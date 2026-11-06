import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { getThemeClasses } from '../utils/theme';
import { StaffRole, CurrencyCode } from '../types/hotel';
import { 
  Sun, 
  Moon, 
  UserCheck, 
  ChevronDown, 
  Building2, 
  Menu, 
  X,
  ShieldCheck,
  Briefcase,
  Users,
  MapPin,
  Utensils,
  LogIn,
  LogOut,
  Key
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentView: 'guest' | 'dashboard' | 'in_room_guest';
  setCurrentView: (view: 'guest' | 'dashboard' | 'in_room_guest') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { 
    themeConfig, 
    activeRole, 
    activeUser,
    setActiveRole, 
    darkMode, 
    setDarkMode, 
    currentCurrency,
    setCurrentCurrency,
    openBookingModal,
    isStaffLoggedIn,
    openLoginModal,
    logoutStaff,
    showToast
  } = useHotel();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeClasses = getThemeClasses(themeConfig.palette);

  const roles: { role: StaffRole | 'guest'; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      role: 'guest', 
      label: 'Guest View', 
      icon: <Users className="w-4 h-4 text-stone-500" />,
      desc: 'Public website & real-time booking'
    },
    { 
      role: 'super_admin', 
      label: 'Super Admin', 
      icon: <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      desc: 'Full CMS, staff RBAC, Supabase sync & audit'
    },
    { 
      role: 'hotel_manager', 
      label: 'Hotel Manager', 
      icon: <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      desc: 'Operations, rates & live bookings'
    },
    { 
      role: 'receptionist', 
      label: 'Receptionist / Front Desk', 
      icon: <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      desc: 'Express check-in/out & availability'
    },
    { 
      role: 'chef', 
      label: 'Head Chef', 
      icon: <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      desc: 'Rooftop kitchen & dining menu'
    },
    { 
      role: 'waiter', 
      label: 'Service Staff / Waiter', 
      icon: <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      desc: 'Dining tables & room service orders'
    },
    { 
      role: 'housekeeping', 
      label: 'Housekeeping', 
      icon: <Building2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />,
      desc: 'Room cleaning & inspection matrix'
    },
  ];

  const handleRoleSelect = (newRole: StaffRole | 'guest') => {
    setRoleDropdownOpen(false);
    if (newRole === 'guest') {
      setActiveRole('guest');
      setCurrentView('guest');
      return;
    }

    if (!isStaffLoggedIn) {
      openLoginModal(newRole);
      return;
    }

    setActiveRole(newRole);
    setCurrentView('dashboard');
    showToast('Role Switched', `Now acting as ${newRole.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const currencyOptions: { code: CurrencyCode; label: string; desc: string }[] = [
    { code: 'USD', label: '$ USD', desc: 'US Dollar' },
    { code: 'NPR', label: 'रू NPR', desc: 'Nepali Rupee' },
    { code: 'INR', label: '₹ INR', desc: 'Indian Rupee' }
  ];

  const currentCurrencyLabel = currencyOptions.find(c => c.code === currentCurrency)?.label || '$ USD';

  return (
    <>
      {/* Top Announcement Bar */}
      {themeConfig.enableAnnouncement && themeConfig.announcementText && (
        <div className="w-full bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-amber-400 font-medium flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3" />
              <span>Kamalpokhari, Kathmandu</span>
            </span>
            <span className="truncate px-2 font-normal text-stone-300 text-center">
              {themeConfig.announcementText}
            </span>
            <span className="hidden md:inline font-mono text-stone-400 shrink-0">
              Direct: {themeConfig.contactPhone}
            </span>
          </div>
        </div>
      )}

      {/* Practical, Perfectly Fitted 3-Zone Header */}
      <header className="sticky top-0 z-40 w-full bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Zone 1: Distinct Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentView('guest')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                {themeConfig.hotelName.toUpperCase()}
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-stone-400 font-sans -mt-1">
                Kathmandu Boutique
              </span>
            </button>
          </div>

          {/* Zone 2: Clean, Concise Nav Links (4 anchors, no bloated pills) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            {currentView === 'guest' ? (
              <>
                <a href="#rooms" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Rooms
                </a>
                <a href="#dining" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Rooftop Dining</span>
                </a>
                <a href="#amenities" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Amenities
                </a>
                <a href="#location" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Location
                </a>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase">
                  Staff Operations Portal
                </span>
                <span>/</span>
                <span className="capitalize">{activeRole.replace('_', ' ')}</span>
              </div>
            )}
          </nav>

          {/* Zone 3: Practical, Scaled Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* 1. Compact Currency Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
                title="Select Display Currency"
              >
                <span>{currentCurrencyLabel}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currencyDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-stone-900 rounded-lg shadow-xl border border-stone-200 dark:border-stone-800 py-1 z-50 animate-in fade-in"
                  onClick={() => setCurrencyDropdownOpen(false)}
                >
                  {currencyOptions.map(({ code, label, desc }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCurrentCurrency(code);
                        setCurrencyDropdownOpen(false);
                        showToast('Currency Switched', `Rates now displayed in ${label}`, 'info');
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors ${
                        currentCurrency === code 
                          ? 'font-bold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20' 
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. In-Room Keycard Button */}
            <button
              type="button"
              onClick={() => setCurrentView(currentView === 'in_room_guest' ? 'guest' : 'in_room_guest')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                currentView === 'in_room_guest'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 hover:border-amber-600/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
              }`}
              title="Guest In-Room Keycard & Ordering Portal"
            >
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">In-Room</span>
            </button>

            {/* 3. Staff Role Switcher or Staff Login */}
            {isStaffLoggedIn && activeUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-amber-600/30 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors"
                  aria-label="Staff Profile"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="capitalize font-semibold hidden sm:inline max-w-[80px] truncate">
                    {activeUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded">
                    {activeRole === 'super_admin' ? 'Admin' : activeRole === 'hotel_manager' ? 'Mgr' : activeRole.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-lg shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 text-left">
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100">{activeUser.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{activeUser.email}</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-mono font-bold mt-0.5">
                        Role: {activeRole.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="p-2 border-b border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView(currentView === 'guest' ? 'dashboard' : 'guest');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full py-1.5 px-2 rounded text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                      >
                        {currentView === 'guest' ? 'Open Staff PMS Dashboard' : 'View Public Website'}
                      </button>
                    </div>

                    <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      Switch Role
                    </div>

                    {roles.map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleSelect(item.role)}
                        className={`w-full px-3 py-1.5 text-left flex items-start gap-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${
                          activeRole === item.role ? 'bg-amber-50 dark:bg-stone-800/80 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5">{item.icon}</div>
                        <div>
                          <div className="text-xs text-stone-900 dark:text-stone-100">{item.label}</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">{item.desc}</div>
                        </div>
                      </button>
                    ))}

                    <div className="pt-1.5 mt-1 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logoutStaff();
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out ({activeUser.username})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal('super_admin')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 hover:border-amber-600 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                title="Super Admin & Staff Sign In"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Staff</span>
              </button>
            )}

            {/* 4. Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle theme"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 5. Primary Action Button */}
            {currentView === 'guest' ? (
              <button
                type="button"
                onClick={() => openBookingModal()}
                className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-lg shadow-sm transition-all whitespace-nowrap ${themeClasses.primary}`}
              >
                Reserve
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('guest')}
                className="px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-lg bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-all shadow-sm whitespace-nowrap"
              >
                Guest View
              </button>
            )}

            {/* 6. Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
              <a
                href="#rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-amber-700"
              >
                Rooms & Suites
              </a>
              <a
                href="#dining"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-amber-700 flex items-center justify-between"
              >
                <span>Rooftop Dining</span>
                <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                  Himalayan View
                </span>
              </a>
              <a
                href="#amenities"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-amber-700"
              >
                Amenities & Services
              </a>
              <a
                href="#location"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-amber-700"
              >
                Kamalpokhari Map & Directions
              </a>
            </nav>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2">
              <PWAInstallButton
                className="w-full py-2.5 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow"
                variant="full"
              />
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className={`w-full py-2.5 text-center text-xs font-semibold tracking-wide uppercase rounded-lg ${themeClasses.primary}`}
              >
                Book Your Stay
              </button>
              {isStaffLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView(currentView === 'guest' ? 'dashboard' : 'guest');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  {currentView === 'guest' ? 'Open Staff Operations PMS' : 'Return to Guest Website'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
