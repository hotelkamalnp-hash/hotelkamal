import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { getThemeClasses } from '../utils/theme';
import { StaffRole } from '../types/hotel';
import { 
  Lock, 
  User, 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Database,
  Briefcase,
  Building2,
  Utensils,
  Coffee,
  Check
} from 'lucide-react';

interface StaffLoginModalProps {
  onSuccess?: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ onSuccess }) => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginStaff, 
    loginModalTargetRole,
    themeConfig,
    staff 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [usernameOrEmail, setUsernameOrEmail] = useState('superadmin');
  const [password, setPassword] = useState('KamalHotel@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Preset role credentials
  const demoAccounts: { role: StaffRole; label: string; user: string; pass: string; icon: React.ReactNode }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin',
      user: 'superadmin',
      pass: 'KamalHotel@2026',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />,
    },
    {
      role: 'hotel_manager',
      label: 'Hotel Manager',
      user: 'manager',
      pass: 'Manager@2026',
      icon: <Briefcase className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      role: 'receptionist',
      label: 'Receptionist',
      user: 'receptionist',
      pass: 'Reception@2026',
      icon: <Building2 className="w-3.5 h-3.5 text-sky-600" />,
    },
    {
      role: 'chef',
      label: 'Head Chef',
      user: 'chef',
      pass: 'Chef@2026',
      icon: <Utensils className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      role: 'waiter',
      label: 'Service / Waiter',
      user: 'waiter',
      pass: 'Waiter@2026',
      icon: <Coffee className="w-3.5 h-3.5 text-indigo-600" />,
    },
    {
      role: 'housekeeping',
      label: 'Housekeeping',
      user: 'housekeeping',
      pass: 'Clean@2026',
      icon: <Check className="w-3.5 h-3.5 text-stone-600" />,
    },
  ];

  // If a specific role was requested when opening the modal, pre-fill that role's credentials
  useEffect(() => {
    if (loginModalTargetRole) {
      const target = demoAccounts.find((a) => a.role === loginModalTargetRole);
      if (target) {
        setUsernameOrEmail(target.user);
        setPassword(target.pass);
      }
    } else {
      setUsernameOrEmail('superadmin');
      setPassword('KamalHotel@2026');
    }
    setErrorMessage('');
  }, [loginModalTargetRole, isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await loginStaff(usernameOrEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      closeLoginModal();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSelectDemo = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-stone-100/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                Kamal Hotel Staff Portal
              </h3>
              <div className="text-[11px] text-stone-500 font-mono">
                Kamalpokhari, Kathmandu · Role Access
              </div>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase status pill */}
        {themeConfig.supabaseConnected && (
          <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Cloud Auth & DB Active</span>
            </span>
            <span className="font-mono text-[10px]">Cloud Synced</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Username or Official Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. superadmin or hotelkamal.np@gmail.com"
                required
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md pl-9 pr-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Staff Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md pl-9 pr-10 py-2 text-xs font-mono font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Credential Autofill Chips */}
          <div className="pt-2">
            <span className="block text-[11px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wider font-mono">
              Quick Test Credentials (Click to auto-fill):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc.user, acc.pass)}
                  className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                    usernameOrEmail === acc.user
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="shrink-0">{acc.icon}</div>
                  <div className="truncate">
                    <div className="text-[11px] font-medium leading-tight">{acc.label}</div>
                    <div className="text-[10px] text-stone-400 font-mono truncate">{acc.user}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-wait' : themeClasses.primary
              }`}
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Kamal Hotel RBAC Security</span>
          <span className="font-mono text-[10px]">Session: Encrypted</span>
        </div>

      </div>
    </div>
  );
};
