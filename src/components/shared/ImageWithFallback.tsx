import { useState } from 'react';
import { classNames } from '../ui';

export const initialsFromName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'R';

export const ImageWithFallback = ({
  src,
  alt,
  fallback,
  className = '',
  fallbackClassName = '',
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={classNames('flex items-center justify-center bg-slate-900 font-semibold text-white dark:bg-slate-100 dark:text-slate-950', fallbackClassName)}>
        {fallback}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};
