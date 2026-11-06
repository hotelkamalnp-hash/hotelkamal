import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { StockItem, StockCategory } from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Boxes
} from 'lucide-react';
import { ModalDismissButton, useModalDismiss } from '../Common/ModalDismissHandler';

export const InventoryStockManager: React.FC = () => {
  const { 
    stockItems, 
    addStockItem, 
    updateStockItem, 
    deleteStockItem, 
    adjustStockQuantity,
    themeConfig,
    currentCurrency 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<StockItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Supplier Delivery Restock');

  useModalDismiss(isAddStockOpen, () => { setIsAddStockOpen(false); setEditingStock(null); });
  useModalDismiss(Boolean(adjustingStock), () => setAdjustingStock(null));

  const categories: ('All' | StockCategory)[] = [
    'All',
    'Kitchen Ingredients',
    'Beverages & Bar',
    'Housekeeping & Toiletries',
    'Linen & Bedding',
    'Maintenance & Solar',
    'Front Office Stationery',
  ];

  // Stock status calculations
  const totalStockCount = stockItems.length;
  const lowStockCount = stockItems.filter((s) => s.currentStock > 0 && s.currentStock <= s.minThreshold).length;
  const outOfStockCount = stockItems.filter((s) => s.currentStock === 0).length;
  const totalAssetValuationUSD = stockItems.reduce((acc, s) => acc + (s.currentStock * s.costPerUnitUSD), 0);

  const filteredItems = stockItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase()) ||
                          item.supplierName.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (filterStockStatus === 'low') {
      matchesStatus = item.currentStock > 0 && item.currentStock <= item.minThreshold;
    } else if (filterStockStatus === 'out') {
      matchesStatus = item.currentStock === 0;
    }

    return matchesCat && matchesSearch && matchesStatus;
  });

  const handleSaveStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stockData = {
      name: formData.get('name') as string,
      category: formData.get('category') as StockCategory,
      sku: formData.get('sku') as string,
      currentStock: Number(formData.get('currentStock')),
      minThreshold: Number(formData.get('minThreshold')),
      unit: formData.get('unit') as string,
      costPerUnitUSD: Number(formData.get('costPerUnitUSD')),
      lastRestockedDate: new Date().toISOString().split('T')[0],
      supplierName: formData.get('supplierName') as string,
      supplierContact: formData.get('supplierContact') as string,
      location: formData.get('location') as string,
    };

    if (editingStock) {
      updateStockItem(editingStock.id, stockData);
      setEditingStock(null);
    } else {
      addStockItem(stockData);
      setIsAddStockOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 font-mono">
            <span>Total SKUs</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-50 mt-1">
            {totalStockCount} Items
          </div>
          <div className="text-[11px] text-stone-400 mt-1">All departments logged</div>
        </div>

        <button 
          onClick={() => setFilterStockStatus(filterStockStatus === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-xl text-left border shadow-sm transition-all ${
            filterStockStatus === 'low' 
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500' 
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 font-mono">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-1">
            {lowStockCount} SKUs
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">Below minimum threshold</div>
        </button>

        <button 
          onClick={() => setFilterStockStatus(filterStockStatus === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-xl text-left border shadow-sm transition-all ${
            filterStockStatus === 'out' 
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500' 
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 font-mono">
            <span>Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-700 dark:text-rose-400 mt-1">
            {outOfStockCount} SKUs
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1">Immediate reorder required</div>
        </button>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 font-mono">
            <span>Total Valuation</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">
            {formatCurrency(convertPrice(totalAssetValuationUSD, currentCurrency), currentCurrency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Estimated asset value</div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by SKU, item name, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filterStockStatus !== 'all' && (
            <button
              onClick={() => setFilterStockStatus('all')}
              className="text-xs text-amber-700 dark:text-amber-400 underline font-medium"
            >
              Clear Status Filter
            </button>
          )}

          <button
            onClick={() => {
              setEditingStock(null);
              setIsAddStockOpen(true);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow ${themeClasses.primary}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-amber-800 text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider font-mono border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Threshold Status</th>
                <th className="py-3 px-3">Unit Valuation</th>
                <th className="py-3 px-3">Storage Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredItems.map((item) => {
                const isOut = item.currentStock === 0;
                const isLow = !isOut && item.currentStock <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</div>
                      <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        SKU: {item.sku} · Supplier: {item.supplierName} ({item.supplierContact})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3 px-3">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono text-[10px] font-bold">
                          ● OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono text-[10px] font-bold">
                          ▲ LOW (Min: {item.minThreshold} {item.unit})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[10px] font-bold">
                          ✓ Optimal ({item.currentStock} &gt; {item.minThreshold})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-800 dark:text-stone-200">
                      ${item.costPerUnitUSD} / {item.unit}
                    </td>
                    <td className="py-3 px-3 text-stone-500 text-[11px]">
                      {item.location}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAdjustingStock(item);
                            setAdjustAmount(5);
                          }}
                          className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[10px] font-bold font-mono transition-colors"
                          title="Restock or Consume"
                        >
                          Stock In/Out
                        </button>
                        <button
                          onClick={() => {
                            setEditingStock(item);
                            setIsAddStockOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-amber-600 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStockItem(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingStock && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAdjustingStock(null)}
        >
          <div 
            className="bg-white dark:bg-stone-900 rounded-xl max-w-sm w-full border border-stone-200 dark:border-stone-800 p-5 space-y-4 text-xs relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2 pr-8">
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-50">
                  Update Stock Count: {adjustingStock.name}
                </h4>
                <p className="text-[11px] text-stone-400 font-mono">SKU: {adjustingStock.sku}</p>
              </div>
            </div>
            <ModalDismissButton onClick={() => setAdjustingStock(null)} label="Close Adjust Stock" />

            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-center font-mono">
              <span className="text-stone-400 text-[10px] block uppercase">Current Stock Balance</span>
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {adjustingStock.currentStock} {adjustingStock.unit}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Adjustment Quantity ({adjustingStock.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Audit Reason / Voucher</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier Shipment, Kitchen Consumption"
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    adjustStockQuantity(adjustingStock.id, adjustAmount, adjustReason);
                    setAdjustingStock(null);
                  }}
                  className="py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+ Add Stock In</span>
                </button>

                <button
                  onClick={() => {
                    adjustStockQuantity(adjustingStock.id, -adjustAmount, adjustReason);
                    setAdjustingStock(null);
                  }}
                  className="py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>- Consume Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Stock Modal */}
      {isAddStockOpen && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setIsAddStockOpen(false); setEditingStock(null); }}
        >
          <div 
            className="bg-white dark:bg-stone-900 rounded-xl max-w-lg w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3 pr-8">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
                {editingStock ? 'Edit Inventory Item' : 'Add New Inventory SKU'}
              </h4>
            </div>
            <ModalDismissButton onClick={() => { setIsAddStockOpen(false); setEditingStock(null); }} label="Close Inventory Editor" />

            <form onSubmit={handleSaveStock} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Item Description</label>
                <input
                  name="name"
                  defaultValue={editingStock?.name || ''}
                  required
                  placeholder="e.g. Organic Red Rice (Marsi)"
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Inventory Category</label>
                  <select
                    name="category"
                    defaultValue={editingStock?.category || 'Kitchen Ingredients'}
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  >
                    <option value="Kitchen Ingredients">Kitchen Ingredients</option>
                    <option value="Beverages & Bar">Beverages & Bar</option>
                    <option value="Housekeeping & Toiletries">Housekeeping & Toiletries</option>
                    <option value="Linen & Bedding">Linen & Bedding</option>
                    <option value="Maintenance & Solar">Maintenance & Solar</option>
                    <option value="Front Office Stationery">Front Office Stationery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">SKU Code</label>
                  <input
                    name="sku"
                    defaultValue={editingStock?.sku || 'KIT-001'}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Current Stock</label>
                  <input
                    name="currentStock"
                    type="number"
                    defaultValue={editingStock?.currentStock || 10}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Low Alert Limit</label>
                  <input
                    name="minThreshold"
                    type="number"
                    defaultValue={editingStock?.minThreshold || 5}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit of Measure</label>
                  <input
                    name="unit"
                    defaultValue={editingStock?.unit || 'kg'}
                    placeholder="kg, bottles, pieces..."
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Cost Per Unit ($ USD)</label>
                  <input
                    name="costPerUnitUSD"
                    type="number"
                    step="0.1"
                    defaultValue={editingStock?.costPerUnitUSD || 5}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Physical Location</label>
                  <input
                    name="location"
                    defaultValue={editingStock?.location || 'Pantry Shelf B'}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Supplier Name</label>
                  <input
                    name="supplierName"
                    defaultValue={editingStock?.supplierName || 'Kathmandu Local Agro'}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Supplier Phone</label>
                  <input
                    name="supplierContact"
                    defaultValue={editingStock?.supplierContact || '+977 98'}
                    required
                    className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="px-3.5 py-1.5 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded font-semibold ${themeClasses.primary}`}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
