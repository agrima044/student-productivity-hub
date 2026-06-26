import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`ui-card ${hoverable ? 'ui-card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
