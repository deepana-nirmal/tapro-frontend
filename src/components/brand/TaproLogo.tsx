type TaproLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClassMap = {
  sm: 'tapro-logo-sm h-[40px] w-auto max-w-[170px] object-contain',
  md: 'tapro-logo-md h-[46px] md:h-[72px] w-auto max-w-[190px] md:max-w-[280px] object-contain',
  lg: 'tapro-logo-lg h-[64px] md:h-[96px] w-auto max-w-[260px] md:max-w-[380px] object-contain',
} as const;

export function TaproLogo({ size = 'md', className = '' }: TaproLogoProps) {
  return (
    <img
      src="/assets/tapro-logo-trimmed.png"
      alt="Tapro logo"
      className={`tapro-logo ${sizeClassMap[size]} ${className}`.trim()}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = '/assets/tapro-logo.svg';
      }}
    />
  );
}

export default TaproLogo;
