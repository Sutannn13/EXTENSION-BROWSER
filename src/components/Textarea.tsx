import React, { forwardRef } from 'react';
import { cn } from '../lib/utils/cn';
import type { TextareaProps } from './types';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, disabled, rows = 3, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl',
        'text-white placeholder-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'resize-none transition-colors',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;