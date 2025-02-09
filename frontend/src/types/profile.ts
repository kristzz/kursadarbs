export enum SectionType {
    EDUCATION = 'education',
    WORK_EXPERIENCE = 'work_experience',
    CERTIFICATION = 'certification',
    PROJECT = 'project',
    SKILL = 'skill',
    AWARD = 'award',
    LANGUAGE = 'language'
}


export interface ProfileSection {
    id: number;
    section_type: SectionType;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    institution: string | null;
    is_public: boolean;
}

export interface UserProfile {
    name: string;
    profession: string;
    country: string;
} 