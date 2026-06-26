import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, success, danger, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  fullWidth = false,
  loading = false,
  icon: Icon = null,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner">⌛</span>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
