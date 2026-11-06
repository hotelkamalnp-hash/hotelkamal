import React from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Compass, 
  BedDouble, 
  Utensils, 
  Key, 
  CalendarCheck,
  LayoutDashboard
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'guest' | 'dashboard' | 'in_room_guest';
  setCurrentView: (view: 'guest' | 'dashboard' | 'in_room_guest') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  currentView, 
  setCurrentView 
}) => {
  const { openBookingModal, isStaffLoggedIn, activeRole } = useHotel();

  const handleNav = (target: 'guest' | 'dashboard' | 'in_room_guest', hash?: string) => {
    setCurrentView(target);
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-1 py-1 pb-safe"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        
        {/* 1. Explore / Home */}
        <button
          onClick={() => handleNav('guest')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'guest'
              ? 'text-amber-700 dark:text-amber-400 font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* 2. Rooms */}
        <button
          onClick={() => handleNav('guest', '#rooms')}
          className="min-h-[48px] flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
        >
          <BedDouble className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Rooms</span>
        </button>

        {/* 3. Dining */}
        <button
          onClick={() => handleNav('guest', '#dining')}
          className="min-h-[48px] flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Dining</span>
        </button>

        {/* 4. In-Room Portal */}
        <button
          onClick={() => handleNav('in_room_guest')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'in_room_guest'
              ? 'text-amber-700 dark:text-amber-400 font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Key className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">In-Room</span>
        </button>

        {/* 5. Primary Book Action (or PMS Dashboard if logged in as staff) */}
        {isStaffLoggedIn && activeRole !== 'guest' ? (
          <button
            onClick={() => handleNav('dashboard')}
            className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-colors ${
              currentView === 'dashboard'
                ? 'text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">PMS</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="min-h-[48px] flex flex-col items-center justify-center py-1 text-amber-700 dark:text-amber-400 hover:text-amber-800 font-bold"
          >
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Reserve</span>
          </button>
        )}

      </div>
    </nav>
  );
};
