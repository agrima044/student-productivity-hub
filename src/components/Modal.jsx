import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = '500px'
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <Card 
        className={`modal-content-card ${className}`} 
        style={{ maxWidth, width: '100%', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default Modal;
