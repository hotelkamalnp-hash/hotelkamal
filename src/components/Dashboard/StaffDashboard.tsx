import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { 
  StaffRole, 
  Booking, 
  Room, 
  AmenityItem, 
  StaffUser, 
  ThemePalette,
  CurrencyCode,
  GuestReview,
  FaqItem
} from '../../types/hotel';
import { getThemeClasses, formatCurrency, convertPrice } from '../../utils/theme';
import { SUPABASE_SQL_SCHEMA } from '../../services/supabase';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  Sliders, 
  Users, 
  ShieldCheck, 
  Bell, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  XCircle,
  Database,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Star,
  Utensils,
  Share2,
  Navigation,
  Smartphone,
  Mail,
  MessageSquare,
  Coins,
  Receipt,
  Boxes,
  Key,
  BarChart3,
  Ticket,
  Image as ImageIcon
} from 'lucide-react';
import { RestaurantBillingManager } from '../Restaurant/RestaurantBillingManager';
import { InventoryStockManager } from '../Inventory/InventoryStockManager';
import { MasterBillingManager } from '../Billing/MasterBillingManager';
import { AccountingFinancialReports } from '../Accounting/AccountingFinancialReports';
import { GuestPasscodeSessionManager } from '../GuestPortal/GuestPasscodeSessionManager';
import { CouponManager } from '../Coupons/CouponManager';
import { StaffGuestIntercom } from '../Intercom/StaffGuestIntercom';
import { MediaGalleryManager } from '../CMS/MediaGalleryManager';

