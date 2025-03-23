'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/auth';

interface Job {
  id: number;
  title: string;
  profession: string;
  location: string;
  country: string;
  salaryRangeLowest: number;
  salaryRangeHighest: number;
  jobDesc: string;
  business: {
    name: string;
    logo?: string;
    industry?: string;
    description?: string;
    location?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

interface User {
  name: string;
  profession: string;
  country: string;
  role: string;
}

export default function JobDetails() {
  const t = useTranslations('JobDetails');
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile to determine role
        const userResponse = await api.get('/user/profile');
        setUser(userResponse.data.user);
        
        // Fetch specific job details
        const jobResponse = await api.get(`/posts/${jobId}`);
        
        if (jobResponse.data.status) {
          setJob(jobResponse.data.post);
          
          // Check if user has already applied for this job
          if (userResponse.data.user.role === 'user') {
            try {
              const applicationsResponse = await api.get('/applications');
              if (applicationsResponse.data.status) {
                const hasAlreadyApplied = applicationsResponse.data.applications.some(
                  (app: any) => app.post_id === parseInt(jobId)
                );
                setHasApplied(hasAlreadyApplied);
              }
            } catch (error) {
              console.error('Error checking application status:', error);
            }
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleApply = async () => {
    if (user?.role !== 'user') {
      alert(t('onlyUsersCanApply'));
      return;
    }
    
    try {
      setApplying(true);
      const response = await api.post('/applications', { job_id: jobId });
      
      if (response.data.status) {
        alert(t('applicationSuccess'));
        setHasApplied(true);
      } else {
        alert(response.data.message || t('applicationError'));
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      alert(t('applicationError'));
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-backgroundc p-4 max-w-7xl mx-auto">
        <div className="bg-componentbgc p-6 rounded-lg shadow-md border border-red-300">
          <h2 className="text-xl font-bold mb-2 text-textc">{t('errorTitle')}</h2>
          <p className="text-textc/80">{error || t('jobNotFound')}</p>
          <Link 
            href="/jobs" 
            className="mt-4 inline-block text-md text-primaryc hover:text-primaryc/80 duration-150"
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
          href="/jobs" 
          className="text-md text-primaryc hover:text-primaryc/80 duration-150 flex items-center gap-2 inline-flex"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('backToJobs')}
        </Link>
      </div>

      {/* Job Details Block */}
      <div className="bg-componentbgc rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold text-textc">{job.title}</h1>

            <div className="mb-6">
              <div className="inline-block text-xl font-bold mb-4 text-textc border-b border-textc/10 pb-2"></div>
              <div className="prose prose-sm max-w-none text-textc/80">
                {job.jobDesc.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-componentbgc rounded-xl border border-textc/10 p-6 sticky top-6">
              <h2 className="inline-block text-xl font-bold mb-4 text-textc border-b border-textc/10 pb-2">{t('jobDetails')}</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-textc/60">{t('profession')}</span>
                  </div>
                  <span className="text-textc font-medium">{job.profession}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-textc/60">{t('location')}</span>
                  </div>
                  <span className="text-textc font-medium">{job.location}, {job.country}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-textc/60">{t('salary')}</span>
                  </div>
                  <span className="text-textc font-medium">{formatSalary(job.salaryRangeLowest, job.salaryRangeHighest)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-textc/60">{t('postedOn')}</span>
                  </div>
                  <span className="text-textc font-medium">{formatDate(job.created_at)}</span>
                </div>
                
                {job.created_at !== job.updated_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span className="text-textc/60">{t('updatedOn')}</span>
                    </div>
                    <span className="text-textc font-medium">{formatDate(job.updated_at)}</span>
                  </div>
                )}
              </div>
              
              {user?.role === 'user' && (
                hasApplied ? (
                  <div className="w-full bg-green-100 text-green-800 px-4 py-3 rounded-md text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {t('alreadyApplied')}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-primaryc hover:bg-primaryc/90 text-white px-4 py-3 rounded-md transition-all duration-200 hover:shadow-md active:transform active:scale-[0.98] font-medium"
                  >
                    {applying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('applying')}
                      </span>
                    ) : (
                      t('applyNow')
                    )}
                  </button>
                )
              )}
              
              {!user && (
                <div className="mt-4 text-center">
                  <Link href="/auth/login" className="text-primaryc hover:underline text-sm">
                    {t('loginToApply')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Information Block */}
      <div className="bg-componentbgc rounded-xl shadow-md p-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-primaryc/10 rounded-full flex items-center justify-center flex-shrink-0">
            {job.business.logo ? (
              <img src={job.business.logo} alt={job.business.name} className="w-14 h-14 rounded-full" />
            ) : (
              <span className="text-2xl font-bold text-primaryc">{job.business.name.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-grow">
            <h2 className="inline-block text-xl font-bold mb-2 text-textc">{job.business.name}</h2>
            
            <div className="flex flex-wrap gap-y-3 gap-x-6 text-textc/80 mb-4">
              {job.business.industry && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span>{job.business.industry}</span>
                </div>
              )}
              
              {job.business.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{job.business.location}</span>
                </div>
              )}
              
              {job.business.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  <a href={job.business.website} target="_blank" rel="noopener noreferrer" className="text-primaryc hover:underline">
                    {job.business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
            
            {job.business.description && (
              <div>
                <h3 className="inline-block text-lg font-semibold mb-3 text-textc border-b border-textc/10 pb-2">{t('aboutCompany')}</h3>
                <div className="prose prose-sm max-w-none text-textc/80">
                  {job.business.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 