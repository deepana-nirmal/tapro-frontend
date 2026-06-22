import { CurrencyCode } from '../types';

export const formatCurrency = (value: number, currencyCode: CurrencyCode = 'LKR') =>
  new Intl.NumberFormat(currencyCode === 'LKR' ? 'en-LK' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
