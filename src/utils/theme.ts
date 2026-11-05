import { ThemePalette, CurrencyCode } from '../types/hotel';

export const getThemeClasses = (palette: ThemePalette) => {
  switch (palette) {
    case 'mountain-emerald':
      return {
        primary: 'bg-emerald-900 text-white hover:bg-emerald-800',
        primaryText: 'text-emerald-900 dark:text-emerald-300',
        accentBg: 'bg-emerald-700 text-white',
        borderAccent: 'border-emerald-700',
        ringFocus: 'focus:ring-emerald-700',
        badge: 'text-emerald-800 dark:text-emerald-300',
        heroOverlay: 'from-emerald-950/80 via-emerald-950/50 to-transparent',
      };
    case 'heritage-bronze':
      return {
        primary: 'bg-amber-900 text-white hover:bg-amber-800',
        primaryText: 'text-amber-900 dark:text-amber-400',
        accentBg: 'bg-amber-700 text-white',
        borderAccent: 'border-amber-700',
        ringFocus: 'focus:ring-amber-700',
        badge: 'text-amber-800 dark:text-amber-400',
        heroOverlay: 'from-stone-950/85 via-stone-950/50 to-transparent',
      };
    case 'midnight-navy':
      return {
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        primaryText: 'text-slate-900 dark:text-sky-400',
        accentBg: 'bg-sky-800 text-white',
        borderAccent: 'border-sky-800',
        ringFocus: 'focus:ring-sky-700',
        badge: 'text-sky-800 dark:text-sky-400',
        heroOverlay: 'from-slate-950/85 via-slate-950/50 to-transparent',
      };
    case 'royal-maroon':
    default:
      return {
        primary: 'bg-rose-950 text-white hover:bg-rose-900 dark:bg-rose-900 dark:hover:bg-rose-800',
        primaryText: 'text-rose-950 dark:text-rose-300',
        accentBg: 'bg-amber-700 text-white',
        borderAccent: 'border-rose-900',
        ringFocus: 'focus:ring-rose-800',
        badge: 'text-rose-900 dark:text-rose-300',
        heroOverlay: 'from-stone-950/85 via-stone-950/55 to-transparent',
      };
  }
};

export const convertPrice = (
  priceUSD: number,
  targetCurrency: CurrencyCode,
  exchangeRates: { USD: number; NPR: number; INR: number } = { USD: 1, NPR: 135, INR: 84.5 }
): number => {
  if (targetCurrency === 'NPR') {
    return Math.round(priceUSD * (exchangeRates.NPR || 135));
  }
  if (targetCurrency === 'INR') {
    return Math.round(priceUSD * (exchangeRates.INR || 84.5));
  }
  return priceUSD;
};

export const formatCurrency = (amount: number, currency: CurrencyCode = 'NPR'): string => {
  if (currency === 'NPR') {
    return `रू ${Math.round(amount).toLocaleString('en-IN')}`;
  }
  if (currency === 'INR') {
    return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
  }
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const calculateStayDuration = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};
