import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '../services/auth';
import websocketService from '../services/websocket';
import StartConversationButton from './messages/StartConversationButton';

interface Message {
  content: string;
  sender: 'business' | 'applicant';
  timestamp: string;
}

interface JobApplicationChatProps {
  jobId: number;
  jobTitle: string;
  applicantId: number;
  applicantName: string;
  businessId: number;
  businessName: string;
  currentUserId: number;
  token: string;
}

const JobApplicationChat: React.FC<JobApplicationChatProps> = ({
  jobId,
  jobTitle,
  applicantId,
  applicantName,
  businessId,
  businessName,
  currentUserId,
  token
}) => {
  const t = useTranslations('JobApplication');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isBusiness = currentUserId === businessId;

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Check if there's an existing conversation
        const response = await api.get(`/job-application/${jobId}/conversation`, {
          params: { applicant_id: applicantId }
        });
        
        if (response.data.status && response.data.conversation) {
          setConversationId(response.data.conversation.id);
          setMessages(response.data.messages || []);
        }
        
        // Connect to WebSocket
        const channelName = isBusiness ? `business-${businessId}` : `user-${applicantId}`;
        websocketService.connect(channelName, token);
        
        // Listen for job application messages
        const unsubscribe = websocketService.on('job_application_message', (data) => {
          if (data.jobId === jobId && 
             ((isBusiness && data.applicantId === applicantId) || 
              (!isBusiness && data.businessId === businessId))) {
            
            addMessage({
              content: data.message,
              sender: isBusiness ? 'applicant' : 'business',
              timestamp: data.timestamp
            });
          }
        });
        
        return () => {
          unsubscribe();
          websocketService.disconnect();
        };
      } catch (err) {
        console.error('Error initializing job application chat:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [jobId, applicantId, businessId, token, isBusiness]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // If there's no conversation yet, create one
      if (!conversationId) {
        const convoResponse = await api.post('/conversations', {
          user_id: isBusiness ? applicantId : businessId
        });
        
        if (convoResponse.data.status) {
          setConversationId(convoResponse.data.conversation_id);
        } else {
          throw new Error('Failed to create conversation');
        }
      }
      
      // Add message to the conversation
      const messageResponse = await api.post(`/conversations/${conversationId}/messages`, {
        content: newMessage.trim()
      });
      
      if (!messageResponse.data.status) {
        throw new Error('Failed to send message');
      }
      
      // Send a WebSocket event for real-time notification
      await api.post('/job-application-message', {
        applicantId,
        businessId,
        jobId,
        conversationId,
        message: newMessage.trim()
      });
      
      // Add message to local state
      addMessage({
        content: newMessage.trim(),
        sender: isBusiness ? 'business' : 'applicant',
        timestamp: new Date().toISOString()
      });
      
      // Clear input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primaryc"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg shadow-md overflow-hidden border border-gray-800/10">
      <div className="p-4 border-b border-gray-800/10 bg-primaryc/5">
        <h3 className="font-semibold text-lg text-textc">
          {t('conversationAbout')} {jobTitle}
        </h3>
        <p className="text-textc/70 text-sm">
          {isBusiness ? t('withApplicant') : t('withBusiness')}: {isBusiness ? applicantName : businessName}
        </p>
      </div>

      {/* Messages area */}
      <div className="h-80 overflow-y-auto p-4 bg-white/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textc/60">
            <p className="mb-4">{t('noMessagesYet')}</p>
            {conversationId === null && (
              <StartConversationButton
                recipientId={isBusiness ? applicantId : businessId}
                recipientType={isBusiness ? 'applicant' : 'business'}
                buttonText={t('startConversation')}
                redirectToMessages={false}
                onConversationCreated={id => setConversationId(id)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.sender === (isBusiness ? 'business' : 'applicant') ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === (isBusiness ? 'business' : 'applicant') 
                      ? 'bg-primaryc text-white rounded-br-none' 
                      : 'bg-gray-200 text-textc rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 text-right opacity-70">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      {conversationId !== null && (
        <div className="p-4 border-t border-gray-800/10 bg-white/20">
          <div className="flex items-center">
            <textarea
              className="flex-1 bg-white rounded-lg border border-gray-800/10 p-2 text-textc resize-none"
              placeholder={t('typeMessage')}
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="ml-2 bg-primaryc text-white rounded-full p-2 hover:bg-primaryc/90 transition-colors"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default JobApplicationChat; 