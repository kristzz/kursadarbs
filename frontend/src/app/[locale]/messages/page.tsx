'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/services/auth';
import Link from 'next/link';
import ConversationList from '@/components/messages/ConversationList';
import MessageArea from '@/components/messages/MessageArea';
import { useRouter } from 'next/navigation';
import useWebSocket from '../hooks/useWebSocket';
import Cookies from 'js-cookie';

interface Conversation {
  id: number;
  title: string;
  other_user: {
    id: number;
    name: string;
  };
  last_message: {
    content: string;
    created_at: string;
    is_mine: boolean;
  } | null;
  updated_at: string;
}

interface Message {
  id: number;
  content: string;
  is_mine: boolean;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  time: string;
}

export default function MessagesPage() {
  const t = useTranslations('Messages');
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showReconnecting, setShowReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const previousChannelRef = useRef('');

  // Handle websocket messages
  const handleWebSocketMessage = useCallback((eventName: string, data: any) => {
    console.log(`Received WebSocket event: ${eventName}`, data);
    
    if (eventName === 'new_message' && activeConversation === data.conversation_id) {
      // Important: Check if this message was sent by the current user
      // If yes, we already have an optimistic version in the UI, so don't add it again
      if (data.user_id === userId) {
        console.log('Ignoring WebSocket message from self', data);
        return;
      }
      
      // Format the message to match our expected format
      const message: Message = {
        id: data.id || data.message_id || Date.now(), // Use any available ID or timestamp as fallback
        content: data.content,
        is_mine: false,
        user: {
          id: data.user_id,
          name: data.user_name || 'Other user',
        },
        created_at: data.created_at || new Date().toISOString(),
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      // Check if we already have this message to avoid duplicates
      if (!messages.some(m => m.id === message.id)) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Update conversation list to show latest message
        updateConversationWithLatestMessage(data.conversation_id, data.content, false);
      }
    } else if (eventName === 'direct_message') {
      // Handle direct messages if needed
      console.log('Received direct message:', data);
      
      // Skip our own messages
      if (data.senderId === userId?.toString()) {
        console.log('Ignoring direct message from self', data);
        return;
      }
      
      // If we have a senderId, we might want to update UI or show notifications
      if (data.senderId) {
        // Find the corresponding conversation
        const conversation = conversations.find(
          c => c.other_user.id.toString() === data.senderId
        );
        
        if (conversation) {
          // Update or highlight the conversation
          updateConversationWithLatestMessage(
            conversation.id, 
            data.content, 
            false
          );
          
          // If this conversation is active, add the message to the list
          if (activeConversation === conversation.id) {
            const message: Message = {
              id: data.id || data.message_id || Date.now(), // Temporary ID until we fetch from server
              content: data.content,
              is_mine: false,
              user: {
                id: parseInt(data.senderId),
                name: conversation.other_user.name,
              },
              created_at: data.created_at || new Date().toISOString(),
              time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            // Check for duplicates before adding
            if (!messages.some(m => m.id === message.id)) {
              setMessages(prevMessages => [...prevMessages, message]);
            }
          }
        }
      }
    } else if (eventName === 'connection_established') {
      console.log('WebSocket connection established successfully');
      setShowReconnecting(false);
      setRetryCount(0);
    }
  }, [activeConversation, conversations, messages, userId]);

  // Handle WebSocket connection errors
  const handleWebSocketError = useCallback((errorMessage: string) => {
    console.error('WebSocket error:', errorMessage);
    
    // Show reconnecting message after the first failure
    if (retryCount > 0) {
      setShowReconnecting(true);
    }
    
    // Increment retry count
    setRetryCount(prev => prev + 1);
    
    // After 3 retries, show a more persistent error
    if (retryCount >= 3) {
      setError(`${t('websocketError')}: ${errorMessage}`);
    }
  }, [retryCount, t]);

  // Initialize WebSocket connection for the active conversation
  const { connected: wsConnected, error: wsError, sendMessage, reconnect } = useWebSocket({
    // Format channel name consistently
    channelName: activeConversation ? `conversation.${activeConversation}` : 'global',
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    // Always auto-connect, even without an active conversation
    autoConnect: true
  });

  // If WebSocket connection status changes, update UI
  useEffect(() => {
    if (wsConnected) {
      setShowReconnecting(false);
      setRetryCount(0);
      setConnectionError('');
      // Clear WebSocket-related errors
      if (error.includes(t('websocketError'))) {
        setError('');
      }
    }
  }, [wsConnected, error, t]);

  // Effect to reconnect when active conversation changes while already connected
  useEffect(() => {
    const currentChannel = activeConversation ? `conversation.${activeConversation}` : 'global';
    
    // Only reconnect if we're already connected and the channel has changed
    if (wsConnected && previousChannelRef.current && previousChannelRef.current !== currentChannel) {
      // We don't need to setActiveConversation here as it's already set, causing this effect to run
      reconnect();
    }
    
    // Update the previous channel reference
    previousChannelRef.current = currentChannel;
  }, [activeConversation, wsConnected, reconnect]);

  // Get current user ID on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user/profile');
        if (response.data && response.data.user) {
          // For consistency, use a timestamp-based ID if no real ID is available
          const userData = response.data.user;
          // Attempt to get a real ID from JWT token if available
          const token = Cookies.get('auth_token');
          if (token) {
            try {
              // Try to decode JWT token to get user ID
              // This is a simple method but not secure - for proper use, verify tokens on server
              const base64Payload = token.split('.')[1];
              const payload = JSON.parse(atob(base64Payload));
              if (payload && payload.sub) {
                setUserId(parseInt(payload.sub));
                return;
              }
            } catch (err) {
              console.warn('Could not extract user ID from token:', err);
            }
          }
          
          // Fallback to timestamp ID
          const numericId = Date.now(); 
          setUserId(numericId);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Use a fallback user ID to not completely break functionality
        setUserId(Date.now());
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch conversations when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/conversations');
        if (response.data && response.data.conversations) {
          setConversations(response.data.conversations);
          
          // If there are conversations, set the first one as active
          if (response.data.conversations.length > 0 && !activeConversation) {
            setActiveConversation(response.data.conversations[0].id);
          }
        } else {
          setError(response.data.message || 'Failed to load conversations');
        }
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError(err.response?.data?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  // Helper to update conversation with new message
  const updateConversationWithLatestMessage = (conversationId: number, content: string, isMine: boolean) => {
    setConversations(prevConversations => {
      const updated = prevConversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            last_message: {
              content,
              created_at: 'just now',
              is_mine: isMine
            },
            updated_at: new Date().toISOString() // Update timestamp to move to top
          };
        }
        return conv;
      });
      
      // Sort conversations - newest update first
      return updated.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      setMessagesLoading(true);
      const response = await api.get(`/conversations/${conversationId}/messages`);
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
      setMessagesLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessagesLoading(false);
    }
  };

  const sendMessageHandler = async () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      
      console.log('Sending message to conversation:', activeConversation);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        content: newMessage.trim(),
        is_mine: true,
        user: {
          id: userId || 0,
          name: 'You' // Will be replaced by actual message data
        },
        created_at: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Add the optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send to server
      const response = await api.post(`/conversations/${activeConversation}/messages`, {
        content: newMessage.trim(),
        conversation_id: activeConversation
      });
      
      if (response.data && response.data.status) {
        console.log('Message sent successfully via API:', response.data);
        
        // Replace optimistic message with actual message from server
        setMessages(prev => prev.map(m => 
          m.id === optimisticMessage.id ? response.data.message : m
        ));
        
        // Also send via WebSocket for real-time delivery to other users
        console.log('Broadcasting message via WebSocket for conversation:', activeConversation);
        
        // Format message for WebSocket delivery
        const wsMessage = {
          event: 'new_message',
          data: {
            conversation_id: activeConversation,
            message: response.data.message,
            content: newMessage.trim(),
            sender_id: userId,
            user_id: userId,
            user_name: response.data.message.user?.name || 'You', 
            timestamp: new Date().toISOString()
          }
        };
        
        // Use WebSocket to broadcast the message
        const wsSuccess = sendMessage('new_message', wsMessage.data);
        console.log('WebSocket broadcast attempt result:', wsSuccess ? 'Success' : 'Queued/Failed');
        
        // Update conversation list with the new message
        updateConversationWithLatestMessage(activeConversation, newMessage.trim(), true);
        
        // Clear the input field
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.data);
        // Remove optimistic message
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
    
    // Clear any errors when switching conversations
    setError('');
    
    // If WebSocket isn't connected, try to reconnect
    if (!wsConnected && activeConversation !== conversationId) {
      reconnect();
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-primaryc hover:text-primaryc/80 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('goBack')}
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-textc mb-6">{t('title')}</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-600 border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}
      
      {wsError && !error.includes(wsError) && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-yellow-600 border border-yellow-200">
          {t('websocketError')}: {wsError}
        </div>
      )}
      
      {/* Connection Status Indicator */}
      <div className={`fixed bottom-4 right-4 px-3 py-1 rounded-md z-10 flex items-center transition-all duration-300 ${
        wsConnected 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : showReconnecting 
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse' 
            : 'bg-red-100 text-red-700 border border-red-200'
      }`}>
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
          wsConnected 
            ? 'bg-green-500' 
            : showReconnecting 
              ? 'bg-yellow-500' 
              : 'bg-red-500'
        }`}></span>
        {wsConnected 
          ? t('connectedToRealtime')
          : showReconnecting 
            ? t('reconnecting')
            : t('disconnected')
        }
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-componentbgc rounded-lg overflow-hidden border border-gray-800/10">
        <div className="md:col-span-1 border-r border-gray-800/10">
          <ConversationList 
            conversations={conversations} 
            activeConversation={typeof activeConversation === 'number' ? 
              conversations.find(c => c.id === activeConversation) : undefined}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>
        
        <div className="col-span-2 bg-bgc flex flex-col">
          {activeConversation ? (
            <MessageArea
              messages={messages}
              loading={messagesLoading}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessageHandler}
              onSendMessage={(message) => {}}
              activeConversation={conversations.find(c => c.id === activeConversation)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-textc/60">
              <p>{t('selectConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 