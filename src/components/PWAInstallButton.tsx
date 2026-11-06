import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, Share2 } from 'lucide-react';
import { ModalDismissButton, useModalDismiss } from './Common/ModalDismissHandler';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'compact' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // Hook-safe modal dismissal bindings
  useModalDismiss(showIOSGuide, () => setShowIOSGuide(false));
  useModalDismiss(showGeneralGuide, () => setShowGeneralGuide(false));

  // If already running in standalone PWA mode, hide
  if (isInstalled) {
    return null;
  }

  // Standard Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={className || `px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all active:scale-95`}
        title="Install Kamal Hotel as a native app on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{variant === 'full' ? 'Install Kamal Hotel App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={className || `px-2.5 py-1.5 rounded-lg border border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium text-xs flex items-center gap-1.5 transition-all`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div 
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 space-y-4 text-xs animate-fade-in relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 pr-8">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-serif font-bold text-sm">Install Kamal Hotel on iOS</h3>
                </div>
              </div>
              <ModalDismissButton onClick={() => setShowIOSGuide(false)} label="Close iOS Guide" />

              <div className="space-y-3 text-stone-600 dark:text-stone-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    1
                  </div>
                  <p>
                    In Safari, tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-amber-600" /> at the bottom or top toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    2
                  </div>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    3
                  </div>
                  <p>
                    Tap <strong>Add</strong> in the top right. Kamal Hotel will now launch as a standalone high-speed mobile app with offline capability!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback modal for general browsers
  return (
    <>
      <button
        type="button"
        onClick={() => setShowGeneralGuide(true)}
        className={className || `px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-amber-600/50 text-stone-700 dark:text-stone-300 font-medium text-xs flex items-center gap-1.5 transition-all`}
        title="Install as high-speed mobile web app"
      >
        <Download className="w-3.5 h-3.5 text-amber-600" />
        <span>Install App</span>
      </button>

      {showGeneralGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4"
          onClick={() => setShowGeneralGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 space-y-4 text-xs animate-fade-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 pr-8">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-sm">Install Kamal Hotel App</h3>
              </div>
            </div>
            <ModalDismissButton onClick={() => setShowGeneralGuide(false)} label="Close Installation Guide" />

            <div className="space-y-3 text-stone-600 dark:text-stone-300">
              <p>You can install this hotel management system directly onto your device home screen:</p>
              <ul className="list-disc pl-4 space-y-1.5 font-sans">
                <li><strong>Chrome / Edge (Desktop)</strong>: Look for the install icon <Download className="w-3 h-3 inline mx-0.5 text-amber-600" /> in the browser address bar.</li>
                <li><strong>Android (Chrome)</strong>: Tap the three dots menu ⋮ &rarr; select <em>&quot;Install app&quot;</em> or <em>&quot;Add to Home Screen&quot;</em>.</li>
                <li><strong>iPhone / iPad (Safari)</strong>: Tap Share <Share2 className="w-3 h-3 inline mx-0.5 text-amber-600" /> &rarr; select <em>&quot;Add to Home Screen&quot;</em>.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowGeneralGuide(false)}
              className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
