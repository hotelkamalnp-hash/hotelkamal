import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { getThemeClasses } from '../utils/theme';
import { 
  Utensils, 
  Wifi, 
  Clock, 
  Car, 
  Sun, 
  Sparkles, 
  Coffee, 
  ShieldCheck, 
  BellRing, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import rooftopImg from '../assets/images/amenity_rooftop_dining_1793848735329.jpg';

export const AmenitiesSection: React.FC = () => {
  const { amenities, themeConfig, showToast } = useHotel();
  const [vipRegistered, setVipRegistered] = useState(false);
  const [vipEmail, setVipEmail] = useState('');

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Icon mapping
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Sun':
        return <Sun className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  const handleVipRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail) return;
    setVipRegistered(true);
    showToast(
      'Priority Invitation Saved!',
      `Thank you! You will receive an exclusive preview invitation to the Rooftop Dining opening at ${vipEmail}`,
      'success'
    );
  };

  return (
    <section id="amenities" className="py-24 bg-stone-100/70 dark:bg-stone-900/60 border-y border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
            Thoughtful Boutique Hospitality
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight text-balance">
            Real-Time Facilities & Rooftop Experience
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            From uninterrupted optical fiber Wi-Fi powered by solar backup in Kamalpokhari to our upcoming rooftop dining sanctuary overlooking the Kathmandu skyline.
          </p>
        </div>

        {/* Hero Spotlight: Rooftop Garden Dining (OPENING SOON) */}
        <div id="dining" className="mb-16 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[340px]">
            <img
              src={themeConfig.rooftopDiningImage || rooftopImg}
              alt="Rooftop Mountain Dining at Kamal Hotel Kathmandu"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950/85 via-stone-950/40 to-transparent pointer-events-none" />
            
            {/* Dynamic Status Tag */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                <span>{themeConfig.rooftopDiningStatus === 'opening_soon' ? 'OPENING SOON' : 'NOW OPEN'}</span>
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <div className="text-xs font-mono text-amber-300 uppercase tracking-widest">
                {themeConfig.rooftopOpeningDateText}
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Rooftop Garden Dining & Lounge
              </h3>
              <p className="text-xs text-stone-300">
                Kamal Hotel, Kamalpokhari, Kathmandu
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded border border-amber-200/50 dark:border-amber-900/40">
                <Utensils className="w-3.5 h-3.5" />
                <span>{themeConfig.rooftopOpeningDateText}</span>
              </div>
              
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {themeConfig.rooftopTeaserHeadline}
              </h4>
              
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {themeConfig.rooftopTeaserDescription}
              </p>

              <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Fresh Himalayan highland single-origin espresso and organic teas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Artisan Newari Samay Baji & Thakali set specialty dinners</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Sunset lounge terrace overlooking Kamalpokhari and Swayambhu skyline</span>
                </div>
              </div>
            </div>

            {/* VIP Opening Preview Waitlist */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Receive Opening Invitation & Tasting Menu:
              </span>
              {vipRegistered ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>You are on the VIP Preview list! We look forward to hosting you soon.</span>
                </div>
              ) : (
                <form onSubmit={handleVipRegister} className="flex gap-2">
                  <input
                    type="email"
                    value={vipEmail}
                    onChange={(e) => setVipEmail(e.target.value)}
                    placeholder="Enter email for VIP invite"
                    className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                    required
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 text-xs font-semibold rounded whitespace-nowrap ${themeClasses.primary}`}
                  >
                    Notify Me
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Amenities Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  {renderIcon(amenity.iconName)}
                </div>
                <div>
                  <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                    {amenity.category}
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mt-1">
                    {amenity.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {amenity.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-400 font-mono flex items-center justify-between">
                <span>Kamalpokhari Hotel Amenity</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Included in Stay</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
