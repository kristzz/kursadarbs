"use client"

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/services/auth'
import { Spinner } from '@/components/spinner'
import CreatePostForm from '@/components/CreatePostForm'
import { Trash2 } from 'lucide-react';

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

export default function BusinessProfile({ user }: { user: any }) {
    const [profile, setProfile] = useState<BusinessProfileData | null>(null)
    const [jobs, setJobs] = useState<JobPost[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<BusinessProfileData>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreatePostForm, setShowCreatePostForm] = useState(false)

    const fetchProfile = useCallback(async () => {
        try {
            const [profileRes, jobsRes] = await Promise.all([
                api.get('/business-profile'),
                api.get('/my-posts')
            ])
            
            setProfile(profileRes.data.business)
            setJobs(jobsRes.data.posts)
            setFormData(profileRes.data.business || {})
        } catch (err) {
            setError('Failed to load business profile')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await api.put('/business-profile', formData)
            setProfile(response.data.business)
            setIsEditing(false)
        } catch (err) {
            setError('Failed to update profile')
        }
    }
    
    const handlePostCreated = (newPost: JobPost) => {
        setJobs(prevJobs => [newPost, ...prevJobs])
    }

    const onDeleteJob = async (jobId: number) => {
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
            setError(err.response?.data?.message || 'Failed to delete job post');
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="mb-8 bg-componentbgc rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 rounded-full bg-primaryc/10 flex items-center justify-center">
                            {profile?.logo ? (
                                <img src={profile.logo} alt="Logo" className="w-full h-full rounded-full" />
                            ) : (
                                <span className="text-4xl text-primaryc">
                                    {profile?.name?.charAt(0).toUpperCase() || 'B'}
                                </span>
                            )}
                        </div>
                        
                        <div>
                            <h1 className="text-3xl font-bold text-textc mb-2">
                                {profile?.name || 'Business Name'}
                            </h1>
                            <div className="flex items-center gap-4 text-textc/80">
                                <span className="bg-primaryc/10 px-3 py-1 rounded-full text-sm">
                                    {profile?.industry || 'Industry'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <LocationIcon />
                                    {profile?.location} {profile?.country}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-primaryc/10 text-primaryc rounded-lg hover:bg-primaryc/20 transition"
                    >
                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-textc/80 mb-1">
                                    Business Name
                                </label>
                                <input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-textc/20 bg-componentbgc"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textc/80 mb-1">
                                    Industry
                                </label>
                                <input
                                    value={formData.industry || ''}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-textc/20 bg-componentbgc"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textc/80 mb-1">
                                    Website
                                </label>
                                <input
                                    value={formData.website || ''}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-textc/20 bg-componentbgc"
                                    type="url"
                                    placeholder="https://example.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textc/80 mb-1">
                                    Country
                                </label>
                                <input
                                    value={formData.country || ''}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-textc/20 bg-componentbgc"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textc/80 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 rounded-lg border border-textc/20 bg-componentbgc h-32"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-primaryc text-white rounded-lg hover:bg-primaryc/90 transition"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <p className="text-textc/80 leading-relaxed">
                        {profile?.description || 'No description provided'}
                    </p>
                )}
            </div>

            <div className="mb-8 p-6 bg-componentbgc rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-textc mb-4">Job Posts</h2>
                    <button 
                        onClick={() => setShowCreatePostForm(true)}
                        className="px-4 py-2 bg-primaryc text-white rounded-lg hover:bg-primaryc/90 transition"
                    >
                        Create New Job Post
                    </button>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.length > 0 ? (
                        jobs.map(job => (
                            <div key={job.id} className="bg-componentbgc p-4 rounded-lg border border-textc/20 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-textc">{job.title}</h3>
                                    <button
                                        onClick={() => onDeleteJob(job.id)}
                                        className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-500/10"
                                        aria-label="Delete job"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="text-textc/80 space-y-1">
                                    <p>{job.profession}</p>
                                    <p>{job.location}</p>
                                    <p>Salary: ${job.salaryRangeLowest.toLocaleString()} - ${job.salaryRangeHighest.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-textc/60">
                            No job posts yet. Create your first job post!
                        </div>
                    )}
                </div>
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
        </div>
    )
}

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
)