type TaproLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClassMap = {
  sm: 'tapro-logo-sm',
  md: 'tapro-logo-md',
  lg: 'tapro-logo-lg',
} as const;

export function TaproLogo({ size = 'md', className = '' }: TaproLogoProps) {
  return (
    <img
      src="/assets/tapro-logo.svg"
      alt="Tapro logo"
      className={`tapro-logo ${sizeClassMap[size]} ${className}`.trim()}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = '/assets/tapro-logo.png';
      }}
    />
  );
}

export default TaproLogo;
