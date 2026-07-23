import { ReactNode } from 'react';

interface ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const variantStyles = { 
  primary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-blue-500 hover:bg-blue-600 text-white',
  outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  icon,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'sm',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-medium rounded-md transition-colors duration-200 shrink-0
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
        <div className='flex flex-row gap-2 items-center shrink-0'>
            {icon}
            {children}
        </div>
    </button>
  );
}
