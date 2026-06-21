import { classNames } from '../ui';

type TaproLogoProps = {
  className?: string;
  imageClassName?: string;
  alt?: string;
  size?: 'default' | 'large';
};

const TaproLogo = ({
  className,
  imageClassName,
  alt = 'Tapro logo',
  size = 'default',
}: TaproLogoProps) => (
  <div className={classNames('inline-flex w-auto items-center overflow-visible', className)}>
    <img
      src="/assets/tapro-logo.png"
      alt={alt}
      className={classNames(size === 'large' ? 'tapro-logo-large' : 'tapro-logo', imageClassName)}
    />
  </div>
);

export default TaproLogo;
