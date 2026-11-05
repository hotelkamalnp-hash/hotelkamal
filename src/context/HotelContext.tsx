import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  Booking,
  StaffUser,
  AuditLog,
  AmenityItem,
  HotelThemeConfig,
  NotificationRecord,
  StaffRole,
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
  CurrencyCode,
  GuestReview,
  FaqItem,
  MenuItem,
  RestaurantOrder,
  StockItem,
  BillSettings,
  MasterInvoice,
  BillItemLine,
  GuestRoomSession,
  CSRChatMessage,
  HotelCoupon,
  CouponDiscountType,
  CouponServiceScope,
} from '../types/hotel';
import { convertPrice } from '../utils/theme';
import { getSupabaseClient, testSupabaseConnection } from '../services/supabase';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_STOCK_ITEMS,
  INITIAL_BILL_SETTINGS,
  INITIAL_INVOICES,
  INITIAL_GUEST_SESSIONS,
} from '../services/restaurantBillingData';

// Visual assets - bundled via Vite imports for GitHub Pages compatibility
import HERO_IMAGE from '../assets/images/hero_hotel_exterior_1793848734140.jpg';
import ROOM_DELUXE_IMAGE from '../assets/images/room_deluxe_suite_1793848735141.jpg';
import ROOM_SUITE_IMAGE from '../assets/images/room_executive_himalayan_1793848733912.jpg';
import AMENITY_ROOFTOP_IMAGE from '../assets/images/amenity_rooftop_dining_1793848735329.jpg';

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Deluxe Heritage Mountain View Room',
    slug: 'deluxe-heritage-mountain-view',
    type: 'deluxe',
    pricePerNightUSD: 55,
    originalPriceUSD: 70,
    maxGuests: 2,
    bedType: '1 King Bed or 2 Twins',
    sizeSqFt: 320,
    view: 'Kamalpokhari Courtyard & Distant Hills',
    floor: '2nd & 3rd Floor',
    totalUnits: 10,
    availableUnits: 7,
    rating: 4.9,
    reviewsCount: 134,
    description:
      'Immerse yourself in serenity in the heart of Kathmandu with hand-carved Newari woodwork, custom plush mattress, soundproof windows, and en-suite rain shower with continuous hot water.',
    images: [ROOM_DELUXE_IMAGE, ROOM_SUITE_IMAGE, HERO_IMAGE],
    amenities: [
      'High-Speed Optical Wi-Fi',
      'Air Conditioning & Heating',
      'Tea & Highland Coffee Bar',
      'Soundproof Triple-Glazed Windows',
      'Eco Rain Shower (Solar Powered)',
      'Smart TV with Streaming Apps',
      'Kamalpokhari City Map & Travel Guide',
    ],
    isFeatured: true,
  },
  {
    id: 'room-2',
    name: 'Executive Himalayan Heritage Suite',
    slug: 'executive-heritage-suite',
    type: 'executive-suite',
    pricePerNightUSD: 95,
    originalPriceUSD: 125,
    maxGuests: 3,
    bedType: '1 King Bed + Convertible Daybed',
    sizeSqFt: 540,
    view: 'Panoramic Kathmandu Valley & Skyline',
    floor: 'Top Floor with Private Sun Terrace',
    totalUnits: 4,
    availableUnits: 2,
    rating: 5.0,
    reviewsCount: 88,
    description:
      'Our signature top-floor suite featuring an expansive private balcony overlooking Kathmandu, separate parlor lounge with hand-woven rugs, work desk, and luxury Ayurvedic amenities.',
    images: [ROOM_SUITE_IMAGE, ROOM_DELUXE_IMAGE, AMENITY_ROOFTOP_IMAGE],
    amenities: [
      'Private Panoramic Balcony',
      'Separate Living Parlor',
      'Mini-Bar Refrigerator',
      'Deep Soaking Tub & Rain Shower',
      'Complimentary Rooftop Breakfast',
      'Ergonomic Work Desk',
      'Welcome Nepali Masala Tea & Fresh Fruit',
    ],
    isFeatured: true,
  },
  {
    id: 'room-3',
    name: 'Super Deluxe Family Veranda Room',
    slug: 'super-deluxe-veranda',
    type: 'super-deluxe',
    pricePerNightUSD: 75,
    originalPriceUSD: 92,
    maxGuests: 4,
    bedType: '2 Queen Beds',
    sizeSqFt: 440,
    view: 'Private Garden Veranda',
    floor: '1st & 2nd Floor',
    totalUnits: 8,
    availableUnits: 5,
    rating: 4.8,
    reviewsCount: 96,
    description:
      'Spacious sanctuary tailored for families and groups visiting Kathmandu. Wide veranda seating facing our botanical courtyard with ample space for luggage and trekking gear.',
    images: [ROOM_DELUXE_IMAGE, HERO_IMAGE, ROOM_SUITE_IMAGE],
    amenities: [
      'Dual Queen Beds',
      'Botanical Veranda Seating',
      'Electric Kettle with Herbal Infusions',
      'Digital Electronic Safe',
      'Complimentary High-Speed Wi-Fi',
      'Daily Housekeeping Service',
      'Quiet Inner-Courtyard Facing',
    ],
    isFeatured: true,
  },
  {
    id: 'room-4',
    name: 'Standard Cozy City Retreat',
    slug: 'standard-cozy-city-retreat',
    type: 'standard-cozy',
    pricePerNightUSD: 38,
    originalPriceUSD: 48,
    maxGuests: 2,
    bedType: '1 Queen Bed',
    sizeSqFt: 240,
    view: 'Peaceful Courtyard',
    floor: 'Ground & 1st Floor',
    totalUnits: 12,
    availableUnits: 9,
    rating: 4.7,
    reviewsCount: 165,
    description:
      'Smartly appointed, peaceful room designed for mindful travelers, digital nomads, and trekkers stopping in Kathmandu. Features fast Wi-Fi, work desk, and clean private bath.',
    images: [HERO_IMAGE, ROOM_DELUXE_IMAGE, ROOM_SUITE_IMAGE],
    amenities: [
      'Comfortable Queen Bed',
      '24/7 Hot Water Shower',
      'Fast Optical Wi-Fi (150 Mbps)',
      'Trekker Luggage Locker',
      'USB Bedside Ports',
      'Complimentary Filtered Water',
    ],
    isFeatured: false,
  },
];

const INITIAL_AMENITIES: AmenityItem[] = [
  {
    id: 'amenity-1',
    name: 'Rooftop Mountain & City Restaurant',
    category: 'Dining',
    description:
      'Opening Soon! Perched atop Kamal Hotel, savor organic Himalayan coffees, Nepali fusion plates, and panoramic sunset views over the Kathmandu valley and distant snow peaks.',
    iconName: 'Utensils',
    imageUrl: AMENITY_ROOFTOP_IMAGE,
    isHighlight: true,
  },
  {
    id: 'amenity-2',
    name: 'High-Speed Optical Fiber Wi-Fi',
    category: 'Connectivity',
    description:
      'Dedicated enterprise dual-band fiber internet (150+ Mbps) throughout all rooms, lobby, and rooftop garden with 100% solar and inverter battery backup continuity.',
    iconName: 'Wifi',
    isHighlight: true,
  },
  {
    id: 'amenity-3',
    name: '24/7 Front Desk & Concierge',
    category: 'Services',
    description:
      'Warm local hosts ready around the clock in Kamalpokhari to assist with check-in, Tribhuvan Airport transfers, taxi booking, currency exchange, and Kathmandu city tours.',
    iconName: 'Clock',
    isHighlight: true,
  },
  {
    id: 'amenity-4',
    name: 'Tribhuvan Airport (TIA) Transfer',
    category: 'Convenience',
    description:
      'Located just 15 minutes from Kathmandu International Airport (TIA). Private hotel sedan pickups with meet-and-greet waiting right at the arrivals terminal.',
    iconName: 'Car',
    isHighlight: false,
  },
  {
    id: 'amenity-5',
    name: 'Solar Thermal Hot Showers',
    category: 'Wellness',
    description:
      'Eco-conscious solar thermal water system providing strong piping hot water 24/7 with zero interruption, even during winter months.',
    iconName: 'Sun',
    isHighlight: false,
  },
  {
    id: 'amenity-6',
    name: 'Trekking Safe-Storage & Permits Desk',
    category: 'Services',
    description:
      'Complimentary secure luggage lockup for your travel bags while you are hiking Annapurna or Everest, plus on-site assistance with TIMS and national park permits.',
    iconName: 'ShieldCheck',
    isHighlight: true,
  },
];

