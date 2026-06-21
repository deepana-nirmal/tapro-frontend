type TaproLogoProps = {
  large?: boolean;
  className?: string;
};

export function TaproLogo({ large = false, className = '' }: TaproLogoProps) {
  return (
    <img
      src="/assets/tapro-logo.png"
      alt="Tapro logo"
      className={`${large ? 'tapro-logo-large' : 'tapro-logo'} ${className}`.trim()}
    />
  );
}

export default TaproLogo;
