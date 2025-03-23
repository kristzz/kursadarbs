'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/auth';
import CountryDropdown from '@/components/countryDropdown';

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
  };
  created_at: string;
}

interface User {
  name: string;
  profession: string;
  country: string;
  role: string;
}

export default function Jobs() {
  const t = useTranslations('Jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [applications, setApplications] = useState<number[]>([]);
  const [applyingToJobId, setApplyingToJobId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile to determine role
        const userResponse = await api.get('/user/profile');
        setUser(userResponse.data.user);
        
        // If user is a regular user, fetch their applications
        if (userResponse.data.user.role === 'user') {
          try {
            const applicationsResponse = await api.get('/applications');
            if (applicationsResponse.data.status) {
              const appliedJobIds = applicationsResponse.data.applications.map(
                (app: any) => app.post_id
              );
              setApplications(appliedJobIds);
            }
          } catch (error) {
            console.error('Error fetching applications:', error);
          }
        }
        
        // Fetch jobs with search and sort parameters
        const jobsResponse = await api.get('/posts', {
          params: {
            search: searchTerm,
            sortKey,
            sortOrder
          }
        });
        
        if (jobsResponse.data.status) {
          setJobs(jobsResponse.data.posts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, sortKey, sortOrder]);

  const handleApply = async (jobId: number) => {
    if (user?.role !== 'user') {
      alert(t('onlyUsersCanApply'));
      return;
    }
    
    try {
      setApplyingToJobId(jobId);
      const response = await api.post('/applications', { job_id: jobId });
      
      if (response.data.status) {
        alert(t('applicationSuccess'));
        setApplications([...applications, jobId]);
      } else {
        alert(response.data.message || t('applicationError'));
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      alert(t('applicationError'));
    } finally {
      setApplyingToJobId(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('availableJobs')}</h1>
      
      {/* Search and filter section */}
      <div className="bg-componentbgc rounded-lg shadow-md p-4 mb-6 border border-textc/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchJobs')}
              className="w-full px-4 py-2 border rounded-md bg-componentbgc focus:border-primaryc focus:ring-1 focus:ring-primaryc transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 border rounded-md bg-componentbgc focus:border-primaryc focus:ring-1 focus:ring-primaryc transition-colors"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="title">{t('sortByTitle')}</option>
              <option value="created_at">{t('sortByDate')}</option>
              <option value="salaryRangeLowest">{t('sortBySalary')}</option>
            </select>
            <select 
              className="px-4 py-2 border rounded-md bg-componentbgc focus:border-primaryc focus:ring-1 focus:ring-primaryc transition-colors"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">{t('ascending')}</option>
              <option value="desc">{t('descending')}</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-componentbgc p-8 rounded-lg text-center border border-textc/10">
          <h3 className="text-xl font-semibold text-textc">{t('noJobsFound')}</h3>
          <p className="mt-2 text-textc/60">{t('tryDifferentSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-componentbgc rounded-lg shadow-md overflow-hidden border border-textc/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primaryc/30"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primaryc/10 rounded-full flex items-center justify-center mr-4 transition-colors duration-300 group-hover:bg-primaryc/20">
                    {job.business.logo ? (
                      <img src={job.business.logo} alt={job.business.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-xl font-bold text-primaryc">{job.business.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-textc">{job.business.name}</h3>
                    <p className="text-sm text-textc/60">{formatDate(job.created_at)}</p>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-textc">{job.title}</h2>
                <div className="mb-4">
                  <div className="flex items-center text-textc/80 mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {job.profession}
                  </div>
                  <div className="flex items-center text-textc/80 mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {job.location}, {job.country}
                  </div>
                  <div className="flex items-center text-textc/80">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {formatSalary(job.salaryRangeLowest, job.salaryRangeHighest)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-textc/80 text-sm line-clamp-3">{job.jobDesc}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="text-primaryc hover:text-primaryc/80 font-medium transition-colors"
                  >
                    {t('viewDetails')}
                  </Link>
                  
                  {user?.role === 'user' && (
                    applications.includes(job.id) ? (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium">
                        {t('applied')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applyingToJobId === job.id}
                        className="bg-primaryc hover:bg-primaryc/90 text-white px-4 py-2 rounded-md transition-all duration-200 hover:shadow-md active:transform active:scale-[0.98] disabled:opacity-70"
                      >
                        {applyingToJobId === job.id ? t('applying') : t('apply')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
