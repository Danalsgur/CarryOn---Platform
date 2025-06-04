import { useState, useRef, useEffect } from 'react';
import { CountryCode, countryCodes } from '../utils/countryCodeData';

interface CountryCodeSelectProps {
  selectedCountry: CountryCode;
  onSelect: (country: CountryCode) => void;
  className?: string;
}

export default function CountryCodeSelect({
  selectedCountry,
  onSelect,
  className = '',
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="mr-2">{selectedCountry.dialCode}</span>
          <span className="text-gray-600 truncate">{selectedCountry.name}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ml-2 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                selectedCountry.code === country.code ? 'bg-gray-50' : ''
              }`}
              onClick={() => {
                onSelect(country);
                setIsOpen(false);
              }}
            >
              <span className="mr-2 w-12 inline-block">{country.dialCode}</span>
              <span className="text-gray-600">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
