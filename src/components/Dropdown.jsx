import React, { useState, useEffect, useRef } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div 
          className="dropdown-menu-list"
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            marginTop: '0.25rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            minWidth: '160px',
            padding: '0.25rem 0',
            animation: 'dropdownFadeIn 0.15s ease'
          }}
          onClick={() => setIsOpen(false)} // close on item click
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
