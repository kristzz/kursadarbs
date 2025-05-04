<?php

namespace App\Http\Controllers\api;

use App\Events\NewMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function getConversations()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $conversations = $user->conversations()
                ->with(['users' => function ($query) use ($user) {
                    $query->where('users.id', '!=', $user->id);
                }, 'lastMessage'])
                ->get()
                ->map(function ($conversation) use ($user) {
                    $otherUser = $conversation->users->first();

                    // Add a null check to prevent errors with incomplete data
                    if (!$otherUser) {
                        return null;
                    }

                    return [
                        'id' => $conversation->id,
                        'title' => $conversation->title ?? $otherUser->name,
                        'other_user' => [
                            'id' => $otherUser->id,
                            'name' => $otherUser->name,
                        ],
                        'last_message' => $conversation->lastMessage ? [
                            'content' => $conversation->lastMessage->content,
                            'created_at' => $conversation->lastMessage->created_at->diffForHumans(),
                            'is_mine' => $conversation->lastMessage->user_id === $user->id,
                        ] : null,
                        'updated_at' => $conversation->updated_at,
                    ];
                })
                ->filter() // Remove any null values from the collection
                ->sortByDesc('updated_at')
                ->values();

            return response()->json([
                'status' => true,
                'conversations' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching conversations: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'status' => false,
                'message' => 'Error fetching conversations: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMessages($conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is part of this conversation
        if (!$conversation->users->contains($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $messages = $conversation->messages()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) use ($user) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'is_mine' => $message->user_id === $user->id,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                    ],
                    'created_at' => $message->created_at->toDateTimeString(),
                    'time' => $message->created_at->format('h:i A'),
                ];
            });

        // Mark unread messages as read
        $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'status' => true,
            'messages' => $messages
        ]);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $user = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is part of this conversation
        if (!$conversation->users->contains($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $message = new Message([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'content' => $request->content,
        ]);

        $message->save();

        // Update conversation timestamp
        $conversation->touch();

        // Broadcast the message
        broadcast(new NewMessageEvent($message))->toOthers();

        return response()->json([
            'status' => true,
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'is_mine' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
                'created_at' => $message->created_at->toDateTimeString(),
                'time' => $message->created_at->format('h:i A'),
            ]
        ]);
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $otherUser = User::findOrFail($request->user_id);

        // Check if conversation already exists
        $existingConversation = $user->conversations()
            ->whereHas('users', function ($query) use ($otherUser) {
                $query->where('users.id', $otherUser->id);
            })
            ->first();

        if ($existingConversation) {
            return response()->json([
                'status' => true,
                'conversation_id' => $existingConversation->id,
                'message' => 'Conversation already exists'
            ]);
        }

        // Create new conversation
        $conversation = new Conversation();
        $conversation->save();

        // Attach users to conversation
        $conversation->users()->attach([$user->id, $otherUser->id]);

        return response()->json([
            'status' => true,
            'conversation_id' => $conversation->id,
            'message' => 'Conversation created successfully'
        ]);
    }
}
