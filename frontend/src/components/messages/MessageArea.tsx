import React, { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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