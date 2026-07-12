import { ReactNode } from 'react'; import { Moon,Sun } from 'lucide-react'; import { formatCompactNumber,formatCurrency } from '../../utils/format'; import { CurrencyCode,OrderItem } from '../../types';
import { Button } from './Button'; import { Card } from './Card'; import { SectionLoading } from './States';
export * from './utils'; export * from './Button'; export * from './Form'; export * from './Card'; export * from './Badge'; export * from './Modal'; export * from './Drawer'; export * from './States'; export * from './Table'; export * from './Toast';
export const PageHeader=({title,description,action}:{title:string;description:string;action?:ReactNode})=><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Tapro</p><h1 className="mt-2 text-[length:var(--text-page-title)] font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p></div>{action&&<div className="flex flex-wrap gap-2">{action}</div>}</div>;
export const StatCard=({label,value,helper,tone='blue'}:{label:string;value:string|number;helper:string;tone?:'emerald'|'blue'|'amber'|'rose'})=><Card><p className="text-xs font-medium text-slate-500">{label}</p><div className="mt-4 text-3xl font-semibold">{typeof value==='number'?formatCompactNumber(value):value}</div><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{helper}</p></Card>;
export const LoadingBlock=({label='Loading workspace...'}:{label?:string})=><SectionLoading label={label}/>;
export const ThemeToggle=({darkMode,onToggle}:{darkMode:boolean;onToggle:()=>void})=><Button variant="ghost" size="icon" onClick={onToggle} aria-label={darkMode?'Use light theme':'Use dark theme'}>{darkMode?<Sun aria-hidden className="h-4 w-4"/>:<Moon aria-hidden className="h-4 w-4"/>}</Button>;
type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  className?: string;
};

type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  loading?: boolean;
  error?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowKey?: (row: T, index: number) => string | number;
  getRowLabel?: (row: T, index: number) => string;
  onRetry?: () => void;
  footer?: ReactNode;
  mobileFooter?: ReactNode;
};

export const DataTable=<T,>({
  columns,
  rows,
  loading = false,
  error,
  emptyTitle = 'No results',
  emptyDescription = 'There is nothing to display yet.',
  getRowKey,
  getRowLabel,
  onRetry,
  footer,
  mobileFooter,
}: DataTableProps<T>) => {
  const rowKey = (row: T, index: number) => getRowKey?.(row, index) ?? (typeof row === 'object' && row !== null && 'id' in row ? String((row as { id?: string | number }).id) : index);
  const state = loading ? (
    <SectionLoading label="Loading table…" />
  ) : error ? (
    <div className="grid gap-3 p-5 text-sm text-rose-700 dark:text-rose-300">
      <div>{error}</div>
      {onRetry ? <div><Button type="button" variant="secondary" onClick={onRetry}>Retry</Button></div> : null}
    </div>
  ) : !rows.length ? (
    <div className="p-5">
      <p className="font-medium text-slate-900 dark:text-slate-100">{emptyTitle}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{emptyDescription}</p>
    </div>
  ) : null;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full table-auto text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
            <tr>{columns.map((column) => <th key={column.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {state ? (
              <tr><td colSpan={columns.length}>{state}</td></tr>
            ) : rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-t border-slate-100 hover:bg-slate-50 focus-within:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                {columns.map((column) => <td key={column.key} className={`min-w-0 max-w-[28rem] px-4 py-3 align-top text-slate-700 dark:text-slate-200 ${column.className || ''}`}>{column.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {footer ? <div className="border-t border-slate-100 p-3 dark:border-slate-800">{footer}</div> : null}
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800 lg:hidden">
        {state || rows.map((row, index) => {
          const label = getRowLabel?.(row, index) || `Result ${index + 1}`;
          return (
            <article key={rowKey(row, index)} aria-label={label} className="grid min-w-0 gap-3 p-4 focus-within:bg-slate-50 dark:focus-within:bg-slate-800">
              {columns.filter((column) => !column.hideOnMobile).map((column) => (
                <div key={column.key} className="grid min-w-0 gap-1 text-sm min-[420px]:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] min-[420px]:gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{column.mobileLabel || column.label}</div>
                  <div className="min-w-0 break-words text-slate-800 dark:text-slate-100 [&_*]:max-w-full [&_.flex]:flex-wrap [&_a]:break-all">{column.render(row)}</div>
                </div>
              ))}
            </article>
          );
        })}
        {mobileFooter || footer ? <div className="p-3">{mobileFooter || footer}</div> : null}
      </div>
    </div>
  );
};
export const OrderItemsList=({items,currencyCode='LKR',emptyLabel='No items available'}:{items?:Array<Pick<OrderItem,'id'|'itemName'|'quantity'|'price'|'subTotal'>>;currencyCode?:CurrencyCode;emptyLabel?:string})=>!items?.length?<p className="text-sm text-slate-500">{emptyLabel}</p>:<div className="space-y-2">{items.map((x,i)=><div key={x.id??i} className="text-sm"><span className="font-medium">{x.quantity} x {x.itemName}</span><span className="text-slate-500"> - {formatCurrency(typeof x.subTotal==='number'?x.subTotal:x.price,currencyCode)}</span></div>)}</div>;
