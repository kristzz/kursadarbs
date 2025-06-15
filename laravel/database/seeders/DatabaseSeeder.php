<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create a regular user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('testtest'),
            'country' => 'Latvia',
            'profession' => 'Software Developer',
            'role' => 'user',
        ]);

        // Create an employer user
        User::factory()->create([
            'name' => 'Test Employer',
            'email' => 'admin@admin.lv',
            'password' => Hash::make('testtest'),
            'country' => 'Latvia',
            'profession' => 'Business Owner',
            'role' => 'employer',
        ]);
    }
}
