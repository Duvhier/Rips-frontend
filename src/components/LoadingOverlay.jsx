import React from 'react';
import { Loader2 } from 'lucide-react';
import ripsLogo from '../assets/rips-logo.png';
import './ExcelConverter.css';

const LoadingOverlay = ({ isLoading, message = 'Procesando...' }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner-container">
            <img 
              src={ripsLogo} 
              alt="RIPS Logo" 
              className="loading-logo"
            />
            <div className="spinner-ring" />
          </div>
          <div className="loading-text-container">
            <p className="loading-text">{message}</p>
            <p className="loading-subtext">Esto puede tomar unos segundos...</p>
          </div>
          <div className="loading-progress">
            <div className="progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;