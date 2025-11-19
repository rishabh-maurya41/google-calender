import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

/**
 * Spinner Component
 * 
 * A reusable loading spinner component that can be used throughout the application.
 * Features:
 * - Three size variants (small, medium, large)
 * - Optional loading message
 * - Customizable via className prop
 * 
 * Requirements: 9.1, 9.4
 */
const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  message,
  className = '' 
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner spinner-${size}`} role="status" aria-live="polite">
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;
