import React, { useState } from 'react';
import { HotelProvider } from './context/HotelContext';
import { Header } from './components/Header';
import { GuestLanding } from './components/GuestLanding';
import { StaffDashboard } from './components/Dashboard/StaffDashboard';
import { BookingCheckoutModal } from './components/BookingCheckoutModal';
import { StaffLoginModal } from './components/StaffLoginModal';
import { CSRWidget } from './components/CSRWidget';
import { ToastContainer } from './components/ToastContainer';

import { InRoomGuestPortal } from './components/GuestPortal/InRoomGuestPortal';

function HotelAppContent() {
  const [currentView, setCurrentView] = useState<'guest' | 'dashboard' | 'in_room_guest'>('guest');

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors">
      {/* 3-Zone Top Navigation Header */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'guest' ? (
          <GuestLanding 
            onOpenDashboard={() => setCurrentView('dashboard')} 
            onOpenInRoomPortal={() => setCurrentView('in_room_guest')}
          />
        ) : currentView === 'in_room_guest' ? (
          <InRoomGuestPortal />
        ) : (
          <StaffDashboard />
        )}
      </main>

      {/* Real-time Secure Booking & Checkout Modal */}
      <BookingCheckoutModal />

      {/* Staff Role & Super Admin Login Modal */}
      <StaffLoginModal />

      {/* Real-Time CSR Concierge & WhatsApp Assistant */}
      <CSRWidget />

      {/* Real-Time Notification Toasts (Booking alerts, SMS, Email, CMS saves) */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <HotelProvider>
      <HotelAppContent />
    </HotelProvider>
  );
}
