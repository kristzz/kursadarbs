"use client"

import { useState } from 'react';
import { api } from '@/services/auth';

interface CreatePostFormProps {
    onSuccess: (post: any) => void;
    onClose: () => void;
}

export default function CreatePostForm({ onSuccess, onClose }: CreatePostFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        jobDesc: '',
        profession: '',
        country: '',
        location: '',
        salaryRangeLowest: '',
        salaryRangeHighest: ''
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.jobDesc.trim()) newErrors.jobDesc = 'Job description is required';
        if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        
        if (!formData.salaryRangeLowest) {
            newErrors.salaryRangeLowest = 'Minimum salary is required';
        } else if (parseFloat(formData.salaryRangeLowest) < 0) {
            newErrors.salaryRangeLowest = 'Salary cannot be negative';
        }
        
        if (!formData.salaryRangeHighest) {
            newErrors.salaryRangeHighest = 'Maximum salary is required';
        } else if (
            parseFloat(formData.salaryRangeHighest) <= parseFloat(formData.salaryRangeLowest)
        ) {
            newErrors.salaryRangeHighest = 'Maximum salary must be greater than minimum salary';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            
            const response = await api.post('/post', formData);
            
            if (response.data.status) {
                onSuccess(response.data.post);
                onClose();
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error creating post:', error);
                setErrors({ general: 'Failed to create post. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-componentbgc rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-textc">Create New Job Post</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textc/80 mb-1">
                            Job Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc/80 mb-1">
                            Profession
                        </label>
                        <input
                            type="text"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                            required
                        />
                        {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc/80 mb-1">
                            Job Description
                        </label>
                        <textarea
                            name="jobDesc"
                            value={formData.jobDesc}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-textc/20 p-2 min-h-[150px] bg-componentbgc text-textc"
                            required
                        />
                        {errors.jobDesc && <p className="text-red-500 text-sm mt-1">{errors.jobDesc}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc/80 mb-1">
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                            required
                        />
                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc/80 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                            placeholder="City, Region"
                            required
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textc/80 mb-1">
                                Minimum Salary
                            </label>
                            <input
                                type="number"
                                name="salaryRangeLowest"
                                value={formData.salaryRangeLowest}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                                min="0"
                                required
                            />
                            {errors.salaryRangeLowest && (
                                <p className="text-red-500 text-sm mt-1">{errors.salaryRangeLowest}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textc/80 mb-1">
                                Maximum Salary
                            </label>
                            <input
                                type="number"
                                name="salaryRangeHighest"
                                value={formData.salaryRangeHighest}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-textc/20 p-2 bg-componentbgc text-textc"
                                min="0"
                                required
                            />
                            {errors.salaryRangeHighest && (
                                <p className="text-red-500 text-sm mt-1">{errors.salaryRangeHighest}</p>
                            )}
                        </div>
                    </div>

                    {errors.general && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-textc hover:text-textc/80"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primaryc text-white rounded-lg hover:bg-primaryc/90 transition"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Job Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}