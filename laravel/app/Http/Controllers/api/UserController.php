<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ProfileSection;

class UserController extends Controller
{
    // ... existing code ...

    /**
     * Display the specified user's public profile.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);

            // Get all public profile sections
            $profileSections = ProfileSection::where('user_id', $id)
                ->where('is_public', true)
                ->get();

            // Organize sections by type
            $organizedSections = [];
            foreach ($profileSections as $section) {
                $type = $section->type;
                if (!isset($organizedSections[$type])) {
                    $organizedSections[$type] = [
                        'type_name' => $this->getTypeName($type),
                        'items' => []
                    ];
                }

                $organizedSections[$type]['items'][] = [
                    'id' => $section->id,
                    'title' => $section->title,
                    'description' => $section->description,
                    'institution' => $section->institution,
                    'start_date' => $section->start_date,
                    'end_date' => $section->end_date,
                    'is_public' => $section->is_public
                ];
            }

            // Only return public information
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profession' => $user->profession,
                'country' => $user->country,
                'bio' => $user->bio,
                'skills' => $user->skills ? json_decode($user->skills) : [],
                'experience' => $user->experience,
                'education' => $user->education,
                'created_at' => $user->created_at,
                'profile_sections' => $organizedSections
            ];

            return response()->json([
                'status' => true,
                'user' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }
    }

    /**
     * Get the display name for a section type
     *
     * @param  string  $type
     * @return string
     */
    private function getTypeName($type)
    {
        $typeNames = [
            'education' => 'Education',
            'experience' => 'Experience',
            'skills' => 'Skills & Technologies',
            'awards' => 'Awards',
            'languages' => 'Languages',
            'certifications' => 'Certifications',
            'projects' => 'Projects'
        ];

        return $typeNames[$type] ?? ucfirst($type);
    }

    // ... existing code ...
}
