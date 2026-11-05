import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room } from '../types/hotel';
import { getThemeClasses, formatCurrency, convertPrice } from '../utils/theme';
import { 
  Users, 
  Maximize2, 
  Bed, 
  Eye, 
  Check, 
  Star, 
  ArrowRight, 
  X,
  Coins
} from 'lucide-react';
import heroFallbackImg from '../assets/images/hero_hotel_exterior_1793848734140.jpg';

interface RoomCatalogProps {
  filteredType?: string;
  minGuests?: number;
}

export const RoomCatalog: React.FC<RoomCatalogProps> = ({ filteredType = 'all', minGuests = 1 }) => {
  const { rooms, themeConfig, currentCurrency, openBookingModal } = useHotel();
  const [activeFilter, setActiveFilter] = useState<string>(filteredType);
  const [detailModalRoom, setDetailModalRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    if (activeFilter !== 'all' && room.type !== activeFilter) {
      return false;
    }
    if (minGuests > 1 && room.maxGuests < minGuests) {
      return false;
    }
    return true;
  });

  const getEffectivePriceInCurrentCurrency = (basePriceUSD: number) => {
    const surge = themeConfig.seasonalSurgeMultiplier || 1.0;
    const priceUSD = basePriceUSD * surge;
    return convertPrice(priceUSD, currentCurrency, themeConfig.exchangeRates);
  };

  const handleOpenDetail = (room: Room) => {
    setDetailModalRoom(room);
    setActiveImageIndex(0);
  };

  return (
    <section id="rooms" className="py-20 bg-stone-50 dark:bg-stone-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
              Sanctuary & Comfort
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight text-balance">
              Rooms & Suites in Kamalpokhari
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Every room at Kamal Hotel combines traditional Newari carved woodwork with modern boutique luxury, solar-warmed showers, and quiet Kathmandu courtyard views.
            </p>
          </div>

          {/* Current Currency Indicator */}
          <div className="flex items-center gap-2 text-xs bg-white dark:bg-stone-900 px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm shrink-0">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="text-stone-500">Live Rates:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {currentCurrency === 'NPR' ? 'Nepali Rupees (रू NPR)' : currentCurrency === 'INR' ? 'Indian Rupees (₹ INR)' : 'US Dollars ($ USD)'}
            </span>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-stone-200 dark:border-stone-800">
          {[
            { id: 'all', label: 'All Accommodations' },
            { id: 'deluxe', label: 'Deluxe Heritage View' },
            { id: 'executive-suite', label: 'Executive Suites' },
            { id: 'super-deluxe', label: 'Family Veranda' },
            { id: 'standard-cozy', label: 'Cozy Budget Retreat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredRooms.map((room) => {
            const price = getEffectivePriceInCurrentCurrency(room.pricePerNightUSD);
            const original = room.originalPriceUSD ? getEffectivePriceInCurrentCurrency(room.originalPriceUSD) : null;
            const mainImg = room.images[0] || heroFallbackImg;

            return (
              <div
                key={room.id}
                className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col transition-all hover:shadow-lg"
              >
                {/* Visual Area */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                  <img
                    src={mainImg}
                    alt={room.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Availability Notice */}
                  <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-md text-stone-200 text-xs px-3 py-1 rounded font-medium flex items-center gap-1.5 border border-stone-700/50">
                    <span className={`w-2 h-2 rounded-full ${room.availableUnits > 2 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>
                      {room.availableUnits > 0
                        ? `${room.availableUnits} of ${room.totalUnits} available in Kathmandu`
                        : 'Fully Booked for selected dates'}
                    </span>
                  </div>

                  {/* Quick Photo Preview trigger */}
                  <button
                    onClick={() => handleOpenDetail(room)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-900 text-xs px-2.5 py-1 rounded font-medium shadow-md transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Gallery ({room.images.length})</span>
                  </button>

                  {/* Room Name overlay in photo bottom */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
                      <span>{room.view}</span>
                      <span>·</span>
                      <span>{room.floor}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                      {room.name}
                    </h3>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-stone-400" />
                      {room.bedType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                      {room.sizeSqFt} sq.ft
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      Max {room.maxGuests} {room.maxGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {room.rating} ({room.reviewsCount})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                    {room.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
                    {room.amenities.slice(0, 4).map((amenity, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing and Action Strip */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-50 tabular-nums">
                          {formatCurrency(price, currentCurrency)}
                        </span>
                        {original && (
                          <span className="text-xs text-stone-400 line-through tabular-nums">
                            {formatCurrency(original, currentCurrency)}
                          </span>
                        )}
                        <span className="text-xs text-stone-500 dark:text-stone-400">/ night</span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        +{themeConfig.taxRatePercent}% VAT & service charge
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(room)}
                        className="px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors whitespace-nowrap"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openBookingModal(room)}
                        disabled={room.availableUnits <= 0}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded shadow transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          room.availableUnits > 0
                            ? themeClasses.primary
                            : 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        <span>{room.availableUnits > 0 ? 'Reserve Room' : 'Sold Out'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Fallback */}
        {filteredRooms.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">No accommodations match your filter criteria</h3>
            <p className="mt-1 text-xs text-stone-500">Please choose a different capacity or room category.</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Room Detail & Photo Gallery Modal */}
      {detailModalRoom && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Room Specification
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  {detailModalRoom.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalRoom(null)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={detailModalRoom.images[activeImageIndex] || detailModalRoom.images[0]}
                  alt={detailModalRoom.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded font-mono">
                  {activeImageIndex + 1} of {detailModalRoom.images.length}
                </div>
              </div>

              {detailModalRoom.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {detailModalRoom.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-600 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-stone-100 dark:border-stone-800 text-xs">
                <div>
                  <div className="text-stone-400">Bedding</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{detailModalRoom.bedType}</div>
                </div>
                <div>
                  <div className="text-stone-400">Room Area</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{detailModalRoom.sizeSqFt} sq.ft</div>
                </div>
                <div>
                  <div className="text-stone-400">Outlook</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{detailModalRoom.view}</div>
                </div>
                <div>
                  <div className="text-stone-400">Location</div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{detailModalRoom.floor}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">About this Accommodation</h4>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {detailModalRoom.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Included Amenities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                  {detailModalRoom.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4 border-t border-stone-200 dark:border-stone-800">
                <div>
                  <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tabular-nums">
                    {formatCurrency(getEffectivePriceInCurrentCurrency(detailModalRoom.pricePerNightUSD), currentCurrency)}
                  </span>
                  <span className="text-xs text-stone-500"> / night</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailModalRoom(null)}
                    className="px-4 py-2 text-xs font-medium rounded border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const roomToBook = detailModalRoom;
                      setDetailModalRoom(null);
                      openBookingModal(roomToBook);
                    }}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded ${themeClasses.primary}`}
                  >
                    Proceed to Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
