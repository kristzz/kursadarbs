import React from 'react';
import { useTranslations } from 'next-intl';

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

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | undefined;
  onSelectConversation: (conversationId: number) => void;
  loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation,
  loading = false
}) => {
  const t = useTranslations('Messages');

  if (loading) {
    return (
      <div className="p-4 text-center text-textc/60">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-textc/60">
        <p>{t('noConversations')}</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] overflow-y-auto">
      <div className="p-3 border-b border-gray-800/10">
        <h2 className="font-semibold text-textc">{t('conversations')}</h2>
      </div>
      <ul>
        {conversations.map(conversation => (
          <li 
            key={conversation.id}
            className={`border-b border-gray-800/10 cursor-pointer hover:bg-gray-100/5 transition-colors ${
              activeConversation?.id === conversation.id ? 'bg-primaryc/10' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-textc">{conversation.title}</h3>
                {conversation.last_message && (
                  <span className="text-xs text-textc/60">{conversation.last_message.created_at}</span>
                )}
              </div>
              {conversation.last_message ? (
                <p className="text-sm text-textc/70 truncate mt-1">
                  {conversation.last_message.is_mine ? `${t('you')}: ` : ''}
                  {conversation.last_message.content}
                </p>
              ) : (
                <p className="text-sm text-textc/50 italic mt-1">{t('noMessages')}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList; 