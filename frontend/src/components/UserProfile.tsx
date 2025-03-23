"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { SectionType, UserProfileType, ProfileSection } from '@/types/profile'

import { api } from '@/services/auth'
import { Spinner } from '@/components/spinner'

const BORDER_STYLES = {
    [SectionType.WORK_EXPERIENCE]: "border-primaryc/30 hover:border-primaryc/50",
    [SectionType.EDUCATION]: "border-accentc/30 hover:border-accentc/50",
    [SectionType.PROJECT]: "border-secondaryc/30 hover:border-secondaryc/50",
    [SectionType.SKILL]: "border-primaryc/30 hover:border-primaryc/50",
    [SectionType.AWARD]: "border-accentc/30 hover:border-accentc/50",
    [SectionType.LANGUAGE]: "border-secondaryc/30 hover:border-secondaryc/50",
    [SectionType.CERTIFICATION]: "border-primaryc/30 hover:border-primaryc/50"
} as const;

const SECTION_TYPE_NAMES = {
    [SectionType.EDUCATION]: 'Education',
    [SectionType.WORK_EXPERIENCE]: 'Work Experience',
    [SectionType.CERTIFICATION]: 'Certifications',
    [SectionType.PROJECT]: 'Projects',
    [SectionType.SKILL]: 'Skills & Technologies',
    [SectionType.AWARD]: 'Awards',
    [SectionType.LANGUAGE]: 'Languages',
} as const;

const Masonry = dynamic(() => import('react-masonry-css'), { ssr: false })
const ProfileSectionComponent = dynamic(() => import('@/components/ProfileSection'))
const AddSectionForm = dynamic(() => import('@/components/AddSectionForm'))

export default function UserProfile({ user }: { user: UserProfileType }) {
    const [sections, setSections] = useState<ProfileSection[]>([])
    const [error, setError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, sectionsRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/profile/sections')
            ]);

            // Handle API response structure variations
            const sectionsData = sectionsRes.data?.sections || sectionsRes.data || [];
            
            UserProfile(profileRes.data?.user || null);
            setSections(Array.isArray(sectionsData) ? sectionsData : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        }
    }, []);

    const fetchSections = useCallback(async () => {
        try {
            const response = await api.get('/profile/sections')
            setSections(response.data.sections || [])
        } catch (err) {
            setError('Failed to load sections')
        }
    }, [])

    useEffect(() => {
        fetchSections()
    }, [fetchSections])

    const groupedSections = useMemo(() => {
        return Object.values(SectionType).reduce((acc, type) => {
            acc[type] = sections.filter(s => s.section_type?.toLowerCase() === type.toLowerCase());
            return acc;
        }, {} as Record<SectionType, ProfileSection[]>);
    }, [sections]);

    const handleAddSection = async (formData: any) => {
        setIsUpdating(true)
        try {
            const response = await api.post('/profile/sections', formData)
            setSections(prev => [...prev, response.data.section])
            setShowAddForm(false)
        } catch (err) {
            setError('Failed to add section')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleToggleVisibility = useCallback(async (id: number) => {
        setSections(prev => prev.map(s => 
            s.id === id ? { ...s, is_public: !s.is_public } : s
        ));

        try {
            await api.post(`/profile/sections/${id}/toggle`);
        } catch (err) {
            setSections(prev => prev.map(s => 
                s.id === id ? { ...s, is_public: !s.is_public } : s
            ));
        }
    }, []);

    const handleDeleteSection = useCallback(async (id: number) => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        setIsUpdating(true);
        try {
            await api.delete(`/profile/sections/${id}`);
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete section');
            await fetchData();
        } finally {
            setIsUpdating(false);
        }
    }, [fetchData]);

    return (
        <div className="p-4 max-w-7xl mx-auto relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-backgroundc/50 backdrop-blur-sm z-10" />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-1 bg-componentbgc rounded-lg border border-textc/20 p-6 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="w-24 h-24 rounded-full bg-primaryc/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-textc">
                            {user?.name?.charAt(0) || '?'}
                        </span>
                    </div>
                </div>

                <div className="col-span-2 md:col-span-1 bg-componentbgc rounded-lg border border-textc/20 p-6 flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div>
                        <h1 className="text-2xl font-bold text-textc mb-1">{user?.name}</h1>
                        <p className="text-lg text-textc/80 mb-1">{user?.profession || 'Add your profession'}</p>
                        <div className="flex items-center gap-2 text-textc/60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{user?.country || 'Add your country'}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="group bg-componentbgc rounded-lg border-2 border-dashed border-textc/20 p-6 flex flex-col col-span-3 md:col-span-1 items-center justify-center gap-3 transition-all duration-200 hover:border-primaryc/50 hover:bg-primaryc/5 active:transform active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-full bg-primaryc/20 flex items-center justify-center group-hover:bg-primaryc/30 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-textc transition-transform group-hover:rotate-90 duration-200" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-textc/80 group-hover:text-textc transition-colors duration-200">
                        Add New Section
                    </span>
                </button>
            </div>

            {error && (
                <div className="md:col-span-3 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

                <Masonry
                breakpointCols={{ default: 3, 1280: 2, 800: 1 }} // Match grid columns
                className="flex w-full gap-4 col-span-3"
                columnClassName=""
                >
                {Object.entries(groupedSections)
                    .filter(([_, s]) => s.length > 0)
                    .map(([type, sections]) => (
                        <div 
                            key={type}
                            className={`mb-4 w-full bg-componentbgc rounded-lg border ${BORDER_STYLES[type as SectionType]} p-6 transition-transform duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5`}
                        >
                            <h2 className="text-xl sm:text-2xl font-bold text-textc mb-4">
                                {SECTION_TYPE_NAMES[type as SectionType]}
                            </h2>
                            <div className="space-y-4">
                                {sections.map(section => (
                                    <ProfileSectionComponent 
                                        key={section.id} 
                                        section={section} 
                                        onToggleVisibility={handleToggleVisibility} 
                                        onDelete={handleDeleteSection} 
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
            </Masonry>

            {sections.length === 0 && (
                <div className="text-textc/60 text-center p-8 bg-componentbgc rounded-lg border border-textc/20">
                    No profile sections yet. Click the button above to add your first section!
                </div>
            )}

            {showAddForm && (
                <AddSectionForm
                    onSubmit={handleAddSection}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}