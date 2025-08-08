// Componente Button reutilizable para Son D'licias

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 focus:ring-indigo-500 shadow-md hover:shadow-lg active:shadow-sm transition-all",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-500",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 focus:ring-green-500 shadow-md hover:shadow-lg active:shadow-sm transition-all",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 active:from-red-800 active:to-rose-800 focus:ring-red-500 shadow-md hover:shadow-lg active:shadow-sm transition-all",
    warning: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 active:from-amber-700 active:to-yellow-700 focus:ring-amber-500 shadow-md hover:shadow-lg active:shadow-sm transition-all",
    info: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 focus:ring-blue-500 shadow-md hover:shadow-lg active:shadow-sm transition-all",
    ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-500",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 focus:ring-indigo-500"
  };
  
  const sizes = {
    xs: "px-3 py-2 text-xs min-h-[36px]",
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-5 py-3 text-sm min-h-[44px]",
    lg: "px-6 py-4 text-base min-h-[48px]",
    xl: "px-8 py-5 text-lg min-h-[52px]"
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button;