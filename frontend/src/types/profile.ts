export enum SectionType {
    WORK_EXPERIENCE = "WORK_EXPERIENCE",
    EDUCATION = "EDUCATION",
    PROJECT = "PROJECT",
    SKILL = "SKILL",
    AWARD = "AWARD",
    LANGUAGE = "LANGUAGE",
    CERTIFICATION = "CERTIFICATION"
  }
  
  export interface ProfileSection {
    id: number;
    section_type: SectionType;
    description: string;
    institution: string;
    start_date: string | null;
    end_date: string | null;
    is_public: boolean;
  }
  
  export interface UserProfile {
    id: number;
    name: string;
    email: string;
    profession?: string;
    country?: string;
  }