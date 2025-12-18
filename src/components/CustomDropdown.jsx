import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomDropdown Component
 *
 * A custom dropdown that supports images, descriptions, and complex HTML in menu items.
 * Designed to replace native <select> elements where more visual customization is needed.
 *
 * @param {Array} options - Array of option objects { value, label, image, description }
 * @param {*} value - Currently selected value
 * @param {Object} selectedOptionOverride - Optional: Provide selected option data directly (for when value not in options)
 * @param {Function} onChange - Callback when selection changes (receives new value)
 * @param {string} placeholder - Placeholder text when no selection
 * @param {string} className - Additional CSS classes for the container
 */
const CustomDropdown = ({
  options = [],
  value,
  selectedOptionOverride = null,
  onChange,
  placeholder = 'Select an option',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Find the selected option (handle null/undefined values)
  // Use override if provided, otherwise find in options
  const selectedOption = selectedOptionOverride || (value != null ? options.find(opt => opt.value === value) : null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Prevent body scroll on mobile when dropdown is open
  useEffect(() => {
    if (isOpen) {
      // Store original body overflow
      const originalOverflow = document.body.style.overflow;
      // Only prevent scroll on mobile (screens < 768px)
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleSelect = (optionValue, event) => {
    if (event) {
      event.stopPropagation();
    }
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-gray-400 dark:hover:border-gray-500 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer text-left flex items-center justify-between touch-manipulation min-h-[44px]"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt=""
              className="w-6 h-6 flex-shrink-0 object-contain"
            />
          )}
          <span className="truncate text-sm md:text-base">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[60vh] md:max-h-96 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => handleSelect(option.value, e)}
              className={`w-full px-3 py-3 md:py-2.5 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation ${
                value != null && option.value === value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {option.image && (
                <img
                  src={option.image}
                  alt=""
                  className="w-6 h-6 md:w-6 md:h-6 flex-shrink-0 object-contain"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm md:text-base">{option.label}</div>
                {option.description && (
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {option.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
