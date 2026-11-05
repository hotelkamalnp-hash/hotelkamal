import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { MenuItem, MenuItemCategory, RestaurantOrder, CSRChatMessage } from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { 
  Key, 
  DoorClosed, 
  Utensils, 
  PhoneCall, 
  MessageSquare, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  LogOut, 
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Leaf,
  Flame,
  Star,
  Mic,
  MicOff,
  PhoneOff
} from 'lucide-react';

export const InRoomGuestPortal: React.FC = () => {
  const { 
    activeGuestSession, 
    loginGuestByRoom, 
    logoutGuestSession,
    menuItems,
    placeRestaurantOrder,
    restaurantOrders,
    guestChatMessages,
    sendGuestServiceMessage,
    isVoipCallActive,
    activeVoipTarget,
    startVoipCall,
    endVoipCall,
    themeConfig,
    currentCurrency,
    invoices
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  // Login form state
  const [inputRoom, setInputRoom] = useState('Room 302');
  const [inputPasscode, setInputPasscode] = useState('4829');
  const [loginError, setLoginError] = useState('');

  // Active in-portal tab
  const [activeTab, setActiveTab] = useState<'dining' | 'intercom' | 'orders' | 'bill'>('dining');

  // Dining cart
  const [diningCart, setDiningCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [specialNote, setSpecialNote] = useState('');

  // Chat message input
  const [chatInput, setChatInput] = useState('');
  const [selectedServiceTag, setSelectedServiceTag] = useState<'room_service' | 'housekeeping' | 'concierge' | 'front_desk'>('concierge');

  // Handle guest login
  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginGuestByRoom(inputRoom, inputPasscode);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setDiningCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateCart = (itemId: string, delta: number) => {
    setDiningCart((prev) =>
      prev.map((c) => {
        if (c.item.id === itemId) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter(Boolean) as { item: MenuItem; quantity: number }[]
    );
  };

  const cartSubtotal = diningCart.reduce((acc, c) => acc + (c.item.priceUSD * c.quantity), 0);
  const cartServiceCharge = cartSubtotal * 0.10;
  const cartTax = (cartSubtotal + cartServiceCharge) * 0.13;
  const cartGrandTotal = cartSubtotal + cartServiceCharge + cartTax;

  const handleSendOrder = () => {
    if (diningCart.length === 0 || !activeGuestSession) return;

    placeRestaurantOrder({
      roomNumber: activeGuestSession.roomNumber,
      tableOrRoomNo: activeGuestSession.roomNumber,
      guestName: activeGuestSession.guestName,
      destination: 'room',
      items: diningCart.map((c) => ({
        menuItemId: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        unitPriceUSD: c.item.priceUSD,
        specialInstructions: specialNote,
      })),
      subtotalUSD: cartSubtotal,
      taxUSD: cartTax,
      serviceChargeUSD: cartServiceCharge,
      totalAmountUSD: cartGrandTotal,
      paymentMode: 'charge_to_room',
      kitchenNotes: specialNote,
    });

    setDiningCart([]);
    setSpecialNote('');
    setActiveTab('orders');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendGuestServiceMessage(chatInput.trim(), selectedServiceTag);
    setChatInput('');
  };

  const myOrders = restaurantOrders.filter(
    (o) => o.tableOrRoomNo.toLowerCase() === activeGuestSession?.roomNumber.toLowerCase()
  );

  // If NOT logged in as a guest, display the login gate
  if (!activeGuestSession) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xl text-xs space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
              In-Room Guest Digital Concierge
            </h2>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Log in with your assigned room number and the 4-digit stay passcode provided on your keycard envelope.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Room Number</label>
              <input
                type="text"
                placeholder="e.g. Room 302"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border font-mono text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">4-Digit Stay Passcode (PIN)</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border font-mono text-center text-lg tracking-widest text-stone-900 dark:text-stone-100"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                Dynamic passcode changes with every guest check-in and resets on checkout.
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold uppercase tracking-wider text-xs shadow-md transition-all ${themeClasses.primary}`}
            >
              Access My Room Services
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 block uppercase font-mono mb-2">Quick Test Check-Ins:</span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputRoom('Room 302');
                  setInputPasscode('4829');
                }}
                className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-[11px] hover:bg-amber-100 font-mono text-amber-800 dark:text-amber-300"
              >
                Room 302 (PIN 4829)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputRoom('Room 205');
                  setInputPasscode('6312');
                }}
                className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-[11px] hover:bg-amber-100 font-mono text-amber-800 dark:text-amber-300"
              >
                Room 205 (PIN 6312)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED-IN IN-HOUSE GUEST INTERFACE
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Active Guest Banner */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50">
                {activeGuestSession.roomNumber} · {activeGuestSession.guestName}
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                PASSCODE: {activeGuestSession.passcode}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Reservation: {activeGuestSession.bookingCode} · Checkout: {activeGuestSession.checkOutDate} at 12:00 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startVoipCall('Reception Desk')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>VoIP Intercom to Reception</span>
          </button>

          <button
            onClick={logoutGuestSession}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1 text-stone-600 dark:text-stone-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* VoIP Call Bar (If connected) */}
      {isVoipCallActive && (
        <div className="p-4 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-700 shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-800">
              <PhoneCall className="w-5 h-5 text-emerald-200 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-sm">VoIP Intercom Call Live with {activeVoipTarget}</div>
              <div className="text-[11px] text-emerald-300 font-mono">
                Kamal Hotel In-House High-Definition Audio Link (Zero Call Charges)
              </div>
            </div>
          </div>

          <button
            onClick={endVoipCall}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dining')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'dining' ? 'bg-amber-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Order Room Dining</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders' ? 'bg-amber-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bill')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'bill' ? 'bg-amber-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Live Room Bill & Folio</span>
        </button>

        <button
          onClick={() => setActiveTab('intercom')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'intercom' ? 'bg-amber-800 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Reception & Waiter Chat</span>
        </button>
      </div>

      {/* ===================== TAB 1: ORDER DINING ===================== */}
      {activeTab === 'dining' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Menu Catalog (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {dish.name}
                      </h4>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                        {formatCurrency(convertPrice(dish.priceUSD, currentCurrency), currentCurrency)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{dish.description}</p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 font-mono">
                      {dish.isVegetarian && <span className="text-emerald-600 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Veg</span>}
                      {dish.isSpicy && <span className="text-rose-600 flex items-center gap-0.5"><Flame className="w-3 h-3" /> Spicy</span>}
                      {dish.isChefSpecial && <span className="text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3" /> Chef Pick</span>}
                      <span>· {dish.preparationTimeMinutes} min prep</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="mt-3 w-full py-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-800 hover:text-white dark:hover:bg-amber-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Room Order</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Room Service Tray / Cart */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-xs h-fit sticky top-24">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50 border-b pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Room Service Tray ({activeGuestSession.roomNumber})</span>
            </h4>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto">
              {diningCart.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  Your food tray is empty. Add hot dishes or beverages from the menu.
                </div>
              ) : (
                diningCart.map((c) => (
                  <div key={c.item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{c.item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {formatCurrency(convertPrice(c.item.priceUSD, currentCurrency), currentCurrency)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border rounded bg-stone-50 dark:bg-stone-800">
                        <button onClick={() => handleUpdateCart(c.item.id, -1)} className="px-2 py-0.5 text-stone-500">-</button>
                        <span className="px-2 font-mono font-bold">{c.quantity}</span>
                        <button onClick={() => handleUpdateCart(c.item.id, 1)} className="px-2 py-0.5 text-stone-500">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {diningCart.length > 0 && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <label className="block font-semibold mb-1">Chef Instructions / Dietary Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, no coriander, deliver at 8:00 PM"
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border text-xs"
                  />
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(convertPrice(cartSubtotal, currentCurrency), currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Service (10%):</span>
                    <span>+{formatCurrency(convertPrice(cartServiceCharge, currentCurrency), currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>VAT (13%):</span>
                    <span>+{formatCurrency(convertPrice(cartTax, currentCurrency), currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold font-sans text-stone-900 dark:text-stone-100 pt-1 border-t">
                    <span>Total Due at Checkout:</span>
                    <span>{formatCurrency(convertPrice(cartGrandTotal, currentCurrency), currentCurrency)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSendOrder}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md transition-all ${themeClasses.primary}`}
                >
                  Place Order Directly to Room
                </button>
                <span className="text-[10px] text-stone-400 text-center block">
                  Charged directly to your room folio. Notification dispatched to chef & waiter immediately.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MY ORDERS ===================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-stone-400 bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-800">
                You have not placed any room dining orders yet.
              </div>
            ) : (
              myOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400">Order #{ord.orderNumber}</span>
                      <div className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 font-mono flex justify-between pt-2 border-t">
                    <span>Total: {formatCurrency(convertPrice(ord.totalAmountUSD, currentCurrency), currentCurrency)}</span>
                    <span>Placed at: {new Date(ord.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: DIRECT INTERCOM CHAT ===================== */}
      {activeTab === 'intercom' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b pb-3 border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Front Desk & Service Intercom
              </h4>
              <p className="text-[11px] text-stone-500 font-mono">
                Direct two-way channel with Receptionist Bikash & Waiter Staff
              </p>
            </div>

            <div className="flex items-center gap-1">
              {(['concierge', 'room_service', 'housekeeping', 'front_desk'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedServiceTag(tag)}
                  className={`px-2 py-1 rounded text-[10px] font-mono capitalize transition-colors ${
                    selectedServiceTag === tag
                      ? 'bg-amber-700 text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {tag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="space-y-3 h-80 overflow-y-auto p-2 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
            {guestChatMessages.map((msg) => {
              const isGuest = msg.sender === 'guest';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'} text-xs`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-0.5">
                    <span className="font-semibold">{msg.guestName || (isGuest ? 'You' : 'Staff')}</span>
                    <span>·</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-sm ${
                      isGuest
                        ? 'bg-amber-800 text-white rounded-tr-none'
                        : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder={`Message receptionist about ${selectedServiceTag.replace('_', ' ')}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border text-xs"
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 shadow ${themeClasses.primary}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ===================== TAB 4: LIVE ROOM BILL & ONGOING FOLIO ===================== */}
      {activeTab === 'bill' && (() => {
        // Find matching invoice for this room or guest
        const matchedInv = invoices.find(
          (inv) => inv.roomNumber.toLowerCase() === activeGuestSession.roomNumber.toLowerCase() ||
                   inv.bookingCode === activeGuestSession.bookingCode
        );

        // Calculate live ongoing orders total
        const diningTotalUSD = myOrders.reduce((acc, o) => acc + o.totalAmountUSD, 0);

        return (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6 max-w-3xl mx-auto text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <span className="font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  Live Guest Statement & Folio
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  {activeGuestSession.roomNumber} · {activeGuestSession.guestName}
                </h3>
                <p className="text-stone-500 text-[11px] font-mono">
                  Stay Dates: {activeGuestSession.checkInDate} &rarr; {activeGuestSession.checkOutDate} · PIN: {activeGuestSession.passcode}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Current Balance Due</span>
                <span className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-300">
                  {matchedInv 
                    ? formatCurrency(convertPrice(matchedInv.balanceDueUSD + diningTotalUSD, currentCurrency), currentCurrency)
                    : formatCurrency(convertPrice(diningTotalUSD || 43.5, currentCurrency), currentCurrency)
                  }
                </span>
              </div>
            </div>

            {/* Services Taken Breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Services & Charges Consumed During Stay
              </h4>

              <div className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-50/50 dark:bg-stone-800/30">
                {/* Room Stay charge */}
                <div className="p-3.5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      Room Accommodation Stay ({activeGuestSession.roomNumber})
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Ref: {activeGuestSession.bookingCode} · Includes solar hot water & high-speed optical Wi-Fi
                    </div>
                  </div>
                  <div className="font-mono font-bold text-stone-800 dark:text-stone-200">
                    {matchedInv 
                      ? formatCurrency(convertPrice(matchedInv.subtotalUSD, currentCurrency), currentCurrency)
                      : formatCurrency(convertPrice(110, currentCurrency), currentCurrency)
                    }
                  </div>
                </div>

                {/* Dining orders items */}
                {myOrders.map((ord) => (
                  <div key={ord.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">
                        Rooftop Kitchen Order #{ord.orderNumber}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')} · Status: {ord.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      {formatCurrency(convertPrice(ord.totalAmountUSD, currentCurrency), currentCurrency)}
                    </div>
                  </div>
                ))}

                {/* Standard tax and service charge summary */}
                <div className="p-3.5 bg-stone-100/60 dark:bg-stone-800/70 flex justify-between items-center text-[11px] font-mono text-stone-500">
                  <span>Hotel Service Charge (10%) & VAT (13%):</span>
                  <span>Included in Total</span>
                </div>
              </div>
            </div>

            {/* Note on checkout */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold">Checkout & Payment Information</div>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300">
                You can settle your balance at the Front Desk counter using Card, eSewa QR, Fonepay, or Cash upon checkout at 12:00 PM. All room dining and addon records will be automatically reconciled on your final printed tax invoice.
              </p>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
