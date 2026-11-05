import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { GuestRoomSession } from '../../types/hotel';
import { getThemeClasses } from '../../utils/theme';
import { 
  Key, 
  DoorClosed, 
  UserCheck, 
  RefreshCw, 
  LogOut, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const GuestPasscodeSessionManager: React.FC = () => {
  const { 
    guestSessions, 
    generateNewRoomPasscode, 
    checkoutAndResetRoomPasscode,
    bookings,
    themeConfig 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [selectedBookingForPasscode, setSelectedBookingForPasscode] = useState(bookings[0]?.id || '');
  const [customRoom, setCustomRoom] = useState('Room 302');
  const [customGuest, setCustomGuest] = useState('Eleanor Vance');

  const handleCreatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const bk = bookings.find((b) => b.id === selectedBookingForPasscode);
    const roomName = bk ? `Room ${bk.roomTypeId.replace('room-', '30')}` : customRoom;
    const guestName = bk ? bk.guestName : customGuest;
    const bkCode = bk ? bk.bookingCode : 'WALKIN-KEY';

    generateNewRoomPasscode(roomName, bkCode, guestName);
  };

  return (
    <div className="space-y-6 text-xs">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
            In-House Guest Digital Key & Room Portal Passcodes
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Room Number + Dynamic Passcode Access
          </h3>
          <p className="text-stone-500">
            Each checked-in guest receives a dynamic 4-digit PIN for direct in-room dining orders, intercom chat, and checkout. Passcodes automatically expire and purge upon checkout.
          </p>
        </div>
      </div>

      {/* Generate New Passcode Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-600" />
          <span>Issue New Room Passcode for Arriving / Checked-In Guest</span>
        </h4>

        <form onSubmit={handleCreatePasscode} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block font-semibold mb-1">Select Active Reservation</label>
            <select
              value={selectedBookingForPasscode}
              onChange={(e) => {
                setSelectedBookingForPasscode(e.target.value);
                const found = bookings.find((b) => b.id === e.target.value);
                if (found) {
                  setCustomGuest(found.guestName);
                  setCustomRoom(`Room ${found.roomTypeId.replace('room-', '30')}`);
                }
              }}
              className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingCode} · {b.guestName} ({b.roomName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Assigned Room Number</label>
            <input
              type="text"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              required
              className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-semibold shadow ${themeClasses.primary} flex items-center justify-center gap-1.5`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Dynamic Passcode</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Guest Passcodes Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider font-mono border-b">
              <tr>
                <th className="py-3 px-4">Room & Guest</th>
                <th className="py-3 px-3">Dynamic Passcode</th>
                <th className="py-3 px-3">Stay Dates</th>
                <th className="py-3 px-3">Session Status</th>
                <th className="py-3 px-4 text-right">Checkout Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {guestSessions.map((session, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {session.roomNumber}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Guest: <span className="font-bold text-stone-700 dark:text-stone-300">{session.guestName}</span> · Ref: {session.bookingCode}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-600/30 text-amber-900 dark:text-amber-200 font-mono font-bold text-sm tracking-widest">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>{session.passcode}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div>{session.checkInDate} &rarr; {session.checkOutDate}</div>
                    <div className="text-stone-400">Created: {session.createdAt}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      session.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}>
                      {session.isActive ? '● ACTIVE IN-HOUSE' : 'EXPIRED (CHECKED-OUT)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {session.isActive ? (
                      <button
                        onClick={() => checkoutAndResetRoomPasscode(session.roomNumber)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors ml-auto"
                        title="Checkout guest and reset passcode"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Checkout & Reset Passcode</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-mono">Purged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
