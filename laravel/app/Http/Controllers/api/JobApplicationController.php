<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Post;
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
}
