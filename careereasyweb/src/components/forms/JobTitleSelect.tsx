'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface JobTitleSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const jobTitles = [
  // Technology
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Quality Assurance Engineer',
  'Systems Administrator',
  'Network Administrator',
  'Database Administrator',
  'Cloud Architect',
  'Security Engineer',
  'Mobile App Developer',
  'Web Developer',
  
  // Business & Management
  'Marketing Manager',
  'Sales Manager',
  'Business Analyst',
  'Project Manager',
  'Operations Manager',
  'General Manager',
  'Executive Assistant',
  'Human Resources Manager',
  'Recruiter',
  'Training Manager',
  'Business Development Manager',
  'Account Manager',
  'Customer Success Manager',
  
  // Finance & Accounting
  'Financial Analyst',
  'Accountant',
  'Senior Accountant',
  'Controller',
  'CFO',
  'Investment Analyst',
  'Credit Analyst',
  'Tax Specialist',
  'Auditor',
  'Bookkeeper',
  
  // Healthcare
  'Registered Nurse',
  'Physician',
  'Medical Assistant',
  'Physical Therapist',
  'Pharmacist',
  'Dental Hygienist',
  'Medical Technologist',
  'Healthcare Administrator',
  
  // Education
  'Teacher',
  'Professor',
  'School Administrator',
  'Curriculum Developer',
  'Educational Consultant',
  'Librarian',
  
  // Marketing & Communications
  'Digital Marketing Specialist',
  'Content Writer',
  'Social Media Manager',
  'Public Relations Specialist',
  'Graphic Designer',
  'Brand Manager',
  'SEO Specialist',
  
  // Sales
  'Sales Representative',
  'Inside Sales Representative',
  'Outside Sales Representative',
  'Sales Development Representative',
  'Account Executive',
  
  // Customer Service
  'Customer Service Representative',
  'Customer Support Specialist',
  'Call Center Agent',
  'Technical Support Specialist',
  
  // Legal
  'Attorney',
  'Paralegal',
  'Legal Assistant',
  'Compliance Officer',
  
  // Engineering (Non-Software)
  'Mechanical Engineer',
  'Electrical Engineer',
  'Civil Engineer',
  'Chemical Engineer',
  'Manufacturing Engineer',
  
  // Other
  'Consultant',
  'Analyst',
  'Coordinator',
  'Specialist',
  'Administrator',
  'Supervisor',
  'Director',
  'Vice President',
  'C-Level Executive',
  'Other'
].sort();

export default function JobTitleSelect({ value, onChange, className = '', placeholder = 'Search or select job title' }: JobTitleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTitles, setFilteredTitles] = useState(jobTitles);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = jobTitles.filter(title =>
      title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTitles(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (title: string) => {
    if (title === 'Other') {
      onChange('');
      setSearchTerm('');
      setIsOpen(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onChange(title);
      setSearchTerm(title);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(value);
  };

  const displayValue = value || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={className}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredTitles.length > 0 ? (
            filteredTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => handleSelect(title)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                  title === 'Other' ? 'border-t border-gray-200 font-medium text-gray-600' : ''
                } ${value === title ? 'bg-brand-light-blue text-black' : ''}`}
              >
                {title}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No matches found. You can type a custom title.
            </div>
          )}
        </div>
      )}
    </div>
  );
}