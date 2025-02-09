<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileSection extends Model
{
    public const SECTION_TYPE_WORK = 'work_experience';
    public const SECTION_TYPE_EDUCATION = 'education';
    public const SECTION_TYPE_CERTIFICATION = 'certification';
    public const SECTION_TYPE_PROJECT = 'project';
    public const SECTION_TYPE_SKILL = 'skill';
    public const SECTION_TYPE_AWARD = 'award';
    public const SECTION_TYPE_LANGUAGE = 'language';

    public const SECTION_TYPES = [
        self::SECTION_TYPE_WORK,
        self::SECTION_TYPE_EDUCATION,
        self::SECTION_TYPE_CERTIFICATION,
        self::SECTION_TYPE_PROJECT,
        self::SECTION_TYPE_SKILL,
        self::SECTION_TYPE_AWARD,
        self::SECTION_TYPE_LANGUAGE
    ];

    protected $fillable = [
        'user_id',
        'section_type',
        'description',
        'start_date',
        'end_date',
        'institution',
        'is_public'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_public' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
