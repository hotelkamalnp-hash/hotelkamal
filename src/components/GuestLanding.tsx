import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { getThemeClasses } from '../utils/theme';
import { BookingBar } from './BookingBar';
import { RoomCatalog } from './RoomCatalog';
import { AmenitiesSection } from './AmenitiesSection';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ChevronDown, 
  ShieldCheck, 
  ExternalLink,
  Navigation,
  Share2
} from 'lucide-react';
import suiteImg from '../assets/images/room_deluxe_suite_1793848735141.jpg';

interface GuestLandingProps {
  onOpenDashboard: () => void;
  onOpenInRoomPortal?: () => void;
}

export const GuestLanding: React.FC<GuestLandingProps> = ({ onOpenDashboard, onOpenInRoomPortal }) => {
  const { themeConfig, reviews, faqs, openBookingModal } = useHotel();
  const themeClasses = getThemeClasses(themeConfig.palette);

  // Search filter passed from BookingBar to RoomCatalog
  const [searchFilter, setSearchFilter] = useState<{
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  } | null>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBookingBarSearch = (filters: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  }) => {
    setSearchFilter(filters);
    const roomsElement = document.getElementById('rooms');
    if (roomsElement) {
      roomsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const approvedReviews = reviews.filter((r) => r.isApproved);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors w-full max-w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center justify-center overflow-hidden">
        {/* Background Visual Asset */}
        <div className="absolute inset-0">
          <img
            src={themeConfig.heroImage}
            alt="Kamal Hotel exterior in Kamalpokhari, Kathmandu"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {/* Measured Scrim for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-stone-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-12 pb-24 space-y-6">
          
          {/* Heritage Badge / Kicker */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
            <span>{themeConfig.starRating}-Star Boutique Sanctuary</span>
            <span aria-hidden="true">·</span>
            <span>Kamalpokhari, Kathmandu</span>
            <span aria-hidden="true">·</span>
            <span>Nepal</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] text-balance">
            {themeConfig.heroHeadline}
          </h1>

          {/* Value Proposition Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-200 font-normal leading-relaxed text-balance">
            {themeConfig.heroSubheadline}
          </p>

          {/* Dominant CTAs & In-Room Guest Access */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => openBookingModal()}
              className={`px-7 py-3.5 text-xs font-semibold tracking-wider uppercase rounded-lg shadow-xl hover:scale-105 transition-all duration-200 ${themeClasses.primary}`}
            >
              Reserve Your Stay
            </button>
            {onOpenInRoomPortal && (
              <button
                onClick={onOpenInRoomPortal}
                className="px-5 py-3.5 text-xs font-semibold tracking-wider uppercase rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/40 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg"
              >
                <span>🔑 In-House Guest Room Portal</span>
              </button>
            )}
            <a
              href="#dining"
              className="px-5 py-3.5 text-xs font-medium tracking-wider uppercase rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Rooftop Dining</span>
            </a>
          </div>

          {/* Adjacency Proof Strip with Google Reviews & Location */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-300">
            {themeConfig.googleReviewUrl && (
              <a
                href={themeConfig.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold text-white">4.9 / 5.0 Google Rating</span>
                <span className="text-stone-300">(Read & Write Reviews)</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            )}
            <span className="hidden sm:inline text-stone-600">·</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Kamalpokhari, Kathmandu (15 min from TIA Airport)</span>
            </div>
            <span className="hidden sm:inline text-stone-600">·</span>
            <div>Zero Booking Fees</div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME BOOKING AVAILABILITY BAR */}
      <BookingBar onSearch={handleBookingBarSearch} />

      {/* 3. ROOMS & ACCOMMODATIONS CATALOG */}
      <RoomCatalog
        filteredType={searchFilter?.roomType || 'all'}
        minGuests={searchFilter?.guests || 1}
      />

      {/* 4. REAL-TIME AMENITIES & ROOFTOP DINING */}
      <AmenitiesSection />

      {/* 5. HERITAGE & HOSPITALITY STORY */}
      <section id="heritage" className="py-24 bg-white dark:bg-stone-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                Kathmandu Valley Boutique Living
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight text-balance">
                Peaceful Haven in Kamalpokhari, Kathmandu
              </h2>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                Situated in the historic Kamalpokhari neighborhood of central Kathmandu, Kamal Hotel offers travelers a tranquil oasis away from city bustle while keeping you minutes away from City Center, Thamel, and Durbar Marg.
              </p>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                Built with authentic Newari woodwork, warm river stone masonry, and peaceful courtyard views, our 3-star property pairs traditional Himalayan hospitality with uninterrupted fiber-optic Wi-Fi and solar hot water continuity.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <div className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-400">2 Mins</div>
                  <div className="text-stone-500 mt-1">Walk to Kamalpokhari Historic Pond & City Center</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-400">15 Mins</div>
                  <div className="text-stone-500 mt-1">Tribhuvan International Airport (TIA) Transfer</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xl">
                <img
                  src={suiteImg}
                  alt="Carved woodwork suite at Kamal Hotel Kathmandu"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-stone-900 text-white p-6 rounded-xl shadow-xl max-w-xs border border-stone-800 hidden sm:block">
                <div className="text-xs text-amber-400 font-mono">“Atithi Devo Bhava”</div>
                <div className="text-xs text-stone-300 mt-1 leading-snug">
                  Guest is equivalent to God in Himalayan culture. Our dedicated local team is here to assist your stay 24/7.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. DYNAMIC GUEST REVIEWS & GOOGLE REVIEWS SECTION */}
      <section className="py-20 bg-stone-100/60 dark:bg-stone-900/40 border-t border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
                Verified Guest Impressions
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Loved by Travelers in Kathmandu
              </h2>
            </div>

            {themeConfig.googleReviewUrl && (
              <a
                href={themeConfig.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 hover:border-amber-500 shadow-sm transition-all"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Write a Google Review</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                    “{review.quote}”
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-xs flex justify-between items-baseline">
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{review.author}</div>
                    <div className="text-[11px] text-stone-400">{review.role} · {review.location}</div>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">{review.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LOCATION & DIRECTIONS TO KAMALPOKHARI */}
      <section id="location" className="py-20 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                Finding Us in Kathmandu
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Prime Kamalpokhari Location
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Kamal Hotel is located on Kamalpokhari Marg, just behind the landmark Kamalpokhari Lotus Pond. It is centrally positioned for business travelers, shopping, and heritage sightseeing.
              </p>

              <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">Exact Address:</div>
                    <div>{themeConfig.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">GPS Coordinates:</div>
                    <div className="font-mono text-stone-500">
                      Lat: {themeConfig.latitude}° N, Long: {themeConfig.longitude}° E
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Maps Action */}
              <div className="pt-2">
                <a
                  href={themeConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider shadow transition-all ${themeClasses.primary}`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Interactive Map Visual Card */}
            <div className="lg:col-span-7">
              <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Kamalpokhari, Kathmandu Hub</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Kathmandu 44600</span>
                </div>

                {/* Map Representation Container */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center p-6 text-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 space-y-2">
                    <div className="w-12 h-12 bg-amber-700 text-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-white dark:ring-stone-800">
                      <MapPin className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      Kamal Hotel Kathmandu
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm">
                      Kamalpokhari Marg (Ward No. 1), near City Center Mall & Narayanhiti Palace Gateway
                    </p>
                    <a
                      href={themeConfig.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline pt-2"
                    >
                      <span>Click to view live satellite map & traffic</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <div className="font-bold text-stone-900 dark:text-stone-100">15 min</div>
                    <div className="text-[10px] text-stone-500">TIA Airport</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <div className="font-bold text-stone-900 dark:text-stone-100">2 min</div>
                    <div className="text-[10px] text-stone-500">City Center Mall</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <div className="font-bold text-stone-900 dark:text-stone-100">8 min</div>
                    <div className="text-[10px] text-stone-500">Thamel / Durbar Marg</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. DYNAMIC FAQS ACCORDION */}
      <section className="py-20 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
              Guest Assistance
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. LOCATION, SOCIAL & CONTACT FOOTER */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
            
            <div className="space-y-4">
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                {themeConfig.hotelName.toUpperCase()}
              </span>
              <p className="text-xs text-stone-400 leading-relaxed">
                Authentic 3-star boutique accommodation in Kamalpokhari, Kathmandu. Dedicated to peaceful Himalayan hospitality, high-speed fiber internet, and rooftop mountain views.
              </p>
              
              {/* Social Channels */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold">Connect With Us:</div>
                <div className="flex items-center gap-3 text-xs">
                  {themeConfig.facebookUrl && (
                    <a href={themeConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white transition-colors">
                      Facebook
                    </a>
                  )}
                  {themeConfig.instagramUrl && (
                    <a href={themeConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white transition-colors">
                      Instagram
                    </a>
                  )}
                  {themeConfig.tiktokUrl && (
                    <a href={themeConfig.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white transition-colors">
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-semibold text-white uppercase tracking-wider font-mono text-[11px]">
                Direct Contacts
              </div>
              <div className="space-y-2 text-stone-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <a href={`mailto:${themeConfig.contactEmail}`} className="hover:text-white">
                    {themeConfig.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{themeConfig.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Front Desk: 24/7 Service</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-semibold text-white uppercase tracking-wider font-mono text-[11px]">
                Kathmandu Location
              </div>
              <p className="text-stone-400 leading-relaxed">
                {themeConfig.address}
              </p>
              <div className="pt-1">
                <a
                  href={themeConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-white text-xs font-medium"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Google Directions</span>
                </a>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-semibold text-white uppercase tracking-wider font-mono text-[11px]">
                Management & Operations
              </div>
              <p className="text-stone-400">
                Staff, Managers, and Super Admin console:
              </p>
              <button
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Operations Console</span>
              </button>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div>
              © 2026 {themeConfig.hotelName}. Kamalpokhari, Kathmandu, Nepal. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>PCI-DSS SSL Encrypted</span>
              <span>·</span>
              <span>Rates in NPR, USD & INR</span>
              <span>·</span>
              <span>Direct Booking Guarantee</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
