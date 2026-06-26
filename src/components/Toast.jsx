import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--color-success)" />;
      case 'danger':
        return <AlertCircle size={18} color="var(--color-danger)" />;
      case 'warning':
        return <AlertCircle size={18} color="var(--color-warning)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--color-info)" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon-wrapper">
            {getIcon(toast.type)}
          </div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            {toast.description && <div className="toast-desc">{toast.description}</div>}
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
