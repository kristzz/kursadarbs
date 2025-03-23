"use client";

import { useState, useEffect, useRef } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import { useTranslations } from 'next-intl';

interface CountryDropdownProps {
  selected: string;
  setSelected: (country: string) => void;
}

const CountryDropdown = ({ selected = '', setSelected }: CountryDropdownProps) => {
  const t = useTranslations('Register'); 
  const [countries, setCountries] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
      const data = await response.json();
      return data.map((country: any) => country.name.common);
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchCountries().then((data) => {
      setCountries(data);
    });
  }, []);

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
    <div className="relative min-w-[240px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 border-b border-white text-inherit text-left flex justify-between items-center"
      >
        {selected && selected.length > 25 ? `${selected.substring(0, 25)}...` : selected || t('selectCountry')}
        <BiChevronDown size={20} className={`${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute left-0 right-0 mt-1 border border-white bg-backgroundc w-full z-10 max-h-60 overflow-y-auto">
          <div className="flex items-center px-2 sticky top-0 bg-backgroundc">
            <AiOutlineSearch size={18} className="text-gray-700" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
              placeholder={t('enterCountryName')}
              className="bg-backgroundc placeholder:text-gray-700 p-2 outline-none w-full"
            />
          </div>

          {countries
            .filter((country) =>
              country.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((country) => (
              <li
                key={country}
                className={`p-2 text-sm hover:bg-primaryc text-white text-left cursor-pointer ${
                  selected && country.toLowerCase() === selected.toLowerCase() && 'bg-primaryc'
                }`}
                onClick={() => {
                  setSelected(country);
                  setIsOpen(false);
                  setInputValue('');
                }}
              >
                {country}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default CountryDropdown;
