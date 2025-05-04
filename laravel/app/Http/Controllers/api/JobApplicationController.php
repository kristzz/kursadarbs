<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Post;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    /**
     * Apply for a job.
     */
    public function apply(Request $request)
    {
        $request->validate([
            'job_id' => 'required|exists:posts,id',
        ]);

        $user = Auth::user();

        // Check if user has already applied
        $existingApplication = JobApplication::where('user_id', $user->id)
            ->where('post_id', $request->job_id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'status' => false,
                'message' => 'You have already applied for this job',
            ]);
        }

        // Check if the post exists
        $post = Post::find($request->job_id);
        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Job not found',
            ]);
        }

        // Create the application
        $application = JobApplication::create([
            'user_id' => $user->id,
            'post_id' => $request->job_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Application submitted successfully',
            'application' => $application,
        ]);
    }

    /**
     * Get all applications for the authenticated user.
     */
    public function getUserApplications()
    {
        $user = Auth::user();
        $applications = JobApplication::with('post.business')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'applications' => $applications,
        ]);
    }

    /**
     * Get all applications for a specific job post.
     * Only the employer who owns the post can see the applications.
     */
    public function getJobApplications($postId)
    {
        $user = Auth::user();

        // Check if the user is an employer
        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only employers can view job applications',
            ]);
        }

        // First try to find the post by ID
        $post = Post::find($postId);

        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Job post not found',
            ]);
        }

        // Check if the post belongs to the employer (either by business_id or user_id)
        $hasAccess = false;

        if ($user->business_id && $post->business_id == $user->business_id) {
            $hasAccess = true;
        } else if ($post->user_id == $user->id) {
            $hasAccess = true;
        }

        if (!$hasAccess) {
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to view applications for this job post',
            ]);
        }

        // Get all applications for this post with applicant details
        $applications = JobApplication::with(['user' => function($query) {
                $query->select('id', 'name', 'email', 'profession', 'country', 'created_at');
            }])
            ->where('post_id', $postId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'post' => $post,
            'applications' => $applications,
        ]);
    }

    /**
     * Get or create a conversation for a job application
     *
     * @param  int  $jobId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversation($jobId)
    {
        try {
            $user = Auth::user();
            $applicantId = request('applicant_id');

            if (!$applicantId && $user->role !== 'EMPLOYER') {
                // If user is an applicant, use their ID
                $applicantId = $user->id;
            }

            if (!$applicantId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Applicant ID is required'
                ], 400);
            }

            // Check if job exists
            $job = Post::findOrFail($jobId);

            // Check if user has permission to access this conversation
            if ($user->role === 'EMPLOYER') {
                // Business users can only access their own job postings
                if ($job->user_id !== $user->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized access to this job application'
                    ], 403);
                }
            } else {
                // Applicants can only access their own conversations
                if ($applicantId !== $user->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized access to this conversation'
                    ], 403);
                }
            }

            // Find the business user
            $businessUser = User::findOrFail($job->user_id);

            // Check if a conversation already exists between these users
            $conversation = $this->findConversationBetweenUsers($businessUser->id, $applicantId);

            // Format messages if conversation exists
            $messages = [];
            if ($conversation) {
                $messages = $conversation->messages()
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($message) use ($user, $businessUser) {
                        return [
                            'content' => $message->content,
                            'sender' => $message->user_id === $businessUser->id ? 'business' : 'applicant',
                            'timestamp' => $message->created_at->toIso8601String()
                        ];
                    });
            }

            return response()->json([
                'status' => true,
                'conversation' => $conversation,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to get conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find a conversation between two users
     *
     * @param  int  $userId1
     * @param  int  $userId2
     * @return \App\Models\Conversation|null
     */
    private function findConversationBetweenUsers($userId1, $userId2)
    {
        return Conversation::whereHas('users', function ($query) use ($userId1) {
            $query->where('users.id', $userId1);
        })->whereHas('users', function ($query) use ($userId2) {
            $query->where('users.id', $userId2);
        })->first();
    }
}
