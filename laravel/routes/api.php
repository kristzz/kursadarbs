<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\ProfileController;
use App\Http\Controllers\api\PostController;
use App\Http\Controllers\api\BusinessProfileController;
use App\Http\Controllers\api\JobApplicationController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\BusinessController;
use App\Http\Controllers\api\MessageController;

use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

Route::post('/auth/register', [AuthController::class, 'registerUser']);
Route::post('/login', [AuthController::class, 'loginUser']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUser']);
    Route::get('/user/profile', [AuthController::class, 'userProfile']);

    // Profile routes
    Route::get('/profile/sections', [ProfileController::class, 'getSections']);
    Route::post('/profile/sections', [ProfileController::class, 'addSection']);
    Route::put('/profile/sections/{section}', [ProfileController::class, 'updateSection']);
    Route::delete('/profile/sections/{section}', [ProfileController::class, 'deleteSection']);
    Route::post('/profile/sections/{section}/toggle', [ProfileController::class, 'toggleVisibility']);

    Route::get('/business-profile', [BusinessProfileController::class, 'getBusinessProfile']);
    Route::put('/business-profile', [BusinessProfileController::class, 'updateBusinessProfile']);

    // Post routes
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::get('/my-posts', [PostController::class, 'getMyPosts']);
    Route::post('/post', [PostController::class, 'post']);
    Route::put('/edit-post', [PostController::class, 'editPosts']);
    Route::delete('/delete-post', [PostController::class, 'deletePost']);

    // Job application routes
    Route::post('/apply', [JobApplicationController::class, 'apply']);
    Route::get('/applications', [JobApplicationController::class, 'getUserApplications']);
    Route::get('/job-applications/{postId}', [JobApplicationController::class, 'getJobApplications']);

    // Chat routes
    Route::get('/conversations', [MessageController::class, 'getConversations']);
    Route::post('/conversations', [MessageController::class, 'createConversation']);
    Route::get('/conversations/{conversationId}/messages', [MessageController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [MessageController::class, 'sendMessage']);
});

// WebSocket Authentication - no middleware, handle auth manually in controller
Route::get('/ws-token', [AuthController::class, 'generateWebSocketToken']);

Route::get('/users/{id}', [UserController::class, 'show']);

// Job application conversations - using sanctum instead of jwt
Route::middleware('auth:sanctum')->get('/job-application/{jobId}/conversation', [JobApplicationController::class, 'getConversation']);
