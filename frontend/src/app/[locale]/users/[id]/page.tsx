'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { api } from '@/services/auth';
import { useSession } from 'next-auth/react';
import { Spinner } from '@/components/spinner';

interface ProfileSectionItem {
  id: number;
  title: string;
  description: string;
  institution: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
}

interface ProfileSectionType {
  type_name: string;
  items: ProfileSectionItem[];
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profession: string;
  country: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  created_at: string;
  profile_sections: {
    [key: string]: ProfileSectionType;
  };
}

export default function UserProfilePage() {
  const t = useTranslations('UserProfile');
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const [startingChat, setStartingChat] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${params.id}`);
        
        if (response.data.status) {
          setProfile(response.data.user);
        } else {
          setError(response.data.message || 'Failed to load user profile');
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.id]);

  // Fetch user role - modified to use a different endpoint
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session) return;
      
      try {
        console.log("Fetching user profile for role...");
        // Use user profile endpoint instead of user-role which is 404'ing
        const response = await api.get('/user/profile');
        console.log("User profile API response:", response.data);
        
        if (response.data && response.data.user) {
          // Extract role from user profile
          const role = response.data.user.role;
          console.log("User role extracted from profile:", role);
          setUserRole(role);
        } else {
          console.error("Failed to fetch user role from profile:", response.data);
        }
      } catch (err) {
        console.error('Error fetching user profile for role:', err);
      }
    };

    fetchUserRole();
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSectionDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const startConversation = async () => {
    try {
      setStartingChat(true);
      const response = await api.post('/conversations', {
        user_id: params.id
      });
      
      if (response.data.status) {
        // Use locale in the messages URL
        const locale = params.locale || '';
        router.push(`/${locale ? locale + '/' : ''}messages?conversationId=${response.data.conversation_id}`);
      } else {
        setError(response.data.message || 'Failed to start conversation');
      }
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      
      // Check if it's an authentication error (401)
      if (err.response && err.response.status === 401) {
        router.push(`/${params.locale}/auth/login`);
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-bold mb-2 text-red-700">{t('errorTitle')}</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="inline-block mt-4 text-primaryc hover:text-primaryc/80"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md border border-yellow-200">
          <h2 className="text-xl font-bold mb-2 text-yellow-700">{t('notFoundTitle')}</h2>
          <p className="text-yellow-600">{t('userNotFound')}</p>
          <button 
            onClick={() => router.back()} 
            className="inline-block mt-4 text-primaryc hover:text-primaryc/80"
          >
            {t('goBack')}
          </button>
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
      
      {/* User info section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-componentbgc rounded-lg overflow-hidden border border-gray-800/10">
          <div className="flex justify-center items-center p-8 bg-gradient-to-b from-primaryc/20 to-transparent">
            <div className="w-24 h-24 rounded-full bg-primaryc flex items-center justify-center text-white text-4xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="bg-componentbgc rounded-lg p-6 border border-gray-800/10 md:col-span-2">
          <h1 className="text-xl font-bold text-textc">{profile.email}</h1>
          <p className="text-primaryc mt-1">{profile.profession || t('noProfession')}</p>
          <div className="flex items-center gap-1 mt-2 text-textc/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>{profile.country || t('noLocation')}</span>
          </div>
          <p className="text-textc/60 text-sm mt-2">{t('memberSince')} {formatDate(profile.created_at)}</p>
        </div>
      </div>
      
      {/* About section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-textc mb-3 border-b border-textc/10 pb-2">{t('about')}</h2>
        <p className="text-textc/80 whitespace-pre-line">
          {profile.bio || t('noBio')}
        </p>
      </div>
      
      {/* Profile sections with updated styling */}
      {profile.profile_sections && Object.keys(profile.profile_sections).length > 0 && (
        <div>
          {Object.entries(profile.profile_sections).map(([type, sectionData]) => (
            <div key={type} className="mb-8">
              <h2 className="text-lg font-semibold text-textc mb-3 border-b border-textc/10 pb-2">
                {sectionData.type_name}
              </h2>
              <div className="space-y-6">
                {sectionData.items.map((item) => (
                  <div key={item.id} className="bg-componentbgc rounded-lg p-4 border border-gray-800/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-primaryc">{item.title}</h3>
                        <p className="text-sm text-textc/70">{item.institution}</p>
                      </div>
                      <div className="text-sm text-textc/60">
                        {formatSectionDate(item.start_date, item.end_date)}
                      </div>
                    </div>
                    <div className="mt-2 text-textc/80 whitespace-pre-line">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contact section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-textc mb-3 border-b border-textc/10 pb-2">{t('contact')}</h2>
        <div className="flex items-center gap-2 text-textc/80 mb-4">
          <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>{profile?.email}</span>
        </div>
        
        {/* Simple Contact Button - always shown for testing */}
        <button
          onClick={startConversation}
          disabled={startingChat}
          className="inline-flex items-center gap-2 bg-primaryc text-white px-4 py-2 rounded-lg hover:bg-primaryc/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          {startingChat ? (
            <>
              <Spinner size="sm" /> {t('startingChat')}
            </>
          ) : (
            t('sendMessage')
          )}
        </button>
      </div>
    </div>
  );
} 