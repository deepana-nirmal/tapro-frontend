import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from './utils';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'link'; size?: 'small'|'medium'|'large'|'icon'; loading?: boolean; leftIcon?: ReactNode; rightIcon?: ReactNode };
export const Button = ({variant='primary',size='medium',loading=false,leftIcon,rightIcon,children,className,...props}:ButtonProps) => {
 const variants={primary:'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700',secondary:'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white',outline:'border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200',ghost:'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',danger:'border-red-700 bg-red-600 text-white hover:bg-red-700',success:'border-green-700 bg-green-600 text-white hover:bg-green-700',link:'border-transparent bg-transparent p-0 text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300'};
 const sizes={small:'min-h-9 px-3 py-1.5 text-sm',medium:'min-h-11 px-4 py-2.5 text-sm',large:'min-h-[52px] px-5 py-3 text-base',icon:'h-11 w-11 p-0'};
 return <button {...props} disabled={props.disabled||loading} aria-busy={loading||undefined} className={classNames('relative inline-flex max-w-full items-center justify-center gap-2 rounded-xl border font-medium transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',variants[variant],sizes[size],className)}>{loading&&<Loader2 aria-hidden className="h-4 w-4 animate-spin"/>}{!loading&&leftIcon}<span className={classNames(size==='icon'&&'sr-only')}>{children}</span>{!loading&&rightIcon}</button>;
};
