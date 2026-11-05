import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { CSRChatMessage } from '../../types/hotel';
import { getThemeClasses } from '../../utils/theme';
import { 
  MessageSquare, 
  Send, 
  PhoneCall, 
  PhoneOff, 
  UserCheck, 
  DoorClosed, 
  Sparkles, 
  Clock, 
  CheckCheck, 
  Utensils, 
  ShieldAlert,
  Search,
  Bell,
  Volume2
} from 'lucide-react';

export const StaffGuestIntercom: React.FC = () => {
  const { 
    guestChatMessages, 
    sendStaffReplyMessage, 
    guestSessions, 
    activeUser, 
    activeRole, 
    themeConfig, 
    isVoipCallActive, 
    activeVoipTarget, 
    startVoipCall, 
    endVoipCall,
    showToast 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Active room selected in staff chat
  const [selectedRoom, setSelectedRoom] = useState<string>('Room 302');
  const [replyText, setReplyText] = useState<string>('');
  const [roomFilterSearch, setRoomFilterSearch] = useState<string>('');

  // Extract unique active room numbers from guest sessions + chat messages
  const sessionRooms = guestSessions.filter((s) => s.isActive).map((s) => s.roomNumber);
  const chatRooms = Array.from(new Set(guestChatMessages.map((m) => m.roomNumber).filter(Boolean))) as string[];
  const allRooms = Array.from(new Set([...sessionRooms, ...chatRooms, 'Room 302', 'Room 305', 'Room 401', 'Room 204']));

  const filteredRoomList = allRooms.filter((r) => 
    r.toLowerCase().includes(roomFilterSearch.toLowerCase())
  );

  // Messages for the currently selected room
  const currentRoomMessages = guestChatMessages.filter(
    (m) => m.roomNumber?.toLowerCase() === selectedRoom.toLowerCase()
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendStaffReplyMessage(replyText.trim(), selectedRoom);
    setReplyText('');
  };

  const handleQuickReply = (text: string) => {
    sendStaffReplyMessage(text, selectedRoom);
  };

  // Find guest details for current room
  const currentSession = guestSessions.find(
    (s) => s.roomNumber.toLowerCase() === selectedRoom.toLowerCase() && s.isActive
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Staff Operations Console
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Two-Way Intercom Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mt-1">
              Guest Intercom & Live Service Dispatch
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Direct communication hub between in-house guests and Reception, Head Chef, Waitstaff, and Housekeeping.
            </p>
          </div>

          {/* VoIP SIP Intercom Status */}
          <div className="flex items-center gap-2">
            {isVoipCallActive ? (
              <button
                onClick={endVoipCall}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse shadow-md transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call ({activeVoipTarget})</span>
              </button>
            ) : (
              <button
                onClick={() => startVoipCall(selectedRoom)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {selectedRoom} (VoIP SIP)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden min-h-[560px]">
        
        {/* Left Column: Room Directory & Active In-House Guests (4 cols) */}
        <div className="lg:col-span-4 border-r border-stone-200 dark:border-stone-800 flex flex-col bg-stone-50/50 dark:bg-stone-950/30">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                In-House Rooms
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                {allRooms.length} Active Keycards
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Room (e.g. 302)..."
                value={roomFilterSearch}
                onChange={(e) => setRoomFilterSearch(e.target.value)}
                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Room List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
            {filteredRoomList.map((room) => {
              const session = guestSessions.find(
                (s) => s.roomNumber.toLowerCase() === room.toLowerCase() && s.isActive
              );
              const roomMsgs = guestChatMessages.filter(
                (m) => m.roomNumber?.toLowerCase() === room.toLowerCase()
              );
              const lastMsg = roomMsgs[roomMsgs.length - 1];
              const isSelected = selectedRoom.toLowerCase() === room.toLowerCase();

              return (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-600'
                      : 'hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}>
                    {room.replace(/[^0-9]/g, '') || 'RM'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {room}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          {lastMsg.time}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500 truncate mt-0.5">
                      {session ? session.guestName : 'Occupied Guest'}
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate mt-1">
                        {lastMsg.sender === 'guest' ? 'Guest: ' : 'Staff: '}
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Intercom Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[560px]">
          
          {/* Header of Active Chat Window */}
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold font-serif text-sm">
                {selectedRoom.replace(/[^0-9]/g, '')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {selectedRoom}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    Live Channel
                  </span>
                </div>
                <div className="text-xs text-stone-500">
                  {currentSession ? `Guest: ${currentSession.guestName} (Stay: ${currentSession.checkInDate} to ${currentSession.checkOutDate})` : 'In-House Registered Guest'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startVoipCall(selectedRoom)}
                className="p-2 text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                title="Initiate VoIP Voice Call"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Staff Response Chips */}
          <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-950/20 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-stone-400 uppercase font-mono text-[10px] shrink-0 mr-1">Quick Reply:</span>
            {[
              'On our way right now!',
              'Housekeeping dispatched to your room.',
              'Kitchen has received your order & is preparing.',
              'Fresh towels and amenities sent.',
              'Front desk acknowledged, assistance coming.',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleQuickReply(chip)}
                className="px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-600 text-stone-700 dark:text-stone-300 hover:text-amber-800 whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-100/40 dark:bg-stone-950/40">
            {currentRoomMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                <MessageSquare className="w-8 h-8 opacity-40 text-amber-600" />
                <p className="text-xs">No messages yet with {selectedRoom}.</p>
                <p className="text-[11px] text-stone-400">
                  Send a welcome message or answer guest requests here.
                </p>
              </div>
            ) : (
              currentRoomMessages.map((msg) => {
                const isFromGuest = msg.sender === 'guest';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isFromGuest ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-1 px-1 font-mono">
                      <span>{isFromGuest ? (msg.guestName || selectedRoom) : `${msg.guestName || 'Front Desk'} (${activeRole.replace('_', ' ')})`}</span>
                      <span>·</span>
                      <span>{msg.time}</span>
                      {msg.serviceTag && (
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {msg.serviceTag.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isFromGuest
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-xs border border-stone-200 dark:border-stone-700'
                          : 'bg-amber-800 text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input Form */}
          <form
            onSubmit={handleSendReply}
            className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Reply to ${selectedRoom} as ${activeUser?.name || 'Staff'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />

            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`p-2 rounded-lg text-white font-semibold transition cursor-pointer disabled:opacity-40 ${themeClasses.primary}`}
              title="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
