import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { AccountingPeriod, AccountingSummary } from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  PieChart, 
  Building, 
  Utensils, 
  Sparkles,
  Percent
} from 'lucide-react';

export const AccountingFinancialReports: React.FC = () => {
  const { invoices, restaurantOrders, bookings, themeConfig, currentCurrency } = useHotel();
  const themeClasses = getThemeClasses(themeConfig.palette);

  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod>('daily');

  // Multipliers / breakdowns based on selected period
  const getPeriodData = (period: AccountingPeriod): AccountingSummary => {
    // Calculate total room revenue from paid bookings & invoices
    const roomStayTotalUSD = invoices
      .flatMap((i) => i.items.filter((item) => item.category === 'room_stay'))
      .reduce((acc, it) => acc + it.amountUSD, 0);

    const diningTotalUSD = invoices
      .flatMap((i) => i.items.filter((item) => item.category === 'restaurant_dining'))
      .reduce((acc, it) => acc + it.amountUSD, 0);

    const servicesTotalUSD = invoices
      .flatMap((i) => i.items.filter((item) => item.category !== 'room_stay' && item.category !== 'restaurant_dining'))
      .reduce((acc, it) => acc + it.amountUSD, 0);

    const multiplier = 
      period === 'daily' ? 1 : 
      period === 'weekly' ? 6.5 : 
      period === 'monthly' ? 26 : 
      period === 'quarterly' ? 78 : 312;

    const baseGross = (roomStayTotalUSD + diningTotalUSD + servicesTotalUSD) * (multiplier * 0.45);
    const taxCollected = baseGross * 0.13;
    const serviceChargeCollected = baseGross * 0.10;
    const discountsGiven = baseGross * 0.03;
    const estimatedExpenses = baseGross * 0.42; // Labor, solar energy, food cost, maintenance
    const netIncome = (baseGross + serviceChargeCollected) - (discountsGiven + estimatedExpenses);

    const labels: Record<AccountingPeriod, string> = {
      daily: 'Today · November 5, 2026',
      weekly: 'Current Week · Week 45, 2026',
      monthly: 'Month of November 2026',
      quarterly: 'Q4 2026 (Oct - Dec)',
      yearly: 'Fiscal Year 2026/27 (Nepal Calendar)',
    };

    return {
      period,
      dateLabel: labels[period],
      roomStayRevenueUSD: roomStayTotalUSD * (multiplier * 0.45),
      restaurantRevenueUSD: diningTotalUSD * (multiplier * 0.45),
      servicesRevenueUSD: servicesTotalUSD * (multiplier * 0.45),
      totalGrossRevenueUSD: baseGross,
      taxCollectedUSD: taxCollected,
      serviceChargeCollectedUSD: serviceChargeCollected,
      discountsGivenUSD: discountsGiven,
      expensesUSD: estimatedExpenses,
      netOperatingIncomeUSD: netIncome,
      totalInvoicesCount: Math.round(invoices.length * (multiplier * 0.5)),
      paidInvoicesCount: Math.round(invoices.filter((i) => i.paymentStatus === 'paid').length * (multiplier * 0.5)),
      pendingInvoicesCount: Math.round(invoices.filter((i) => i.paymentStatus !== 'paid').length * (multiplier * 0.5)),
    };
  };

  const data = getPeriodData(selectedPeriod);

  return (
    <div className="space-y-6">
      
      {/* Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
            Financial Ledger & P&L Statement
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Revenue, Tax & Operational Accounting
          </h3>
          <p className="text-xs text-stone-500">{data.dateLabel}</p>
        </div>

        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
          {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as AccountingPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                selectedPeriod === p
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Financial Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-50 mt-1">
            {formatCurrency(convertPrice(data.totalGrossRevenueUSD, currentCurrency), currentCurrency)}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% vs last {selectedPeriod}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Net Operating Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">
            {formatCurrency(convertPrice(data.netOperatingIncomeUSD, currentCurrency), currentCurrency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 font-mono">
            After operating costs & food expenses
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Tax (13% VAT) Collected</span>
            <Percent className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-sky-700 dark:text-sky-400 mt-1">
            {formatCurrency(convertPrice(data.taxCollectedUSD, currentCurrency), currentCurrency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 font-mono">
            Ready for IRD Nepal monthly filing
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Service Charge (10%)</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-indigo-700 dark:text-indigo-400 mt-1">
            {formatCurrency(convertPrice(data.serviceChargeCollectedUSD, currentCurrency), currentCurrency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 font-mono">
            Staff gratuity & kitchen incentive pool
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Table */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-50 border-b pb-2">
            Revenue Breakdown by Department ({selectedPeriod.toUpperCase()})
          </h4>

          <div className="space-y-3 text-xs">
            {/* Rooms */}
            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Room Stays & Suites</div>
                  <div className="text-[11px] text-stone-400 font-mono">4 room categories · 34 total units</div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                {formatCurrency(convertPrice(data.roomStayRevenueUSD, currentCurrency), currentCurrency)}
              </div>
            </div>

            {/* Restaurant */}
            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Rooftop Restaurant & Dining</div>
                  <div className="text-[11px] text-stone-400 font-mono">Room service, beverages & culinary specials</div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                {formatCurrency(convertPrice(data.restaurantRevenueUSD, currentCurrency), currentCurrency)}
              </div>
            </div>

            {/* Additional Services */}
            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Airport Transfers & Concierge</div>
                  <div className="text-[11px] text-stone-400 font-mono">TIA sedan pickups, permits & laundry</div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                {formatCurrency(convertPrice(data.servicesRevenueUSD, currentCurrency), currentCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses & Margin Box */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 text-xs font-mono">
          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-50 font-sans border-b pb-2">
            Operational Cost & Margin
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Gross Sales:</span>
              <span>{formatCurrency(convertPrice(data.totalGrossRevenueUSD, currentCurrency), currentCurrency)}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Discounts Deducted:</span>
              <span>-{formatCurrency(convertPrice(data.discountsGivenUSD, currentCurrency), currentCurrency)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Estimated OPEX:</span>
              <span>-{formatCurrency(convertPrice(data.expensesUSD, currentCurrency), currentCurrency)}</span>
            </div>
            <div className="flex justify-between text-indigo-600">
              <span>Service Charge Pool:</span>
              <span>+{formatCurrency(convertPrice(data.serviceChargeCollectedUSD, currentCurrency), currentCurrency)}</span>
            </div>
            <div className="pt-2 border-t flex justify-between font-bold text-sm text-emerald-700 dark:text-emerald-400 font-sans">
              <span>Net Profit:</span>
              <span>{formatCurrency(convertPrice(data.netOperatingIncomeUSD, currentCurrency), currentCurrency)}</span>
            </div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-[11px] text-stone-500 font-sans mt-3">
            Invoices: <strong className="text-stone-800 dark:text-stone-200">{data.totalInvoicesCount} total</strong> ({data.paidInvoicesCount} paid, {data.pendingInvoicesCount} pending settlement).
          </div>
        </div>

      </div>

    </div>
  );
};
