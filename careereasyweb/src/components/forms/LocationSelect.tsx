'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  country: string;
  className?: string;
  placeholder?: string;
}

// Major US cities with state abbreviations
const usLocations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
  'Boston, MA',
  'El Paso, TX',
  'Nashville, TN',
  'Detroit, MI',
  'Oklahoma City, OK',
  'Portland, OR',
  'Las Vegas, NV',
  'Memphis, TN',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Albuquerque, NM',
  'Tucson, AZ',
  'Fresno, CA',
  'Sacramento, CA',
  'Kansas City, MO',
  'Mesa, AZ',
  'Atlanta, GA',
  'Omaha, NE',
  'Colorado Springs, CO',
  'Raleigh, NC',
  'Miami, FL',
  'Virginia Beach, VA',
  'Oakland, CA',
  'Minneapolis, MN',
  'Tulsa, OK',
  'Tampa, FL',
  'Arlington, TX',
  'New Orleans, LA'
].sort();

// Major Canadian cities with province abbreviations
const canadaLocations = [
  'Toronto, ON',
  'Montreal, QC',
  'Vancouver, BC',
  'Calgary, AB',
  'Edmonton, AB',
  'Ottawa, ON',
  'Winnipeg, MB',
  'Quebec City, QC',
  'Hamilton, ON',
  'Kitchener, ON',
  'London, ON',
  'Victoria, BC',
  'Halifax, NS',
  'Oshawa, ON',
  'Windsor, ON',
  'Saskatoon, SK',
  'St. Catharines, ON',
  'Regina, SK',
  'Sherbrooke, QC',
  'Kelowna, BC',
  'Barrie, ON',
  'Abbotsford, BC',
  'Sudbury, ON',
  'Kingston, ON',
  'Saguenay, QC',
  'Trois-Rivières, QC',
  'Guelph, ON',
  'Cambridge, ON',
  'Whitby, ON',
  'Brantford, ON'
].sort();

export default function LocationSelect({ value, onChange, country, className = '', placeholder = 'Search or select location' }: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locations = useMemo(() => {
    return country === 'US' ? usLocations : country === 'Canada' ? canadaLocations : [];
  }, [country]);

  useEffect(() => {
    const filtered = locations.filter(location =>
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset when country changes
  useEffect(() => {
    if (value && !locations.includes(value)) {
      onChange('');
      setSearchTerm('');
    }
  }, [country, locations, value, onChange]);

  const handleSelect = (location: string) => {
    onChange(location);
    setSearchTerm(location);
    setIsOpen(false);
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

  if (!country) {
    return (
      <input
        type="text"
        disabled
        placeholder="Please select a country first"
        className={`${className} opacity-50 cursor-not-allowed`}
      />
    );
  }

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
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => handleSelect(location)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                  value === location ? 'bg-brand-light-blue text-black' : ''
                }`}
              >
                {location}
              </button>
            ))
          ) : (
            <div className="px-4 py-2">
              <div className="text-gray-500 text-sm mb-2">
                No matches found. You can type a custom location.
              </div>
              <div className="text-xs text-gray-400">
                Format: City, {country === 'US' ? 'XX (state abbreviation)' : 'XX (province abbreviation)'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}