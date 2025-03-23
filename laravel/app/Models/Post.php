<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'business_id',
        'title',
        'jobDesc',
        'profession',
        'country',
        'location',
        'salaryRangeLowest',
        'salaryRangeHighest',
    ];

    /**
     * Get the user that created the post.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the business associated with the post.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
