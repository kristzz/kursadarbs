<?php

namespace App\Http\Controllers\api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
                'token' => $token
            ], 200)->cookie(
                'auth_token',
                $token,
                60 * 24 * 30, // 30 days
                '/',
                null,
                true,     // secure
                true      // httpOnly
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
                null,
                true,     // secure
                true      // httpOnly
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
            ]
        ]);
    }
}