const INITIAL_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    author: 'Subash Shrestha',
    role: 'Kathmandu Visitor',
    location: 'Pokhara, Nepal',
    quote: 'The location in Kamalpokhari is unbeatable—walking distance to City Center, Thamel, and Durbar Marg yet tucked away in a quiet street. Warm hospitality and spotlessly clean rooms.',
    rating: 5,
    date: 'October 2026',
    isApproved: true,
  },
  {
    id: 'rev-2',
    author: 'Eleanor Vance',
    role: 'Travel Photographer',
    location: 'California, USA',
    quote: 'Kamal Hotel was our favorite stay in Nepal. The hand-carved Newari woodwork is gorgeous, the beds are super comfy, and the instant SMS/Email voucher with airport pickup was effortless.',
    rating: 5,
    date: 'November 2026',
    isApproved: true,
  },
  {
    id: 'rev-3',
    author: 'Rajesh & Pooja Agarwal',
    role: 'Family Holiday',
    location: 'Delhi, India',
    quote: 'Very peaceful boutique hotel right near Kamalpokhari pond. Clean rooms, hot showers anytime, and staff were extremely courteous with my parents. Rates in INR made booking very convenient!',
    rating: 5,
    date: 'September 2026',
    isApproved: true,
  },
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Where is Kamal Hotel located in Kathmandu?',
    answer: 'We are situated in Kamalpokhari, Kathmandu, Nepal—just a 2-minute stroll from the historic Kamalpokhari Pond, 5 minutes from City Center Mall, and 12-15 minutes from Tribhuvan International Airport (TIA).',
    category: 'Location',
  },
  {
    id: 'faq-2',
    question: 'When will the Rooftop Garden Dining be opening?',
    answer: 'Our panoramic Rooftop Garden Restaurant is currently putting finishing touches and is scheduled for its Grand Opening in Winter 2026! Guests can already preview the space for morning coffee and sunset viewing.',
    category: 'Dining',
  },
  {
    id: 'faq-3',
    question: 'Can I pay in Nepali Rupees (NPR), US Dollars (USD), or Indian Rupees (INR)?',
    answer: 'Yes! Our booking engine supports real-time rate display and payment in Nepali Rupees (रू NPR), US Dollars ($ USD), and Indian Rupees (₹ INR). You can pay online via Card, eSewa, or choose Pay at Check-In.',
    category: 'Payment',
  },
  {
    id: 'faq-4',
    question: 'Do you provide airport pickup from Tribhuvan International Airport?',
    answer: 'Yes, we provide private hotel sedan pickups 24/7 for NPR 2,400 ($18 USD). Our driver waits directly outside the arrivals terminal holding a Kamal Hotel namecard.',
    category: 'Services',
  },
];

const INITIAL_THEME: HotelThemeConfig = {
  palette: 'royal-maroon',
  fontFamily: 'garamond',
  hotelName: 'Kamal Hotel',
  starRating: 3,
  tagline: 'Authentic Himalayan Warmth & Peaceful Boutique Comfort',
  heroHeadline: 'Experience Authentic Himalayan Boutique Hospitality in Kathmandu',
  heroSubheadline:
    'A tranquil 3-star boutique sanctuary in Kamalpokhari, Kathmandu. Hand-carved heritage architecture, peaceful inner courtyard, and upcoming panoramic rooftop dining.',
  contactEmail: 'hotelkamal.np@gmail.com',
  contactPhone: '+977 1 4422589',
  whatsappNumber: '+977 9851023456',
  address: 'Kamalpokhari Marg, Ward No. 1, Kathmandu 44600, Nepal',
  city: 'Kathmandu',
  neighborhood: 'Kamalpokhari (near City Center & Kamalpokhari Pond)',
  latitude: 27.7123,
  longitude: 85.3240,
  googleMapsUrl: 'https://maps.google.com/?q=Kamalpokhari,+Kathmandu,+Nepal',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJkamalhotel_ktm',
  facebookUrl: 'https://facebook.com/kamalhotelkathmandu',
  tiktokUrl: 'https://tiktok.com/@kamalhotelkathmandu',
  instagramUrl: 'https://instagram.com/kamalhotel.np',
  checkInTime: '02:00 PM',
  checkOutTime: '12:00 PM',
  defaultCurrency: 'NPR',
  exchangeRates: {
    USD: 1,
    NPR: 135,
    INR: 84.5,
  },
  seasonalSurgeMultiplier: 1.0,
  taxRatePercent: 13,
  heroImage: HERO_IMAGE,
  announcementText: 'Namaste! Rooftop Himalayan Dining Opening Soon · Book direct for complimentary welcome tea and breakfast!',
  enableAnnouncement: true,

  // Rooftop Dining
  rooftopDiningStatus: 'opening_soon',
  rooftopOpeningDateText: 'Grand Opening Soon · Winter 2026',
  rooftopTeaserHeadline: 'Panoramic Kathmandu Valley & Himalayan Skyline Rooftop Restaurant',
  rooftopTeaserDescription:
    'Perched above Kamalpokhari, our upcoming glasshouse terrace restaurant will present artisan highland coffees, authentic Newari fusion delicacies, and handcrafted mocktails with 360-degree views of the valley and distant mountain peaks.',
  rooftopDiningImage: AMENITY_ROOFTOP_IMAGE,

  // Supabase
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) || '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  supabaseConnected: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};

