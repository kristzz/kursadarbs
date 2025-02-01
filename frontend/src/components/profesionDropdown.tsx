import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  selected: string;
  setSelected: (value: string) => void;
  options: string[];
}

const profesionDropdown = ({ selected, setSelected, options }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="relative min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 border-b border-white text-inherit text-left flex justify-between items-center"
      >
        {selected}
        <span className={`transform ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>˅</span>
      </button>
      {isOpen && (
        <ul className="absolute left-0 right-0 mt-1 border border-white bg-backgroundc w-full z-10">
          {options.map((option) => (
            <li key={option}>
              <button
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className="w-full px-2 py-1 hover:bg-primaryc text-white text-left"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default profesionDropdown;