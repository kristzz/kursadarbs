<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ProfileSection;

class ProfileSectionPolicy
{
    public function view(User $user, ProfileSection $profileSection): bool
    {
        return $profileSection->is_public || $user->id === $profileSection->user_id;
    }

    public function update(User $user, ProfileSection $profileSection): bool
    {
        return $user->id === $profileSection->user_id;
    }

    public function delete(User $user, ProfileSection $profileSection): bool
    {
        return $user->id === $profileSection->user_id;
    }
}