const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Kamal Dev Sharma',
    username: 'superadmin',
    email: 'hotelkamal.np@gmail.com',
    phone: '+977 9851023456',
    password: 'KamalHotel@2026',
    role: 'super_admin',
    permissions: [
      'all_access',
      'manage_staff',
      'edit_cms',
      'modify_rates',
      'manage_bookings',
      'manage_rooms',
      'view_finances',
      'view_audit_logs',
      'supabase_sync',
    ],
    status: 'active',
    lastActive: 'Just now',
    department: 'Executive Ownership & Management',
  },
  {
    id: 'staff-2',
    name: 'Anita Gurung',
    username: 'manager',
    email: 'anita.manager@kamalhotel.np',
    phone: '+977 9841239870',
    password: 'Manager@2026',
    role: 'hotel_manager',
    permissions: [
      'manage_bookings',
      'manage_rooms',
      'modify_rates',
      'process_checkin',
      'view_finances',
      'view_audit_logs',
    ],
    status: 'active',
    lastActive: '10 mins ago',
    department: 'Operations & Guest Relations',
  },
  {
    id: 'staff-3',
    name: 'Bikash Adhikari',
    username: 'receptionist',
    email: 'frontdesk@kamalhotel.np',
    phone: '+977 9813456789',
    password: 'Reception@2026',
    role: 'receptionist',
    permissions: ['process_checkin', 'manage_bookings', 'view_availability'],
    status: 'active',
    lastActive: '3 mins ago',
    department: 'Front Office & Concierge',
  },
  {
    id: 'staff-4',
    name: 'Ramesh Magar (Head Chef)',
    username: 'chef',
    email: 'chef.ramesh@kamalhotel.np',
    phone: '+977 9801122334',
    password: 'Chef@2026',
    role: 'chef',
    permissions: ['view_dining_orders', 'manage_menu_specials', 'view_breakfast_counts'],
    status: 'active',
    lastActive: '15 mins ago',
    department: 'Culinary & Rooftop Restaurant',
  },
  {
    id: 'staff-5',
    name: 'Prakash Lama (Service Lead)',
    username: 'waiter',
    email: 'service@kamalhotel.np',
    phone: '+977 9805566778',
    password: 'Waiter@2026',
    role: 'waiter',
    permissions: ['view_dining_orders', 'room_service_dispatch', 'view_guest_preferences'],
    status: 'active',
    lastActive: '8 mins ago',
    department: 'Restaurant & Banquet Service',
  },
  {
    id: 'staff-6',
    name: 'Sunita Thapa',
    username: 'housekeeping',
    email: 'housekeeping@kamalhotel.np',
    phone: '+977 9803322114',
    password: 'Clean@2026',
    role: 'housekeeping',
    permissions: ['manage_rooms_cleanliness', 'view_availability'],
    status: 'active',
    lastActive: '20 mins ago',
    department: 'Housekeeping & Laundry',
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    bookingCode: 'KH-2026-9042',
    guestName: 'Eleanor Vance',
    guestEmail: 'eleanor.vance@gmail.com',
    guestPhone: '+1 (415) 890-2341',
    guestCountry: 'United States',
    roomTypeId: 'room-1',
    roomName: 'Deluxe Heritage Mountain View Room',
    roomType: 'deluxe',
    checkInDate: '2026-11-05',
    checkOutDate: '2026-11-09',
    nights: 4,
    adults: 2,
    children: 0,
    addons: [
      { id: 'ad-1', name: 'Rooftop Himalayan Breakfast Buffet', priceUSD: 8, description: 'Daily breakfast' },
      { id: 'ad-2', name: 'Private Airport Pickup', priceUSD: 18, description: 'Direct pickup' },
    ],
    subtotal: 252,
    taxAmount: 32.76,
    totalAmount: 284.76,
    currency: 'USD',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    cardLast4: '4242',
    bookingStatus: 'checked-in',
    createdAt: '2026-11-01T10:14:00Z',
    specialRequests: 'Upper floor room facing Kamalpokhari quiet side.',
    smsSent: true,
    emailSent: true,
    whatsappSent: true,
  },
  {
    id: 'bk-102',
    bookingCode: 'KH-2026-9055',
    guestName: 'Rajesh & Pooja Agarwal',
    guestEmail: 'rajesh.agarwal@delhi.in',
    guestPhone: '+91 98110 99881',
    guestCountry: 'India',
    roomTypeId: 'room-3',
    roomName: 'Super Deluxe Family Veranda Room',
    roomType: 'super-deluxe',
    checkInDate: '2026-11-06',
    checkOutDate: '2026-11-09',
    nights: 3,
    adults: 3,
    children: 1,
    addons: [
      { id: 'ad-2', name: 'Private Airport Pickup', priceUSD: 18, description: 'TIA pickup' },
    ],
    subtotal: 20533,
    taxAmount: 2669,
    totalAmount: 23202,
    currency: 'INR',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    cardLast4: '8821',
    bookingStatus: 'confirmed',
    createdAt: '2026-11-02T14:32:00Z',
    specialRequests: 'Elderly parents with us; ground or 1st floor preferred.',
    smsSent: true,
    emailSent: true,
    whatsappSent: true,
  },
  {
    id: 'bk-103',
    bookingCode: 'KH-2026-9068',
    guestName: 'Subash Shrestha',
    guestEmail: 'subash.pokhara@gmail.com',
    guestPhone: '+977 9841234567',
    guestCountry: 'Nepal',
    roomTypeId: 'room-1',
    roomName: 'Deluxe Heritage Mountain View Room',
    roomType: 'deluxe',
    checkInDate: '2026-11-04',
    checkOutDate: '2026-11-07',
    nights: 3,
    adults: 2,
    children: 0,
    addons: [],
    subtotal: 22275,
    taxAmount: 2895,
    totalAmount: 25170,
    currency: 'NPR',
    paymentStatus: 'paid',
    paymentMethod: 'esewa',
    bookingStatus: 'checked-in',
    createdAt: '2026-10-30T09:20:00Z',
    specialRequests: 'Arriving by private car, will need parking.',
    smsSent: true,
    emailSent: true,
    whatsappSent: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-04 19:25:00',
    actorName: 'Kamal Dev Sharma',
    actorRole: 'Super Admin',
    action: 'Location & Rooftop Dining Configured',
    category: 'cms',
    details: 'Updated address to Kamalpokhari, Kathmandu. Set Rooftop Dining to Opening Soon status.',
    ipAddress: '103.10.23.41',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-04 18:30:12',
    actorName: 'Kamal Dev Sharma',
    actorRole: 'Super Admin',
    action: 'Multi-Currency Enabled',
    category: 'rate',
    details: 'Enabled NPR, USD, and INR rates with live exchange conversion (1 USD = 135 NPR = 84.5 INR).',
    ipAddress: '103.10.23.41',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-04 15:10:45',
    actorName: 'Anita Gurung',
    actorRole: 'Hotel Manager',
    action: 'Room Inventory Update',
    category: 'booking',
    details: 'Executive Himalayan Suite availability verified after deep cleaning inspection.',
    ipAddress: '103.10.23.44',
  },
];

