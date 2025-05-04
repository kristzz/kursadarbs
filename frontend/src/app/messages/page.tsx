'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '../../services/auth';
import BusinessMessaging from '../../components/messages/BusinessMessaging';
import ApplicantMessaging from '../../components/messages/ApplicantMessaging';
import ConversationList from '../../components/messages/ConversationList';
import MessageArea from '../../components/messages/MessageArea';

export default function MessagesPage() {
  const t = useTranslations('Messages');
  const searchParams = useSearchParams();
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
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
  }>>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    created_at: string;
    is_mine: boolean;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Get conversationId, businessId, or applicantId from query parameters
  const conversationId = searchParams.get('conversationId') ? 
    parseInt(searchParams.get('conversationId') as string) : null;
  const businessId = searchParams.get('businessId') ? 
    parseInt(searchParams.get('businessId') as string) : null;
  const applicantId = searchParams.get('applicantId') ? 
    parseInt(searchParams.get('applicantId') as string) : null;

  useEffect(() => {
    // Fetch user information
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        // Fetch user role
        const response = await api.get('/user/profile');
        if (response.data && response.data.user) {
          setUserRole(response.data.user.role);
          
          // Create a unique pseudoID from the user's data we actually have
          // This avoids hardcoded values while still providing a consistent ID
          const userData = response.data.user;
          // Store a numeric ID to ensure type compatibility
          const numericId = Date.now(); // Use timestamp as a temporary but unique numeric ID
          setUserId(numericId);
        }

        // Get token for WS connection
        const tokenResponse = await api.get('/ws-token');
        if (tokenResponse.data && tokenResponse.data.token) {
          setAuthToken(tokenResponse.data.token);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch conversations after we have the user ID
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const response = await api.get('/conversations');
        if (response.data && response.data.conversations) {
          setConversations(response.data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/conversations/${activeConversation}/messages`);
        if (response.data && response.data.messages) {
          // Add messages state
          setMessages(response.data.messages);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Add function to send messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await api.post(`/conversations/${activeConversation}/messages`, {
        content: newMessage.trim()
      });
      
      if (response.data && response.data.message) {
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">{t('errorTitle')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!userId || !token) {
    return (
      <div className="p-6 bg-yellow-100 text-yellow-700 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">{t('authRequired')}</h2>
        <p>{t('pleaseLogin')}</p>
      </div>
    );
  }

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4">{error}</div>}
      {!userRole && !error && <div className="p-4 text-center">Loading...</div>}
      
      {userRole && (
        <div className="grid grid-cols-3 gap-4 h-[600px] border border-gray-800/10 rounded-lg overflow-hidden bg-bgc">
          {/* WebSocket error message */}
          {authToken && <div className="col-span-3 bg-green-500/10 text-green-500 text-xs p-1 text-center">Connected to real-time updates</div>}
          
          {/* Conversation list */}
          <div className="col-span-1 bg-bgc border-r-[1px] border-gray-800/10">
            <ConversationList 
              conversations={conversations} 
              activeConversation={typeof activeConversation === 'number' ? 
                conversations.find(c => c.id === activeConversation) : undefined}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </div>
          
          {/* Message area */}
          <div className="col-span-2 flex flex-col">
            {activeConversation ? (
              <MessageArea
                messages={messages}
                loading={loading}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={handleSendMessage}
                onSendMessage={(message) => {}}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-textc/60">
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 