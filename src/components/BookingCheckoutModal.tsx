import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room, BookingAddon, PaymentMethod, CurrencyCode } from '../types/hotel';
import { getThemeClasses, formatCurrency, convertPrice, calculateStayDuration } from '../utils/theme';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  Printer, 
  MessageSquare, 
  ArrowRight, 
  ChevronLeft, 
  Smartphone,
  MapPin,
  Coins,
  Tag,
  Ticket
} from 'lucide-react';
import { useModalDismiss, ModalDismissButton } from './Common/ModalDismissHandler';

const AVAILABLE_ADDONS: BookingAddon[] = [
  {
    id: 'addon-breakfast',
    name: 'Rooftop Himalayan Breakfast Buffet',
    priceUSD: 8,
    description: 'Fresh organic fruits, highland coffee, eggs, and freshly baked pastries daily.',
    selected: true,
  },
  {
    id: 'addon-airport',
    name: 'Private Tribhuvan Airport (TIA) Pickup',
    priceUSD: 18,
    description: 'Private hotel sedan meets you right outside the arrivals terminal in Kathmandu.',
    selected: false,
  },
  {
    id: 'addon-tour',
    name: 'Kathmandu Valley Heritage Tour',
    priceUSD: 25,
    description: 'Private driver excursion to Pashupatinath, Boudhanath, and Swayambhunath.',
    selected: false,
  },
  {
    id: 'addon-massage',
    name: 'Traditional Ayurvedic Relaxation Massage',
    priceUSD: 35,
    description: '60-minute therapeutic herbal oil massage by certified wellness therapists.',
    selected: false,
  },
];

