'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { generalAPI } from '@/services/api';
import { Career } from '@/types/api';

interface JobTitlesMultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  className?: string;
  placeholder?: string;
}

export default function JobTitlesMultiSelect({ value, onChange, className = '', placeholder = 'Search and select desired job titles' }: JobTitlesMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTitles, setJobTitles] = useState<Career[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch job titles from API
  useEffect(() => {
    const fetchJobTitles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await generalAPI.getCareers();
        const careers = response.data.filter((career: Career) => career.name && career.id);
        const sortedCareers = careers.sort((a: Career, b: Career) => a.name.localeCompare(b.name));
        setJobTitles(sortedCareers);
        setFilteredTitles(sortedCareers);
      } catch (err) {
        console.error('Failed to fetch job titles:', err);
        setError('Failed to load job titles');
        // Fallback to some common job titles
        const fallbackTitles = [
          { id: 1, name: 'Software Engineer' },
          { id: 2, name: 'Marketing Manager' },
          { id: 3, name: 'Sales Representative' },
          { id: 4, name: 'Product Manager' },
          { id: 5, name: 'Data Scientist' },
          { id: 6, name: 'Business Analyst' },
          { id: 7, name: 'Project Manager' },
          { id: 8, name: 'Designer' },
          { id: 9, name: 'Developer' },
          { id: 10, name: 'Consultant' }
        ].sort((a, b) => a.name.localeCompare(b.name));
        setJobTitles(fallbackTitles);
        setFilteredTitles(fallbackTitles);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitles();
  }, []);

  useEffect(() => {
    const filtered = jobTitles.filter(career =>
      career.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !value.includes(career.id)
    );
    setFilteredTitles(filtered);
  }, [searchTerm, jobTitles, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (career: Career) => {
    if (!value.includes(career.id)) {
      onChange([...value, career.id]);
    }
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemove = (idToRemove: number) => {
    onChange(value.filter(id => id !== idToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
      // Remove last selected item when backspacing with empty input
      handleRemove(value[value.length - 1]);
    }
  };

  // Helper function to get career name by ID
  const getCareerNameById = (id: number): string => {
    const career = jobTitles.find(c => c.id === id);
    return career ? career.name : `Career ${id}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className={`${className} min-h-[48px] flex flex-wrap items-center gap-2 p-2`}>
        {/* Selected job titles */}
        {value.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 bg-brand-light-blue text-black px-3 py-1 rounded-lg text-sm font-medium"
          >
            {getCareerNameById(id)}
            <button
              type="button"
              onClick={() => handleRemove(id)}
              className="hover:bg-brand-navy hover:text-white rounded-full p-0.5 transition-colors duration-150"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {/* Input field */}
        <div className="flex-1 relative min-w-[200px]">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : 'Add more...'}
            className="w-full border-none outline-none bg-transparent text-sm"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2"
          >
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Loading job titles...
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-center text-red-600 text-sm">
              {error}
            </div>
          ) : filteredTitles.length > 0 ? (
            filteredTitles.map((career) => (
              <button
                key={career.id}
                type="button"
                onClick={() => handleSelect(career)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
              >
                {career.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              {value.length === jobTitles.length 
                ? 'All available job titles selected'
                : 'No matches found'
              }
            </div>
          )}
        </div>
      )}
      
      {/* Selected count indicator */}
      {value.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {value.length} job title{value.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}