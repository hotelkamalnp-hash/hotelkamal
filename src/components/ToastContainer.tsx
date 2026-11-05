import React from 'react';
import { useHotel } from '../context/HotelContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHotel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl p-4 flex items-start gap-3 transition-all animate-in slide-in-from-top-3 fade-in duration-200"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-600" />}
          </div>

          <div className="flex-1 text-xs">
            <h5 className="font-semibold text-stone-900 dark:text-stone-100">{toast.title}</h5>
            <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
