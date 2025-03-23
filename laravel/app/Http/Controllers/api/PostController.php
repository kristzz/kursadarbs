<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Create a new job post.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function post(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'jobDesc' => 'required|string',
            'profession' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salaryRangeLowest' => 'required|numeric|min:0',
            'salaryRangeHighest' => 'required|numeric|min:0|gt:salaryRangeLowest',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();

        // Ensure the user is a business user with a registered business
        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only business users with registered businesses can create posts',
            ], 403);
        }

        // Create the post
        $post = Post::create([
            'user_id' => $user->id,
            'business_id' => $user->business->id,
            'title' => $request->title,
            'jobDesc' => $request->jobDesc,
            'profession' => $request->profession,
            'country' => $request->country,
            'location' => $request->location,
            'salaryRangeLowest' => $request->salaryRangeLowest,
            'salaryRangeHighest' => $request->salaryRangeHighest,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Post created successfully',
            'post' => $post,
        ], 201);
    }

    /**
     * Get all job posts with optional search and filters.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPosts(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'search' => 'nullable|string',
            'sortKey' => 'nullable|in:title,created_at,salaryRangeLowest',
            'sortOrder' => 'nullable|in:asc,desc',
            'minSalary' => 'nullable|numeric|min:0',
            'maxSalary' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

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

        // Salary range filter
        $query->whereBetween('salaryRangeLowest', [
            $request->minSalary ?? 0,
            $request->maxSalary ?? 100000000,
        ]);

        // Sorting
        $query->orderBy(
            $request->sortKey ?? 'title',
            $request->sortOrder ?? 'asc'
        );

        $posts = $query->get();

        return response()->json([
            'status' => true,
            'posts' => $posts,
            'userType' => Auth::user()->type,
        ]);
    }

    /**
     * Get posts created by the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyPosts()
    {
        $posts = Post::where('user_id', Auth::user()->id)
            ->with('business')
            ->get();

        return response()->json([
            'status' => true,
            'posts' => $posts,
            'userType' => Auth::user()->type,
        ]);
    }

    /**
     * Edit a job post.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editPosts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:posts,id',
            'title' => 'required|string|max:255',
            'jobDesc' => 'required|string',
            'profession' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'salaryRangeLowest' => 'required|numeric|min:0',
            'salaryRangeHighest' => 'required|numeric|min:0|gt:salaryRangeLowest',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $post = Post::find($request->id);

        // Ensure the user owns the post
        if ($post->user_id !== Auth::user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'You are not authorized to edit this post',
            ], 403);
        }

        // Update the post
        $post->update($request->only([
            'title', 'jobDesc', 'profession', 'country', 'location',
            'salaryRangeLowest', 'salaryRangeHighest',
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Post updated successfully',
            'post' => $post,
        ]);
    }

    /**
     * Delete a job post.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePost(Request $request)
    {
        $post = Post::find($request->id);

        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Post not found',
            ], 404);
        }

        // Ensure the user owns the post
        if ($post->user_id !== Auth::user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'You are not authorized to delete this post',
            ], 403);
        }

        $post->delete();

        return response()->json([
            'status' => true,
            'message' => 'Post deleted successfully',
        ]);
    }
}
