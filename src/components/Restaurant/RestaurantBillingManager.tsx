import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { 
  MenuItem, 
  RestaurantOrder, 
  MenuItemCategory 
} from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { 
  Utensils, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  ChefHat, 
  ShoppingBag, 
  Check, 
  XCircle, 
  Edit3, 
  Trash2, 
  Flame, 
  Leaf, 
  Star,
  DollarSign
} from 'lucide-react';

export const RestaurantBillingManager: React.FC = () => {
  const { 
    menuItems, 
    restaurantOrders, 
    themeConfig, 
    currentCurrency, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    updateOrderStatus,
    placeRestaurantOrder,
    activeRole,
    staff
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [activeSubTab, setActiveSubTab] = useState<'live_orders' | 'menu_catalog' | 'pos_quick_order'>('live_orders');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add item modal
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // POS Direct Order Cart State
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [orderDestination, setOrderDestination] = useState<'room' | 'rooftop_table' | 'courtyard'>('room');
  const [orderRoomOrTable, setOrderRoomOrTable] = useState('Room 302');
  const [guestNameInput, setGuestNameInput] = useState('Eleanor Vance');
  const [paymentModeInput, setPaymentModeInput] = useState<'charge_to_room' | 'cash_on_delivery' | 'card_online'>('charge_to_room');

  const categories: ('All' | MenuItemCategory)[] = [
    'All',
    'Nepali Heritage & Newari',
    'Main Course',
    'Himalayan Specials',
    'Starters',
    'Rooftop Bar & Beverages',
    'Desserts'
  ];

  const filteredMenu = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (dish: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === dish.id);
      if (existing) {
        return prev.map((c) => c.item.id === dish.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item: dish, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== dishId));
  };

  const handleUpdateCartQty = (dishId: string, delta: number) => {
    setCart((prev) => 
      prev.map((c) => {
        if (c.item.id === dishId) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter(Boolean) as { item: MenuItem; quantity: number }[]
    );
  };

  const cartSubtotalUSD = cart.reduce((acc, c) => acc + (c.item.priceUSD * c.quantity), 0);
  const cartTaxUSD = cartSubtotalUSD * 0.13;
  const cartServiceChargeUSD = cartSubtotalUSD * 0.10;
  const cartTotalUSD = cartSubtotalUSD + cartTaxUSD + cartServiceChargeUSD;

  const handleSubmitCartOrder = () => {
    if (cart.length === 0) return;

    placeRestaurantOrder({
      roomNumber: orderRoomOrTable,
      tableOrRoomNo: orderRoomOrTable,
      guestName: guestNameInput || 'Guest',
      destination: orderDestination,
      items: cart.map((c) => ({
        menuItemId: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        unitPriceUSD: c.item.priceUSD,
      })),
      subtotalUSD: cartSubtotalUSD,
      taxUSD: cartTaxUSD,
      serviceChargeUSD: cartServiceChargeUSD,
      totalAmountUSD: cartTotalUSD,
      paymentMode: paymentModeInput,
    });

    setCart([]);
    setActiveSubTab('live_orders');
  };

  const handleSaveDish = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dishData = {
      name: formData.get('name') as string,
      category: formData.get('category') as MenuItemCategory,
      description: formData.get('description') as string,
      priceUSD: Number(formData.get('priceUSD')),
      isVegetarian: formData.get('isVegetarian') === 'on',
      isSpicy: formData.get('isSpicy') === 'on',
      isChefSpecial: formData.get('isChefSpecial') === 'on',
      available: true,
      preparationTimeMinutes: Number(formData.get('prepTime')) || 20,
    };

    if (editingDish) {
      updateMenuItem(editingDish.id, dishData);
      setEditingDish(null);
    } else {
      addMenuItem(dishData);
      setIsAddDishOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('live_orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'live_orders'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Kitchen & Service Orders ({restaurantOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pos_quick_order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'pos_quick_order'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS / Place Room Order</span>
          </button>

          <button
            onClick={() => setActiveSubTab('menu_catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'menu_catalog'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu & Pricing CMS ({menuItems.length})</span>
          </button>
        </div>

        {activeSubTab === 'menu_catalog' && (
          <button
            onClick={() => {
              setEditingDish(null);
              setIsAddDishOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow ${themeClasses.primary}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        )}
      </div>

      {/* ===================== SUBTAB 1: LIVE ORDERS ===================== */}
      {activeSubTab === 'live_orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurantOrders.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
                No active kitchen or room service orders. Click "POS / Place Room Order" or place an order from the Guest Portal to test.
              </div>
            ) : (
              restaurantOrders.map((ord) => (
                <div 
                  key={ord.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          #{ord.orderNumber}
                        </span>
                        <div className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                          {ord.tableOrRoomNo} · {ord.guestName}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        ord.status === 'placed'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : ord.status === 'preparing'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : ord.status === 'ready_for_delivery'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Order items */}
                    <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-lg space-y-1 font-mono text-[11px]">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                          <span>{formatCurrency(convertPrice(it.unitPriceUSD * it.quantity, currentCurrency), currentCurrency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-[11px] text-stone-500 font-mono">
                      <span>Total: {formatCurrency(convertPrice(ord.totalAmountUSD, currentCurrency), currentCurrency)}</span>
                      <span>Mode: {ord.paymentMode.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Order Workflow Action Buttons (Chef / Waiter) */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'preparing', 'Head Chef Ramesh')}
                        className="w-full py-1.5 px-2 rounded bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] text-center"
                      >
                        Accept & Start Preparing
                      </button>
                    )}

                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'ready_for_delivery', 'Prakash (Waiter Lead)')}
                        className="w-full py-1.5 px-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] text-center"
                      >
                        Mark Ready for Waiter Dispatch
                      </button>
                    )}

                    {ord.status === 'ready_for_delivery' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'delivered')}
                        className="w-full py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] text-center"
                      >
                        Confirm Delivered to Room
                      </button>
                    )}

                    {ord.status === 'delivered' && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed & Charged</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 2: POS QUICK ORDER ===================== */}
      {activeSubTab === 'pos_quick_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Selection (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMenu.map((dish) => (
                <div
                  key={dish.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between hover:border-amber-600 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {dish.name}
                      </span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                        {formatCurrency(convertPrice(dish.priceUSD, currentCurrency), currentCurrency)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{dish.description}</p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 font-mono">
                      {dish.isVegetarian && <span className="text-emerald-600 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Veg</span>}
                      {dish.isSpicy && <span className="text-rose-600 flex items-center gap-0.5"><Flame className="w-3 h-3" /> Spicy</span>}
                      {dish.isChefSpecial && <span className="text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3" /> Chef Pick</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-700 hover:text-white dark:hover:bg-amber-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Ticket</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Ticket / Cart (Right column) */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-xs">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50 border-b pb-2 border-stone-200 dark:border-stone-800">
              Kitchen Dispatch Ticket
            </h4>

            {/* Destination selector */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Destination</label>
                <select
                  value={orderDestination}
                  onChange={(e) => setOrderDestination(e.target.value as any)}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                >
                  <option value="room">Room Service Delivery</option>
                  <option value="rooftop_table">Rooftop Garden Table</option>
                  <option value="courtyard">Courtyard Lounge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Room / Table #</label>
                  <input
                    type="text"
                    value={orderRoomOrTable}
                    onChange={(e) => setOrderRoomOrTable(e.target.value)}
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Billing Settlement</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value as any)}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                >
                  <option value="charge_to_room">Charge to Room Folio (Checkout)</option>
                  <option value="cash_on_delivery">Cash Upon Waiter Delivery</option>
                  <option value="card_online">Paid via QR / Card POS</option>
                </select>
              </div>
            </div>

            {/* Cart Items list */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-6 text-center text-stone-400">Cart is empty. Select dishes to add.</div>
              ) : (
                cart.map((c) => (
                  <div key={c.item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{c.item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {formatCurrency(convertPrice(c.item.priceUSD, currentCurrency), currentCurrency)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded bg-stone-50 dark:bg-stone-800">
                        <button onClick={() => handleUpdateCartQty(c.item.id, -1)} className="px-2 py-0.5 text-stone-500">-</button>
                        <span className="px-2 font-mono">{c.quantity}</span>
                        <button onClick={() => handleUpdateCartQty(c.item.id, 1)} className="px-2 py-0.5 text-stone-500">+</button>
                      </div>
                      <button onClick={() => handleRemoveFromCart(c.item.id)} className="text-stone-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t font-mono text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(convertPrice(cartSubtotalUSD, currentCurrency), currentCurrency)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Service Charge (10%):</span>
                  <span>+{formatCurrency(convertPrice(cartServiceChargeUSD, currentCurrency), currentCurrency)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>VAT (13%):</span>
                  <span>+{formatCurrency(convertPrice(cartTaxUSD, currentCurrency), currentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold font-sans text-stone-900 dark:text-stone-100 pt-1 border-t">
                  <span>Total Order:</span>
                  <span>{formatCurrency(convertPrice(cartTotalUSD, currentCurrency), currentCurrency)}</span>
                </div>

                <button
                  onClick={handleSubmitCartOrder}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md transition-all mt-3 ${themeClasses.primary}`}
                >
                  Dispatch to Kitchen & Waiter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 3: MENU CMS CATALOG ===================== */}
      {activeSubTab === 'menu_catalog' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800 text-[11px] uppercase tracking-wider font-mono border-y">
                <tr>
                  <th className="py-2.5 px-4">Dish Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price (USD / NPR)</th>
                  <th className="py-2.5 px-3 text-center">Prep Time</th>
                  <th className="py-2.5 px-3 text-center">Flags</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {menuItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{dish.name}</div>
                      <div className="text-[11px] text-stone-400 max-w-md truncate">{dish.description}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono text-[10px]">
                        {dish.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                      ${dish.priceUSD} · {formatCurrency(convertPrice(dish.priceUSD, 'NPR'), 'NPR')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {dish.preparationTimeMinutes} mins
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {dish.isVegetarian && <span title="Vegetarian"><Leaf className="w-3.5 h-3.5 text-emerald-600" /></span>}
                        {dish.isSpicy && <span title="Spicy"><Flame className="w-3.5 h-3.5 text-rose-600" /></span>}
                        {dish.isChefSpecial && <span title="Chef Special"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingDish(dish);
                            setIsAddDishOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-amber-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(dish.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to Add / Edit Dish */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                {editingDish ? 'Edit Dish Details' : 'Add New Restaurant Dish'}
              </h4>
              <button onClick={() => setIsAddDishOpen(false)} className="text-stone-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Dish Name</label>
                <input
                  name="name"
                  defaultValue={editingDish?.name || ''}
                  required
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingDish?.category || 'Nepali Heritage & Newari'}
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  >
                    <option value="Nepali Heritage & Newari">Nepali Heritage & Newari</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Himalayan Specials">Himalayan Specials</option>
                    <option value="Starters">Starters</option>
                    <option value="Rooftop Bar & Beverages">Rooftop Bar & Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price in USD ($)</label>
                  <input
                    name="priceUSD"
                    type="number"
                    step="0.5"
                    defaultValue={editingDish?.priceUSD || 10}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ingredients & Description</label>
                <textarea
                  name="description"
                  defaultValue={editingDish?.description || ''}
                  rows={2}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-semibold text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isVegetarian" defaultChecked={editingDish?.isVegetarian} />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isSpicy" defaultChecked={editingDish?.isSpicy} />
                  <span>Spicy</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isChefSpecial" defaultChecked={editingDish?.isChefSpecial} />
                  <span>Chef Pick</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="px-3.5 py-1.5 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded font-semibold ${themeClasses.primary}`}
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
