<?php

namespace App\Http\Controllers\api;

use App\Models\ProfileSection;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ProfileController extends Controller
{
    public function getSections(Request $request): JsonResponse
    {
        $sections = ProfileSection::where('user_id', Auth::id())->get();

        return response()->json([
            'status' => true,
            'sections' => $sections
        ]);
    }

    public function addSection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section_type' => 'required|in:' . implode(',', ProfileSection::SECTION_TYPES),
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'institution' => 'required|string|max:255',
            'is_public' => 'boolean'
        ]);

        $section = ProfileSection::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Section added successfully',
            'section' => $section
        ]);
    }

    public function updateSection(Request $request, ProfileSection $section): JsonResponse
    {
        if ($section->user_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }

        $validated = $request->validate([
            'section_type' => 'required|in:' . implode(',', ProfileSection::SECTION_TYPES),
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'institution' => 'required|string|max:255',
            'is_public' => 'boolean'
        ]);

        $section->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Section updated successfully',
            'section' => $section
        ]);
    }

    public function deleteSection(ProfileSection $section): JsonResponse
    {
        if ($section->user_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }

        $section->delete();

        return response()->json([
            'status' => true,
            'message' => 'Section deleted successfully'
        ]);
    }

    public function toggleVisibility(ProfileSection $section): JsonResponse
    {
        if ($section->user_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }

        $section->update([
            'is_public' => !$section->is_public
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Visibility updated successfully',
            'is_public' => $section->is_public
        ]);
    }
}
