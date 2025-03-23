export enum SectionType {
  EDUCATION = 'education',
  WORK_EXPERIENCE = 'work_experience',
  CERTIFICATION = 'certification',
  PROJECT = 'project',
  SKILL = 'skill',
  AWARD = 'award',
  LANGUAGE = 'language',
}

export interface UserProfileType {
  id: number
  name: string
  email: string
  profession?: string
  country?: string
  type: 'user' | 'business'
}

export interface ProfileSection {
  id: number
  section_type: SectionType
  description: string
  institution?: string
  start_date?: string
  end_date?: string
  is_public: boolean
}