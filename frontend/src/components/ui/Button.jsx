import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  const variants = {
    primary: 'btn-primary',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
    outline:
      'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </button>
  );
};

export default Button;
