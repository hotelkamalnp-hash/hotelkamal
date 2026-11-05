import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { HotelCoupon, CouponDiscountType, CouponServiceScope } from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Percent, 
  DollarSign, 
  Tag, 
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CouponManager: React.FC = () => {
  const { 
    coupons, 
    addCoupon, 
    deleteCoupon, 
    toggleCouponStatus, 
    themeConfig, 
    currentCurrency, 
    activeUser,
    showToast 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterScope, setFilterScope] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [applicableTo, setApplicableTo] = useState<CouponServiceScope>('all');
  const [minSpendUSD, setMinSpendUSD] = useState<number>(30);
  const [validUntil, setValidUntil] = useState<string>('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(250);

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    showToast('Code Copied', `Promo code ${couponCode} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase().replace(/\s+/g, ''),
      description: description.trim() || `${discountValue}${discountType === 'percentage' ? '%' : ' USD'} discount voucher`,
      discountType,
      discountValue: Number(discountValue),
      applicableTo,
      minSpendUSD: Number(minSpendUSD) || 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: validUntil || '2026-12-31',
      usageLimit: Number(usageLimit) || 100,
      isActive: true,
      createdBy: activeUser ? `${activeUser.name} (${activeUser.role})` : 'Super Admin',
    });

    // Reset Form
    setCode('');
    setDescription('');
    setDiscountValue(15);
    setMinSpendUSD(30);
    setIsModalOpen(false);
  };

  const filteredCoupons = coupons.filter((c) => {
    if (filterScope === 'all') return true;
    return c.applicableTo === filterScope;
  });

  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0);
  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Marketing & Guest Rewards
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500">Real-time discount engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mt-1">
              Coupons, Vouchers & Guest Promotional Codes
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Create and manage promotional discount vouchers for room bookings, rooftop dining, and boutique guest services.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer ${themeClasses.primary}`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Coupon</span>
          </button>
        </div>

        {/* Key KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <div className="text-[11px] font-medium text-stone-500 uppercase font-mono">Active Campaigns</div>
            <div className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-1">
              {activeCount} <span className="text-xs font-sans font-normal text-stone-400">/ {coupons.length}</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <div className="text-[11px] font-medium text-stone-500 uppercase font-mono">Total Redemptions</div>
            <div className="text-xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">
              {totalRedemptions} <span className="text-xs font-sans font-normal text-stone-400">times</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <div className="text-[11px] font-medium text-stone-500 uppercase font-mono">Scope Support</div>
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Rooms · Dining · All</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <div className="text-[11px] font-medium text-stone-500 uppercase font-mono">Redemption Gate</div>
            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 mt-1.5 text-stone-600 dark:text-stone-300">
              Live in Booking & Room Dining
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'rooms', label: 'Rooms Only' },
            { id: 'dining', label: 'Rooftop Dining' },
            { id: 'services', label: 'Spa & Services' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterScope(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterScope === f.id
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-400 font-mono">
          Showing {filteredCoupons.length} vouchers
        </span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => {
          const isExpired = new Date(coupon.validUntil) < new Date();
          const isLimitReached = coupon.usageLimit ? coupon.timesUsed >= coupon.usageLimit : false;
          const isCurrentlyUsable = coupon.isActive && !isExpired && !isLimitReached;

          return (
            <div
              key={coupon.id}
              className={`relative bg-white dark:bg-stone-900 rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isCurrentlyUsable
                  ? 'border-stone-200 dark:border-stone-800 hover:border-amber-600/50 hover:shadow'
                  : 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50 dark:bg-stone-900/50'
              }`}
            >
              <div className="space-y-3">
                {/* Code & Scope Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1 rounded text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
                      title="Copy promo code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    coupon.applicableTo === 'all'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                      : coupon.applicableTo === 'rooms'
                      ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {coupon.applicableTo === 'all' ? 'All Hotel' : coupon.applicableTo}
                  </span>
                </div>

                {/* Discount Value */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `${formatCurrency(convertPrice(coupon.discountValue, currentCurrency, themeConfig.exchangeRates), currentCurrency)} OFF`}
                  </span>
                  {coupon.minSpendUSD > 0 && (
                    <span className="text-[11px] text-stone-500 font-sans">
                      (min. {formatCurrency(convertPrice(coupon.minSpendUSD, currentCurrency, themeConfig.exchangeRates), currentCurrency)})
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-snug">
                  {coupon.description}
                </p>

                {/* Expiry & Usage info */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500 space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Valid until:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{coupon.validUntil}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usage count:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {coupon.timesUsed} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'times'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => toggleCouponStatus(coupon.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    coupon.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {coupon.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{coupon.isActive ? 'Active' : 'Disabled'}</span>
                </button>

                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition"
                  title="Delete coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl text-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Create Promotional Coupon
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Coupon Code (Uppercase) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIPSUMMER26"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-mono font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Applicable Scope
                  </label>
                  <select
                    value={applicableTo}
                    onChange={(e) => setApplicableTo(e.target.value as CouponServiceScope)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="all">All Services (Rooms & Dining)</option>
                    <option value="rooms">Rooms & Suites Only</option>
                    <option value="dining">Rooftop Dining Only</option>
                    <option value="services">Spa & Wellness Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Voucher Headline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% Exclusive Discount for In-House Guests"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Discount Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`flex-1 py-2 text-center rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                        discountType === 'percentage'
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage %</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed_amount')}
                      className={`flex-1 py-2 text-center rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                        discountType === 'fixed_amount'
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Fixed USD ($)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Discount Value ({discountType === 'percentage' ? '%' : 'USD $'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percentage' ? 90 : 500}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Min Spend (USD $)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minSpendUSD}
                    onChange={(e) => setMinSpendUSD(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Usage Cap Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-semibold text-white shadow transition cursor-pointer ${themeClasses.primary}`}
                >
                  Create & Activate Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
