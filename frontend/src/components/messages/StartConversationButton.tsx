import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../services/auth';

interface StartConversationButtonProps {
  recipientId: number;
  recipientType: 'business' | 'applicant';
  buttonText?: string;
  className?: string;
  onConversationCreated?: (conversationId: number) => void;
  redirectToMessages?: boolean;
}

const StartConversationButton: React.FC<StartConversationButtonProps> = ({
  recipientId,
  recipientType,
  buttonText,
  className = '',
  onConversationCreated,
  redirectToMessages = false
}) => {
  const t = useTranslations('Messages');
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startConversation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/conversations', {
        user_id: recipientId
      });
      
      if (response.data.status) {
        const conversationId = response.data.conversation_id;
        
        if (onConversationCreated) {
          onConversationCreated(conversationId);
        }
        
        if (redirectToMessages) {
          // Redirect to the messages page with the newly created conversation
          // In the App Router, we need to build the URL differently
          const locale = params.locale || '';
          let url = `/${locale ? locale + '/' : ''}messages?conversationId=${conversationId}`;
          
          if (recipientType === 'business') {
            url += `&businessId=${recipientId}`;
          } else {
            url += `&applicantId=${recipientId}`;
          }
          
          router.push(url);
        }
      }
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      
      // Check if it's an authentication error (401)
      if (err.response && err.response.status === 401) {
        // Redirect to login page with locale
        const locale = params.locale || 'en';
        router.push(`/${locale}/auth/login`);
        return;
      }
      
      setError(t('failedToStartConversation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={startConversation}
        disabled={loading}
        className={`flex items-center justify-center px-4 py-2 rounded-md bg-primaryc text-white hover:bg-primaryc/90 transition-colors ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        )}
        {buttonText || t('sendMessage')}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default StartConversationButton; 