import { ButtonHTMLAttributes, PropsWithChildren, ReactNode, useId, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaproLogo from '../branding/TaproLogo';
import { Button, Card, classNames } from '../ui';

export const AuthLayout = ({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) => (
  <div className="min-h-screen min-h-[100dvh] bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_100%)] px-3 py-4 text-slate-950 sm:px-6 sm:py-8">
    <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-7xl gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)] lg:items-stretch">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-[#063f43] p-8 text-white shadow-2xl shadow-slate-950/15 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.24),transparent_32%)]" />
        <div className="relative">
          <Link to="/" className="inline-flex rounded-2xl bg-white px-4 py-3" aria-label="Back to Tapro home">
            <TaproLogo size="md" className="max-w-[220px]" />
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Restaurant QR ordering SaaS</p>
          <h1 className="mt-4 max-w-2xl text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/82">{description}</p>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-3">
          {['Manage menus', 'Track orders', 'Coordinate staff'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/12 bg-white/10 p-4">
              <QrCode aria-hidden className="h-5 w-5 text-emerald-200" />
              <p className="mt-3 text-sm font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>
      <main className="flex min-w-0 flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <Link to="/" className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm" aria-label="Back to Tapro home">
            <TaproLogo size="sm" className="max-w-[150px]" />
          </Link>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
            <ArrowLeft aria-hidden className="h-4 w-4" /> Home
          </Link>
        </div>
        {children}
      </main>
    </div>
  </div>
);

export const AuthFormCard = ({ eyebrow, title, description, children, footer }: PropsWithChildren<{ eyebrow?: string; title: string; description: string; footer?: ReactNode }>) => (
  <Card className="mx-auto w-full max-w-xl border-slate-200/80 bg-white/95 p-0 shadow-xl shadow-slate-950/8">
    <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p> : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
    <div className="px-5 py-6 sm:px-8">{children}</div>
    {footer ? <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:px-8">{footer}</div> : null}
  </Card>
);

export const PasswordField = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  autoComplete,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  autoComplete: string;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <LockKeyhole aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={classNames(helperText && helperId, error && errorId) || undefined}
          className={classNames(
            'min-h-11 w-full rounded-xl border bg-white px-10 py-2.5 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-100',
            error ? 'border-red-400' : 'border-slate-300'
          )}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
        </button>
      </div>
      {helperText ? <p id={helperId} className="text-xs leading-5 text-slate-500">{helperText}</p> : null}
      {error ? <p id={errorId} role="alert" className="text-xs leading-5 text-red-600">{error}</p> : null}
    </div>
  );
};

export const FormError = ({ message }: { message?: string }) => message ? (
  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{message}</p>
) : null;

export const FormSuccess = ({ message }: { message?: string }) => message ? (
  <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">{message}</p>
) : null;

export const AuthSubmitButton = ({ loading, loadingText, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean; loadingText: string }>) => (
  <Button type="submit" className="w-full" disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
    <span className="inline-flex min-w-[9rem] items-center justify-center gap-2">
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {loading ? loadingText : children}
    </span>
  </Button>
);
