import { cn } from '../lib/utils/cn';

interface LoadingDotsProps {
  className?: string;
}

export default function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1.5 py-2', className)}>
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '200ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '400ms' }} />
    </div>
  );
}