import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface StatusMessageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  /** Optional secondary link, e.g. back to home. */
  link?: { to: string; label: string };
  className?: string;
}

/** Consistent empty / error state used across pages. */
export const StatusMessage: React.FC<StatusMessageProps> = ({
  title,
  description,
  icon,
  onRetry,
  link,
  className = ''
}) => (
  <div
    role="status"
    className={`surface-card flex w-full flex-col items-center justify-center gap-4 px-6 py-16 text-center animate-page ${className}`}
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-[#8E93A0]">
      {icon ?? <AlertTriangle className="h-6 w-6" />}
    </div>
    <div className="space-y-1.5">
      <p className="font-display text-base font-bold text-white sm:text-lg">{title}</p>
      {description && <p className="mx-auto max-w-md text-xs text-[#8E93A0] sm:text-sm">{description}</p>}
    </div>
    {(onRetry || link) && (
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        )}
        {link && (
          <Link to={link.to} className={onRetry ? 'btn-secondary' : 'btn-primary'}>
            {link.label}
          </Link>
        )}
      </div>
    )}
  </div>
);

