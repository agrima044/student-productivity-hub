import React from 'react';

// Spinning loader icon
export const Loader = ({ size = 24, color = 'var(--color-primary)', className = '', style = {} }) => {
  return (
    <div 
      className={`flex items-center justify-center p-4 ${className}`}
      style={{ ...style }}
    >
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid var(--border-color)',
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Skeleton loading placeholders for Cards
export const CardSkeleton = () => {
  return (
    <div 
      className="ui-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem', 
        opacity: 0.7,
        animation: 'pulse 1.5s infinite' 
      }}
    >
      <div style={{ height: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', width: '60%' }} />
      <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', width: '90%' }} />
      <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', width: '40%' }} />
      <div style={{ height: '30px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
