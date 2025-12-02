import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './ExcelConverter.css';

const Modal = ({ isOpen, onClose, type = 'info', title, message }) => {
  if (!isOpen) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'var(--success-500)',
    error: 'var(--error-500)',
    warning: 'var(--warning-500)',
    info: 'var(--info-500)'
  };

  const Icon = icons[type];
  const iconColor = colors[type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            <X size={24} />
          </button>
          
          <div className="modal-header">
            <div className="modal-icon-container" style={{ backgroundColor: `${iconColor}15` }}>
              <Icon size={48} color={iconColor} />
            </div>
            <h2 className="modal-title">{title}</h2>
          </div>
          
          <div className="modal-body">
            <p className="modal-message">{message}</p>
          </div>

<div className="modal-footer">
  <button 
    className="modal-button modal-button-light"
    onClick={onClose}
    style={{ 
      background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor} 100%)`,
      border: `1px solid ${iconColor}80`, // 80 = 50% de opacidad en hex
      boxShadow: `0 4px 6px -1px ${iconColor}20, 0 2px 4px -1px ${iconColor}10`
    }}
  >
    Entendido
  </button>
</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;