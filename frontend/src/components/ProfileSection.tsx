import { memo, useMemo } from 'react';
import { Switch } from './Switch';
import { Trash2 } from 'lucide-react';
import { ProfileSection as ProfileSectionType } from '@/types/profile';

interface ProfileSectionProps {
    section: ProfileSectionType;
    onToggleVisibility: (id: number) => void;
    onDelete: (id: number) => void;
}

// Memoize date formatting function
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    // Use simple string manipulation instead of Date object for ISO formats
    try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month)-1]} ${parseInt(day)}, ${year}`;
    } catch {
        return '';
    }
};

const ProfileSectionComponent = ({ section, onToggleVisibility, onDelete }: ProfileSectionProps) => {
    // Memoize formatted dates
    const [startDate, endDate] = useMemo(() => [
        formatDate(section.start_date),
        section.end_date ? formatDate(section.end_date) : 'Present'
    ], [section.start_date, section.end_date]);

    return (
        <div className="p-6 border border-textc/20 rounded-lg bg-componentbgc/50 shadow-sm hover:bg-componentbgc/70 transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-textc">
                    {section.institution || 'Untitled'}
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-textc/60">
                            {section.is_public ? 'Public' : 'Private'}
                        </span>
                        <Switch
                            isOn={section.is_public}
                            onToggle={() => onToggleVisibility(section.id)}
                            ariaLabel={`Toggle visibility for ${section.institution || 'this section'}`}
                        />
                    </div>
                    <button
                        onClick={() => onDelete(section.id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-500/10"
                        aria-label="Delete section"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            
            {section.description && (
                <p className="mt-2 text-textc/80">
                    {section.description}
                </p>
            )}
            
            {(section.start_date || section.end_date) && (
                <p className="text-sm text-textc/60 mt-2">
                    {startDate} - {endDate}
                </p>
            )}
        </div>
    );
};

export default memo(ProfileSectionComponent);