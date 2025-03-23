<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\ProfileController;
use App\Http\Controllers\api\PostController;
use App\Http\Controllers\api\BusinessProfileController;

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


    Route::post('/post', [PostController::class, 'post']);
    Route::get('/posts', [PostController::class, 'getPosts']);
    Route::get('/my-posts', [PostController::class, 'getMyPosts']);
    Route::put('/edit-post', [PostController::class, 'editPosts']);
    Route::delete('/delete-post', [PostController::class, 'deletePost']);
});
