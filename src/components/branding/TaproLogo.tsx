import { SyntheticEvent } from 'react';
import { classNames } from '../ui';

type TaproLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  variant?: 'full' | 'mark';
  withWordmark?: boolean;
  showTagline?: boolean;
  alt?: string;
};

const primaryLogoSrc = '/assets/tapro-logo.svg';
const fallbackLogoSrc = '/assets/tapro-logo.jpg';
const sizeClassMap = {
  sm: 'tapro-logo-sm',
  md: 'tapro-logo-md',
  lg: 'tapro-logo-lg',
} as const;

const handleLogoError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src.endsWith(fallbackLogoSrc)) {
    return;
  }

  image.src = fallbackLogoSrc;
};

const TaproLogo = ({
  size = 'md',
  className,
  imageClassName,
  labelClassName: _labelClassName,
  variant = 'full',
  withWordmark = true,
  showTagline = false,
  alt = 'Tapro logo',
}: TaproLogoProps) => {
  void _labelClassName;
  void variant;
  void withWordmark;
  void showTagline;

  return (
    <img
      src={primaryLogoSrc}
      alt={alt}
      className={classNames('tapro-logo', sizeClassMap[size], imageClassName, className)}
      onError={handleLogoError}
    />
  );
};

export default TaproLogo;
