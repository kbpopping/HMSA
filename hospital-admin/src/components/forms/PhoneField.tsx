import { forwardRef, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { countryCodes, CountryCode, getDefaultCountryCode, extractCountryCode } from '../../data/countryCodes';

interface PhoneFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  countryCode?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryCodeChange?: (code: string) => void;
}

/**
 * PhoneField - Phone input with country code selector
 * 
 * Supports selecting country codes and stores the full phone number with country code
 */
const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  ({ label, error, helperText, countryCode: propCountryCode, className, id, value = '', onChange, onCountryCodeChange, ...props }, ref) => {
    const inputId = id || `phone-${Math.random().toString(36).substr(2, 9)}`;
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
      if (propCountryCode) {
        const country = countryCodes.find(c => c.dialCode === propCountryCode);
        if (country) return country;
      }
      // Try to extract from value
      if (value) {
        const extracted = extractCountryCode(value);
        if (extracted) return extracted.countryCode;
      }
      return getDefaultCountryCode();
    });
    const [localNumber, setLocalNumber] = useState<string>(() => {
      if (value) {
        const extracted = extractCountryCode(value);
        return extracted ? extracted.number : value;
      }
      return '';
    });
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update local number when value prop changes
    useEffect(() => {
      if (value) {
        const extracted = extractCountryCode(value);
        if (extracted) {
          setSelectedCountry(extracted.countryCode);
          setLocalNumber(extracted.number);
        } else {
          setLocalNumber(value);
        }
      } else {
        setLocalNumber('');
      }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsCountryDropdownOpen(false);
        }
      };
      if (isCountryDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isCountryDropdownOpen]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNumber = e.target.value;
      setLocalNumber(newNumber);
      
      // Combine country code and number
      const fullNumber = selectedCountry.dialCode + newNumber;
      
      // Create synthetic event for onChange
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: fullNumber,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleCountrySelect = (country: CountryCode) => {
      setSelectedCountry(country);
      setIsCountryDropdownOpen(false);
      setCountrySearchQuery(''); // Reset search
      
      if (onCountryCodeChange) {
        onCountryCodeChange(country.dialCode);
      }
      
      // Update the full phone number with new country code
      const fullNumber = country.dialCode + localNumber;
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: fullNumber,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex gap-2 min-w-0">
          <div className="flex-shrink-0 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className={clsx(
                'w-24 h-12 rounded-lg border px-2 text-foreground-light dark:text-foreground-dark',
                'bg-background-light dark:bg-background-dark',
                'border-border-light dark:border-border-dark',
                'flex items-center justify-center gap-1 font-medium',
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                error && 'border-red-500 dark:border-red-400'
              )}
            >
              <span className="text-sm">{selectedCountry.flag || ''}</span>
              <span className="text-xs">{selectedCountry.dialCode}</span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
            
            {isCountryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 max-h-96 overflow-y-auto bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countrySearchQuery}
                    className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-2"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    id="country-search"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {countryCodes
                    .filter((country) => {
                      if (!countrySearchQuery) return true;
                      const query = countrySearchQuery.toLowerCase();
                      return (
                        country.name.toLowerCase().includes(query) ||
                        country.dialCode.includes(query) ||
                        country.code.toLowerCase().includes(query)
                      );
                    })
                    .map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={clsx(
                        'w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors',
                        selectedCountry.code === country.code && 'bg-primary/20 dark:bg-primary/30'
                      )}
                    >
                      <span className="text-lg">{country.flag || '🌐'}</span>
                      <span className="flex-1 text-sm text-foreground-light dark:text-foreground-dark">{country.name}</span>
                      <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            value={localNumber}
            onChange={handleNumberChange}
            className={clsx(
              'flex-1 min-w-0 h-12 rounded-lg border px-4 text-foreground-light dark:text-foreground-dark',
              'placeholder-subtle-light dark:placeholder-subtle-dark',
              'bg-background-light dark:bg-background-dark',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'transition-colors',
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-border-light dark:border-border-dark',
              className
            )}
            placeholder="Phone number"
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">{helperText}</p>
        )}
      </div>
    );
  }
);

PhoneField.displayName = 'PhoneField';

export default PhoneField;

