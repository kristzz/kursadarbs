import { useState, useRef, useEffect } from 'react';
import { SectionType } from '@/types/profile';
import { BiChevronDown } from 'react-icons/bi';

interface AddSectionFormProps {
    onSubmit: (data: {
        section_type: SectionType;
        description: string;
        institution: string;
        start_date: string;
        end_date: string;
        is_public: boolean;
    }) => void;
    onClose: () => void;
}

export default function AddSectionForm({ onSubmit, onClose }: AddSectionFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [formData, setFormData] = useState({
        section_type: SectionType.EDUCATION,
        description: '',
        institution: '',
        start_date: '',
        end_date: '',
        is_public: true
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const sectionTypes = [
        { value: SectionType.WORK_EXPERIENCE, label: 'Work Experience' },
        { value: SectionType.EDUCATION, label: 'Education' },
        { value: SectionType.PROJECT, label: 'Project' },
        { value: SectionType.SKILL, label: 'Skill & Technology' },
        { value: SectionType.AWARD, label: 'Award' },
        { value: SectionType.LANGUAGE, label: 'Language' },
        { value: SectionType.CERTIFICATION, label: 'Certification' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-componentbgc rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-textc">Add New Section</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textc mb-1">
                            Section Type
                        </label>
                        <div className="relative min-w-[240px]" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full px-2 py-1 border-b border-textc text-textc text-left flex justify-between items-center bg-componentbgc"
                            >
                                {sectionTypes.find(type => type.value === formData.section_type)?.label}
                                <BiChevronDown size={20} className={`${isOpen ? 'rotate-180' : ''} text-textc`} />
                            </button>
                            {isOpen && (
                                <ul className="absolute left-0 right-0 mt-1 border border-textc bg-componentbgc w-full z-10">
                                    {sectionTypes.map((type) => (
                                        <li key={type.value}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, section_type: type.value }));
                                                    setIsOpen(false);
                                                }}
                                                className="w-full px-2 py-1 hover:bg-primaryc text-textc text-left"
                                            >
                                                {type.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc mb-1">
                            Institution/Company
                        </label>
                        <input
                            type="text"
                            value={formData.institution}
                            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                            className="w-full rounded-lg border border-textc/20 p-2 bg-backgroundc text-textc"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textc mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full rounded-lg border border-textc/20 p-2 min-h-[100px] bg-backgroundc text-textc"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textc mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full rounded-lg border border-textc/20 p-2 bg-backgroundc text-textc"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textc mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full rounded-lg border border-textc/20 p-2 bg-backgroundc text-textc"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_public"
                            checked={formData.is_public}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                            className="rounded border-textc/20 bg-backgroundc text-primaryc"
                        />
                        <label htmlFor="is_public" className="text-sm font-medium text-textc">
                            Make this section public
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-textc hover:text-textc/80"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primaryc text-textc rounded-lg hover:bg-accentc transition-colors"
                        >
                            Add Section
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 