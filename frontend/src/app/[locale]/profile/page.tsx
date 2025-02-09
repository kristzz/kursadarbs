"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProfileSection as ProfileSectionType, UserProfile, SectionType } from '@/types/profile';
import ProfileSection from '@/components/ProfileSection';
import AddSectionForm from '@/components/AddSectionForm';
import { getCsrfToken } from '@/services/auth';
import { Spinner } from '@/components/spinner';
import { Switch } from '@/components/Switch';
import { Trash2, Clock } from 'lucide-react';
import { getGridStyles } from '@/utils/gridStyles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
    });
};

export default function ProfilePage(): JSX.Element {
    const [sections, setSections] = useState<ProfileSectionType[]>([]);
    const [error, setError] = useState<string>('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Update the groupedSections object to include all section types
    const groupedSections = {
        [SectionType.EDUCATION]: sections.filter(s => s.section_type === SectionType.EDUCATION),
        [SectionType.WORK_EXPERIENCE]: sections.filter(s => s.section_type === SectionType.WORK_EXPERIENCE),
        [SectionType.CERTIFICATION]: sections.filter(s => s.section_type === SectionType.CERTIFICATION),
        [SectionType.PROJECT]: sections.filter(s => s.section_type === SectionType.PROJECT),
        [SectionType.SKILL]: sections.filter(s => s.section_type === SectionType.SKILL),
        [SectionType.AWARD]: sections.filter(s => s.section_type === SectionType.AWARD),
        [SectionType.LANGUAGE]: sections.filter(s => s.section_type === SectionType.LANGUAGE),
    };

    // Update section type display names
    const sectionTypeNames = {
        [SectionType.EDUCATION]: 'Education',
        [SectionType.WORK_EXPERIENCE]: 'Work Experience',
        [SectionType.CERTIFICATION]: 'Certifications',
        [SectionType.PROJECT]: 'Projects',
        [SectionType.SKILL]: 'Skills & Technologies',
        [SectionType.AWARD]: 'Awards',
        [SectionType.LANGUAGE]: 'Languages',
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/profile`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (response.data.user) {
                setUserProfile(response.data.user);
            } else {
                console.error('Profile fetch failed: No user data in response');
                setError('Failed to load profile data');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
    };

    const fetchSections = async () => {
        try {
            const response = await axios.get(`${API_URL}/profile/sections`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (response.data.status) {
                setSections(response.data.sections);
            } else {
                console.error('Sections fetch failed:', response.data.message);
                setError('Failed to load sections');
            }
        } catch (err) {
            console.error('Sections fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load sections');
        }
    };

    const handleAddSection = async (formData: {
        section_type: SectionType;
        description: string;
        institution: string;
        start_date: string;
        end_date: string;
        is_public: boolean;
    }) => {
        setIsUpdating(true);
        try {
            await getCsrfToken();
            const response = await axios.post(
                `${API_URL}/profile/sections`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                }
            );
            // Handle nested response data
            const newSection = response.data.section || response.data;
            setSections(prev => Array.isArray(prev) ? [...prev, newSection] : [newSection]);
            setShowAddForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add section');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleVisibility = async (id: number) => {
        // Optimistic update
        setSections(prev => prev.map(section => 
            section.id === id 
                ? { ...section, is_public: !section.is_public }
                : section
        ));

        try {
            await getCsrfToken();
            await axios.post(
                `${API_URL}/profile/sections/${id}/toggle`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                }
            );
        } catch (err) {
            // Revert on error
            setSections(prev => prev.map(section => 
                section.id === id 
                    ? { ...section, is_public: !section.is_public }
                    : section
            ));
            setError(err instanceof Error ? err.message : 'Failed to toggle visibility');
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this section?')) {
            return;
        }

        setIsUpdating(true);
        try {
            await getCsrfToken();
            await axios.delete(`${API_URL}/profile/sections/${id}`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            // Optimistic update
            setSections(prev => prev.filter(section => section.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete section');
            await fetchSections(); // Refresh the sections in case of error
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            try {
                await getCsrfToken();
                await Promise.all([fetchUserProfile(), fetchSections()]);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize page');
            } finally {
                setIsInitialLoading(false);
            }
        };

        initializePage();
    }, []);

    // Debug logs for state changes
    useEffect(() => {
        
    }, [userProfile]);

    useEffect(() => {

    }, [sections]);

    if (isInitialLoading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 max-w-7xl mx-auto relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-backgroundc/50 backdrop-blur-sm z-10" />
            )}
            
            {/* Header section - reorganized for mobile */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Profile Picture - 1/3 width */}
                <div className="col-span-1 bg-componentbgc rounded-lg border border-textc/20 p-6 flex items-center justify-center
                    transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="w-24 h-24 rounded-full bg-primaryc/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-textc">
                            {userProfile?.name?.charAt(0) || '?'}
                        </span>
                    </div>
                </div>

                {/* Info Container - 2/3 width */}
                <div className="col-span-2 md:col-span-1 bg-componentbgc rounded-lg border border-textc/20 p-6 flex flex-col justify-center
                    transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div>
                        <h1 className="text-2xl font-bold text-textc mb-1">{userProfile?.name}</h1>
                        <p className="text-lg text-textc/80 mb-1">{userProfile?.profession || 'Add your profession'}</p>
                        <div className="flex items-center gap-2 text-textc/60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{userProfile?.country || 'Add your country'}</span>
                        </div>
                    </div>
                </div>

                {/* Add Button Container */}
                <button
                    onClick={() => setShowAddForm(true)}
                    className="group bg-componentbgc rounded-lg border-2 border-dashed border-textc/20 p-6 
                        flex flex-col col-span-3 md:col-span-1 items-center justify-center gap-3 transition-all duration-200
                        hover:border-primaryc/50 hover:bg-primaryc/5 active:transform active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-full bg-primaryc/20 flex items-center justify-center 
                        group-hover:bg-primaryc/30 transition-colors duration-200">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6 text-textc transition-transform group-hover:rotate-90 duration-200" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-textc/80 group-hover:text-textc transition-colors duration-200">
                        Add New Section
                    </span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="md:col-span-3 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Dynamic grid layout - changed grid-cols-6 to grid-cols-1 for mobile */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
                {(() => {
                    const activeSections = Object.entries(groupedSections)
                        .filter(([_, sections]) => sections.length > 0);
                    
                    const totalSections = activeSections.length;

                    return activeSections.map(([type, sections], index) => {
                        const gridStyle = getGridStyles(type, index, totalSections);
                        const borderStyles = {
                            [SectionType.WORK_EXPERIENCE]: "border-primaryc/30 hover:border-primaryc/50",
                            [SectionType.EDUCATION]: "border-accentc/30 hover:border-accentc/50",
                            [SectionType.PROJECT]: "border-secondaryc/30 hover:border-secondaryc/50",
                            [SectionType.SKILL]: "border-primaryc/30 hover:border-primaryc/50",
                            [SectionType.AWARD]: "border-accentc/30 hover:border-accentc/50",
                            [SectionType.LANGUAGE]: "border-secondaryc/30 hover:border-secondaryc/50",
                            [SectionType.CERTIFICATION]: "border-primaryc/30 hover:border-primaryc/50",
                        }[type] || "border-textc/30 hover:border-textc/50";

                        return (
                            <div 
                                key={type}
                                className={`
                                    ${gridStyle}
                                    bg-componentbgc rounded-lg border
                                    ${borderStyles}
                                    p-4 sm:p-6 
                                    transition-all duration-300 
                                    hover:shadow-lg hover:-translate-y-0.5
                                    mb-4 sm:mb-0
                                `}
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-textc mb-4">
                                    {sectionTypeNames[type as SectionType]}
                                </h2>
                                <div className="space-y-4 overflow-y-auto max-h-60 pr-2 scrollbar-thin scrollbar-thumb-textc/20 scrollbar-track-transparent hover:scrollbar-thumb-textc/30">
                                    {sections.map((section) => (
                                        <ProfileSection 
                                            key={section.id} 
                                            section={section} 
                                            onToggleVisibility={handleToggleVisibility} 
                                            onDelete={handleDeleteSection} 
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>

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
