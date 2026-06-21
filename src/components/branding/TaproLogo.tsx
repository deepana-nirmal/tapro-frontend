import { classNames } from '../ui';

type TaproLogoProps = {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  variant?: 'full' | 'mark';
  withWordmark?: boolean;
  showTagline?: boolean;
  alt?: string;
};

const fullLogoSrc = '/assets/tapro-logo-full.svg';
const markLogoSrc = '/assets/tapro-logo-mark.svg';

const TaproLogo = ({
  className,
  imageClassName,
  labelClassName,
  variant = 'full',
  withWordmark = true,
  showTagline = false,
  alt = 'Tapro logo',
}: TaproLogoProps) => {
  if (variant === 'mark') {
    return (
      <div className={classNames('inline-flex items-center gap-3', className)}>
        <img src={markLogoSrc} alt={alt} className={classNames('h-12 w-12 object-contain', imageClassName)} />
        {withWordmark ? (
          <div className={labelClassName}>
            <p className="text-xl font-semibold tracking-[-0.04em] text-slate-950">Tapro</p>
            {showTagline ? <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Restaurant Command Platform</p> : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={classNames('inline-flex items-center', className)}>
      <img src={fullLogoSrc} alt={alt} className={classNames('h-16 w-auto object-contain', imageClassName)} />
      {showTagline ? (
        <p className={classNames('ml-4 text-[11px] uppercase tracking-[0.28em] text-slate-500', labelClassName)}>
          Restaurant Command Platform
        </p>
      ) : null}
    </div>
  );
};

export default TaproLogo;
