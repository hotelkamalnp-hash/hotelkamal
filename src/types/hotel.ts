export type RoomType = 'deluxe' | 'super-deluxe' | 'executive-suite' | 'standard-cozy';
export type CurrencyCode = 'NPR' | 'USD' | 'INR';

export interface Room {
  id: string;
  name: string;
  slug: string;
  type: RoomType;
  pricePerNightUSD: number; // Stored in base USD, converted dynamically
  originalPriceUSD?: number;
  maxGuests: number;
  bedType: string;
  sizeSqFt: number;
  view: string;
  floor: string;
  totalUnits: number;
  availableUnits: number;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  amenities: string[];
  isFeatured?: boolean;
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';
export type PaymentMethod = 'card' | 'esewa' | 'khalti' | 'onsite';

export interface BookingAddon {
  id: string;
  name: string;
  priceUSD: number;
  description: string;
  selected?: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  roomTypeId: string;
  roomName: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  addons: BookingAddon[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  bookingStatus: BookingStatus;
  createdAt: string;
  specialRequests?: string;
  smsSent: boolean;
  emailSent: boolean;
  whatsappSent: boolean;
}

export type StaffRole = 
  | 'super_admin' 
  | 'hotel_manager' 
  | 'receptionist' 
  | 'chef' 
  | 'waiter' 
  | 'housekeeping';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: StaffRole;
  permissions: string[];
  status: 'active' | 'on-leave' | 'inactive';
  lastActive: string;
  department: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: 'booking' | 'rate' | 'cms' | 'staff' | 'security' | 'payment';
  details: string;
  ipAddress: string;
}

export interface AmenityItem {
  id: string;
  name: string;
  category: 'Dining' | 'Wellness' | 'Connectivity' | 'Services' | 'Convenience';
  description: string;
  iconName: string;
  imageUrl?: string;
  isHighlight?: boolean;
}

export interface GuestReview {
  id: string;
  author: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  date: string;
  isApproved: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type ThemePalette = 'royal-maroon' | 'mountain-emerald' | 'heritage-bronze' | 'midnight-navy';

export interface HotelThemeConfig {
  palette: ThemePalette;
  fontFamily: 'garamond' | 'playfair' | 'jakarta';
  hotelName: string;
  starRating: number;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googleReviewUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  checkInTime: string;
  checkOutTime: string;
  defaultCurrency: CurrencyCode;
  exchangeRates: {
    USD: number;
    NPR: number;
    INR: number;
  };
  seasonalSurgeMultiplier: number;
  taxRatePercent: number;
  heroImage: string;
  announcementText: string;
  enableAnnouncement: boolean;
  
  // Rooftop Dining specific
  rooftopDiningStatus: 'opening_soon' | 'open' | 'renovation';
  rooftopOpeningDateText: string;
  rooftopTeaserHeadline: string;
  rooftopTeaserDescription: string;
  rooftopDiningImage: string;

  // Supabase Integration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseConnected: boolean;
}

export interface NotificationRecord {
  id: string;
  timestamp: string;
  recipient: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  subject: string;
  message: string;
  status: 'delivered' | 'sent' | 'pending';
  bookingCode?: string;
}

export interface CSRChatMessage {
  id: string;
  sender: 'guest' | 'concierge' | 'bot' | 'receptionist' | 'waiter';
  roomNumber?: string;
  guestName?: string;
  text: string;
  time: string;
  serviceTag?: 'room_service' | 'housekeeping' | 'concierge' | 'front_desk';
}

// ----------------- RESTAURANT & DINING -----------------
export type MenuItemCategory = 'Starters' | 'Main Course' | 'Nepali Heritage & Newari' | 'Himalayan Specials' | 'Rooftop Bar & Beverages' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  description: string;
  priceUSD: number;
  imageUrl?: string;
  isVegetarian: boolean;
  isSpicy?: boolean;
  isChefSpecial?: boolean;
  available: boolean;
  preparationTimeMinutes: number;
}

export type OrderStatus = 'placed' | 'confirmed_by_waiter' | 'preparing' | 'ready_for_delivery' | 'delivered' | 'cancelled';
export type OrderDestination = 'room' | 'rooftop_table' | 'courtyard';

export interface RestaurantOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPriceUSD: number;
  specialInstructions?: string;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  roomNumber: string;
  guestName: string;
  guestPhone?: string;
  destination: OrderDestination;
  tableOrRoomNo: string;
  items: RestaurantOrderItem[];
  subtotalUSD: number;
  taxUSD: number;
  serviceChargeUSD: number;
  totalAmountUSD: number;
  status: OrderStatus;
  createdAt: string;
  waiterAssigned?: string;
  kitchenNotes?: string;
  paymentMode: 'charge_to_room' | 'cash_on_delivery' | 'card_online';
}

