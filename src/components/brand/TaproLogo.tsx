type TaproLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClassMap = {
  sm: 'tapro-logo-sm h-10 w-auto max-w-[170px] object-contain',
  md: 'tapro-logo-md h-11 md:h-16 w-auto max-w-[190px] md:max-w-[260px] object-contain',
  lg: 'tapro-logo-lg h-[60px] md:h-24 w-auto max-w-[260px] md:max-w-[380px] object-contain',
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
