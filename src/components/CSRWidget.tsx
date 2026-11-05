import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { CSRChatMessage } from '../types/hotel';
import { 
  MessageSquare, 
  X, 
  Send, 
  PhoneCall, 
  Sparkles, 
  Clock, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const INITIAL_MESSAGES: CSRChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'concierge',
    text: 'Namaste! Welcome to Kamal Hotel. I am Aayush from our front office team. How may I assist your stay or reservation today?',
    time: 'Just now',
  },
];

export const CSRWidget: React.FC = () => {
  const { themeConfig, bookings } = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CSRChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: CSRChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'guest',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Automated Concierge Bot / CSR Responses
    setTimeout(() => {
      let replyText = 'Thank you for your message! Our front desk concierge is on standby. You can also reach us directly at ' + themeConfig.contactPhone + '.';
      const lower = text.toLowerCase();

      if (lower.includes('breakfast') || lower.includes('food') || lower.includes('dining')) {
        replyText = 'Our Rooftop Mountain Garden Restaurant serves daily breakfast from 06:30 AM to 10:30 AM. Fresh Himalayan organic coffee and hot buffet dishes are complimentary for direct website bookings!';
      } else if (lower.includes('airport') || lower.includes('pickup') || lower.includes('shuttle') || lower.includes('flight')) {
        replyText = 'Yes! We offer private sedan airport transfers for $18. Simply add it during checkout or message us your flight arrival number and our driver will wait with a Kamal Hotel namecard.';
      } else if (lower.includes('check-in') || lower.includes('checkout') || lower.includes('time')) {
        replyText = `Standard check-in is at ${themeConfig.checkInTime} and check-out is at ${themeConfig.checkOutTime}. We also provide complimentary luggage storage if you arrive early or go trekking!`;
      } else if (lower.includes('ref') || lower.includes('kh-') || lower.includes('booking') || lower.includes('reservation')) {
        replyText = `To look up your reservation, check your email for the KH-2026-XXXX booking voucher. Our reception desk is also available 24/7 to re-dispatch your SMS confirmation.`;
      } else if (lower.includes('wifi') || lower.includes('internet')) {
        replyText = 'We provide dedicated dual-band fiber optic Wi-Fi (150+ Mbps) throughout all rooms and rooftop terraces with 100% solar backup continuity.';
      }

      const botMsg: CSRChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'concierge',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleWhatsAppRedirect = () => {
    const cleanNumber = themeConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hello Kamal Hotel, I have an inquiry regarding room booking and amenities.')}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 border border-stone-700/50"
          aria-label="Open Concierge Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-amber-400 dark:text-amber-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Concierge & WhatsApp</span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[520px] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 font-serif font-bold text-sm">
                KH
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-serif leading-tight">Kamal Hotel Concierge</h4>
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <span>Front Desk Active</span>
                  <span>·</span>
                  <span>Avg reply: &lt; 1 min</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleWhatsAppRedirect}
                className="p-1.5 text-stone-300 hover:text-emerald-400 rounded transition-colors"
                title="Direct WhatsApp"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Action Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">
              Prefer WhatsApp messaging?
            </span>
            <button
              onClick={handleWhatsAppRedirect}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Connect on WA</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/60 dark:bg-stone-950/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'guest' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-xl leading-relaxed ${
                    m.sender === 'guest'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-br-none'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none border border-stone-200/80 dark:border-stone-700 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 px-3 py-2 rounded-xl w-16 border border-stone-200 dark:border-stone-700">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse delay-300" />
              </div>
            )}
          </div>

          {/* Preset Inquiries Suggestions */}
          <div className="px-3 py-2 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSendMessage('What are rooftop breakfast hours?')}
              className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
            >
              🍳 Breakfast Hours
            </button>
            <button
              onClick={() => handleSendMessage('How does airport pickup work?')}
              className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
            >
              🚗 Airport Pickup
            </button>
            <button
              onClick={() => handleSendMessage('Check-in policy?')}
              className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
            >
              🕒 Check-in Times
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about rooms or stay..."
              className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
