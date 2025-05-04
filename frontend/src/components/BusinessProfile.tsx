"use client"

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/services/auth'
import { Spinner } from '@/components/spinner'
import CreatePostForm from '@/components/CreatePostForm'
import { Trash2, Edit, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import EditPostForm from '@/components/EditPostForm'
import StartConversationButton from './messages/StartConversationButton'

interface BusinessProfileData {
    id: number
    name: string
    industry: string
    website?: string
    logo?: string
    description?: string
    country: string
    location: string
}

interface JobPost {
    id: number
    title: string
    profession: string
    location: string
    salaryRangeLowest: number
    salaryRangeHighest: number
}

interface Job {
    id: number;
    title: string;
    profession: string;
    location: string;
    country: string;
    salaryRangeLowest: number;
    salaryRangeHighest: number;
    jobDesc: string;
    applications_count: number;
    created_at: string;
}

interface BusinessProfileProps {
    userId: number;
}

export default function BusinessProfile({ userId }: BusinessProfileProps) {
    const t = useTranslations('BusinessProfile');
    const [profile, setProfile] = useState<BusinessProfileData | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<BusinessProfileData>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreatePostForm, setShowCreatePostForm] = useState(false)
    const [needsBusinessProfile, setNeedsBusinessProfile] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingPostId, setEditingPostId] = useState<number | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true)
            
            // Fetch business profile
            const profileResponse = await api.get('/business-profile')
            if (profileResponse.data.status) {
                setProfile(profileResponse.data.business)
                setFormData(profileResponse.data.business || {})
            } else {
                setNeedsBusinessProfile(true)
                setFormData({
                    name: '',
                    industry: '',
                    website: '',
                    description: '',
                    country: '',
                    location: ''
                })
            }
            
            // Fetch jobs posted by this business
            const jobsResponse = await api.get('/my-posts')
            
            if (jobsResponse.data.status) {
                if (Array.isArray(jobsResponse.data.posts)) {
                    setJobs(jobsResponse.data.posts)
                } else {
                    setJobs([])
                }
            } else {
                setJobs([]) // Ensure jobs is an empty array, not undefined
                
                if (jobsResponse.data.message === 'No business profile found for this user') {
                    setNeedsBusinessProfile(true)
                    setIsEditing(true) // Automatically open the edit form
                }
            }

            // Fetch user role
            const userRoleResponse = await api.get('/user/profile')
            if (userRoleResponse.data && userRoleResponse.data.user) {
                setUserRole(userRoleResponse.data.user.role)
                setCurrentUserId(userRoleResponse.data.user.id || null)
            } else {
                setUserRole(null)
                setCurrentUserId(null)
            }
        } catch (err: any) {
            console.error('Error fetching business profile:', err)
            setError('Failed to load business profile')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            const response = await api.put('/business-profile', formData)
            if (response.data.status) {
                setProfile(response.data.business)
                setIsEditing(false)
                setNeedsBusinessProfile(false)
                setError('')
                // Refresh the profile data
                fetchProfile()
            } else {
                setError(response.data.message || 'Failed to update profile')
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }
    
    const handlePostCreated = (newPost: JobPost) => {
        setJobs(prevJobs => [newPost as any, ...prevJobs])
        // Refresh the job list after creating a new post
        fetchProfile()
        setShowCreatePostForm(false) // Close the form after successful creation
    }

    const onDeleteJob = async (jobId: number) => {
        if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
        
        try {
            const response = await api.delete('/delete-post', {
                data: { id: jobId }
            });

            if (response.data.status) {
                // Update the UI by removing the deleted job
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
                // Optionally show a success message
                setError(''); // Clear any previous errors
            } else {
                setError(response.data.message || 'Failed to delete job post');
            }
        } catch (err: any) {
            console.error('Error deleting job post:', err);
            setError(err.response?.data?.message || 'Failed to delete job post');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditPost = (postId: number) => {
        setEditingPostId(postId)
    }

    const handlePostUpdated = () => {
        fetchProfile()
        setEditingPostId(null)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Business Information */}
            {isEditing ? (
                <div className="bg-componentbgc rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-textc">
                        {needsBusinessProfile ? t('createBusinessProfile') : t('editBusinessProfile')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-textc mb-1">
                                    {t('businessName')} *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-textc mb-1">
                                    {t('industry')} *
                                </label>
                                <input
                                    type="text"
                                    id="industry"
                                    name="industry"
                                    value={formData.industry || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-textc mb-1">
                                    {t('country')} *
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-textc mb-1">
                                    {t('location')} *
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label htmlFor="website" className="block text-sm font-medium text-textc mb-1">
                                    {t('website')}
                                </label>
                                <input
                                    type="url"
                                    id="website"
                                    name="website"
                                    value={formData.website || ''}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com"
                                    className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-textc mb-1">
                                {t('description')}
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            {!needsBusinessProfile && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 border border-textc/20 rounded-md text-textc hover:bg-textc/5"
                                >
                                    {t('cancel')}
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primaryc text-white rounded-md hover:bg-primaryc/90 flex items-center gap-2"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Spinner size="sm" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>{needsBusinessProfile ? t('create') : t('save')}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : profile ? (
                <div className="bg-componentbgc rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-primaryc/10 rounded-full flex items-center justify-center flex-shrink-0">
                                {profile.logo ? (
                                    <img src={profile.logo} alt={profile.name} className="w-14 h-14 rounded-full" />
                                ) : (
                                    <span className="text-2xl font-bold text-primaryc">{profile.name?.charAt(0) || 'B'}</span>
                                )}
                            </div>
                            
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold mb-2 text-textc">{profile.name || t('businessName')}</h2>
                                
                                <div className="flex flex-wrap gap-y-3 gap-x-6 text-textc/80 mb-4">
                                    {profile.industry && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                            </svg>
                                            <span>{profile.industry}</span>
                                        </div>
                                    )}
                                    
                                    {profile.location && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            <span>{profile.location}, {profile.country}</span>
                                        </div>
                                    )}
                                    
                                    {profile.website && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primaryc" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                                            </svg>
                                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primaryc hover:underline">
                                                {profile.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                
                                {profile.description && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-textc border-b border-textc/10 pb-2">{t('aboutBusiness')}</h3>
                                        <div className="prose prose-sm max-w-none text-textc/80">
                                            {profile.description.split('\n').map((paragraph: string, index: number) => (
                                                <p key={index} className="mb-4">{paragraph}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-primaryc hover:text-primaryc/80 p-2 rounded-full hover:bg-primaryc/10 transition-colors"
                                title={t('editBusinessProfile')}
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                            
                            {/* Add message button for non-owners */}
                            {userRole !== "EMPLOYER" && currentUserId !== profile.id && (
                                <StartConversationButton 
                                    recipientId={profile.id}
                                    recipientType="business"
                                    buttonText={t('contactBusiness')}
                                    redirectToMessages={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            ) : needsBusinessProfile ? (
                <div className="bg-yellow-50 p-6 rounded-lg shadow-md border border-yellow-200 mb-6">
                    <h2 className="text-xl font-bold mb-2 text-yellow-800">{t('noBusinessProfile')}</h2>
                    <p className="text-yellow-700 mb-4">{t('createBusinessProfileDesc')}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primaryc text-white rounded-md hover:bg-primaryc/90"
                    >
                        {t('createBusinessProfile')}
                    </button>
                </div>
            ) : null}

            {/* Job Listings */}
            <div className="bg-componentbgc rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-textc">{t('jobListings')}</h2>
                    <button 
                        onClick={() => setShowCreatePostForm(true)}
                        className="bg-primaryc hover:bg-primaryc/90 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('createJob')}
                    </button>
                </div>
                
                {jobs && jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-componentbgc rounded-xl shadow-md overflow-hidden border border-textc/10 hover:shadow-lg transition-shadow duration-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-bold text-textc">{job.title}</h2>
                                        <span className="text-sm text-textc/60">{formatDate(job.created_at)}</span>
                                    </div>
                                    
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
                                        {job.salaryRangeLowest && job.salaryRangeHighest && (
                                            <div className="flex items-center text-textc/80 mb-1">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                ${job.salaryRangeLowest.toLocaleString()} - ${job.salaryRangeHighest.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="flex items-center text-textc/80">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            {job.applications_count || 0} {job.applications_count === 1 ? 'applicant' : 'applicants'}
                                        </div>
                                    </div>
                                    
                                    {job.jobDesc && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-textc mb-1">Description</h3>
                                            <p className="text-textc/80 text-sm line-clamp-3">
                                                {job.jobDesc}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-textc/10">
                                        <Link
                                            href={`/jobs/${job.id}`}
                                            className="text-primaryc hover:text-primaryc/80 font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                            {t('viewJob')}
                                        </Link>
                                        
                                        <Link
                                            href={`/employer/jobs/${job.id}/applications`}
                                            className="text-primaryc hover:text-primaryc/80 font-medium flex items-center gap-1 ml-4"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            {t('viewApplications')} ({job.applications_count || 0})
                                        </Link>
                                        
                                        <button
                                            onClick={() => handleEditPost(job.id)}
                                            className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1 ml-4"
                                        >
                                            <Edit className="w-4 h-4" />
                                            {t('edit')}
                                        </button>
                                        
                                        <button
                                            onClick={() => onDeleteJob(job.id)}
                                            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 ml-4"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 text-textc/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-textc mb-2">{t('noJobsPosted')}</h3>
                        <p className="text-textc/60 mb-4">{t('createJobDescription')}</p>
                        <button 
                            onClick={() => setShowCreatePostForm(true)}
                            className="inline-block bg-primaryc hover:bg-primaryc/90 text-white px-4 py-2 rounded-md transition-all duration-200"
                        >
                            {t('createJob')}
                        </button>
                    </div>
                )}
            </div>

            {showCreatePostForm && (
                <CreatePostForm
                    onSuccess={handlePostCreated}
                    onClose={() => setShowCreatePostForm(false)}
                />
            )}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {editingPostId && (
                <EditPostForm
                    postId={editingPostId}
                    onSuccess={handlePostUpdated}
                    onClose={() => setEditingPostId(null)}
                />
            )}
        </div>
    )
}