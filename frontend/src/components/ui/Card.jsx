import React from 'react';

const Card = ({
  children,
  className = '',
  hover = true,
  glass = true,
  glow = false,
  gradient = true,
  ...props
}) => {
  // If gradient is true, we use 'gradient-border' instead of the standard border
  const baseClasses = glass ? 'glass-card' : 'bg-white rounded-[2.5rem] shadow-sm';
  const borderClasses = gradient ? 'gradient-border' : 'border border-gray-100';
  const hoverClasses = hover ? 'hover-lift group' : '';
  const glowClasses = glow && !gradient ? 'glow-border' : ''; // Disable simple glow if gradient is on, as gradient has its own style

  return (
    <div
      className={`${baseClasses} ${borderClasses} ${hoverClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
