import React, { PropsWithChildren, ReactNode } from 'react';
import { Loader2, Moon, Sun } from 'lucide-react';
import { formatCompactNumber, formatCurrency } from '../../utils/format';
import { OrderItem } from '../../types';

export const classNames = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export const Card = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => (
  <div
    className={classNames(
      'relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900 dark:shadow-panel-dark',
      'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-200/70 before:to-transparent before:content-[""] dark:before:via-emerald-400/40',
      className
    )}
  >
    {children}
  </div>
);

export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">Tapro</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
    {action}
  </div>
);

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) => {
  const styles = {
    primary: 'border border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600',
    secondary: 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/20',
    ghost: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'border border-red-500 bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      className={classNames('inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50', styles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
    {label && <span>{label}</span>}
    <input
      {...props}
      className={classNames(
        'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none ring-0 transition dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        'placeholder:text-slate-400 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] dark:focus:border-emerald-400',
        props.className
      )}
    />
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

export const Textarea = ({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
    {label && <span>{label}</span>}
    <textarea
      {...props}
      className={classNames(
        'min-h-[108px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        'placeholder:text-slate-400 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] dark:focus:border-emerald-400',
        props.className
      )}
    />
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

export const Select = ({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
    {label && <span>{label}</span>}
    <select
      {...props}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
    >
      {children}
    </select>
  </label>
);

export const StatCard = ({
  label,
  value,
  helper,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: 'emerald' | 'blue' | 'amber' | 'rose';
}) => {
  const tones = {
    emerald: 'from-emerald-400/20 via-teal-400/10 to-transparent',
    blue: 'from-cyan-400/20 via-sky-400/10 to-transparent',
    amber: 'from-amber-400/20 via-orange-400/10 to-transparent',
    rose: 'from-rose-400/20 via-fuchsia-400/10 to-transparent',
  };

  return (
    <Card className={`bg-gradient-to-br ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
        {typeof value === 'number' ? formatCompactNumber(value) : value}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{helper}</p>
    </Card>
  );
};

export const StatusBadge = ({ value }: { value: string }) => {
  const styles = value.includes('ACTIVE') || value === 'READY' || value === 'PAID'
    ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
    : value.includes('PENDING') || value === 'PREPARING'
      ? 'border border-amber-300/20 bg-amber-400/10 text-amber-200'
      : 'border border-rose-300/20 bg-rose-400/10 text-rose-200';

  return <span className={classNames('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', styles)}>{value}</span>;
};

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <Card className="border-dashed text-center">
    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
  </Card>
);

export const LoadingBlock = ({ label = 'Loading workspace...' }: { label?: string }) => (
  <div className="flex min-h-[240px] items-center justify-center">
    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={classNames('skeleton rounded-2xl', className)} />
);

export const ThemeToggle = ({ darkMode, onToggle }: { darkMode: boolean; onToggle: () => void }) => (
  <Button variant="ghost" onClick={onToggle} className="h-10 w-10 rounded-full p-0">
    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
  </Button>
);

export const DataTable = <T,>({
  columns,
  rows,
}: {
  columns: Array<{ key: string; label: string; render: (row: T) => ReactNode }>;
  rows: T[];
}) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900/80">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {rows.map((row, index) => (
            <tr key={index} className="align-top transition hover:bg-slate-50 dark:hover:bg-slate-900/80">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const OrderItemsList = ({
  items,
  emptyLabel = 'No items available',
}: {
  items?: Array<Pick<OrderItem, 'id' | 'itemName' | 'quantity' | 'price' | 'subTotal'>>;
  emptyLabel?: string;
}) => {
  if (!items?.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.id ?? `${item.itemName}-${index}`} className="text-sm text-slate-700 dark:text-slate-200">
          <span className="font-medium">{item.quantity} x {item.itemName}</span>
          <span className="text-slate-500 dark:text-slate-400"> - {formatCurrency(typeof item.subTotal === 'number' ? item.subTotal : item.price)}</span>
        </div>
      ))}
    </div>
  );
};
