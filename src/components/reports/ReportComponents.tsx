import { ReactNode } from 'react';
import { Button, Card } from '../ui';

export type ChartPoint = {
  label: string;
  value: number;
  helper?: string;
};

export const exportCsv = (filename: string, rows: Array<Record<string, string | number | null | undefined>>) => {
  const escape = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportToolbar = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
    {children}
  </div>
);

export const BarChartCard = ({ title, description, points, valueFormatter = (value) => String(value), exportFilename }: {
  title: string;
  description?: string;
  points: ChartPoint[];
  valueFormatter?: (value: number) => string;
  exportFilename?: string;
}) => {
  const max = Math.max(...points.map((point) => point.value), 1);
  const summary = points.length
    ? `${title}: ${points.map((point) => `${point.label} ${valueFormatter(point.value)}`).join(', ')}.`
    : `${title}: no data available.`;

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        {exportFilename && points.length ? (
          <Button type="button" variant="secondary" onClick={() => exportCsv(exportFilename, points.map((point) => ({ label: point.label, value: point.value, helper: point.helper || '' })))}>
            Export CSV
          </Button>
        ) : null}
      </div>
      <p className="sr-only">{summary}</p>
      <div aria-hidden className="mt-5 grid gap-3">
        {points.length ? points.map((point) => (
          <div key={point.label} className="grid gap-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">{point.label}</span>
              <span className="font-semibold text-slate-950 dark:text-white">{valueFormatter(point.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(4, (point.value / max) * 100)}%` }} />
            </div>
          </div>
        )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">No report data available for this view.</div>}
      </div>
    </Card>
  );
};

export const DonutSummaryCard = ({ title, points }: { title: string; points: ChartPoint[] }) => {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="sr-only">{points.map((point) => `${point.label}: ${point.value}`).join(', ') || 'No data available.'}</p>
      <div className="mt-5 grid gap-3">
        {points.length ? points.map((point) => (
          <div key={point.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
            <span>{point.label}</span>
            <span className="font-semibold">{total ? `${Math.round((point.value / total) * 100)}%` : '0%'} · {point.value}</span>
          </div>
        )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">No distribution data yet.</div>}
      </div>
    </Card>
  );
};
