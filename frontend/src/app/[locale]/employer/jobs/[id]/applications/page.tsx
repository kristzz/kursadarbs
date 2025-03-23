'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { api } from '@/services/auth';

interface Applicant {
  id: number;
  name: string;
  email: string;
  profession: string;
  country: string;
  created_at: string;
}

interface JobApplication {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
  user: Applicant;
}

interface Post {
  id: number;
  title: string;
}

export default function JobApplicationsPage() {
  const t = useTranslations('JobApplications');
  const params = useParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/job-applications/${params.id}`);
        
        if (response.data.status) {
          setApplications(response.data.applications);
          setPost(response.data.post);
        } else {
          setError(response.data.message || 'Failed to load applications');
        }
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
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
          <Link 
            href="/profile" 
            className="inline-block mt-4 text-primaryc hover:text-primaryc/80"
          >
            {t('backToJobs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/profile" 
          className="text-primaryc hover:text-primaryc/80 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('backToJobs')}
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold text-textc mb-6">
        {t('applicationsFor')} "{post?.title}"
      </h1>
      
      {applications.length > 0 ? (
        <div className="bg-componentbgc rounded-xl shadow-md p-6">
          <div className="mb-4 text-textc/70">
            {applications.length} {applications.length === 1 ? t('applicant') : t('applicants')}
          </div>
          
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="border border-textc/10 rounded-lg p-4 hover:bg-componentbgc/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-textc">{application.user.name}</h3>
                  <span className="text-sm text-textc/60">
                    {t('appliedOn')} {formatDate(application.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-textc/60 mb-1">Email</div>
                    <div className="text-textc">{application.user.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-textc/60 mb-1">{t('profession')}</div>
                    <div className="text-textc">{application.user.profession || '-'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-textc/60 mb-1">{t('location')}</div>
                    <div className="text-textc">{application.user.country || '-'}</div>
                  </div>
                </div>
                
                <Link
                  href={`/users/${application.user_id}`}
                  className="text-primaryc hover:text-primaryc/80 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {t('viewProfile')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-componentbgc rounded-xl shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-textc/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-bold text-textc mb-2">{t('noApplications')}</h2>
          <p className="text-textc/60">{t('noApplicationsDesc')}</p>
        </div>
      )}
    </div>
  );
} 