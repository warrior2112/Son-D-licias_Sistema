// Componente de Loading Spinner mejorado para Son D'licias

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'indigo', 
  text = 'Cargando...',
  showText = true,
  className = '',
  variant = 'spinner'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    slate: 'text-slate-600'
  };

  const renderSpinner = () => {
    if (variant === 'dots') {
      return (
        <div className="flex space-x-1">
          <div className={`${sizes[size]} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`${sizes[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`${sizes[size]} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div className={`${sizes[size]} bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full animate-pulse`}></div>
      );
    }

    if (variant === 'bars') {
      return (
        <div className="flex space-x-1">
          <div className={`w-1 ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10'} bg-indigo-600 animate-pulse`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-1 ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10'} bg-blue-600 animate-pulse`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-1 ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10'} bg-indigo-600 animate-pulse`} style={{ animationDelay: '300ms' }}></div>
          <div className={`w-1 ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10'} bg-blue-600 animate-pulse`} style={{ animationDelay: '450ms' }}></div>
        </div>
      );
    }

    // Default spinner
    return (
      <svg 
        className={`animate-spin ${sizes[size]} ${colors[color]}`} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      
      {showText && text && (
        <p className={`mt-3 text-sm ${colors[color]} font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Spinner de página completa con efecto de backdrop mejorado
export const FullPageSpinner = ({ text = 'Cargando sistema...', variant = 'dots' }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-100/95 to-gray-100/95 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <LoadingSpinner size="lg" text={text} variant={variant} color="indigo" />
    </div>
  </div>
);

// Spinner para botones mejorado
export const ButtonSpinner = ({ size = 'sm' }) => (
  <svg 
    className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-current`} 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Componente de carga para tablas
export const TableLoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner variant="bars" size="md" text="Cargando datos..." />
  </div>
);

// Componente de carga para formularios
export const FormLoadingSpinner = () => (
  <div className="flex items-center justify-center py-4">
    <LoadingSpinner variant="pulse" size="sm" text="Procesando..." />
  </div>
);

export default LoadingSpinner;