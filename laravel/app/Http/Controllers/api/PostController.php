<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Business;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index(Request $request)
    {
        $query = Post::with('business');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('jobDesc', 'like', "%$search%")
                  ->orWhere('profession', 'like', "%$search%")
                  ->orWhere('country', 'like', "%$search%")
                  ->orWhere('location', 'like', "%$search%");
            });
        }

        // Sorting
        $sortKey = $request->input('sortKey', 'created_at');
        $sortOrder = $request->input('sortOrder', 'desc');

        // Validate sort key to prevent SQL injection
        $allowedSortKeys = ['title', 'profession', 'location', 'country', 'created_at', 'salaryRangeLowest'];
        if (!in_array($sortKey, $allowedSortKeys)) {
            $sortKey = 'created_at';
        }

        $query->orderBy($sortKey, $sortOrder === 'asc' ? 'asc' : 'desc');

        $posts = $query->get();

        return response()->json([
            'status' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Store a newly created post.
     */
    public function store(Request $request)
    {
        return $this->post($request);
    }

    /**
     * Display the specified post.
     */
    public function show($id)
    {
        return $this->getPost($id);
    }

    /**
     * Update the specified post.
     */
    public function update(Request $request, $id)
    {
        $request->merge(['id' => $id]);
        return $this->editPosts($request);
    }

    /**
     * Remove the specified post.
     */
    public function destroy($id)
    {
        $request = new Request(['id' => $id]);
        return $this->deletePost($request);
    }

    /**
     * Create a new job post.
     */
    public function post(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'jobDesc' => 'required|string',
            'profession' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salaryRangeLowest' => 'required|numeric|min:0',
            'salaryRangeHighest' => 'required|numeric|gte:salaryRangeLowest',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();

        // Check if user is an employer
        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only employers can create job posts',
            ], 403);
        }

        // Get business ID from user or create a new business
        $businessId = $user->business_id;

        if (!$businessId) {
            return response()->json([
                'status' => false,
                'message' => 'No business profile found for this user',
            ]);
        }

        // Create the post
        $post = Post::create([
            'title' => $request->title,
            'jobDesc' => $request->jobDesc,
            'profession' => $request->profession,
            'country' => $request->country,
            'location' => $request->location,
            'salaryRangeLowest' => $request->salaryRangeLowest,
            'salaryRangeHighest' => $request->salaryRangeHighest,
            'business_id' => $businessId,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Job post created successfully',
            'post' => $post,
        ]);
    }

    /**
     * Get all posts.
     */
    public function getPosts(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Get posts created by the authenticated business user.
     */
    public function getMyPosts()
    {
        $user = Auth::user();

        // Check if user is an employer
        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only employers can view their job posts',
            ], 403);
        }

        $businessId = $user->business_id;

        // If no business ID, check if user has posts directly associated with their user ID
        if (!$businessId) {
            $posts = Post::where('user_id', $user->id)
                ->with('business')
                ->withCount('applications')
                ->orderBy('created_at', 'desc')
                ->get();

            if ($posts->count() > 0) {
                return response()->json([
                    'status' => true,
                    'posts' => $posts,
                    'warning' => 'You do not have a business profile yet. Please create one for better visibility.',
                ]);
            }

            return response()->json([
                'status' => false,
                'message' => 'No business profile found for this user',
                'posts' => [],
            ]);
        }

        // Get all posts for this business
        $posts = Post::where('business_id', $businessId)
            ->with('business')
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Edit an existing job post.
     */
    public function editPosts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:posts,id',
            'title' => 'sometimes|required|string|max:255',
            'jobDesc' => 'sometimes|required|string',
            'profession' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'salaryRangeLowest' => 'sometimes|required|numeric|min:0',
            'salaryRangeHighest' => 'sometimes|required|numeric|gte:salaryRangeLowest',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $post = Post::find($request->id);

        // Check if post exists
        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Post not found',
            ], 404);
        }

        // Check if user owns the post
        if ($post->business_id != $user->business_id && $post->user_id != $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to edit this post',
            ], 403);
        }

        // Update the post
        $post->update($request->only([
            'title', 'jobDesc', 'profession', 'country', 'location',
            'salaryRangeLowest', 'salaryRangeHighest'
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Job post updated successfully',
            'post' => $post,
        ]);
    }

    /**
     * Delete a job post.
     */
    public function deletePost(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $post = Post::find($request->id);

        // Check if post exists
        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Post not found',
            ], 404);
        }

        // Check if user owns the post
        if ($post->business_id != $user->business_id && $post->user_id != $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to delete this post',
            ], 403);
        }

        // Delete the post
        $post->delete();

        return response()->json([
            'status' => true,
            'message' => 'Job post deleted successfully',
        ]);
    }

    /**
     * Get a specific job post.
     */
    public function getPost($id)
    {
        $post = Post::with('business')->find($id);

        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Post not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'post' => $post,
        ]);
    }
}
