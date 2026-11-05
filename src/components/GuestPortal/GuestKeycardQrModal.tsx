import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { GuestRoomSession } from '../../types/hotel';
import { 
  X, 
  Printer, 
  QrCode as QrIcon, 
  Key, 
  Wifi, 
  Phone, 
  Utensils, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Copy
} from 'lucide-react';

interface GuestKeycardQrModalProps {
  session: GuestRoomSession;
  onClose: () => void;
}

export const GuestKeycardQrModal: React.FC<GuestKeycardQrModalProps> = ({ session, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Generate guest direct login URL
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(session.roomNumber)}&pin=${encodeURIComponent(session.passcode)}#in-room-portal`
    : `https://kamalhotel.np/?room=${encodeURIComponent(session.roomNumber)}&pin=${encodeURIComponent(session.passcode)}#in-room-portal`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        portalUrl,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#1c1917', // stone-900
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code generation failed:', error);
        }
      );
    }
  }, [portalUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-4">
        
        {/* Top Control Header (hidden in print) */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-50">
                Guest Room Keycard & Login QR
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {session.roomNumber} · {session.guestName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow hover:opacity-90 transition-opacity"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Keycard Slip */}
        <div className="p-6 sm:p-8 bg-white text-stone-900 space-y-6">
          
          {/* Slip border & header */}
          <div className="border-2 border-dashed border-stone-300 p-6 rounded-2xl space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-stone-50/40">
            
            {/* Hotel Brand Header */}
            <div className="text-center border-b border-stone-200 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-serif text-xl font-bold tracking-tight text-amber-950 uppercase">
                  Kamal Hotel
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                  3-STAR BOUTIQUE
                </span>
              </div>
              <p className="text-[11px] text-stone-500">Kamalpokhari Marg, Kathmandu 44600, Nepal</p>
              <p className="text-[10px] font-mono text-stone-400 mt-0.5">Front Desk: +977-1-4523678 / Ext 100</p>
            </div>

            {/* Room & Guest Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Assigned Room</span>
                <span className="font-serif font-bold text-lg text-stone-900">{session.roomNumber}</span>
              </div>
              <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Guest Name</span>
                <span className="font-semibold text-stone-900 truncate block">{session.guestName}</span>
                <span className="text-[10px] font-mono text-stone-400">Ref: {session.bookingCode}</span>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-stone-50 rounded-lg border border-stone-200 font-mono text-[11px]">
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">Check-In</span>
                <span className="font-bold text-stone-800">{session.checkInDate}</span>
              </div>
              <div className="text-stone-400">&rarr;</div>
              <div className="text-right">
                <span className="text-stone-400 block text-[9px] uppercase">Check-Out</span>
                <span className="font-bold text-stone-800">{session.checkOutDate}</span>
              </div>
            </div>

            {/* QR Code and PIN Block */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2 border-y border-stone-200">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-sm">
                  <canvas ref={canvasRef} className="rounded" />
                </div>
                <span className="text-[10px] font-mono text-stone-500 mt-1.5 flex items-center gap-1">
                  <QrIcon className="w-3 h-3 text-amber-600" />
                  <span>Scan with Phone Camera</span>
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start space-y-3 text-center sm:text-left">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block">
                    In-Room Portal PIN
                  </span>
                  <div className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-xl bg-amber-500 text-stone-950 font-mono font-bold text-2xl tracking-widest shadow-sm">
                    <Key className="w-5 h-5 text-stone-900" />
                    <span>{session.passcode}</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 space-y-1">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Utensils className="w-3.5 h-3.5 text-amber-700" />
                    <span>Order Room Dining & Rooftop Grill</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span>VoIP Audio Intercom to Reception</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Housekeeping & Live Bill Folio</span>
                  </p>
                </div>
              </div>
            </div>

            {/* In-Room High-Speed WiFi Credentials */}
            <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Wifi className="w-4 h-4" />
                <span>Complimentary High-Speed Hotel Wi-Fi</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-stone-800">
                <span className="text-stone-400">Network (SSID):</span>
                <span className="font-bold text-white">KamalHotel_Guest_5G</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-400">Password:</span>
                <span className="font-bold text-amber-300">kamalpokhari#2025</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center text-[10px] text-stone-400 font-mono">
              * Note: For your security, this passkey and session data automatically expire and reset upon formal checkout.
            </div>

          </div>

          {/* Quick Actions (hidden in print) */}
          <div className="flex items-center justify-between gap-3 pt-2 print:hidden">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Portal URL'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Keycard Holder Slip</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
