import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { MasterInvoice, InvoiceTemplateId } from '../../types/hotel';
import { formatCurrency, convertPrice, getThemeClasses } from '../../utils/theme';
import { InvoicePrintModal } from './InvoicePrintModal';
import { 
  Receipt, 
  Settings, 
  Printer, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Percent, 
  DollarSign, 
  Edit3, 
  Trash2,
  Sliders,
  CreditCard,
  Building
} from 'lucide-react';

export const MasterBillingManager: React.FC = () => {
  const { 
    invoices, 
    billSettings, 
    updateBillSettings, 
    updateInvoice,
    createCustomInvoice,
    generateInvoiceForBooking,
    addPaymentToInvoice,
    bookings,
    currentCurrency,
    themeConfig 
  } = useHotel();

  const themeClasses = getThemeClasses(themeConfig.palette);

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'settings'>('invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  
  // Selected invoice for Print Modal
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<MasterInvoice | null>(null);

  // New Invoice Modal
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');

  // Form state for bill settings
  const [settingsForm, setSettingsForm] = useState(billSettings);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          inv.guestName.toLowerCase().includes(search.toLowerCase()) ||
                          inv.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBillSettings(settingsForm);
  };

  const templates: { id: InvoiceTemplateId; name: string; desc: string }[] = [
    { id: 'heritage-gold', name: 'Heritage Gold (Newari Border)', desc: 'Regal maroon and gold frame with authentic Newari borders and dual QR payment box' },
    { id: 'executive-modern', name: 'Executive Modern (Corporate)', desc: 'High-contrast bold monochromatic typography with detailed service categorization' },
    { id: 'minimalist-clean', name: 'Minimalist Clean (Boutique)', desc: 'Understated elegance, airy whitespace, and subtle divider rules' },
    { id: 'regal-himalayan', name: 'Regal Himalayan (Burgundy)', desc: 'Rich mountain sapphire and burgundy accents ideal for suite luxury folios' },
    { id: 'compact-pos-thermal', name: 'Compact POS Thermal Slip', desc: '80mm receipt format suitable for front desk thermal printers and express checkouts' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'invoices'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Master Invoices & Guest Folios ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'settings'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Bill & Template Settings (5 Designs)</span>
          </button>
        </div>

        {activeSubTab === 'invoices' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow ${themeClasses.primary}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Bill from Booking</span>
            </button>
          </div>
        )}
      </div>

      {/* ===================== TAB 1: INVOICES LIST ===================== */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search by invoice #, guest, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-white dark:bg-stone-900 border text-xs"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-stone-400">Payment:</span>
              {(['all', 'paid', 'pending'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded capitalize ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] uppercase tracking-wider font-mono border-b">
                  <tr>
                    <th className="py-3 px-4">Invoice # & Date</th>
                    <th className="py-3 px-3">Guest & Room</th>
                    <th className="py-3 px-3">Service Charges & Tax</th>
                    <th className="py-3 px-3">Total Payable</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">Issued: {inv.issuedAt}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{inv.guestName}</div>
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                          {inv.roomNumber} ({inv.checkInDate} &rarr; {inv.checkOutDate})
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>Svc ({inv.serviceChargePercent}%): +{formatCurrency(convertPrice(inv.serviceChargeAmountUSD, currentCurrency), currentCurrency)}</div>
                        <div className="text-stone-400">VAT ({inv.taxPercent}%): +{formatCurrency(convertPrice(inv.taxAmountUSD, currentCurrency), currentCurrency)}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                        {formatCurrency(convertPrice(inv.grandTotalUSD, currentCurrency), currentCurrency)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          ● {inv.paymentStatus} ({inv.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: BILL & TEMPLATE SETTINGS ===================== */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Template Selection Cards */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              Select Invoice Print Template Design
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, template: tpl.id })}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    settingsForm.template === tpl.id
                      ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-600'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'
                  }`}
                >
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 block">
                      {tpl.name}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug">{tpl.desc}</p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase">
                    {settingsForm.template === tpl.id ? '✓ Active Template' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Legal, Tax & Logo Config */}
          <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-xs">
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 border-b pb-2">
              Hotel Legal Header & Tax Rates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Hotel Legal Name</label>
                <input
                  type="text"
                  value={settingsForm.hotelLegalName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hotelLegalName: e.target.value })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nepal PAN / VAT Reg No.</label>
                <input
                  type="text"
                  value={settingsForm.panVatNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, panVatNumber: e.target.value })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Hotel Logo Image URL / Path</label>
                <input
                  type="text"
                  value={settingsForm.hotelLogoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hotelLogoUrl: e.target.value })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Standard VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settingsForm.taxPercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, taxPercent: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
                <span className="text-[10px] text-stone-400">Nepal standard hotel VAT is 13%.</span>
              </div>

              <div>
                <label className="block font-semibold mb-1">Hotel Service Charge (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settingsForm.serviceChargePercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, serviceChargePercent: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
                <span className="text-[10px] text-stone-400">Standard hospitality service fee is 10%.</span>
              </div>

              <div>
                <label className="block font-semibold mb-1">Default Discount (%)</label>
                <input
                  type="number"
                  step="1"
                  value={settingsForm.defaultDiscountPercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultDiscountPercent: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Official Authorized Signatory</label>
                <input
                  type="text"
                  value={settingsForm.authorizedSignatoryName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, authorizedSignatoryName: e.target.value })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Support & Accounts Direct Phone</label>
                <input
                  type="text"
                  value={settingsForm.contactSupportPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactSupportPhone: e.target.value })}
                  className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Footer Hospitality Note</label>
              <input
                type="text"
                value={settingsForm.footerNote}
                onChange={(e) => setSettingsForm({ ...settingsForm, footerNote: e.target.value })}
                className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Terms & Conditions Disclaimer</label>
              <textarea
                value={settingsForm.termsAndConditions}
                onChange={(e) => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                rows={2}
                className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`px-5 py-2 rounded-lg font-semibold text-xs shadow ${themeClasses.primary}`}
              >
                Save Invoice Customization Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Generate Bill Modal */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full border border-stone-200 dark:border-stone-800 p-6 space-y-4 text-xs">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50 border-b pb-2">
              Generate Master Invoice from Booking
            </h4>

            <div>
              <label className="block font-semibold mb-1">Select Confirmed Reservation</label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full p-2 rounded bg-stone-50 dark:bg-stone-800 border font-mono"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} · {b.guestName} ({b.roomName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="px-3.5 py-1.5 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const inv = generateInvoiceForBooking(selectedBookingId);
                  setIsNewInvoiceOpen(false);
                  setSelectedInvoiceForPrint(inv);
                }}
                className={`px-4 py-1.5 rounded font-semibold ${themeClasses.primary}`}
              >
                Compile & View Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print & Preview Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          billSettings={billSettings}
          currency={currentCurrency}
          onClose={() => setSelectedInvoiceForPrint(null)}
          onMarkPaid={() => {
            addPaymentToInvoice(selectedInvoiceForPrint.id, selectedInvoiceForPrint.balanceDueUSD, 'onsite');
            setSelectedInvoiceForPrint(null);
          }}
        />
      )}

    </div>
  );
};
