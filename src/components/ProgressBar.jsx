import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  showPercent = true,
  height = '8px',
  color = '' // optional color override
}) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));

  const getProgressColor = () => {
    if (color) return color;
    if (percentage >= 85) return 'var(--color-success)';
    if (percentage >= 75) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs font-semibold text-secondary">
          {label && <span>{label}</span>}
          {showPercent && <span>{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div 
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getProgressColor(),
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-normal)'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
