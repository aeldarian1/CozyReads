import { ReactNode } from 'react';
import { getStatusColor } from '@/lib/design-tokens';

export interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  status?: string;
}

const variantStyles = {
  success: 'bg-green-100 text-green-700 border-green-300',
  error: 'bg-red-100 text-red-700 border-red-300',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  info: 'bg-blue-100 text-blue-700 border-blue-300',
  default: 'bg-gray-100 text-gray-700 border-gray-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  status,
}: BadgeProps) {
  let badgeStyle = variantStyles[variant];
  let customStyle: React.CSSProperties | undefined;

  if (status) {
    const statusColors = getStatusColor(status);
    customStyle = {
      backgroundColor: statusColors.bg,
      color: statusColors.text,
      borderColor: statusColors.border,
    };
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${status ? '' : badgeStyle}
        ${sizeStyles[size]}
        ${className}
      `}
      style={customStyle}
    >
      {children}
    </span>
  );
}
