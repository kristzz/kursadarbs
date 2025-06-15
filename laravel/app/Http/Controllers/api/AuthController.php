<?php

namespace App\Http\Controllers\api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Create User
     * @param Request $request
     * @return JsonResponse
     */
    public function registerUser(Request $request): JsonResponse
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name' => 'required',
                'email' => 'required|email|unique:users,email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                'password' => 'required',
                'country' => 'required',
                'profession' => 'required',
                'purpose' => 'required|in:findWork,provideWork',
                'source' => 'required'
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'country' => $request->country,
                'profession' => $request->profession,
                'role' => $request->purpose === 'findWork' ? 'user' : 'employer',
                'source' => $request->source
            ]);

            $token = $user->createToken("authToken")->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'User Created Successfully',
                'user' => $user,
            ], 200)->cookie(
                'auth_token',
                $token,
                60 * 24 * 30, // 30 days
                '/',
                'localhost', // Use 'localhost' instead of null
                false,       // Set to false for local development
                false,       // Set httpOnly to false temporarily for debugging
                false,       // raw
                'Lax'        // sameSite policy
            );

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Login The User
     * @param Request $request
     * @return JsonResponse
     */
    public function loginUser(Request $request): JsonResponse
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required'
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            if (!Auth::attempt($request->only(['email', 'password']))) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email & Password do not match our records.',
                ], 401);
            }

            $user = User::where('email', $request->email)->first();
            $token = $user->createToken("authToken")->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'User Logged In Successfully',
            ], 200)->cookie(
                'auth_token',
                $token,
                60 * 24 * 30, // 30 days
                '/',
                "localhost",  // domain
                false,      // secure (false for local development)
                false,      // httpOnly (false for debugging)
                false,      // raw
                "Lax"       // sameSite policy
            );

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Logout The User
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutUser(Request $request): JsonResponse
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'status' => true,
                'message' => 'User Logged Out Successfully'
            ], 200)->cookie(
                'auth_token',
                '',
                -1,
                '/',
                null,
                true,
                true
            );

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Get User Profile
     * @param Request $request
     * @return JsonResponse
     */
    public function userProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'profession' => $user->profession,
                'country' => $user->country,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Generate a token for WebSocket authentication
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateWebSocketToken(Request $request)
    {
        $user = null;

        // Try to get user from auth_token cookie
        if ($authToken = $request->cookie('auth_token')) {
            try {
                // First try as plain Sanctum token (format: ID|token)
                if (strpos($authToken, '|') !== false) {
                    $sanctumToken = \Laravel\Sanctum\PersonalAccessToken::findToken($authToken);
                    if ($sanctumToken) {
                        $user = $sanctumToken->tokenable;
                    }
                } else {
                    // Try as encrypted cookie
                    $token = decrypt($authToken);
                    $sanctumToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($sanctumToken) {
                        $user = $sanctumToken->tokenable;
                    }
                }
            } catch (\Exception $e) {
                // Cookie processing failed, continue to fallback
            }
        }

        // Fallback to regular Auth facade (for session authentication)
        if (!$user) {
            $user = Auth::user();
        }

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Create a simple JWT token manually instead of using JWTAuth::customClaims
        try {
            // Use JWTAuth but without custom claims to avoid Carbon issues
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'status' => true,
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate token: ' . $e->getMessage()
            ], 500);
        }
    }
}
