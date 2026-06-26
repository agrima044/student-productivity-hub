import React from 'react';

export const EmptyState = ({
  icon: Icon = null,
  title = 'No Items Found',
  description = 'Add items to get started.',
  action = null,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
      style={{
        color: 'var(--text-muted)',
        minHeight: '260px',
        ...style
      }}
    >
      {Icon && (
        <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
          <Icon size={48} />
        </div>
      )}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.4 }}>
        {description}
      </p>
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
