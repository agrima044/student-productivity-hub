import React from 'react';

export const Input = ({
  label,
  type = 'text',
  error,
  options = [], // [{ value, label }] for select fields
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  rows = 3, // for textarea
  ...props
}) => {
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="input-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}

      {isSelect ? (
        <select
          value={value}
          onChange={onChange}
          className={`input-field ${error ? 'input-error-border' : ''}`}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`input-field ${error ? 'input-error-border' : ''}`}
          required={required}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${error ? 'input-error-border' : ''}`}
          required={required}
          {...props}
        />
      )}

      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
