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
  Star,
  MapPin,
  ExternalLink,
  Utensils,
  LogIn,
  LogOut,
  Key
} from 'lucide-react';

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

    // If not authenticated yet, prompt for login credentials
    if (!isStaffLoggedIn) {
      openLoginModal(newRole);
      return;
    }

    setActiveRole(newRole);
    setCurrentView('dashboard');
    showToast('Role Switched', `Now acting as ${newRole.replace('_', ' ').toUpperCase()}`, 'info');
  };

  return (
    <>
      {/* Top Announcement Bar if enabled */}
      {themeConfig.enableAnnouncement && themeConfig.announcementText && (
        <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2 border-b border-stone-800">
          <span className="text-amber-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Kamalpokhari, Kathmandu
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="truncate">{themeConfig.announcementText}</span>
          <span className="hidden md:inline font-mono text-stone-400">| Direct: {themeConfig.contactPhone}</span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 lg:gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('guest')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
                {themeConfig.hotelName.toUpperCase()}
              </span>
            </button>
          </div>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
            {currentView === 'guest' ? (
              <>
                <a href="#rooms" className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
                  Rooms & Suites
                </a>
                <a href="#dining" className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5">
                  <span>Rooftop Dining</span>
                  {themeConfig.rooftopDiningStatus === 'opening_soon' && (
                    <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                      Opening Soon
                    </span>
                  )}
                </a>
                <a href="#amenities" className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
                  Amenities
                </a>
                <a href="#heritage" className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
                  Our Story
                </a>
                <a href="#location" className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
                  Kamalpokhari Map
                </a>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase">
                  Staff Operations Portal
                </span>
                <span>/</span>
                <span>Role: {activeRole.replace('_', ' ').toUpperCase()}</span>
                {themeConfig.supabaseConnected && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
                    Supabase Connected
                  </span>
                )}
              </div>
            )}
          </nav>

          {/* Zone 3: 1 primary action + Currency + Role switcher + Dark mode */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Multi-Currency Switcher (NPR, USD, INR) */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 text-xs font-semibold">
              {(['NPR', 'USD', 'INR'] as CurrencyCode[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrentCurrency(curr);
                    showToast('Currency Switched', `Rates now displayed in ${curr === 'NPR' ? 'Nepali Rupees (रू)' : curr === 'INR' ? 'Indian Rupees (₹)' : 'US Dollars ($)'}`, 'info');
                  }}
                  className={`px-2 py-1 rounded transition-all ${
                    currentCurrency === curr
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                  title={`Switch to ${curr}`}
                >
                  {curr === 'NPR' ? 'रू NPR' : curr === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>

            {/* Google Review direct button */}
            {themeConfig.googleReviewUrl && (
              <a
                href={themeConfig.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-800 hover:border-amber-500 text-stone-700 dark:text-stone-200 transition-colors"
                title="Write a Google Review"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>4.9 on Google</span>
              </a>
            )}

            {/* View Switcher button between Guest, In-Room Portal & Dashboard */}
            <button
              onClick={() => setCurrentView(currentView === 'in_room_guest' ? 'guest' : 'in_room_guest')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'in_room_guest'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                  : 'border-amber-600/40 text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100'
              }`}
              title="Guest Login with Room Number + Dynamic PIN"
            >
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>In-Room Portal</span>
            </button>

            {activeRole !== 'guest' && (
              <button
                onClick={() => setCurrentView(currentView === 'guest' ? 'dashboard' : 'guest')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0"
              >
                {currentView === 'guest' ? 'PMS Dashboard' : 'Public Website'}
              </button>
            )}

            {/* Role & Authentication Status */}
            {isStaffLoggedIn && activeUser ? (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 transition-colors whitespace-nowrap shrink-0"
                    aria-label="Staff Profile"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span className="capitalize hidden md:inline font-semibold">{activeUser.name.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded hidden xl:inline">
                      {activeRole.replace('_', ' ')}
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

                      <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        Switch Persona
                      </div>

                      {roles.map((item) => (
                        <button
                          key={item.role}
                          onClick={() => handleRoleSelect(item.role)}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${
                            activeRole === item.role ? 'bg-amber-50 dark:bg-stone-800/80 font-medium' : ''
                          }`}
                        >
                          <div className="mt-0.5">{item.icon}</div>
                          <div>
                            <div className="text-xs text-stone-900 dark:text-stone-100">{item.label}</div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">{item.desc}</div>
                          </div>
                        </button>
                      ))}

                      <div className="pt-1.5 mt-1 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            logoutStaff();
                          }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out ({activeUser.username})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logoutStaff}
                  className="hidden lg:flex items-center gap-1 p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                  title="Sign Out of Operations"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal('super_admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-400 text-stone-700 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
                title="Super Admin & Staff Sign In"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Sign In</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            {currentView === 'guest' ? (
              <button
                onClick={() => openBookingModal()}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded shadow-sm transition-all whitespace-nowrap shrink-0 ${themeClasses.primary}`}
              >
                Reserve Room
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('guest')}
                className="px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-all whitespace-nowrap shrink-0"
              >
                Guest View
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="text-xs font-medium text-stone-500">Select Currency:</span>
              <div className="flex gap-1">
                {(['NPR', 'USD', 'INR'] as CurrencyCode[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrentCurrency(curr)}
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      currentCurrency === curr
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
              <a
                href="#rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-700"
              >
                Rooms & Suites
              </a>
              <a
                href="#dining"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-700 flex items-center justify-between"
              >
                <span>Rooftop Dining</span>
                {themeConfig.rooftopDiningStatus === 'opening_soon' && (
                  <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    Opening Soon
                  </span>
                )}
              </a>
              <a
                href="#amenities"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-700"
              >
                Amenities
              </a>
              <a
                href="#heritage"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-700"
              >
                Our Story
              </a>
              <a
                href="#location"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-700"
              >
                Kamalpokhari Map & Directions
              </a>
            </nav>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className={`w-full py-2.5 text-center text-xs font-semibold tracking-wide uppercase rounded ${themeClasses.primary}`}
              >
                Book Your Stay
              </button>
              {activeRole !== 'guest' && (
                <button
                  onClick={() => {
                    setCurrentView(currentView === 'guest' ? 'dashboard' : 'guest');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-medium rounded border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  {currentView === 'guest' ? 'Operations Dashboard' : 'Guest Website'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
