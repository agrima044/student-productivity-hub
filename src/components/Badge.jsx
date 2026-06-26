import React from 'react';

export const Badge = ({
  children,
  variant = 'secondary', // primary, success, warning, danger, info, secondary
  className = '',
  ...props
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' };
      case 'success':
        return { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' };
      case 'warning':
        return { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' };
      case 'danger':
        return { backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' };
      case 'info':
        return { backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' };
      case 'secondary':
      default:
        return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
    }
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.625rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.6875rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    border: '1px solid transparent',
    ...getBadgeStyle()
  };

  return (
    <span style={style} className={className} {...props}>
      {children}
    </span>
  );
};

export default Badge;
