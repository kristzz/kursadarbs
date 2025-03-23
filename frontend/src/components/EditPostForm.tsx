"use client"

import { useState, useEffect } from 'react'
import { api } from '@/services/auth'
import { Spinner } from '@/components/spinner'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CountryDropdown from './countryDropdown'

interface EditPostFormProps {
  postId: number
  onSuccess: () => void
  onClose: () => void
}

interface PostData {
  id: number
  title: string
  jobDesc: string
  profession: string
  country: string
  location: string
  salaryRangeLowest: number
  salaryRangeHighest: number
}

export default function EditPostForm({ postId, onSuccess, onClose }: EditPostFormProps) {
  const t = useTranslations('EditPost')
  const [formData, setFormData] = useState<PostData>({
    id: postId,
    title: '',
    jobDesc: '',
    profession: '',
    country: '',
    location: '',
    salaryRangeLowest: 0,
    salaryRangeHighest: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/posts/${postId}`)
        if (response.data.status) {
          setFormData({
            id: postId,
            title: response.data.post.title,
            jobDesc: response.data.post.jobDesc,
            profession: response.data.post.profession,
            country: response.data.post.country,
            location: response.data.post.location,
            salaryRangeLowest: response.data.post.salaryRangeLowest,
            salaryRangeHighest: response.data.post.salaryRangeHighest
          })
        } else {
          setError(response.data.message || 'Failed to load job post')
        }
      } catch (err: any) {
        console.error('Error fetching post:', err)
        setError(err.response?.data?.message || 'Failed to load job post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salaryRangeLowest' || name === 'salaryRangeHighest' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleCountryChange = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      
      const response = await api.put(`/edit-post`, formData)
      
      if (response.data.status) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(response.data.message || 'Failed to update job post')
      }
    } catch (err: any) {
      console.error('Error updating post:', err)
      setError(err.response?.data?.message || 'Failed to update job post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-componentbgc rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-textc/10">
          <h2 className="text-xl font-bold text-textc">{t('editJob')}</h2>
          <button 
            onClick={onClose}
            className="text-textc/60 hover:text-textc p-2 rounded-full hover:bg-textc/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryc"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
              {error}
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-textc/10 text-textc rounded-md hover:bg-textc/20"
              >
                {t('close')}
              </button>
            </div>
          </div>
        ) : success ? (
          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-lg text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {t('jobUpdated')}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-textc mb-1">
                {t('jobTitle')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
              />
            </div>
            
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-textc mb-1">
                {t('profession')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-textc mb-1">
                  {t('country')} <span className="text-red-500">*</span>
                </label>
                <CountryDropdown
                  value={formData.country}
                  onChange={handleCountryChange}
                  className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-textc mb-1">
                  {t('location')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                  placeholder={t('cityOrRegion')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salaryRangeLowest" className="block text-sm font-medium text-textc mb-1">
                  {t('minSalary')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="salaryRangeLowest"
                  name="salaryRangeLowest"
                  value={formData.salaryRangeLowest}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                />
              </div>
              
              <div>
                <label htmlFor="salaryRangeHighest" className="block text-sm font-medium text-textc mb-1">
                  {t('maxSalary')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="salaryRangeHighest"
                  name="salaryRangeHighest"
                  value={formData.salaryRangeHighest}
                  onChange={handleChange}
                  required
                  min={formData.salaryRangeLowest}
                  step="100"
                  className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="jobDesc" className="block text-sm font-medium text-textc mb-1">
                {t('jobDescription')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jobDesc"
                name="jobDesc"
                value={formData.jobDesc}
                onChange={handleChange}
                required
                rows={6}
                className="w-full p-2 border border-textc/20 rounded-md bg-componentbgc text-textc"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-textc/10 text-textc rounded-md hover:bg-textc/20"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primaryc text-white rounded-md hover:bg-primaryc/90 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    <span>{t('saving')}</span>
                  </>
                ) : (
                  <span>{t('saveChanges')}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 