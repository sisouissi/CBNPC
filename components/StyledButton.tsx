
import React from 'react';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const StyledButton: React.FC<StyledButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  ...props
}) => {
  const baseStyles = 'group font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-150 ease-in-out';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary text-text-onPrimary hover:bg-primary-dark focus:ring-primary-dark shadow-sm';
      break;
    case 'secondary': // More like Fluent's standard/subtle button
      variantStyles = 'bg-neutral-surface text-text-primary border border-neutral-border hover:bg-neutral-background focus:ring-primary shadow-sm';
      break;
    case 'outline': // For question options, now more like secondary, but with hover change
      variantStyles = `bg-neutral-surface text-text-primary border border-neutral-border hover:bg-primary-light hover:border-primary focus:ring-primary shadow-sm ${props.onClick ? 'justify-between' : 'justify-center'}`;
      break;
    case 'ghost': // Text button
      variantStyles = 'bg-transparent text-primary hover:bg-primary-light focus:ring-primary';
      break;
    case 'accent': 
      variantStyles = 'bg-accent text-text-onPrimary hover:bg-accent-dark focus:ring-accent-dark shadow-sm';
      break;
    case 'error':
      variantStyles = 'bg-status-error text-text-onPrimary hover:bg-red-700 focus:ring-red-700 shadow-sm';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'py-1.5 px-3 text-sm'; // Consistent with Fluent-like sizing
      break;
    case 'md':
      sizeStyles = 'py-2 px-4 text-sm'; // Fluent default button height is often 32px or 36px
      break;
    case 'lg':
      sizeStyles = 'py-2.5 px-5 text-base';
      break;
  }

  const widthStyles = fullWidth ? 'w-full' : '';
  const isQuestionOption = variant === 'outline' && props.onClick;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      {...props}
    >
      {iconLeft && <span className="mr-2 flex-shrink-0">{iconLeft}</span>}
      <span className={`truncate ${isQuestionOption ? "flex-grow text-left" : ""}`}>{children}</span>
      {iconRight}
      {isQuestionOption && !iconRight && <ChevronRightIcon className="ml-auto text-text-secondary group-hover:text-primary transition-colors flex-shrink-0"/>}
    </button>
  );
};
