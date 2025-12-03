import React from 'react';
import { Loader2 } from 'lucide-react';
import './ExcelConverter.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  iconOnly = false,
  ...props
}) => {
  // Clases CSS según variantes
  const variantClasses = {
    primary: 'button-primary',
    outline: 'button-outline',
    ghost: 'button-ghost',
    success: 'button-success',
    error: 'button-error',
    warning: 'button-warning'
  };

  // Clases CSS según tamaño
  const sizeClasses = {
    xs: 'button-xs',
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg',
    xl: 'button-xl'
  };

  // Tamaños de iconos según tamaño del botón
  const iconSizeMap = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  };

  // Clases adicionales
  const fullWidthClass = fullWidth ? 'button-full-width' : '';
  const iconOnlyClass = iconOnly ? 'button-icon-only' : '';

  // Determinar si mostrar icono
  const shouldShowIcon = Icon && !isLoading;
  const iconElement = shouldShowIcon ? (
    <Icon 
      size={iconSizeMap[size]} 
      className={`button-icon ${iconPosition === 'right' ? 'icon-right' : 'icon-left'}`}
      strokeWidth={2}
    />
  ) : null;

  // Contenido del botón
  const buttonContent = iconOnly && Icon ? (
    // Solo icono
    <Icon 
      size={iconSizeMap[size]} 
      strokeWidth={2}
      aria-label={typeof children === 'string' ? children : 'Botón'}
    />
  ) : (
    // Icono + texto
    <>
      {isLoading ? (
        <Loader2 
          className="animate-spin button-loader" 
          size={iconSizeMap[size]} 
          strokeWidth={2}
        />
      ) : (
        iconPosition === 'left' && iconElement
      )}
      
      <span className={`button-text ${isLoading ? 'opacity-50' : ''}`}>
        {children}
      </span>
      
      {!isLoading && iconPosition === 'right' && iconElement}
    </>
  );

  return (
    <button
      type={type}
      className={`
        button
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidthClass}
        ${iconOnlyClass}
        ${className}
        ${disabled ? 'button-disabled' : ''}
      `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled}
      {...props}
    >
      {buttonContent}
      
      {isLoading && (
        <span className="sr-only">
          Cargando...
        </span>
      )}
    </button>
  );
};

export default Button;