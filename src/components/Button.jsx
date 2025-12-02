import React from 'react';
import { Loader2 } from 'lucide-react';
import './ExcelConverter.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'button-primary',
    outline: 'button-outline',
    ghost: 'button-ghost',
    success: 'button-success',
    error: 'button-error'
  };

  const sizeClasses = {
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg'
  };

  return (
    <button
      className={`
        button
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={20} />}
      {Icon && !isLoading && <Icon size={20} />}
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
      {isLoading && (
        <span className="sr-only">
          Cargando...
        </span>
      )}
    </button>
  );
};

export default Button;