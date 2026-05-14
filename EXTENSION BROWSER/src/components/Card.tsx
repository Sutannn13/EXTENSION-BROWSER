import React from 'react';
import { cn } from '../lib/utils/cn';
import type { CardProps } from './types';

export default function Card({ children, variant = 'default', className, ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-slate-800 border-slate-700',
    elevated: 'bg-slate-800 shadow-lg',
    outlined: 'bg-transparent border border-slate-600',
  };

  return (
    <div className={cn('rounded-xl border p-4', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}