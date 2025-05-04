import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { api } from '../../services/auth';
import websocketService from '../../services/websocket';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';

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

interface ApplicantMessagingProps {
  businessId?: number; // Optional business ID to start conversation with
  userId: number; // Current user ID
  token: string;
}

const ApplicantMessaging: React.FC<ApplicantMessagingProps> = ({ businessId, userId, token }) => {
  const t = useTranslations('Messages');
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  // Load conversations when the component mounts
  useEffect(() => {
    fetchConversations();
    
    // Setup WebSocket connection
    if (token) {
      websocketService.connect(`user-${userId}`, token);
      
      // Listen for connection changes
      const unsubscribe = websocketService.onConnectionChange((isConnected) => {
        setConnected(isConnected);
      });
      
      // Listen for new messages
      const messageUnsubscribe = websocketService.on('new_message', (data) => {
        if (activeConversation && data.conversation_id === activeConversation.id) {
          setMessages(prev => [...prev, data.message]);
        }
        
        // Update conversation list with the new message
        updateConversationWithNewMessage(data.conversation_id, data.message);
      });
      
      return () => {
        unsubscribe();
        messageUnsubscribe();
        websocketService.disconnect();
      };
    }
  }, [token, userId]);

  // If businessId is provided, start a conversation with that business
  useEffect(() => {
    if (businessId) {
      startConversationWithBusiness(businessId);
    }
  }, [businessId]);

  // When active conversation changes, load its messages
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      if (response.data.status) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/conversations/${conversationId}/messages`);
      if (response.data.status) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startConversationWithBusiness = async (businessId: number) => {
    try {
      setLoading(true);
      const response = await api.post('/conversations', { user_id: businessId });
      if (response.data.status) {
        // Fetch updated conversations to include the new one
        await fetchConversations();
        
        // Find and set active conversation
        const conversationId = response.data.conversation_id;
        const newActiveConversation = conversations.find(c => c.id === conversationId);
        
        if (newActiveConversation) {
          setActiveConversation(newActiveConversation);
        } else {
          // If not in our list yet, fetch conversations again
          const updatedResponse = await api.get('/conversations');
          if (updatedResponse.data.status) {
            setConversations(updatedResponse.data.conversations);
            const foundConversation = updatedResponse.data.conversations.find(
              (c: Conversation) => c.id === conversationId
            );
            if (foundConversation) {
              setActiveConversation(foundConversation);
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to start conversation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    try {
      const response = await api.post(`/conversations/${activeConversation.id}/messages`, {
        content: newMessage.trim()
      });
      
      if (response.data.status) {
        // Add the new message to the conversation
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        
        // Update the conversation in the list with the new message
        updateConversationWithNewMessage(activeConversation.id, response.data.message);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const updateConversationWithNewMessage = (conversationId: number, message: Message) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c.id === conversationId);
      
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          last_message: {
            content: message.content,
            created_at: message.time,
            is_mine: message.is_mine
          },
          updated_at: new Date().toISOString()
        };
        
        // Sort conversations by updated_at, newest first
        return updated.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }
      
      return updated;
    });
  };

  return (
    <div className="flex flex-col md:flex-row bg-white/5 rounded-lg overflow-hidden shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button className="absolute top-0 right-0 px-2" onClick={() => setError('')}>×</button>
        </div>
      )}
      
      <div className="w-full md:w-1/3 border-r border-gray-800/10">
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          loading={loading}
        />
      </div>
      
      <div className="w-full md:w-2/3">
        <MessageArea 
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          activeConversation={activeConversation}
        />
      </div>
      
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow-md">
          {t('reconnecting')}
        </div>
      )}
    </div>
  );
};

export default ApplicantMessaging; 