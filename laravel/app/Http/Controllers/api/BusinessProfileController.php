<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Business;
use Illuminate\Support\Facades\Validator;

class BusinessProfileController extends Controller
{
    /**
     * Get the business profile for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinessProfile()
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only business users can access this profile',
            ], 403);
        }

        $business = $user->business;

        if (!$business) {
            return response()->json([
                'status' => false,
                'message' => 'Business profile not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'business' => $business,
        ]);
    }

    /**
     * Update the business profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateBusinessProfile(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'employer') {
            return response()->json([
                'status' => false,
                'message' => 'Only business users can update this profile',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'website' => 'nullable|url',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'country' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $business = $user->business;

        if (!$business) {
            $business = new Business();
            $business->user_id = $user->id;
        }

        $business->fill($request->only([
            'name', 'industry', 'website', 'logo', 'description', 'country', 'location',
        ]));
        $business->save();

        return response()->json([
            'status' => true,
            'message' => 'Business profile updated successfully',
            'business' => $business,
        ]);
    }
}
