import React, { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Video, VideoOff, Phone, PhoneOff } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  is_mine: boolean;
  user?: {
    id: number;
    name: string;
  };
  created_at: string;
  time?: string;
}

interface Conversation {
  id: number;
  title: string;
  other_user: {
    id: number;
    name: string;
  };
}

interface MessageAreaProps {
  messages: Message[];
  loading?: boolean;
  activeConversation?: Conversation;
  onSendMessage: (message: string) => void;
  newMessage?: string;
  setNewMessage?: (message: string) => void;
  sendMessage?: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({
  messages,
  loading = false,
  activeConversation,
  onSendMessage,
  newMessage: externalNewMessage,
  setNewMessage: externalSetNewMessage,
  sendMessage: externalSendMessage,
}) => {
  const t = useTranslations('Messages');
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localNewMessage, setLocalNewMessage] = useState('');

  // Use either external state management or local state
  const newMessage = externalNewMessage !== undefined ? externalNewMessage : localNewMessage;
  const setNewMessage = externalSetNewMessage || setLocalNewMessage;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (externalSendMessage) {
      externalSendMessage();
    } else {
      onSendMessage(newMessage);
      setLocalNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Video call invite message component
  const VideoCallInvite = () => {
    const handleJoinCall = () => {
      router.push('/video-call');
    };

    const handleAudioOnly = () => {
      router.push('/video-call');
    };

    return (
      <div className="max-w-md bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg rounded-bl-none">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Video Call Invitation</h4>
            <p className="text-blue-100 text-xs">Join the video call to discuss your application</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Meeting Details</span>
            <span className="text-xs text-blue-100">Today, 2:30 PM</span>
          </div>
          <p className="text-xs text-blue-100">Duration: ~30 minutes</p>
          <p className="text-xs text-blue-100">Interview discussion</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleJoinCall}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Video className="w-3 h-3" />
            Join Call
          </button>
          <button 
            onClick={handleAudioOnly}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Phone className="w-3 h-3" />
            Audio Only
          </button>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-blue-100">
            Meeting ID: 123-456-789
          </p>
        </div>
        <div className="text-xs mt-1 text-right opacity-70">
          2:25 PM
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] text-textc/60">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-3 border-b border-gray-800/10">
        <h2 className="font-semibold text-textc">
          {activeConversation ? activeConversation.title : 'Messages'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-textc/60">
            {t ? t('startConversation') : 'Start a conversation'}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                  message.is_mine 
                      ? 'bg-primaryc text-white rounded-br-none' 
                      : 'bg-gray-200/10 text-textc rounded-bl-none'
                  }`}
                >
                  {!message.is_mine && message.user && (
                    <div className="text-xs font-medium mb-1">{message.user.name}</div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 text-right opacity-70">
                    {message.time || new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Video call invite as the newest message */}
            <div className="flex justify-start">
              <VideoCallInvite />
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-800/10">
        <div className="flex items-center">
          <textarea
            className="flex-1 bg-gray-100/5 border border-gray-800/10 rounded-lg p-2 text-textc resize-none"
            placeholder={t ? t('typeMessage') : 'Type a message...'}
            rows={2}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ml-2 bg-primaryc text-white rounded-full p-2 hover:bg-primaryc/90 transition-colors"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageArea; 