export const BookingCheckoutModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    closeBookingModal, 
    selectedRoomForBooking, 
    themeConfig, 
    currentCurrency, 
    setCurrentCurrency, 
    createBooking,
    validateAndApplyCoupon,
    redeemCoupon,
    showToast
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Today & Tomorrow default
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const checkoutDefault = new Date(today);
  checkoutDefault.setDate(today.getDate() + 4);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // Steps: 1: Details & Addons, 2: Payment, 3: Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [checkIn, setCheckIn] = useState<string>(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(formatDate(checkoutDefault));
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [guestName, setGuestName] = useState<string>('Boutique Traveler');
  const [guestEmail, setGuestEmail] = useState<string>('hotelkamal.np@gmail.com');
  const [guestPhone, setGuestPhone] = useState<string>('+977 9801234567');
  const [guestCountry, setGuestCountry] = useState<string>('Nepal');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Addons State
  const [addons, setAddons] = useState<BookingAddon[]>(AVAILABLE_ADDONS);

  // Coupon State
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCouponData, setAppliedCouponData] = useState<{
    code: string;
    discountUSD: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('888');
  const [cardHolder, setCardHolder] = useState<string>('KAMAL GUEST');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Confirmed booking state
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string>('');

  useModalDismiss({
    isOpen: isBookingModalOpen && Boolean(selectedRoomForBooking),
    onClose: closeBookingModal,
  });

  if (!isBookingModalOpen || !selectedRoomForBooking) {
    return null;
  }

  const room = selectedRoomForBooking;
  const nights = calculateStayDuration(checkIn, checkOut);
  const surgeMultiplier = themeConfig.seasonalSurgeMultiplier || 1.0;

  // Rate in selected currency
  const baseRateInCurrency = convertPrice(room.pricePerNightUSD * surgeMultiplier, currentCurrency, themeConfig.exchangeRates);
  const roomSubtotal = baseRateInCurrency * nights;

  const selectedAddons = addons.filter((a) => a.selected);
  const addonsSubtotal = selectedAddons.reduce((sum, item) => {
    const itemPriceInCurrency = convertPrice(item.priceUSD, currentCurrency, themeConfig.exchangeRates);
    if (item.id === 'addon-breakfast') {
      return sum + itemPriceInCurrency * nights * adults;
    }
    return sum + itemPriceInCurrency;
  }, 0);

  // Base USD subtotal for coupon logic
  const roomSubtotalUSD = (room.pricePerNightUSD * surgeMultiplier) * nights;
  const addonsSubtotalUSD = selectedAddons.reduce((sum, item) => {
    if (item.id === 'addon-breakfast') {
      return sum + item.priceUSD * nights * adults;
    }
    return sum + item.priceUSD;
  }, 0);
  const rawSubtotalUSD = roomSubtotalUSD + addonsSubtotalUSD;

  const rawSubtotal = roomSubtotal + addonsSubtotal;

  // Coupon discount calculation
  const couponDiscountInCurrency = appliedCouponData 
    ? convertPrice(appliedCouponData.discountUSD, currentCurrency, themeConfig.exchangeRates)
    : 0;

  const discountedSubtotal = Math.max(0, rawSubtotal - couponDiscountInCurrency);
  const taxRate = (themeConfig.taxRatePercent || 13) / 100;
  const taxAmount = Number((discountedSubtotal * taxRate).toFixed(2));
  const grandTotal = Number((discountedSubtotal + taxAmount).toFixed(2));

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = validateAndApplyCoupon(couponInput.trim(), rawSubtotalUSD, 'rooms');
    if (res.valid && res.coupon) {
      setAppliedCouponData({
        code: res.coupon.code,
        discountUSD: res.discountAmountUSD,
        description: res.coupon.description,
      });
      showToast('Coupon Applied!', `Saved $${res.discountAmountUSD.toFixed(2)} with code ${res.coupon.code}`, 'success');
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponData(null);
    setCouponInput('');
    setCouponError('');
    showToast('Coupon Removed', 'Standard booking rate restored.', 'info');
  };

  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.map((addon) => (addon.id === id ? { ...addon, selected: !addon.selected } : addon))
    );
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate 3D Secure Authorization
    setTimeout(() => {
      const created = createBooking({
        guestName,
        guestEmail,
        guestPhone,
        guestCountry,
        roomTypeId: room.id,
        roomName: room.name,
        roomType: room.type,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        adults,
        children,
        addons: selectedAddons,
        subtotal: discountedSubtotal,
        taxAmount,
        totalAmount: grandTotal,
        currency: currentCurrency,
        paymentStatus: 'paid',
        paymentMethod,
        cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4).replace(/\s/g, '') || '4242' : undefined,
        bookingStatus: 'confirmed',
        specialRequests: appliedCouponData 
          ? `${specialRequests ? specialRequests + ' | ' : ''}Promo applied: ${appliedCouponData.code} (-$${appliedCouponData.discountUSD.toFixed(2)})`
          : specialRequests,
      });

      if (appliedCouponData) {
        redeemCoupon(appliedCouponData.code);
      }

      setConfirmedBookingCode(created.bookingCode);
      setIsProcessing(false);
      setStep(3);
    }, 1200);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBookingModal();
      }}
    >
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-4xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 animate-fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-100/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              Kamal Hotel · Kamalpokhari, Kathmandu
            </span>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Step {step} of 3: {step === 1 ? 'Guest Information' : step === 2 ? 'Secure Payment' : 'Confirmed Voucher'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector inside modal */}
            <div className="flex bg-stone-200 dark:bg-stone-700 rounded p-0.5 text-[11px] font-semibold">
              {(['NPR', 'USD', 'INR'] as CurrencyCode[]).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrentCurrency(curr)}
                  className={`px-1.5 py-0.5 rounded ${
                    currentCurrency === curr
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-xs'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <ModalDismissButton onClose={closeBookingModal} ariaLabel="Close booking modal" />
          </div>
        </div>

        {/* Step 1: Details & Enhancements */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                    Guest & Reservation Details
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Instant automated confirmation vouchers will be dispatched to this email and phone.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Check-Out Date ({nights} {nights === 1 ? 'night' : 'nights'})
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Adults
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Children (0-12 yrs)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100"
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                        Email Address (for voucher)
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                        Mobile Phone (for SMS updates)
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+977 9801234567"
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Special Requests / Dietary Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g., Upper floor room facing Kamalpokhari quiet courtyard, early bag drop."
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Add-ons Selector */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                    Enhance Your Stay (Optional Add-ons)
                  </h4>
                  <div className="space-y-2">
                    {addons.map((addon) => {
                      const addonPriceInCurrency = convertPrice(addon.priceUSD, currentCurrency, themeConfig.exchangeRates);
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            addon.selected
                              ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                              : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={addon.selected}
                            onChange={() => toggleAddon(addon.id)}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100">
                              <span>{addon.name}</span>
                              <span className="tabular-nums">
                                +{formatCurrency(addonPriceInCurrency, currentCurrency)} {addon.id === 'addon-breakfast' ? '/ person / night' : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{addon.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Reservation Summary Card */}
              <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-800/60 p-6 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Booking Summary ({currentCurrency})
                  </div>
                  
                  {/* Room Thumbnail & Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-200 dark:border-stone-700">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-16 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                        {room.name}
                      </h4>
                      <div className="text-[11px] text-stone-500">
                        {room.bedType} · {room.view}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div className="py-4 border-b border-stone-200 dark:border-stone-700 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Stay Duration:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Dates:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {checkIn} → {checkOut}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Guests:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {adults} Adults {children > 0 ? `, ${children} Children` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="py-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">
                        Room Rate ({formatCurrency(baseRateInCurrency, currentCurrency)} × {nights}n):
                      </span>
                      <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                        {formatCurrency(roomSubtotal, currentCurrency)}
                      </span>
                    </div>
                    {addonsSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Selected Add-ons:</span>
                        <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                          {formatCurrency(addonsSubtotal, currentCurrency)}
                        </span>
                      </div>
                    )}

                    {/* Promo Code Input & Applied Voucher */}
                    <div className="pt-2 pb-1 border-t border-stone-200 dark:border-stone-700">
                      {appliedCouponData ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Voucher: {appliedCouponData.code}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                              -{formatCurrency(couponDiscountInCurrency, currentCurrency)}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-stone-400 hover:text-rose-600 font-bold px-1"
                              title="Remove coupon"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Promo / Voucher Code"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError('');
                              }}
                              className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-stone-900 dark:text-stone-100"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon()}
                              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                          )}
                          <p className="text-[10px] text-stone-400">
                            Try: <span className="font-mono font-bold text-stone-600 dark:text-stone-300">WELCOME2026</span> (15% off) or <span className="font-mono font-bold text-stone-600 dark:text-stone-300">HIMALAYANVIP</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {appliedCouponData && (
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span>Coupon Savings ({appliedCouponData.code}):</span>
                        <span className="tabular-nums">-{formatCurrency(couponDiscountInCurrency, currentCurrency)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-stone-500">VAT & Taxes ({themeConfig.taxRatePercent}%):</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                        {formatCurrency(taxAmount, currentCurrency)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Total Due:</span>
                      <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                        {formatCurrency(grandTotal, currentCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Trust guarantees */}
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-700/60 text-[11px] text-stone-500 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Best Rate Guarantee & Free Cancellation</span>
                    </div>
                    <p className="text-[10px] leading-tight">
                      Cancel up to 48 hours prior to check-in for a 100% full refund.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 ${themeClasses.primary}`}
                >
                  <span>Continue to Secure Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Step 2: Payment Gateway */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                    Secure Payment Gateway
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Encrypted with 256-bit SSL. Rates processed in {currentCurrency}.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-stone-400">Total to Authorize</div>
                  <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                    {formatCurrency(grandTotal, currentCurrency)}
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-stone-900 dark:text-stone-100 font-medium shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-amber-700 dark:text-amber-400" />
                  <div>Credit / Debit Card</div>
                  <div className="text-[10px] text-stone-400">Visa, MC, UPI/Amex</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    paymentMethod === 'esewa'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-stone-900 dark:text-stone-100 font-medium shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1 text-emerald-600" />
                  <div>eSewa / Khalti QR</div>
                  <div className="text-[10px] text-stone-400">Nepal Mobile Wallet</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('onsite')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    paymentMethod === 'onsite'
                      ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/30 text-stone-900 dark:text-stone-100 font-medium shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Lock className="w-4 h-4 mb-1 text-sky-600" />
                  <div>Pay at Check-In</div>
                  <div className="text-[10px] text-stone-400">Card Hold Guarantee</div>
                </button>
              </div>

              {/* Card Details Inputs */}
              {paymentMethod === 'card' && (
                <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Card Details
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>256-BIT ENCRYPTION</span>
                      <Lock className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-mono font-medium text-stone-900 dark:text-stone-100"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-mono font-medium text-stone-900 dark:text-stone-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                        Security Code (CVV)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs font-mono font-medium text-stone-900 dark:text-stone-100"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'esewa' && (
                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>eSewa / Khalti Mobile Wallet Integration</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    Upon clicking Confirm, an instant digital QR code and wallet authorization prompt will verify payment against {formatCurrency(grandTotal, currentCurrency)}.
                  </p>
                </div>
              )}

              {paymentMethod === 'onsite' && (
                <div className="p-5 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-800 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Guaranteed Reservation with Pay-at-Hotel</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    Your room is securely locked in. Settle the balance in Nepali Rupees (NPR), Indian Rupees (INR), US Dollars (USD), or credit card when checking into Kamal Hotel reception in Kamalpokhari.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`py-3 px-6 rounded-lg font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
                    isProcessing ? 'opacity-70 cursor-wait' : themeClasses.primary
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Confirm ({formatCurrency(grandTotal, currentCurrency)})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation & Automated Voucher */}
        {step === 3 && (
          <div className="p-6 sm:p-10 space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                Payment Authorized & Reservation Guaranteed
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Namaste! Your Stay at Kamal Hotel Kathmandu is Confirmed
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                We have registered your booking in our reservation matrix. Automated SMS and Email vouchers have been dispatched.
              </p>
            </div>

            {/* Notification Dispatch Simulation Badges */}
            <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <Mail className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="font-semibold">Email Dispatched</div>
                  <div className="text-[10px] text-stone-500 truncate">{guestEmail}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <Phone className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="font-semibold">SMS Delivered</div>
                  <div className="text-[10px] text-stone-500 truncate">{guestPhone}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="font-semibold">WhatsApp Ready</div>
                  <div className="text-[10px] text-stone-500">Concierge Connected</div>
                </div>
              </div>
            </div>

            {/* Printable Voucher Card */}
            <div className="max-w-xl mx-auto bg-stone-50 dark:bg-stone-800/70 p-6 rounded-xl border border-stone-200 dark:border-stone-700 space-y-4 print:border-none print:shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
                <div>
                  <div className="text-[11px] font-mono text-stone-400">OFFICIAL BOOKING REFERENCE</div>
                  <div className="text-xl font-mono font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                    {confirmedBookingCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono text-stone-400">STATUS</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    GUARANTEED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-stone-400">Primary Guest</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{guestName}</div>
                </div>
                <div>
                  <div className="text-stone-400">Accommodation</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{room.name}</div>
                </div>
                <div>
                  <div className="text-stone-400">Check-In Date</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {checkIn} ({themeConfig.checkInTime})
                  </div>
                </div>
                <div>
                  <div className="text-stone-400">Check-Out Date</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {checkOut} ({themeConfig.checkOutTime})
                  </div>
                </div>
                <div>
                  <div className="text-stone-400">Total Settled ({currentCurrency})</div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                    {formatCurrency(grandTotal, currentCurrency)}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400">Payment Gateway Ref</div>
                  <div className="font-mono text-stone-700 dark:text-stone-300 mt-0.5">
                    {paymentMethod.toUpperCase()} · AUTH# {Math.floor(100000 + Math.random() * 900000)}
                  </div>
                </div>
              </div>

              {specialRequests && (
                <div className="pt-2 text-xs border-t border-stone-200 dark:border-stone-700">
                  <span className="text-stone-400">Special Notes: </span>
                  <span className="text-stone-700 dark:text-stone-300 italic">{specialRequests}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Kamal Hotel · {themeConfig.address}</span>
                <span className="font-mono">{themeConfig.contactPhone}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="max-w-xl mx-auto flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintVoucher}
                className="px-4 py-2.5 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Voucher</span>
              </button>
              <button
                onClick={closeBookingModal}
                className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded shadow transition-all ${themeClasses.primary}`}
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