// ----------------- INVENTORY & STOCK -----------------
export type StockCategory = 'Kitchen Ingredients' | 'Beverages & Bar' | 'Housekeeping & Toiletries' | 'Linen & Bedding' | 'Maintenance & Solar' | 'Front Office Stationery';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  sku: string;
  currentStock: number;
  minThreshold: number; // Low stock alert trigger
  unit: string; // 'kg', 'bottles', 'packs', 'pieces', 'liters', etc.
  costPerUnitUSD: number;
  lastRestockedDate: string;
  supplierName: string;
  supplierContact: string;
  location: string;
}

// ----------------- BILLING & INVOICE TEMPLATES -----------------
export type InvoiceTemplateId = 'heritage-gold' | 'executive-modern' | 'minimalist-clean' | 'regal-himalayan' | 'compact-pos-thermal';

export interface BillSettings {
  template: InvoiceTemplateId;
  hotelLogoUrl: string;
  hotelLegalName: string;
  panVatNumber: string;
  taxPercent: number; // e.g. 13% VAT
  serviceChargePercent: number; // e.g. 10% Service Charge
  defaultDiscountPercent: number;
  footerNote: string;
  showQrCodeForPayment: boolean;
  showBreakdownByService: boolean;
  termsAndConditions: string;
  contactSupportPhone: string;
  authorizedSignatoryName: string;
}

export interface BillItemLine {
  id: string;
  description: string;
  category: 'room_stay' | 'restaurant_dining' | 'laundry' | 'airport_transfer' | 'spa_wellness' | 'minibar' | 'other';
  date: string;
  quantity: number;
  rateUSD: number;
  amountUSD: number;
}

export interface MasterInvoice {
  id: string;
  invoiceNumber: string;
  bookingCode: string;
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string;
  guestPanVat?: string;
  checkInDate: string;
  checkOutDate: string;
  issuedAt: string;
  items: BillItemLine[];
  subtotalUSD: number;
  discountPercent: number;
  discountAmountUSD: number;
  serviceChargePercent: number;
  serviceChargeAmountUSD: number;
  taxPercent: number;
  taxAmountUSD: number;
  grandTotalUSD: number;
  amountPaidUSD: number;
  balanceDueUSD: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// ----------------- IN-HOUSE GUEST STAY PASSCODE -----------------
export interface GuestRoomSession {
  roomNumber: string;
  bookingCode: string;
  guestName: string;
  passcode: string; // Dynamically generated random PIN e.g. 4829
  checkInDate: string;
  checkOutDate: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

// ----------------- FINANCIAL ACCOUNTING -----------------
export type AccountingPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface AccountingSummary {
  period: AccountingPeriod;
  dateLabel: string;
  roomStayRevenueUSD: number;
  restaurantRevenueUSD: number;
  servicesRevenueUSD: number;
  totalGrossRevenueUSD: number;
  taxCollectedUSD: number;
  serviceChargeCollectedUSD: number;
  discountsGivenUSD: number;
  expensesUSD: number;
  netOperatingIncomeUSD: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
}