export const StaffDashboard: React.FC = () => {
  const { 
    bookings, 
    rooms, 
    amenities, 
    staff, 
    auditLogs, 
    notifications,
    reviews,
    faqs,
    themeConfig, 
    activeRole,
    activeUser,
    currentCurrency,
    updateBookingStatus,
    updateThemeConfig,
    addRoom,
    updateRoom,
    deleteRoom,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    addReview,
    updateReview,
    deleteReview,
    addFaq,
    updateFaq,
    deleteFaq,
    addStaff,
    deleteStaff,
    changeUserPassword,
    connectSupabase,
    syncWithSupabase,
    showToast
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Tabs
  type DashboardTab = 
    | 'overview' 
    | 'restaurant' 
    | 'billing' 
    | 'inventory' 
    | 'passcodes' 
    | 'coupons'
    | 'intercom'
    | 'media'
    | 'accounting' 
    | 'bookings' 
    | 'rooms' 
    | 'cms' 
    | 'supabase' 
    | 'staff' 
    | 'notifications' 
    | 'audit';

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Strict Role Auto-Routing: immediately opens the respective authorized operational view
  React.useEffect(() => {
    if (activeRole === 'chef' || activeRole === 'waiter') {
      setActiveTab('restaurant');
    } else if (activeRole === 'receptionist') {
      setActiveTab('passcodes');
    } else if (activeRole === 'housekeeping') {
      setActiveTab('rooms');
    } else if (activeRole === 'super_admin' || activeRole === 'hotel_manager') {
      // Retain current or default to overview
    }
  }, [activeRole]);

  // Search & Filters
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  // Modals for CRUD
  const [isAddRoomOpen, setIsAddRoomOpen] = useState<boolean>(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState<boolean>(false);
  const [isAddFaqOpen, setIsAddFaqOpen] = useState<boolean>(false);

  // Editing items
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Supabase connection form state
  const [inputSupabaseUrl, setInputSupabaseUrl] = useState<string>(themeConfig.supabaseUrl || '');
  const [inputSupabaseKey, setInputSupabaseKey] = useState<string>(themeConfig.supabaseAnonKey || '');
  const [isConnectingSupabase, setIsConnectingSupabase] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Analytics Calculations
  const totalRoomsCount = rooms.reduce((acc, r) => acc + r.totalUnits, 0);
  const totalAvailableRooms = rooms.reduce((acc, r) => acc + r.availableUnits, 0);
  const occupiedRooms = totalRoomsCount - totalAvailableRooms;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedRooms / totalRoomsCount) * 100) : 0;
  
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const todayCheckIns = bookings.filter((b) => b.bookingStatus === 'confirmed').length;

  const hasPermission = (perm: string): boolean => {
    if (activeRole === 'super_admin') return true;
    if (!activeUser) return false;
    return activeUser.permissions.includes('all_access') || activeUser.permissions.includes(perm);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.roomName.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === 'all' || b.bookingStatus === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    return auditCategoryFilter === 'all' || log.category === auditCategoryFilter;
  });

  // Handle Room Form Submit
  const handleSaveRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roomData = {
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      type: formData.get('type') as any,
      pricePerNightUSD: Number(formData.get('pricePerNightUSD')),
      originalPriceUSD: Number(formData.get('originalPriceUSD')) || undefined,
      maxGuests: Number(formData.get('maxGuests')),
      bedType: formData.get('bedType') as string,
      sizeSqFt: Number(formData.get('sizeSqFt')),
      view: formData.get('view') as string,
      floor: formData.get('floor') as string,
      totalUnits: Number(formData.get('totalUnits')),
      availableUnits: Number(formData.get('availableUnits')),
      rating: 4.9,
      reviewsCount: 12,
      description: formData.get('description') as string,
      images: [
        (formData.get('image') as string) || './assets/images/room_deluxe_suite_1793848735141.jpg',
      ],
      amenities: (formData.get('amenities') as string).split(',').map((s) => s.trim()),
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
    } else {
      addRoom(roomData);
      setIsAddRoomOpen(false);
    }
  };

  // Change Password state
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState<StaffUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Handle Staff Form Submit
  const handleSaveStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as StaffRole;
    
    let permissions: string[] = ['view_availability'];
    if (role === 'super_admin') {
      permissions = ['all_access', 'manage_staff', 'edit_cms', 'modify_rates', 'manage_bookings', 'manage_rooms', 'view_finances', 'view_audit_logs', 'supabase_sync'];
    } else if (role === 'hotel_manager') {
      permissions = ['manage_bookings', 'manage_rooms', 'modify_rates', 'process_checkin', 'view_finances', 'view_audit_logs'];
    } else if (role === 'receptionist') {
      permissions = ['process_checkin', 'manage_bookings', 'view_availability'];
    } else if (role === 'chef') {
      permissions = ['view_dining_orders', 'manage_menu_specials', 'view_breakfast_counts'];
    } else if (role === 'waiter') {
      permissions = ['view_dining_orders', 'room_service_dispatch', 'view_guest_preferences'];
    } else if (role === 'housekeeping') {
      permissions = ['manage_rooms_cleanliness', 'view_availability'];
    }

    addStaff({
      name: formData.get('name') as string,
      username: (formData.get('username') as string).trim().toLowerCase(),
      password: (formData.get('password') as string) || 'KamalHotel@2026',
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role,
      permissions,
      status: 'active',
      department: formData.get('department') as string,
      lastActive: 'Just registered',
    });
    setIsAddStaffOpen(false);
  };

  // Handle Connect Supabase
  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingSupabase(true);
    await connectSupabase(inputSupabaseUrl.trim(), inputSupabaseKey.trim());
    setIsConnectingSupabase(false);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    showToast('Schema Copied!', 'SQL migration copied to clipboard. Ready to paste in Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dashboard Title & Active Persona Banner */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Kamal Hotel PMS · Kamalpokhari, Kathmandu
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                themeConfig.supabaseConnected 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {themeConfig.supabaseConnected ? 'Supabase Sync Active' : 'Local Storage Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
              Operations, CMS & Database Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {activeUser ? activeUser.name : 'Authorized Staff'}
              </div>
              <div className="text-[11px] text-stone-500 font-mono uppercase">
                Role: {activeRole.replace('_', ' ')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center font-serif text-lg">
              {activeRole === 'super_admin' ? 'SA' : activeRole === 'hotel_manager' ? 'HM' : 'FD'}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs strictly filtered by RBAC */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
          {[
            { 
              id: 'overview', 
              label: 'Overview & KPIs', 
              icon: <LayoutDashboard className="w-4 h-4" />, 
              perm: true 
            },
            { 
              id: 'passcodes', 
              label: 'Guest Passcodes & QR Keycards', 
              icon: <Key className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist'
            },
            { 
              id: 'bookings', 
              label: `Reservations (${bookings.length})`, 
              icon: <CalendarDays className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist'
            },
            { 
              id: 'restaurant', 
              label: 'Rooftop Dining & POS', 
              icon: <Utensils className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'chef' || activeRole === 'waiter'
            },
            { 
              id: 'coupons', 
              label: 'Coupons & Vouchers', 
              icon: <Ticket className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist'
            },
            { 
              id: 'intercom', 
              label: 'Guest Intercom & Chat', 
              icon: <MessageSquare className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist' || activeRole === 'waiter'
            },
            { 
              id: 'billing', 
              label: 'Billing & Folios (5 Templates)', 
              icon: <Receipt className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist'
            },
            { 
              id: 'inventory', 
              label: 'Stock & Inventory', 
              icon: <Boxes className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'chef' || activeRole === 'housekeeping'
            },
            { 
              id: 'media', 
              label: 'Hero & Photos CMS', 
              icon: <ImageIcon className="w-4 h-4" />, 
              perm: activeRole === 'super_admin'
            },
            { 
              id: 'accounting', 
              label: 'Accounting & P&L', 
              icon: <BarChart3 className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager'
            },
            { 
              id: 'rooms', 
              label: `Room Inventory (${rooms.length})`, 
              icon: <BedDouble className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager' || activeRole === 'receptionist' || activeRole === 'housekeeping'
            },
            { 
              id: 'cms', 
              label: 'CMS Page & Rates Editor', 
              icon: <Sliders className="w-4 h-4" />, 
              perm: activeRole === 'super_admin'
            },
            { 
              id: 'supabase', 
              label: 'Supabase Backend & DB', 
              icon: <Database className="w-4 h-4" />, 
              perm: activeRole === 'super_admin'
            },
            { 
              id: 'staff', 
              label: `Staff & RBAC (${staff.length})`, 
              icon: <Users className="w-4 h-4" />, 
              perm: activeRole === 'super_admin'
            },
            { 
              id: 'notifications', 
              label: `Alerts (${notifications.length})`, 
              icon: <Bell className="w-4 h-4" />, 
              perm: true 
            },
            { 
              id: 'audit', 
              label: `Audit Logs (${auditLogs.length})`, 
              icon: <ShieldCheck className="w-4 h-4" />, 
              perm: activeRole === 'super_admin' || activeRole === 'hotel_manager'
            },
          ]
            .filter((tab) => tab.perm)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Occupancy Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                    {occupancyRate}%
                  </span>
                  <span className="text-xs text-stone-400">
                    ({occupiedRooms} of {totalRoomsCount} rooms in Kamalpokhari)
                  </span>
                </div>
                <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Total Confirmed Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                  {formatCurrency(totalRevenue, currentCurrency)}
                </div>
                <div className="mt-2 text-[11px] text-stone-400">
                  Across {bookings.length} reservations (NPR, USD & INR supported)
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Pending Arrivals / Check-Ins</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                  {todayCheckIns}
                </div>
                <div className="mt-2 text-[11px] text-stone-400">
                  Front Desk ready in Kamalpokhari
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Rooftop Dining Status</span>
                  <Utensils className="w-4 h-4 text-sky-500" />
                </div>
                <div className="mt-2 text-xl font-serif font-bold text-stone-900 dark:text-stone-50 uppercase">
                  {themeConfig.rooftopDiningStatus.replace('_', ' ')}
                </div>
                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  {themeConfig.rooftopOpeningDateText}
                </div>
              </div>
            </div>

            {/* Room Availability Matrix */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50">
                    Live Room Availability & Status Matrix (Kathmandu)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Real-time status of each room category across floors in Kamalpokhari.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.map((room) => {
                  const priceInCurrent = convertPrice(room.pricePerNightUSD, currentCurrency, themeConfig.exchangeRates);
                  return (
                    <div
                      key={room.id}
                      className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                            {room.name}
                          </div>
                          <div className="text-[11px] text-stone-400">{room.floor}</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                          {formatCurrency(priceInCurrent, currentCurrency)}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Units Status:</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {room.availableUnits} free / {room.totalUnits} total
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{
                              width: `${(room.availableUnits / room.totalUnits) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESTAURANT & ROOFTOP DINING */}
        {activeTab === 'restaurant' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <RestaurantBillingManager />
          </div>
        )}

        {/* TAB: BILLING, TAX, DISCOUNT, SERVICE CHARGE & TEMPLATES */}
        {activeTab === 'billing' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <MasterBillingManager />
          </div>
        )}

        {/* TAB: STOCK & INVENTORY (LOW STOCK / OUT OF STOCK) */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <InventoryStockManager />
          </div>
        )}

        {/* TAB: GUEST ROOM PASSCODES (KEYLESS ACCESS & RESET ON CHECKOUT) */}
        {activeTab === 'passcodes' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <GuestPasscodeSessionManager />
          </div>
        )}

        {/* TAB: COUPONS, VOUCHERS & PROMO CODES */}
        {activeTab === 'coupons' && (
          <CouponManager />
        )}

        {/* TAB: GUEST & STAFF INTERCOM LIVE CHAT */}
        {activeTab === 'intercom' && (
          <StaffGuestIntercom />
        )}

        {/* TAB: HERO, ROOFTOP & ROOM PHOTOS MEDIA CMS */}
        {activeTab === 'media' && (
          <MediaGalleryManager />
        )}

        {/* TAB: ACCOUNTING & P&L (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY) */}
        {activeTab === 'accounting' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <AccountingFinancialReports />
          </div>
        )}

        {/* TAB 2: RESERVATIONS */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  Guest Reservations & Front Desk Desk
                </h3>
                <p className="text-xs text-stone-500">
                  Search, verify guest arrivals in Kamalpokhari, trigger express check-in / check-out.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by name, ref, room..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked-In</option>
                  <option value="checked-out">Checked-Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider text-stone-500 font-mono border-y border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room & Dates</th>
                    <th className="py-3 px-4">Settlement</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-mono font-semibold text-amber-700 dark:text-amber-400">
                        {b.bookingCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{b.guestName}</div>
                        <div className="text-[11px] text-stone-400">{b.guestEmail} · {b.guestPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-stone-800 dark:text-stone-200 font-medium">{b.roomName}</div>
                        <div className="text-[11px] text-stone-400">
                          {b.checkInDate} to {b.checkOutDate} ({b.nights}n)
                        </div>
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                        {formatCurrency(b.totalAmount, b.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {b.paymentStatus} ({b.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.bookingStatus === 'checked-in'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : b.bookingStatus === 'confirmed'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.bookingStatus === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(b.id, 'checked-in')}
                              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors"
                            >
                              Check-In
                            </button>
                          )}
                          {b.bookingStatus === 'checked-in' && (
                            <button
                              onClick={() => updateBookingStatus(b.id, 'checked-out')}
                              className="px-2.5 py-1 text-[11px] font-medium bg-stone-700 text-white hover:bg-stone-800 rounded transition-colors"
                            >
                              Check-Out
                            </button>
                          )}
                          {b.bookingStatus !== 'cancelled' && (
                            <button
                              onClick={() => updateBookingStatus(b.id, 'cancelled')}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & ROOM CRUD */}
        {activeTab === 'rooms' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  Room Inventory & Rate Manager
                </h3>
                <p className="text-xs text-stone-500">
                  Dynamically add new rooms, modify base USD prices, picture URLs, available units, or update specifications.
                </p>
              </div>

              {hasPermission('manage_rooms') && (
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setIsAddRoomOpen(true);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded flex items-center gap-1.5 ${themeClasses.primary}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Room Type</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => {
                const priceInNPR = convertPrice(room.pricePerNightUSD, 'NPR', themeConfig.exchangeRates);
                const priceInINR = convertPrice(room.pricePerNightUSD, 'INR', themeConfig.exchangeRates);

                return (
                  <div
                    key={room.id}
                    className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex gap-4 p-4">
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-24 h-24 rounded-lg object-cover shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold uppercase text-amber-700 dark:text-amber-400">
                            {room.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingRoom(room);
                                setIsAddRoomOpen(true);
                              }}
                              className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                              title="Edit Room"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRoom(room.id)}
                              className="p-1 text-stone-400 hover:text-rose-600"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {room.name}
                        </h4>
                        <div className="text-xs text-stone-500">
                          {room.bedType} · {room.sizeSqFt} sq.ft · {room.view}
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div className="text-xs font-bold text-stone-900 dark:text-stone-100 font-mono">
                            ${room.pricePerNightUSD} USD · रू {priceInNPR.toLocaleString()} NPR · ₹ {priceInINR.toLocaleString()} INR
                          </div>
                          <div className="text-xs font-mono text-stone-500">
                            Units: {room.availableUnits} / {room.totalUnits}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-800/50 px-4 py-2 text-[11px] text-stone-500 flex justify-between border-t border-stone-100 dark:border-stone-800">
                      <span>Floor: {room.floor}</span>
                      <span>Amenities: {room.amenities.length} items</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add / Edit Room Modal */}
            {isAddRoomOpen && (
              <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-stone-900 rounded-xl max-w-xl w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4 my-8">
                  <div className="flex justify-between items-center border-b pb-3 border-stone-200 dark:border-stone-800">
                    <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-50">
                      {editingRoom ? 'Edit Room Specifications' : 'Add New Room Specification'}
                    </h4>
                    <button onClick={() => setIsAddRoomOpen(false)} className="text-stone-400 hover:text-stone-600">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Room Name</label>
                      <input
                        name="name"
                        defaultValue={editingRoom?.name || ''}
                        required
                        className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Category Type</label>
                        <select
                          name="type"
                          defaultValue={editingRoom?.type || 'deluxe'}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        >
                          <option value="deluxe">Deluxe</option>
                          <option value="super-deluxe">Super Deluxe</option>
                          <option value="executive-suite">Executive Suite</option>
                          <option value="standard-cozy">Standard Cozy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Base Price in USD ($)</label>
                        <input
                          type="number"
                          name="pricePerNightUSD"
                          defaultValue={editingRoom?.pricePerNightUSD || 60}
                          required
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Max Guests</label>
                        <input
                          type="number"
                          name="maxGuests"
                          defaultValue={editingRoom?.maxGuests || 2}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Total Units</label>
                        <input
                          type="number"
                          name="totalUnits"
                          defaultValue={editingRoom?.totalUnits || 8}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Available Units</label>
                        <input
                          type="number"
                          name="availableUnits"
                          defaultValue={editingRoom?.availableUnits || 6}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Bed Configuration</label>
                        <input
                          name="bedType"
                          defaultValue={editingRoom?.bedType || '1 King Bed'}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Area (sq.ft)</label>
                        <input
                          type="number"
                          name="sizeSqFt"
                          defaultValue={editingRoom?.sizeSqFt || 320}
                          className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Main Picture URL</label>
                      <input
                        name="image"
                        defaultValue={editingRoom?.images[0] || './assets/images/room_deluxe_suite_1793848735141.jpg'}
                        className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Description</label>
                      <textarea
                        name="description"
                        rows={2}
                        defaultValue={editingRoom?.description || 'Authentic boutique hotel comfort in Kamalpokhari with hand-carved Newari wood accents.'}
                        className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Key Amenities (comma separated)</label>
                      <input
                        name="amenities"
                        defaultValue={editingRoom?.amenities.join(', ') || 'High-Speed Wi-Fi, Hot Shower, City Map, Solar Hot Water'}
                        className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsAddRoomOpen(false)}
                        className="px-4 py-2 rounded border text-stone-600 dark:text-stone-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-5 py-2 rounded font-semibold ${themeClasses.primary}`}
                      >
                        Save Room
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CMS PAGE, LOCATION, DINING & RATES EDITOR */}
        {activeTab === 'cms' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                Super Admin Content Management Engine
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Landing Page Content, Location, Rates & Rooftop Dining
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                All changes made here reflect immediately across the guest portal and booking engine.
              </p>
            </div>

            {/* 1. Multi-Currency & Exchange Rates */}
            <div className="space-y-4 p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Currency Display & Real-Time Exchange Rates</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    Set conversion multipliers for 1 USD to NPR and INR.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold">
                  Default: {themeConfig.defaultCurrency}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">1 USD = Nepali Rupees (NPR)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={themeConfig.exchangeRates.NPR}
                    onChange={(e) =>
                      updateThemeConfig({
                        exchangeRates: { ...themeConfig.exchangeRates, NPR: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">1 USD = Indian Rupees (INR)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={themeConfig.exchangeRates.INR}
                    onChange={(e) =>
                      updateThemeConfig({
                        exchangeRates: { ...themeConfig.exchangeRates, INR: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Seasonal Surge Multiplier (e.g. 1.0, 1.25)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={themeConfig.seasonalSurgeMultiplier}
                    onChange={(e) => updateThemeConfig({ seasonalSurgeMultiplier: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Rooftop Dining Opening Soon Configuration */}
            <div className="space-y-4 p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div>
                <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-700" />
                  <span>Rooftop Dining Status & Teaser Manager</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Configure whether rooftop dining is Opening Soon or Now Open, along with teaser dates and headlines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Rooftop Dining Status</label>
                  <select
                    value={themeConfig.rooftopDiningStatus}
                    onChange={(e) => updateThemeConfig({ rooftopDiningStatus: e.target.value as any })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-semibold"
                  >
                    <option value="opening_soon">Opening Soon (Show Teaser & VIP List)</option>
                    <option value="open">Now Open (Full Service Active)</option>
                    <option value="renovation">Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Opening Date Banner Text</label>
                  <input
                    type="text"
                    value={themeConfig.rooftopOpeningDateText}
                    onChange={(e) => updateThemeConfig({ rooftopOpeningDateText: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Rooftop Teaser Headline</label>
                  <input
                    type="text"
                    value={themeConfig.rooftopTeaserHeadline}
                    onChange={(e) => updateThemeConfig({ rooftopTeaserHeadline: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Rooftop Teaser Story Description</label>
                  <textarea
                    rows={2}
                    value={themeConfig.rooftopTeaserDescription}
                    onChange={(e) => updateThemeConfig({ rooftopTeaserDescription: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2"
                  />
                </div>
              </div>
            </div>

            {/* 3. Location & Google Map Coordinates */}
            <div className="space-y-4 p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Kathmandu, Kamalpokhari Location & GPS Coordinates</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Full Postal Address</label>
                  <input
                    type="text"
                    value={themeConfig.address}
                    onChange={(e) => updateThemeConfig({ address: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Neighborhood</label>
                  <input
                    type="text"
                    value={themeConfig.neighborhood}
                    onChange={(e) => updateThemeConfig({ neighborhood: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Latitude Coordinate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={themeConfig.latitude}
                    onChange={(e) => updateThemeConfig({ latitude: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Longitude Coordinate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={themeConfig.longitude}
                    onChange={(e) => updateThemeConfig({ longitude: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Google Directions / Map URL</label>
                  <input
                    type="text"
                    value={themeConfig.googleMapsUrl}
                    onChange={(e) => updateThemeConfig({ googleMapsUrl: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Social Links & Google Reviews */}
            <div className="space-y-4 p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>Google Review Button & Social Media Links</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Google Review Link / Button URL</label>
                  <input
                    type="text"
                    value={themeConfig.googleReviewUrl}
                    onChange={(e) => updateThemeConfig({ googleReviewUrl: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={themeConfig.facebookUrl}
                    onChange={(e) => updateThemeConfig({ facebookUrl: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={themeConfig.instagramUrl}
                    onChange={(e) => updateThemeConfig({ instagramUrl: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">TikTok URL</label>
                  <input
                    type="text"
                    value={themeConfig.tiktokUrl}
                    onChange={(e) => updateThemeConfig({ tiktokUrl: e.target.value })}
                    className="w-full bg-white dark:bg-stone-900 border rounded p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 5. Theme Palette & Typography */}
            <div className="space-y-4">
              <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Visual Color Palette
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { id: 'royal-maroon', name: 'Royal Maroon & Gold', desc: 'Regal Himalayan heritage with deep burgundy accents' },
                  { id: 'mountain-emerald', name: 'Mountain Emerald & Sand', desc: 'Serene pine forest and lush valley sage' },
                  { id: 'heritage-bronze', name: 'Heritage Bronze & Ochre', desc: 'Warm antique bronze and sunlit terracotta' },
                  { id: 'midnight-navy', name: 'Midnight Navy & Brushed Gold', desc: 'Starlit mountain night with sapphire tone' },
                ].map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => updateThemeConfig({ palette: palette.id as ThemePalette })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      themeConfig.palette === palette.id
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-600'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      {palette.name}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-tight">{palette.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Dynamic Testimonials Manager */}
            <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                    Guest Testimonials & Reviews Manager ({reviews.length})
                  </h4>
                  <p className="text-xs text-stone-500">Edit or add reviews that appear on the landing page.</p>
                </div>
                <button
                  onClick={() => setIsAddReviewOpen(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1 ${themeClasses.primary}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Review</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{rev.author}</span>
                        <button onClick={() => deleteReview(rev.id)} className="text-stone-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-stone-500">{rev.location}</div>
                      <p className="text-stone-600 dark:text-stone-300 italic mt-2">“{rev.quote}”</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200 dark:border-stone-700 text-stone-400">
                      <span>{rev.rating} ★ Rating</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal to Add Review */}
            {isAddReviewOpen && (
              <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-700 text-xs">
                  <h4 className="text-base font-bold font-serif">Add Guest Review</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      addReview({
                        author: fd.get('author') as string,
                        role: fd.get('role') as string,
                        location: fd.get('location') as string,
                        quote: fd.get('quote') as string,
                        rating: Number(fd.get('rating')),
                        isApproved: true,
                      });
                      setIsAddReviewOpen(false);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-semibold mb-1">Guest Name</label>
                      <input name="author" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">City / Country</label>
                      <input name="location" defaultValue="Kathmandu, Nepal" className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Review Quote</label>
                      <textarea name="quote" rows={3} required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Rating (1 to 5)</label>
                      <select name="rating" defaultValue={5} className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2">
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setIsAddReviewOpen(false)} className="px-3 py-1.5 border rounded">
                        Cancel
                      </button>
                      <button type="submit" className={`px-4 py-1.5 rounded font-semibold ${themeClasses.primary}`}>
                        Save Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SUPABASE BACKEND & DATABASE INTEGRATION */}
        {activeTab === 'supabase' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  Cloud Backend & Real-Time Sync
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  Supabase PostgreSQL & Auth Integration
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Connect your Supabase project to enable cloud database storage, real-time sync, and user auth.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                    themeConfig.supabaseConnected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${themeConfig.supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {themeConfig.supabaseConnected ? 'Supabase Connected' : 'Local Fallback Storage'}
                </span>
              </div>
            </div>

            {/* What you need from Supabase Guide */}
            <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-4 text-xs">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>What We Need From Your Supabase Project</span>
              </h4>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                To connect real database persistence and authentication, you only need 2 values from your free Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 underline">supabase.com</a>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">1. Project URL (`SUPABASE_URL`)</div>
                  <div className="text-[11px] text-stone-500 mt-1 font-mono">
                    Found in: Project Settings &rarr; API &rarr; Project URL
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Example: `https://xyzabcdefg.supabase.co`</div>
                </div>

                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">2. Anon Public API Key (`SUPABASE_ANON_KEY`)</div>
                  <div className="text-[11px] text-stone-500 mt-1 font-mono">
                    Found in: Project Settings &rarr; API &rarr; Project API keys (`anon` / `public`)
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`</div>
                </div>
              </div>
            </div>

            {/* Connection Credentials Form */}
            <form onSubmit={handleConnectSupabase} className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 space-y-4 text-xs">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Connect Your Supabase Project
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={inputSupabaseUrl}
                    onChange={(e) => setInputSupabaseUrl(e.target.value)}
                    required
                    className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Supabase Anon Public API Key</label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    value={inputSupabaseKey}
                    onChange={(e) => setInputSupabaseKey(e.target.value)}
                    required
                    className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  Stored securely in client configuration with automatic reconnect.
                </span>

                <div className="flex items-center gap-2">
                  {themeConfig.supabaseConnected && (
                    <button
                      type="button"
                      onClick={() => syncWithSupabase()}
                      className="px-4 py-2 text-xs font-semibold rounded bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                    >
                      Sync All Data to Supabase
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isConnectingSupabase}
                    className={`px-5 py-2 text-xs font-semibold rounded ${themeClasses.primary}`}
                  >
                    {isConnectingSupabase ? 'Verifying...' : 'Test & Connect Supabase'}
                  </button>
                </div>
              </div>
            </form>

            {/* 1-Click Copy PostgreSQL Schema */}
            <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Complete Supabase SQL Migration Schema</span>
                  </h4>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Click copy and paste this into your Supabase Dashboard &rarr; SQL Editor to generate all tables with RLS policies.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto bg-stone-900 text-stone-200 p-4 rounded-lg font-mono text-[11px] leading-relaxed border border-stone-800">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STAFF & RBAC */}
        {activeTab === 'staff' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  Access Management & Security
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  Staff Roster & Role-Based Permissions (RBAC)
                </h3>
                <p className="text-xs text-stone-500">
                  Super admin can assign team members to Super Admin, Hotel Manager, Front Desk Clerk, or Housekeeping.
                </p>
              </div>

              {hasPermission('manage_staff') && (
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className={`px-4 py-2 text-xs font-semibold rounded flex items-center gap-1.5 ${themeClasses.primary}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider text-stone-500 font-mono border-y border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="py-3 px-4">Member & Username</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Granular Permissions</th>
                    <th className="py-3 px-4">Credentials</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{member.name}</div>
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                          Username: <span className="font-bold">@{member.username}</span>
                        </div>
                        <div className="text-[11px] text-stone-400">{member.email} · {member.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            member.role === 'super_admin'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : member.role === 'hotel_manager'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : member.role === 'chef'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : member.role === 'waiter'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : member.role === 'receptionist'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 dark:text-stone-300">{member.department}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.permissions.map((p, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-stone-600 dark:text-stone-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                          <span>••••••••</span>
                          {hasPermission('manage_staff') && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStaffForPassword(member);
                                setNewPasswordInput('');
                              }}
                              className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-sans hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 transition-colors"
                              title="Change Password"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ● {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('manage_staff') && (
                            <button
                              onClick={() => {
                                setSelectedStaffForPassword(member);
                                setNewPasswordInput('');
                              }}
                              className="p-1 text-stone-400 hover:text-amber-600 rounded"
                              title="Update Password"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {member.role !== 'super_admin' && hasPermission('manage_staff') && (
                            <button
                              onClick={() => deleteStaff(member.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Change Password Modal */}
            {selectedStaffForPassword && (
              <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-stone-200 dark:border-stone-800">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                        Update Password for @{selectedStaffForPassword.username}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Member: {selectedStaffForPassword.name} ({selectedStaffForPassword.role.replace('_', ' ')})
                      </p>
                    </div>
                    <button onClick={() => setSelectedStaffForPassword(null)} className="text-stone-400">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newPasswordInput.trim().length < 6) {
                        showToast('Password Error', 'Password must be at least 6 characters.', 'error');
                        return;
                      }
                      changeUserPassword(selectedStaffForPassword.id, newPasswordInput.trim());
                      setSelectedStaffForPassword(null);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold mb-1">New Secure Password</label>
                      <input
                        type="text"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="e.g. KamalChef@2026"
                        required
                        className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 font-mono text-stone-900 dark:text-stone-100"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Minimum 6 characters. The user will use their username (@{selectedStaffForPassword.username}) and this new password.
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffForPassword(null)}
                        className="px-3.5 py-1.5 rounded border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-1.5 rounded font-semibold ${themeClasses.primary}`}
                      >
                        Save New Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Staff Modal */}
            {isAddStaffOpen && (
              <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b pb-3 border-stone-200 dark:border-stone-800">
                    <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-50">
                      Add New Staff Member
                    </h4>
                    <button onClick={() => setIsAddStaffOpen(false)} className="text-stone-400">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Full Legal Name</label>
                      <input name="name" placeholder="e.g. Rajesh Khadka" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Login Username</label>
                        <input name="username" placeholder="e.g. rajesh" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 font-mono" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Initial Password</label>
                        <input name="password" defaultValue="KamalHotel@2026" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2 font-mono" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Official Email</label>
                      <input name="email" type="email" placeholder="e.g. rajesh@kamalhotel.np" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Phone Number</label>
                      <input name="phone" defaultValue="+977 98" required className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Role Assignment</label>
                      <select name="role" defaultValue="receptionist" className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2">
                        <option value="hotel_manager">Hotel Manager (Operations & Rates)</option>
                        <option value="receptionist">Receptionist / Front Desk Clerk</option>
                        <option value="chef">Head Chef (Kitchen & Dining)</option>
                        <option value="waiter">Waiter / Restaurant Service Lead</option>
                        <option value="housekeeping">Housekeeping & Room Inspector</option>
                        <option value="super_admin">Super Admin (Full Ownership & CMS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Department</label>
                      <input name="department" defaultValue="Front Office & Concierge" className="w-full bg-stone-50 dark:bg-stone-800 border rounded p-2" />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsAddStaffOpen(false)}
                        className="px-4 py-2 rounded border"
                      >
                        Cancel
                      </button>
                      <button type="submit" className={`px-5 py-2 rounded font-semibold ${themeClasses.primary}`}>
                        Add Member & Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                Automated Messaging Gateway
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Dispatched Email, SMS & WhatsApp Records
              </h3>
              <p className="text-xs text-stone-500">
                Live automated transmission logs for reservations at Kamal Hotel Kathmandu.
              </p>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  No automated notifications dispatched yet. Make a test reservation to observe live dispatch.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-amber-700 dark:text-amber-400">
                        {notif.channel === 'email' ? (
                          <Mail className="w-4 h-4" />
                        ) : notif.channel === 'sms' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700">
                            {notif.channel}
                          </span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{notif.subject}</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="text-[11px] text-stone-400 font-mono">
                          Recipient: {notif.recipient} {notif.bookingCode ? `· Ref: ${notif.bookingCode}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {notif.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-stone-400 font-mono mt-1">{notif.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  Compliance & Traceability
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  Security & Operational Audit Trail
                </h3>
                <p className="text-xs text-stone-500">
                  Every reservation modification, price change, CMS update, and role grant is logged with IP and actor details.
                </p>
              </div>

              <select
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                <option value="all">All Categories</option>
                <option value="booking">Booking Operations</option>
                <option value="cms">CMS & Theme</option>
                <option value="rate">Rate Changes</option>
                <option value="staff">Staff RBAC</option>
                <option value="security">Security</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider text-stone-500 font-mono border-y border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 font-mono text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono text-[11px]">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 whitespace-nowrap text-stone-400">{log.timestamp}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-stone-900 dark:text-stone-100 font-sans">
                          {log.actorName}
                        </span>
                        <span className="text-stone-400 ml-1">({log.actorRole})</span>
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-stone-800 dark:text-stone-200">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-stone-600 dark:text-stone-400 max-w-sm">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right text-stone-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
