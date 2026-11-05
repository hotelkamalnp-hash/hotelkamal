import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instance
let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export const getSupabaseClient = (supabaseUrl?: string, supabaseAnonKey?: string): SupabaseClient | null => {
  const url = supabaseUrl || (import.meta.env.VITE_SUPABASE_URL as string);
  const key = supabaseAnonKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

  if (!url || !key) {
    return null;
  }

  // Reuse if url and key match
  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
};

/**
 * Tests connection to Supabase by fetching a heartbeat or table metadata
 */
export const testSupabaseConnection = async (
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ success: boolean; message: string }> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, message: 'Please provide both Supabase Project URL and Publishable Key (sb_publishable_... or anon key).' };
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    // Ping with a lightweight query
    const { error } = await client.from('rooms').select('count', { count: 'exact', head: true });
    
    // If table doesn't exist yet, it means authentication succeeded but the schema hasn't been run yet!
    if (error && (error.code === '42P01' || error.code === 'PGRST204' || error.code === 'PGRST200' || error.message?.includes('does not exist') || error.message?.includes('relation'))) {
      return { 
        success: true, 
        message: 'Connected to Supabase! (Database tables not yet created — paste and run the SQL migration schema in your Supabase SQL Editor).' 
      };
    } else if (error && error.message?.includes('FetchError')) {
      return { success: false, message: `Network connection failed: ${error.message}. Please check your Project URL.` };
    } else if (error && (error.code === 'PGRST301' || error.message?.includes('apikey') || error.message?.includes('JWT'))) {
      return { success: false, message: 'Invalid API Key. Please copy the "Publishable key" from your Supabase dashboard.' };
    }

    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase.' };
  }
};

/**
 * Complete PostgreSQL SQL Schema for Supabase
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- KAMAL HOTEL (KAMALPOKHARI, KATHMANDU) - SUPABASE POSTGRESQL SCHEMA
-- Paste this script into your Supabase Dashboard -> SQL Editor and click 'Run'.
-- ==============================================================================

-- 1. Create Room Categories & Inventory Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  max_guests INT DEFAULT 2,
  bed_type TEXT NOT NULL,
  size_sq_ft INT,
  view TEXT,
  floor TEXT,
  total_units INT DEFAULT 5,
  available_units INT DEFAULT 5,
  rating NUMERIC(3,1) DEFAULT 4.9,
  reviews_count INT DEFAULT 10,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Reservations & Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_country TEXT,
  room_type_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT NOT NULL,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  addons JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NPR',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'card',
  card_last4 TEXT,
  booking_status TEXT DEFAULT 'confirmed',
  special_requests TEXT,
  sms_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Hotel CMS & Dynamic Configuration Table
CREATE TABLE IF NOT EXISTS public.hotel_config (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Hotel Amenities Table
CREATE TABLE IF NOT EXISTS public.amenities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  image_url TEXT,
  is_highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Guest Reviews & Testimonials Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  role TEXT,
  location TEXT,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Security & Operations Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  ip_address TEXT
);

-- 7. Create Staff Users & RBAC Permissions Table
CREATE TABLE IF NOT EXISTS public.staff_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  department TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalog and config
CREATE POLICY "Public can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Public can view amenities" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Public can view hotel config" ON public.hotel_config FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (is_approved = true);

-- Public can insert new bookings
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own bookings by code" ON public.bookings FOR SELECT USING (true);

-- Authenticated staff policies (Full CRUD)
CREATE POLICY "Staff can manage all rooms" ON public.rooms FOR ALL USING (true);
CREATE POLICY "Staff can manage all bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Staff can update config" ON public.hotel_config FOR ALL USING (true);
CREATE POLICY "Staff can manage audit logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Staff can manage reviews" ON public.reviews FOR ALL USING (true);
`;
