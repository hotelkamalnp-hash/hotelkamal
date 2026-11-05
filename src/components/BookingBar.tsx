import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { getThemeClasses, calculateStayDuration } from '../utils/theme';
import { Calendar, Users, BedDouble, Search } from 'lucide-react';

interface BookingBarProps {
  onSearch: (filters: { checkIn: string; checkOut: string; guests: number; roomType: string }) => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({ onSearch }) => {
  const { themeConfig, openBookingModal } = useHotel();
  const themeClasses = getThemeClasses(themeConfig.palette);

  // Default dates: tomorrow and 3 days later
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const checkoutDefault = new Date(today);
  checkoutDefault.setDate(today.getDate() + 4);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(formatDate(checkoutDefault));
  const [guests, setGuests] = useState<number>(2);
  const [roomType, setRoomType] = useState<string>('all');

  const nights = calculateStayDuration(checkIn, checkOut);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, guests, roomType });
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-12 relative z-20 px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 transition-colors"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Check-In */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              min={formatDate(today)}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
              required
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              Check-Out Date
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">({nights} {nights === 1 ? 'night' : 'nights'})</span>
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
              required
            />
          </div>

          {/* Guests */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              Guests Capacity
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
            >
              <option value={1}>1 Solo Explorer</option>
              <option value={2}>2 Adults (Couple / Twin)</option>
              <option value={3}>3 Guests (Triple / Suite)</option>
              <option value={4}>4+ Family / Group</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-md font-semibold text-xs sm:text-sm tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2 ${themeClasses.primary}`}
            >
              <Search className="w-4 h-4" />
              <span>Check Real-Time Rates</span>
            </button>
          </div>
        </div>

        {/* Real-time trust notes */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span>Direct Booking Perks:</span>
            <span className="text-amber-700 dark:text-amber-400 font-medium">Free Himalayan Rooftop Breakfast</span>
            <span>·</span>
            <span>Zero Booking Fees</span>
            <span>·</span>
            <span>Instant Email & SMS Voucher</span>
          </div>
          <div className="font-mono text-stone-400">
            Check-in from {themeConfig.checkInTime}
          </div>
        </div>
      </form>
    </div>
  );
};
