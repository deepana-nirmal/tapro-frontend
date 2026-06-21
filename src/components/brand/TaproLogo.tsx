import { classNames } from '../ui';

type TaproLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showWordmark?: boolean;
};

const sizeMap = {
  sm: {
    full: 'w-[120px] md:w-[136px]',
    icon: 'w-10 md:w-11',
  },
  md: {
    full: 'w-[148px] md:w-[164px]',
    icon: 'w-12 md:w-[52px]',
  },
  lg: {
    full: 'w-[170px] md:w-[188px]',
    icon: 'w-14 md:w-16',
  },
} as const;

const iconShapes = (
  <>
    <rect x="8" y="8" width="88" height="88" rx="24" fill="#F7FBFA" stroke="#123C3A" strokeWidth="6" />
    <path d="M28 34H42V48H28z" fill="#123C3A" />
    <path d="M62 34H76V48H62z" fill="#F97316" />
    <path d="M28 62H42V76H28z" fill="#123C3A" />
    <path d="M67 64H74V71H67z" fill="#F97316" />
    <path d="M77 64H84V71H77z" fill="#F97316" />
    <path d="M67 74H74V81H67z" fill="#123C3A" />
    <path d="M77 74H84V81H77z" fill="#F97316" />
    <path
      d="M31 66c1-13 11-24 24-24s23 11 24 24H31z"
      fill="#123C3A"
    />
    <path
      d="M53 40c0-2 2-4 4-4s4 2 4 4"
      fill="none"
      stroke="#123C3A"
      strokeLinecap="round"
      strokeWidth="5"
    />
    <path
      d="M18 28v27"
      fill="none"
      stroke="#123C3A"
      strokeLinecap="round"
      strokeWidth="5"
    />
    <path
      d="M14 28v12M22 28v12"
      fill="none"
      stroke="#123C3A"
      strokeLinecap="round"
      strokeWidth="3.5"
    />
    <path
      d="M29 54h50"
      fill="none"
      stroke="#123C3A"
      strokeLinecap="round"
      strokeWidth="5"
    />
  </>
);

export function TaproLogo({
  size = 'md',
  className = '',
  showWordmark = true,
}: TaproLogoProps) {
  const widthClass = showWordmark ? sizeMap[size].full : sizeMap[size].icon;

  return (
    <span className={classNames('brand-logo', className)}>
      <svg
        viewBox={showWordmark ? '0 0 420 112' : '0 0 104 104'}
        aria-hidden="true"
        role="img"
        className={classNames('h-auto overflow-visible', widthClass)}
      >
        <title>Tapro logo</title>
        <g>{iconShapes}</g>
        {showWordmark ? (
          <>
            <text
              x="120"
              y="73"
              fill="#123C3A"
              fontFamily="'Space Grotesk', 'IBM Plex Sans', sans-serif"
              fontSize="58"
              fontWeight="700"
              letterSpacing="-3"
            >
              Tap
            </text>
            <text
              x="280"
              y="73"
              fill="#F97316"
              fontFamily="'Space Grotesk', 'IBM Plex Sans', sans-serif"
              fontSize="58"
              fontWeight="700"
              letterSpacing="-3"
            >
              ro
            </text>
          </>
        ) : null}
      </svg>
    </span>
  );
}

export default TaproLogo;
