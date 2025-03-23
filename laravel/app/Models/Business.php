<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'industry',
        'website',
        'logo',
        'description',
        'country',
        'location',
    ];

    /**
     * Get the user that owns the business.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
