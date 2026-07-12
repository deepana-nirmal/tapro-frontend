import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { classNames } from '../ui/utils';

export const OwnerPageHeader = ({
  title,
  description,
  eyebrow = 'Owner workspace',
  action,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/92 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-end md:justify-between md:p-5">
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
    {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
  </div>
);

export const OwnerMetricCard = ({
  label,
  value,
  helper,
  tone = 'slate',
}: {
  label: string;
  value: ReactNode;
  helper: string;
  tone?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
}) => (
  <Card className="p-4">
    <div className={classNames(
      'mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl',
      tone === 'emerald' && 'bg-emerald-100 text-emerald-700',
      tone === 'blue' && 'bg-blue-100 text-blue-700',
      tone === 'amber' && 'bg-amber-100 text-amber-700',
      tone === 'rose' && 'bg-rose-100 text-rose-700',
      tone === 'slate' && 'bg-slate-100 text-slate-700'
    )}>
      <BarChart3 className="h-4 w-4" />
    </div>
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{helper}</p>
  </Card>
);

export const OwnerFilterBar = ({ children, resultLabel, onReset }: { children: ReactNode; resultLabel: string; onReset?: () => void }) => (
  <Card className="p-3 sm:p-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{resultLabel}</span>
        {onReset ? <Button variant="ghost" onClick={onReset}>Reset</Button> : null}
      </div>
    </div>
  </Card>
);

export const OwnerAlert = ({ title, children }: { title: string; children: ReactNode }) => (
  <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
    <div className="flex gap-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 leading-6">{children}</div>
      </div>
    </div>
  </div>
);

export const OwnerQuickAction = ({ to, label, description }: { to: string; label: string; description: string }) => (
  <Link to={to} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-emerald-950/20">
    <span className="min-w-0">
      <span className="block font-semibold text-slate-950 dark:text-white">{label}</span>
      <span className="mt-1 block text-sm text-slate-500">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
  </Link>
);