const INITIAL_COUPONS: HotelCoupon[] = [
  {
    id: 'cp-welcome15',
    code: 'WELCOME2026',
    description: '15% Off all Room Stays & Dining at Kamal Hotel',
    discountType: 'percentage',
    discountValue: 15,
    applicableTo: 'all',
    minSpendUSD: 40,
    validFrom: '2025-01-01',
    validUntil: '2026-12-31',
    usageLimit: 500,
    timesUsed: 42,
    isActive: true,
    createdBy: 'Subash Sharma (Super Admin)',
  },
  {
    id: 'cp-rooftop10',
    code: 'ROOFTOP10',
    description: '$10 USD Flat Voucher for Rooftop Garden Dining',
    discountType: 'fixed_amount',
    discountValue: 10,
    applicableTo: 'dining',
    minSpendUSD: 25,
    validFrom: '2025-01-01',
    validUntil: '2026-12-31',
    usageLimit: 200,
    timesUsed: 19,
    isActive: true,
    createdBy: 'Chef Subash (Head Chef)',
  },
  {
    id: 'cp-himalayanvip',
    code: 'HIMALAYANVIP',
    description: '20% Exclusive Privilege on Executive & Presidential Suites',
    discountType: 'percentage',
    discountValue: 20,
    applicableTo: 'rooms',
    minSpendUSD: 100,
    maxDiscountUSD: 150,
    validFrom: '2025-01-01',
    validUntil: '2026-12-31',
    usageLimit: 100,
    timesUsed: 14,
    isActive: true,
    createdBy: 'General Manager',
  },
  {
    id: 'cp-kamal5',
    code: 'KAMAL5',
    description: '5% Instant Direct Website Booking Promo',
    discountType: 'percentage',
    discountValue: 5,
    applicableTo: 'all',
    validFrom: '2025-01-01',
    validUntil: '2027-12-31',
    usageLimit: 1000,
    timesUsed: 88,
    isActive: true,
    createdBy: 'Marketing Team',
  },
];

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface HotelContextType {
  rooms: Room[];
  amenities: AmenityItem[];
  bookings: Booking[];
  staff: StaffUser[];
  auditLogs: AuditLog[];
  notifications: NotificationRecord[];
  themeConfig: HotelThemeConfig;
  reviews: GuestReview[];
  faqs: FaqItem[];
  activeRole: StaffRole | 'guest';
  activeUser: StaffUser | null;
  darkMode: boolean;
  currentCurrency: CurrencyCode;
  toasts: NotificationToast[];
  selectedRoomForBooking: Room | null;
  isBookingModalOpen: boolean;

  // Restaurant & Dining
  menuItems: MenuItem[];
  restaurantOrders: RestaurantOrder[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  placeRestaurantOrder: (order: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => RestaurantOrder;
  updateOrderStatus: (orderId: string, status: RestaurantOrder['status'], waiterName?: string) => void;

  // Stock & Inventory
  stockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  adjustStockQuantity: (id: string, delta: number, reason: string) => void;

  // Billing, Invoicing & Template Customization
  billSettings: BillSettings;
  invoices: MasterInvoice[];
  updateBillSettings: (updates: Partial<BillSettings>) => void;
  generateInvoiceForBooking: (bookingId: string) => MasterInvoice;
  createCustomInvoice: (inv: Omit<MasterInvoice, 'id' | 'invoiceNumber' | 'issuedAt'>) => MasterInvoice;
  updateInvoice: (id: string, updates: Partial<MasterInvoice>) => void;
  addPaymentToInvoice: (invoiceId: string, amount: number, method: PaymentMethod) => void;

  // In-House Guest Room Sessions (Room number + dynamic passcode)
  guestSessions: GuestRoomSession[];
  activeGuestSession: GuestRoomSession | null;
  loginGuestByRoom: (roomNumber: string, passcode: string) => { success: boolean; message: string; session?: GuestRoomSession };
  logoutGuestSession: () => void;
  generateNewRoomPasscode: (roomNumber: string, bookingCode: string, guestName: string) => GuestRoomSession;
  checkoutAndResetRoomPasscode: (roomNumber: string) => void;

  // Intercom & In-Room Guest Chat / VoIP
  guestChatMessages: CSRChatMessage[];
  sendGuestServiceMessage: (text: string, serviceTag?: CSRChatMessage['serviceTag']) => void;
  sendStaffReplyMessage: (text: string, roomNumber: string) => void;
  isVoipCallActive: boolean;
  activeVoipTarget: string | null;
  startVoipCall: (targetRoomOrDept: string) => void;
  endVoipCall: () => void;
  
  // Actions
  setDarkMode: (value: boolean) => void;
  setCurrentCurrency: (currency: CurrencyCode) => void;
  setActiveRole: (role: StaffRole | 'guest') => void;
  openBookingModal: (room?: Room) => void;
  closeBookingModal: () => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'smsSent' | 'emailSent' | 'whatsappSent'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  updatePaymentStatus: (bookingId: string, status: PaymentStatus) => void;
  
  // CMS CRUD actions
  updateThemeConfig: (updates: Partial<HotelThemeConfig>) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  addAmenity: (amenity: Omit<AmenityItem, 'id'>) => void;
  updateAmenity: (amenityId: string, updates: Partial<AmenityItem>) => void;
  deleteAmenity: (amenityId: string) => void;
  
  // Reviews & FAQs CRUD
  addReview: (review: Omit<GuestReview, 'id' | 'date'>) => void;
  updateReview: (id: string, updates: Partial<GuestReview>) => void;
  deleteReview: (id: string) => void;
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;

  // Staff & RBAC Management
  addStaff: (member: Omit<StaffUser, 'id'>) => void;
  updateStaffRoleAndPermissions: (staffId: string, role: StaffRole, permissions: string[]) => void;
  deleteStaff: (staffId: string) => void;

  // Authentication & Staff Session
  isStaffLoggedIn: boolean;
  isLoginModalOpen: boolean;
  loginModalTargetRole?: StaffRole;
  openLoginModal: (preferredRole?: StaffRole) => void;
  closeLoginModal: () => void;
  loginStaff: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string; user?: StaffUser }>;
  logoutStaff: () => void;
  changeUserPassword: (userId: string, newPass: string) => void;

  // Supabase Sync & Connection
  connectSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;

  // Audit log helper
  addAuditLog: (action: string, category: AuditLog['category'], details: string) => void;
  
  // Toasts
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Coupons & Promo Vouchers
  coupons: HotelCoupon[];
  addCoupon: (coupon: Omit<HotelCoupon, 'id' | 'timesUsed'>) => void;
  updateCoupon: (id: string, updates: Partial<HotelCoupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;
  validateAndApplyCoupon: (code: string, subtotalUSD: number, serviceScope?: CouponServiceScope) => { valid: boolean; discountAmountUSD: number; coupon?: HotelCoupon; message: string };
  redeemCoupon: (code: string) => boolean;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_rooms_v2');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [amenities, setAmenities] = useState<AmenityItem[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_amenities_v2');
    return saved ? JSON.parse(saved) : INITIAL_AMENITIES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_bookings_v2');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [staff, setStaff] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_staff_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].username) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_STAFF;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_audit_v2');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_notifications_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<GuestReview[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_reviews_v2');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_faqs_v2');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [themeConfig, setThemeConfig] = useState<HotelThemeConfig>(() => {
    const saved = localStorage.getItem('kamal_hotel_theme_v2');
    const parsed = saved ? JSON.parse(saved) : INITIAL_THEME;
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
    return {
      ...parsed,
      supabaseUrl: parsed.supabaseUrl || envUrl,
      supabaseAnonKey: parsed.supabaseAnonKey || envKey,
      supabaseConnected: parsed.supabaseConnected || Boolean(parsed.supabaseUrl && parsed.supabaseAnonKey) || Boolean(envUrl && envKey),
    };
  });

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('kamal_hotel_currency') as CurrencyCode) || 'NPR';
  });

  const [activeRole, setActiveRole] = useState<StaffRole | 'guest'>(() => {
    const savedSession = localStorage.getItem('kamal_hotel_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        return parsed.role || 'guest';
      } catch (e) {}
    }
    return 'guest';
  });

  const [activeUser, setActiveUser] = useState<StaffUser | null>(() => {
    const savedSession = localStorage.getItem('kamal_hotel_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const found = INITIAL_STAFF.find((s) => s.id === parsed.userId || s.role === parsed.role);
        return found || INITIAL_STAFF[0];
      } catch (e) {}
    }
    return null;
  });

  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kamal_hotel_session') !== null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalTargetRole, setLoginModalTargetRole] = useState<StaffRole | undefined>(undefined);
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem('kamal_hotel_dark') === 'true';
  });

  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Coupons & Promo Vouchers state
  const [coupons, setCoupons] = useState<HotelCoupon[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_coupons_v1');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  useEffect(() => {
    localStorage.setItem('kamal_hotel_coupons_v1', JSON.stringify(coupons));
  }, [coupons]);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kamal_hotel_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kamal_hotel_dark', 'false');
    }
  }, [darkMode]);

  // Persist items
  useEffect(() => {
    localStorage.setItem('kamal_hotel_rooms_v2', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_amenities_v2', JSON.stringify(amenities));
  }, [amenities]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_staff_v3', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_audit_v2', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_faqs_v2', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_theme_v2', JSON.stringify(themeConfig));
  }, [themeConfig]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_currency', currentCurrency);
  }, [currentCurrency]);

  // ----------------- RESTAURANT & DINING STATE -----------------
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_menu_v1');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_orders_v1');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kamal_hotel_menu_v1', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_orders_v1', JSON.stringify(restaurantOrders));
  }, [restaurantOrders]);

  // ----------------- STOCK & INVENTORY STATE -----------------
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_stock_v1');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('kamal_hotel_stock_v1', JSON.stringify(stockItems));
  }, [stockItems]);

  // ----------------- BILLING & INVOICES STATE -----------------
  const [billSettings, setBillSettings] = useState<BillSettings>(() => {
    const saved = localStorage.getItem('kamal_hotel_bill_settings_v1');
    return saved ? JSON.parse(saved) : INITIAL_BILL_SETTINGS;
  });

  const [invoices, setInvoices] = useState<MasterInvoice[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_invoices_v1');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  useEffect(() => {
    localStorage.setItem('kamal_hotel_bill_settings_v1', JSON.stringify(billSettings));
  }, [billSettings]);

  useEffect(() => {
    localStorage.setItem('kamal_hotel_invoices_v1', JSON.stringify(invoices));
  }, [invoices]);

  // ----------------- IN-HOUSE GUEST PASSCODE SESSIONS -----------------
  const [guestSessions, setGuestSessions] = useState<GuestRoomSession[]>(() => {
    const saved = localStorage.getItem('kamal_hotel_guest_sessions_v1');
    return saved ? JSON.parse(saved) : INITIAL_GUEST_SESSIONS;
  });

  const [activeGuestSession, setActiveGuestSession] = useState<GuestRoomSession | null>(() => {
    const saved = localStorage.getItem('kamal_hotel_active_guest_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('kamal_hotel_guest_sessions_v1', JSON.stringify(guestSessions));
  }, [guestSessions]);

  useEffect(() => {
    if (activeGuestSession) {
      localStorage.setItem('kamal_hotel_active_guest_session', JSON.stringify(activeGuestSession));
    } else {
      localStorage.removeItem('kamal_hotel_active_guest_session');
    }
  }, [activeGuestSession]);

  // ----------------- IN-ROOM INTERCOM & VOIP -----------------
  const [guestChatMessages, setGuestChatMessages] = useState<CSRChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'concierge',
      roomNumber: 'Reception',
      guestName: 'Bikash (Front Desk)',
      text: 'Namaste! Welcome to Kamal Hotel, Kamalpokhari. How may we assist your stay today? Feel free to order room dining or request towels.',
      time: 'Just now',
      serviceTag: 'front_desk',
    },
  ]);
  const [isVoipCallActive, setIsVoipCallActive] = useState<boolean>(false);
  const [activeVoipTarget, setActiveVoipTarget] = useState<string | null>(null);

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
  };

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (action: string, category: AuditLog['category'], details: string) => {
    const actor = staff.find((s) => s.role === activeRole) || {
      name: activeRole === 'guest' ? 'Guest / Traveler' : 'Authorized Staff',
      role: activeRole,
    };
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: dateStr,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      category,
      details,
      ipAddress: '103.10.23.' + Math.floor(Math.random() * 80 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const openBookingModal = (room?: Room) => {
    if (room) {
      setSelectedRoomForBooking(room);
    } else if (rooms.length > 0) {
      setSelectedRoomForBooking(rooms[0]);
    }
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'smsSent' | 'emailSent' | 'whatsappSent'>): Booking => {
    const bookingSeq = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `KH-2026-${bookingSeq}`;
    const newBooking: Booking = {
      ...bookingData,
      id: 'bk-' + Math.random().toString(36).substring(2, 9),
      bookingCode,
      createdAt: new Date().toISOString(),
      smsSent: true,
      emailSent: true,
      whatsappSent: true,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Decrease room available units
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === newBooking.roomTypeId) {
          return {
            ...r,
            availableUnits: Math.max(0, r.availableUnits - 1),
          };
        }
        return r;
      })
    );

    // Automated Notification Records
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const currencyLabel = newBooking.currency === 'NPR' ? `NPR ${newBooking.totalAmount.toLocaleString()}` : newBooking.currency === 'INR' ? `INR ${newBooking.totalAmount.toLocaleString()}` : `$${newBooking.totalAmount.toFixed(2)}`;
    
    const emailRecord: NotificationRecord = {
      id: 'notif-email-' + Math.random().toString(36).substring(2, 9),
      timestamp,
      recipient: newBooking.guestEmail,
      channel: 'email',
      subject: `Booking Confirmed: ${newBooking.roomName} at Kamal Hotel, Kamalpokhari (${bookingCode})`,
      message: `Dear ${newBooking.guestName}, your reservation at Kamal Hotel (Kamalpokhari, Kathmandu) is confirmed for ${newBooking.checkInDate} to ${newBooking.checkOutDate}. Total paid: ${currencyLabel}. Welcome to the Kathmandu Valley!`,
      status: 'delivered',
      bookingCode,
    };

    const smsRecord: NotificationRecord = {
      id: 'notif-sms-' + Math.random().toString(36).substring(2, 9),
      timestamp,
      recipient: newBooking.guestPhone,
      channel: 'sms',
      subject: `SMS Confirmation [${bookingCode}]`,
      message: `Kamal Hotel (Kamalpokhari, Kathmandu): Namaste ${newBooking.guestName}! Your room ${newBooking.roomName} is confirmed for ${newBooking.checkInDate}. Ref: ${bookingCode}. 24/7 Front Desk: ${themeConfig.contactPhone}`,
      status: 'delivered',
      bookingCode,
    };

    const waRecord: NotificationRecord = {
      id: 'notif-wa-' + Math.random().toString(36).substring(2, 9),
      timestamp,
      recipient: newBooking.guestPhone,
      channel: 'whatsapp',
      subject: `WhatsApp Hospitality Voucher [${bookingCode}]`,
      message: `Welcome to Kamal Hotel! We have prepared your itinerary, Kamalpokhari location map, airport transfer instructions, and rooftop preview pass. Chat with our concierge here 24/7!`,
      status: 'delivered',
      bookingCode,
    };

    setNotifications((prev) => [emailRecord, smsRecord, waRecord, ...prev]);

    addAuditLog(
      'New Guest Reservation',
      'booking',
      `Booking ${bookingCode} confirmed for ${newBooking.guestName} (${newBooking.roomName}, ${currencyLabel}) via ${newBooking.paymentMethod}.`
    );

    showToast(
      'Reservation Confirmed!',
      `Booking ${bookingCode} created. Automated email voucher & SMS sent to ${newBooking.guestEmail}`,
      'success'
    );

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, bookingStatus: status };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      addAuditLog(
        `Booking Status Changed: ${status}`,
        'booking',
        `Reservation ${target.bookingCode} for ${target.guestName} status changed to ${status}.`
      );
      showToast('Booking Updated', `Status changed to ${status.toUpperCase()} for ${target.guestName}`);
    }
  };

  const updatePaymentStatus = (bookingId: string, status: PaymentStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, paymentStatus: status };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      addAuditLog(
        `Payment Status Changed: ${status}`,
        'payment',
        `Payment for booking ${target.bookingCode} marked as ${status}.`
      );
      showToast('Payment Status Updated', `Payment marked as ${status.toUpperCase()}`);
    }
  };

  // CMS Updates
  const updateThemeConfig = (updates: Partial<HotelThemeConfig>) => {
    setThemeConfig((prev) => ({ ...prev, ...updates }));
    addAuditLog('CMS Configuration Updated', 'cms', `Updated fields: ${Object.keys(updates).join(', ')}`);
    showToast('Settings Saved', 'Landing page content, rates, or theme updated dynamically.');
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: 'room-' + Math.random().toString(36).substring(2, 9),
    };
    setRooms((prev) => [...prev, newRoom]);
    addAuditLog('New Room Created', 'cms', `Added room "${newRoom.name}" ($${newRoom.pricePerNightUSD}/night)`);
    showToast('Room Added', `${newRoom.name} added to catalog.`);
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return { ...r, ...updates };
        }
        return r;
      })
    );
    const target = rooms.find((r) => r.id === roomId);
    addAuditLog('Room Specifications Modified', 'cms', `Updated "${target?.name || roomId}"`);
    showToast('Room Updated', 'Changes saved to live directory.');
  };

  const deleteRoom = (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    addAuditLog('Room Removed', 'cms', `Deleted room "${target?.name || roomId}" from active catalog.`);
    showToast('Room Deleted', `Removed from hotel inventory.`);
  };

  const addAmenity = (amenityData: Omit<AmenityItem, 'id'>) => {
    const newAmenity: AmenityItem = {
      ...amenityData,
      id: 'amenity-' + Math.random().toString(36).substring(2, 9),
    };
    setAmenities((prev) => [...prev, newAmenity]);
    addAuditLog('Amenity Added', 'cms', `Added hotel facility: "${newAmenity.name}"`);
    showToast('Amenity Added', `${newAmenity.name} is now visible to guests.`);
  };

  const updateAmenity = (amenityId: string, updates: Partial<AmenityItem>) => {
    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === amenityId) {
          return { ...a, ...updates };
        }
        return a;
      })
    );
    addAuditLog('Amenity Modified', 'cms', `Updated amenity ${amenityId}`);
    showToast('Amenity Updated', 'Details refreshed.');
  };

  const deleteAmenity = (amenityId: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== amenityId));
    addAuditLog('Amenity Removed', 'cms', `Deleted amenity ${amenityId}`);
    showToast('Amenity Removed', 'Amenity deleted.');
  };

  // Reviews CRUD
  const addReview = (reviewData: Omit<GuestReview, 'id' | 'date'>) => {
    const newReview: GuestReview = {
      ...reviewData,
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
    setReviews((prev) => [newReview, ...prev]);
    addAuditLog('Guest Review Added', 'cms', `Added review by ${newReview.author}`);
    showToast('Review Added', 'Review published to landing page.');
  };

  const updateReview = (id: string, updates: Partial<GuestReview>) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addAuditLog('Guest Review Modified', 'cms', `Updated review ${id}`);
    showToast('Review Updated', 'Review changes saved.');
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Guest Review Deleted', 'cms', `Removed review ${id}`);
    showToast('Review Removed', 'Review deleted from site.');
  };

  // FAQs CRUD
  const addFaq = (faqData: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = {
      ...faqData,
      id: 'faq-' + Math.random().toString(36).substring(2, 9),
    };
    setFaqs((prev) => [...prev, newFaq]);
    addAuditLog('FAQ Added', 'cms', `Added FAQ: "${newFaq.question}"`);
    showToast('FAQ Added', 'FAQ added to landing page.');
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addAuditLog('FAQ Modified', 'cms', `Updated FAQ ${id}`);
    showToast('FAQ Updated', 'FAQ changes saved.');
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    addAuditLog('FAQ Deleted', 'cms', `Deleted FAQ ${id}`);
    showToast('FAQ Removed', 'FAQ removed from landing page.');
  };

  // Staff & RBAC
  const addStaff = (userData: Omit<StaffUser, 'id' | 'lastActive'>) => {
    const newUser: StaffUser = {
      ...userData,
      id: 'staff-' + Math.random().toString(36).substring(2, 9),
      lastActive: 'Just registered',
    };
    setStaff((prev) => [...prev, newUser]);
    addAuditLog('Staff Member Added', 'staff', `Added ${newUser.name} with role ${newUser.role}`);
    showToast('Staff Member Added', `${newUser.name} added to hotel operations team.`);
  };

  const updateStaffRoleAndPermissions = (
    staffId: string,
    role: StaffRole,
    permissions: string[],
    status?: 'active' | 'on-leave' | 'inactive'
  ) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            role,
            permissions,
            status: status || s.status,
          };
        }
        return s;
      })
    );
    const target = staff.find((s) => s.id === staffId);
    addAuditLog(
      'Staff Role & RBAC Updated',
      'security',
      `Updated role for ${target?.name} to "${role}" with ${permissions.length} granular permissions.`
    );
    showToast('Permissions Updated', `Role updated for ${target?.name}`);
  };

  const deleteStaff = (staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    addAuditLog('Staff Member Removed', 'security', `Removed staff member ${target?.name}`);
    showToast('Staff Removed', 'Member deleted from access registry.');
  };

  // Supabase Connection & Sync
  const connectSupabase = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    const result = await testSupabaseConnection(url, key);
    if (result.success) {
      updateThemeConfig({
        supabaseUrl: url,
        supabaseAnonKey: key,
        supabaseConnected: true,
      });
      addAuditLog('Supabase Backend Connected', 'security', `Connected to Supabase project at ${url.substring(0, 24)}...`);
      showToast('Supabase Connected!', 'Backend database & Auth initialized.', 'success');
    } else {
      updateThemeConfig({ supabaseConnected: false });
      showToast('Connection Failed', result.message, 'warning');
    }
    return result;
  };

  const syncWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient(themeConfig.supabaseUrl, themeConfig.supabaseAnonKey);
    if (!client) {
      return { success: false, message: 'Please connect to Supabase first in the Supabase tab.' };
    }

    try {
      // Upsert hotel configuration
      await client.from('hotel_config').upsert({
        id: 'main_config',
        config: themeConfig,
        updated_at: new Date().toISOString(),
      });

      // Upsert rooms
      for (const room of rooms) {
        await client.from('rooms').upsert({
          id: room.id,
          name: room.name,
          slug: room.slug,
          type: room.type,
          price_per_night: room.pricePerNightUSD,
          original_price: room.originalPriceUSD || null,
          max_guests: room.maxGuests,
          bed_type: room.bedType,
          size_sq_ft: room.sizeSqFt,
          view: room.view,
          floor: room.floor,
          total_units: room.totalUnits,
          available_units: room.availableUnits,
          rating: room.rating,
          reviews_count: room.reviewsCount,
          description: room.description,
          images: room.images,
          amenities: room.amenities,
          is_featured: room.isFeatured || false,
        });
      }

      addAuditLog('Supabase Data Synced', 'security', 'Synced all rooms, config, and audit logs to Supabase PostgreSQL.');
      showToast('Supabase Synced', 'All catalog, rooms, and configuration synced to Supabase!', 'success');
      return { success: true, message: 'Successfully synced all data to Supabase PostgreSQL database!' };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || 'Sync failed.' };
    }
  };

  const openLoginModal = (preferredRole?: StaffRole) => {
    setLoginModalTargetRole(preferredRole);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const loginStaff = async (
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: StaffUser }> => {
    const clean = usernameOrEmail.trim().toLowerCase();

    // Match by username or email
    const matched = staff.find(
      (s) => s.username?.toLowerCase() === clean || s.email.toLowerCase() === clean
    );

    if (!matched) {
      return { success: false, message: 'User not found. Check username or official email.' };
    }

    if (matched.status === 'inactive') {
      return { success: false, message: 'This staff account is currently inactive.' };
    }

    if (matched.password && matched.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    // Attempt Supabase Auth login if connected
    if (themeConfig.supabaseConnected && themeConfig.supabaseUrl && themeConfig.supabaseAnonKey) {
      const client = getSupabaseClient(themeConfig.supabaseUrl, themeConfig.supabaseAnonKey);
      if (client) {
        try {
          await client.auth.signInWithPassword({
            email: matched.email,
            password: password,
          });
        } catch (e) {
          console.warn('Supabase auth attempt:', e);
        }
      }
    }

    setActiveUser(matched);
    setActiveRole(matched.role);
    setIsStaffLoggedIn(true);
    setIsLoginModalOpen(false);

    localStorage.setItem(
      'kamal_hotel_session',
      JSON.stringify({
        userId: matched.id,
        role: matched.role,
        name: matched.name,
        loginAt: new Date().toISOString(),
      })
    );

    addAuditLog(
      'Staff Authentication Success',
      'security',
      `${matched.name} (${matched.role}) logged in successfully.`
    );

    showToast(
      'Signed In Successfully',
      `Namaste ${matched.name}! Active role: ${matched.role.replace('_', ' ').toUpperCase()}`,
      'success'
    );

    return { success: true, message: 'Login successful!', user: matched };
  };

  const logoutStaff = () => {
    const prevName = activeUser?.name || 'Staff User';
    setActiveRole('guest');
    setActiveUser(null);
    setIsStaffLoggedIn(false);
    localStorage.removeItem('kamal_hotel_session');

    if (themeConfig.supabaseConnected && themeConfig.supabaseUrl && themeConfig.supabaseAnonKey) {
      const client = getSupabaseClient(themeConfig.supabaseUrl, themeConfig.supabaseAnonKey);
      if (client) {
        client.auth.signOut().catch(() => {});
      }
    }

    addAuditLog('Staff Logged Out', 'security', `${prevName} signed out of the operations console.`);
    showToast('Signed Out', 'Returned to guest portal.', 'info');
  };

  const changeUserPassword = (userId: string, newPass: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, password: newPass } : s))
    );
    const target = staff.find((s) => s.id === userId);
    addAuditLog('Staff Password Updated', 'security', `Password modified for ${target?.name}`);
    showToast('Password Updated', `New credentials saved for ${target?.name}`);
  };

  // ----------------- RESTAURANT & DINING ACTIONS -----------------
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'menu-' + Date.now(),
    };
    setMenuItems((prev) => [...prev, newItem]);
    addAuditLog('Menu Item Added', 'cms', `Added dish: ${item.name} (${item.category})`);
    showToast('Dish Added', `${item.name} is now available in the restaurant menu.`);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Menu Updated', 'Dish details updated successfully.');
  };

  const deleteMenuItem = (id: string) => {
    const found = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    addAuditLog('Menu Item Deleted', 'cms', `Removed dish: ${found?.name}`);
    showToast('Dish Removed', 'Item deleted from menu.', 'info');
  };

  const placeRestaurantOrder = (orderData: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>): RestaurantOrder => {
    const orderNum = 'KHO-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: RestaurantOrder = {
      ...orderData,
      id: 'order-' + Date.now(),
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      status: 'placed',
    };

    setRestaurantOrders((prev) => [newOrder, ...prev]);

    // Dispatch automated in-app notifications to waiter, chef, and receptionist
    const notifMessage = `New Order #${orderNum} from ${newOrder.tableOrRoomNo} (${newOrder.guestName}): ${newOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}. Mode: ${newOrder.paymentMode}.`;
    
    // Add to notifications queue
    const notif: NotificationRecord = {
      id: 'notif-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: `Kitchen & Service Crew (Room ${newOrder.tableOrRoomNo})`,
      channel: 'push',
      subject: `Kitchen Alert: Order #${orderNum}`,
      message: notifMessage,
      status: 'delivered',
      bookingCode: orderNum,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Append to guest chat log
    setGuestChatMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        sender: 'concierge',
        roomNumber: newOrder.tableOrRoomNo,
        guestName: 'Rooftop Kitchen & Waiter',
        text: `✅ Order #${orderNum} received! Our chef is preparing your dishes. Estimated delivery time: 20-25 mins.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceTag: 'room_service',
      },
    ]);

    addAuditLog('Room Dining Order Placed', 'booking', `Order #${orderNum} for ${newOrder.tableOrRoomNo} ($${newOrder.totalAmountUSD.toFixed(2)})`);
    showToast(`Order #${orderNum} Placed!`, `Sent to Head Chef & Waiter. Total: $${newOrder.totalAmountUSD.toFixed(2)}`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: RestaurantOrder['status'], waiterName?: string) => {
    setRestaurantOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            waiterAssigned: waiterName || ord.waiterAssigned,
          };
        }
        return ord;
      })
    );
    const target = restaurantOrders.find((o) => o.id === orderId);
    showToast('Order Status Updated', `Order #${target?.orderNumber} is now: ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // ----------------- STOCK & INVENTORY ACTIONS -----------------
  const addStockItem = (item: Omit<StockItem, 'id'>) => {
    const newStock: StockItem = {
      ...item,
      id: 'stock-' + Date.now(),
    };
    setStockItems((prev) => [...prev, newStock]);
    addAuditLog('Stock Item Created', 'cms', `Added inventory SKU ${item.sku}: ${item.name} (${item.category})`);
    showToast('Stock Added', `${item.name} logged into inventory system.`);
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Inventory Updated', 'Stock item modified successfully.');
  };

  const deleteStockItem = (id: string) => {
    const found = stockItems.find((s) => s.id === id);
    setStockItems((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Stock Item Deleted', 'cms', `Removed stock item: ${found?.name} (${found?.sku})`);
    showToast('Item Removed', 'Inventory record deleted.', 'info');
  };

  const adjustStockQuantity = (id: string, delta: number, reason: string) => {
    setStockItems((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = Math.max(0, s.currentStock + delta);
          return {
            ...s,
            currentStock: updated,
            lastRestockedDate: delta > 0 ? new Date().toISOString().split('T')[0] : s.lastRestockedDate,
          };
        }
        return s;
      })
    );
    const item = stockItems.find((s) => s.id === id);
    addAuditLog('Stock Adjusted', 'cms', `${delta > 0 ? '+' : ''}${delta} ${item?.unit} of ${item?.name} (${reason})`);
    showToast('Stock Adjusted', `Updated count for ${item?.name}: ${((item?.currentStock || 0) + delta)} ${item?.unit}`);
  };

  // ----------------- BILLING & INVOICING ACTIONS -----------------
  const updateBillSettings = (updates: Partial<BillSettings>) => {
    setBillSettings((prev) => ({ ...prev, ...updates }));
    addAuditLog('Bill Settings Customized', 'cms', 'Updated invoice template, tax/service rates, or logo.');
    showToast('Bill Settings Saved', 'Invoice template and formatting rules updated.', 'success');
  };

  const generateInvoiceForBooking = (bookingId: string): MasterInvoice => {
    const booking = bookings.find((b) => b.id === bookingId);
    const invoiceNum = 'KH-INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Find room charge
    const room = rooms.find((r) => r.id === booking?.roomTypeId);
    const roomRateUSD = room ? room.pricePerNightUSD : 50;
    const nights = booking?.nights || 1;

    // Check if guest has any room service restaurant orders
    const guestOrders = restaurantOrders.filter(
      (o) => o.tableOrRoomNo === booking?.bookingCode || o.guestName.toLowerCase() === booking?.guestName.toLowerCase()
    );

    const items: BillItemLine[] = [
      {
        id: 'li-' + Math.random().toString(36).substring(2, 7),
        description: `${booking?.roomName || 'Room Stay'} (${nights} Nights @ $${roomRateUSD}/night)`,
        category: 'room_stay',
        date: booking?.checkInDate || new Date().toISOString().split('T')[0],
        quantity: nights,
        rateUSD: roomRateUSD,
        amountUSD: roomRateUSD * nights,
      },
    ];

    // Add addons
    if (booking?.addons && booking.addons.length > 0) {
      booking.addons.forEach((addon) => {
        items.push({
          id: 'li-' + Math.random().toString(36).substring(2, 7),
          description: addon.name,
          category: addon.name.toLowerCase().includes('airport') ? 'airport_transfer' : 'other',
          date: booking.checkInDate,
          quantity: 1,
          rateUSD: addon.priceUSD,
          amountUSD: addon.priceUSD,
        });
      });
    }

    // Add dining orders
    guestOrders.forEach((ord) => {
      items.push({
        id: 'li-' + ord.id,
        description: `Rooftop Dining Order #${ord.orderNumber} (${ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')})`,
        category: 'restaurant_dining',
        date: ord.createdAt.split('T')[0],
        quantity: 1,
        rateUSD: ord.subtotalUSD,
        amountUSD: ord.subtotalUSD,
      });
    });

    const subtotal = items.reduce((acc, i) => acc + i.amountUSD, 0);
    const discountAmount = (subtotal * (billSettings.defaultDiscountPercent || 0)) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const serviceCharge = (discountedSubtotal * billSettings.serviceChargePercent) / 100;
    const taxableBase = discountedSubtotal + serviceCharge;
    const tax = (taxableBase * billSettings.taxPercent) / 100;
    const grandTotal = Math.round((taxableBase + tax) * 100) / 100;

    const newInv: MasterInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceNum,
      bookingCode: booking?.bookingCode || 'DIRECT-WALKIN',
      roomNumber: booking ? `Room ${booking.roomTypeId.replace('room-', '30')}` : 'Room 302',
      guestName: booking?.guestName || 'Guest Walk-in',
      guestEmail: booking?.guestEmail || 'guest@example.com',
      guestPhone: booking?.guestPhone || '+977 98',
      checkInDate: booking?.checkInDate || new Date().toISOString().split('T')[0],
      checkOutDate: booking?.checkOutDate || new Date().toISOString().split('T')[0],
      issuedAt: new Date().toLocaleString(),
      items,
      subtotalUSD: subtotal,
      discountPercent: billSettings.defaultDiscountPercent,
      discountAmountUSD: discountAmount,
      serviceChargePercent: billSettings.serviceChargePercent,
      serviceChargeAmountUSD: serviceCharge,
      taxPercent: billSettings.taxPercent,
      taxAmountUSD: tax,
      grandTotalUSD: grandTotal,
      amountPaidUSD: booking?.paymentStatus === 'paid' ? grandTotal : 0,
      balanceDueUSD: booking?.paymentStatus === 'paid' ? 0 : grandTotal,
      paymentStatus: booking?.paymentStatus || 'pending',
      paymentMethod: booking?.paymentMethod || 'card',
    };

    setInvoices((prev) => [newInv, ...prev]);
    showToast('Invoice Generated', `Master bill created for ${newInv.guestName} (${invoiceNum})`);
    return newInv;
  };

  const createCustomInvoice = (invData: Omit<MasterInvoice, 'id' | 'invoiceNumber' | 'issuedAt'>): MasterInvoice => {
    const invNum = 'KH-INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newInv: MasterInvoice = {
      ...invData,
      id: 'inv-' + Date.now(),
      invoiceNumber: invNum,
      issuedAt: new Date().toLocaleString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    addAuditLog('Custom Bill Issued', 'payment', `Invoice ${invNum} created for ${invData.guestName} ($${invData.grandTotalUSD.toFixed(2)})`);
    showToast('Bill Created', `Invoice ${invNum} registered successfully.`);
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<MasterInvoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
    showToast('Invoice Saved', 'Bill adjustments updated.', 'success');
  };

  const addPaymentToInvoice = (invoiceId: string, amount: number, method: PaymentMethod) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.amountPaidUSD + amount;
          const newBalance = Math.max(0, inv.grandTotalUSD - newPaid);
          const newStatus: PaymentStatus = newBalance === 0 ? 'paid' : 'pending';
          return {
            ...inv,
            amountPaidUSD: newPaid,
            balanceDueUSD: newBalance,
            paymentStatus: newStatus,
            paymentMethod: method,
          };
        }
        return inv;
      })
    );
    addAuditLog('Payment Registered', 'payment', `Collected $${amount} for Invoice #${invoiceId}`);
    showToast('Payment Recorded', `Payment of $${amount.toFixed(2)} applied via ${method.toUpperCase()}.`);
  };

  // ----------------- IN-HOUSE GUEST PASSCODE SESSIONS -----------------
  const loginGuestByRoom = (roomNumber: string, passcode: string): { success: boolean; message: string; session?: GuestRoomSession } => {
    const cleanRoom = roomNumber.trim().toLowerCase();
    const cleanPass = passcode.trim();

    const session = guestSessions.find(
      (s) => s.roomNumber.toLowerCase().includes(cleanRoom) && s.passcode === cleanPass && s.isActive
    );

    if (!session) {
      return {
        success: false,
        message: 'Invalid room number or in-house passcode. Please verify with reception or your keycard envelope.',
      };
    }

    // Strict stay period validation: PIN works only during stay dates
    const today = new Date().toISOString().split('T')[0];
    if (session.checkOutDate && today > session.checkOutDate) {
      return {
        success: false,
        message: `Your stay has ended as of ${session.checkOutDate}. Passcode has expired. Please contact reception.`,
      };
    }

    setActiveGuestSession(session);
    showToast('Welcome to Your Room Portal!', `Logged into ${session.roomNumber} (${session.guestName})`, 'success');
    return { success: true, message: 'Welcome!', session };
  };

  const logoutGuestSession = () => {
    setActiveGuestSession(null);
    showToast('Guest Portal Signed Out', 'Thank you for visiting.', 'info');
  };

  const generateNewRoomPasscode = (roomNumber: string, bookingCode: string, guestName: string): GuestRoomSession => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newSession: GuestRoomSession = {
      roomNumber,
      bookingCode,
      guestName,
      passcode: randomPin,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toLocaleString(),
      expiresAt: new Date(Date.now() + 86400000 * 3).toLocaleString(),
    };

    setGuestSessions((prev) => [newSession, ...prev.filter((s) => s.roomNumber !== roomNumber)]);
    addAuditLog('Guest Passcode Issued', 'security', `Generated PIN ${randomPin} for ${roomNumber} (${guestName})`);
    showToast('Guest Passcode Generated', `${roomNumber} passcode is: ${randomPin}. Guest can now log in.`, 'success');
    return newSession;
  };

  const checkoutAndResetRoomPasscode = (roomNumber: string) => {
    const cleanRoom = roomNumber.toLowerCase();

    // 1. Expire and deactivate session
    setGuestSessions((prev) =>
      prev.map((s) => (s.roomNumber.toLowerCase() === cleanRoom ? { ...s, isActive: false, passcode: 'EXPIRED' } : s))
    );

    // 2. Clear active session if logged in
    if (activeGuestSession?.roomNumber.toLowerCase() === cleanRoom) {
      setActiveGuestSession(null);
    }

    // 3. Mark booking as checked-out
    setBookings((prev) =>
      prev.map((b) => {
        if (`room ${b.roomTypeId.replace('room-', '30')}`.toLowerCase() === cleanRoom || b.bookingCode.toLowerCase().includes(cleanRoom)) {
          return { ...b, bookingStatus: 'checked-out' };
        }
        return b;
      })
    );

    // 4. Reset & purge room chat messages
    setGuestChatMessages((prev) =>
      prev.filter((m) => m.roomNumber?.toLowerCase() !== cleanRoom)
    );

    addAuditLog('Room Checked Out & Passcode Purged', 'security', `Checkout completed for ${roomNumber}. PIN expired and guest session reset.`);
    showToast('Checkout Complete', `Passcode for ${roomNumber} revoked and session reset for next guest.`, 'success');
  };

  // ----------------- INTERCOM & IN-ROOM VOIP ACTIONS -----------------
  const sendGuestServiceMessage = (text: string, serviceTag: CSRChatMessage['serviceTag'] = 'concierge') => {
    const room = activeGuestSession?.roomNumber || 'Room 302';
    const guest = activeGuestSession?.guestName || 'In-House Guest';
    const msg: CSRChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'guest',
      roomNumber: room,
      guestName: guest,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceTag,
    };
    setGuestChatMessages((prev) => [...prev, msg]);

    // Automated Reception reply acknowledgment
    setTimeout(() => {
      setGuestChatMessages((prev) => [
        ...prev,
        {
          id: 'reply-' + Date.now(),
          sender: 'receptionist',
          roomNumber: room,
          guestName: 'Bikash (Front Desk)',
          text: `Namaste ${guest}! We have received your request regarding: "${text}". Our team has dispatched assistance to ${room}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          serviceTag,
        },
      ]);
    }, 1200);
  };

  const sendStaffReplyMessage = (text: string, roomNumber: string) => {
    const staffName = activeUser?.name || 'Reception Staff';
    const msg: CSRChatMessage = {
      id: 'staff-reply-' + Date.now(),
      sender: 'receptionist',
      roomNumber,
      guestName: staffName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceTag: 'front_desk',
    };
    setGuestChatMessages((prev) => [...prev, msg]);
    showToast('Intercom Message Sent', `Delivered to ${roomNumber}`);
  };

  const startVoipCall = (targetRoomOrDept: string) => {
    setIsVoipCallActive(true);
    setActiveVoipTarget(targetRoomOrDept);
    showToast('VoIP Intercom Connected', `Audio link active with ${targetRoomOrDept} (Kamal Hotel SIP Intercom)`, 'info');
  };

  const endVoipCall = () => {
    setIsVoipCallActive(false);
    setActiveVoipTarget(null);
    showToast('VoIP Call Ended', 'Intercom session closed.', 'info');
  };

  // ----------------- COUPONS & PROMO VOUCHERS -----------------
  const addCoupon = (newCp: Omit<HotelCoupon, 'id' | 'timesUsed'>) => {
    const coupon: HotelCoupon = {
      ...newCp,
      id: 'cp-' + Math.random().toString(36).substring(2, 9),
      timesUsed: 0,
      code: newCp.code.trim().toUpperCase(),
    };
    setCoupons((prev) => [coupon, ...prev]);
    addAuditLog('Created Coupon ' + coupon.code, 'rates', `Added coupon ${coupon.code} with value ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' USD'}`);
    showToast('Coupon Created', `Promo code "${coupon.code}" is now active.`, 'success');
  };

  const updateCoupon = (id: string, updates: Partial<HotelCoupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, code: updates.code ? updates.code.trim().toUpperCase() : c.code } : c))
    );
    showToast('Coupon Updated', 'Promo code parameters updated successfully.', 'info');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon Deleted', 'Coupon removed from active system.', 'warning');
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const validateAndApplyCoupon = (
    code: string,
    subtotalUSD: number,
    serviceScope: CouponServiceScope = 'all'
  ) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmountUSD: 0, message: 'Please enter a coupon or promo code.' };
    }

    const coupon = coupons.find((c) => c.code === cleanCode);
    if (!coupon) {
      return { valid: false, discountAmountUSD: 0, message: `Promo code "${cleanCode}" is invalid or does not exist.` };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmountUSD: 0, message: `Promo code "${cleanCode}" is currently inactive.` };
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.validFrom && today < coupon.validFrom) {
      return { valid: false, discountAmountUSD: 0, message: `Promo code "${cleanCode}" is not yet active.` };
    }
    if (coupon.validUntil && today > coupon.validUntil) {
      return { valid: false, discountAmountUSD: 0, message: `Promo code "${cleanCode}" expired on ${coupon.validUntil}.` };
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, discountAmountUSD: 0, message: `Promo code "${cleanCode}" has reached its maximum redemptions.` };
    }

    if (coupon.applicableTo !== 'all' && serviceScope !== 'all' && coupon.applicableTo !== serviceScope) {
      return { valid: false, discountAmountUSD: 0, message: `Coupon "${cleanCode}" is only applicable to ${coupon.applicableTo.replace('_', ' ')}.` };
    }

    if (coupon.minSpendUSD && subtotalUSD < coupon.minSpendUSD) {
      return {
        valid: false,
        discountAmountUSD: 0,
        message: `Minimum spend of $${coupon.minSpendUSD.toFixed(2)} required for "${cleanCode}".`,
      };
    }

    let discountAmountUSD = 0;
    if (coupon.discountType === 'percentage') {
      discountAmountUSD = (subtotalUSD * coupon.discountValue) / 100;
      if (coupon.maxDiscountUSD && discountAmountUSD > coupon.maxDiscountUSD) {
        discountAmountUSD = coupon.maxDiscountUSD;
      }
    } else {
      discountAmountUSD = Math.min(subtotalUSD, coupon.discountValue);
    }

    return {
      valid: true,
      discountAmountUSD: Math.round(discountAmountUSD * 100) / 100,
      coupon,
      message: `Coupon "${coupon.code}" applied! You saved $${discountAmountUSD.toFixed(2)} (${coupon.description}).`,
    };
  };

  const redeemCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    let found = false;
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code === cleanCode) {
          found = true;
          return { ...c, timesUsed: c.timesUsed + 1 };
        }
        return c;
      })
    );
    return found;
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        amenities,
        bookings,
        staff,
        auditLogs,
        notifications,
        themeConfig,
        reviews,
        faqs,
        activeRole,
        activeUser,
        darkMode,
        currentCurrency,
        toasts,
        selectedRoomForBooking,
        isBookingModalOpen,
        isStaffLoggedIn,
        isLoginModalOpen,
        loginModalTargetRole,
        setDarkMode,
        setCurrentCurrency,
        setActiveRole,
        openBookingModal,
        closeBookingModal,
        openLoginModal,
        closeLoginModal,
        loginStaff,
        logoutStaff,
        changeUserPassword,
        createBooking,
        updateBookingStatus,
        updatePaymentStatus,
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
        // Restaurant & Dining
        menuItems,
        restaurantOrders,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        placeRestaurantOrder,
        updateOrderStatus,

        // Stock & Inventory
        stockItems,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        adjustStockQuantity,

        // Billing & Invoices
        billSettings,
        invoices,
        updateBillSettings,
        generateInvoiceForBooking,
        createCustomInvoice,
        updateInvoice,
        addPaymentToInvoice,

        // Guest Sessions & Passcode
        guestSessions,
        activeGuestSession,
        loginGuestByRoom,
        logoutGuestSession,
        generateNewRoomPasscode,
        checkoutAndResetRoomPasscode,

        // Intercom & In-Room VoIP
        guestChatMessages,
        sendGuestServiceMessage,
        sendStaffReplyMessage,
        isVoipCallActive,
        activeVoipTarget,
        startVoipCall,
        endVoipCall,

        addStaff,
        updateStaffRoleAndPermissions,
        deleteStaff,
        connectSupabase,
        syncWithSupabase,
        addAuditLog,
        showToast,
        removeToast,

        // Coupons & Promo Vouchers
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        validateAndApplyCoupon,
        redeemCoupon,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

