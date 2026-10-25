import React, { useState } from 'react';
import { Invoice, InvoiceItem, PaymentStatus, Booking, ClientTraveler, AgencySettings } from '../types';
import { 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Send, 
  CreditCard, 
  FileText, 
  Trash2, 
  X, 
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  bookings: Booking[];
  clients: ClientTraveler[];
  settings: AgencySettings;
  onSaveInvoice: (invoice: Invoice) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  onOpenBookingById: (bookingId: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  bookings,
  clients,
  settings,
  onSaveInvoice,
  selectedInvoice,
  setSelectedInvoice,
  onOpenBookingById,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);
  const [paymentRecordedToast, setPaymentRecordedToast] = useState(false);

  // New Invoice Form state
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'AUD' | 'JPY' | 'CAD'>('USD');
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(0);
  const [invoiceNotes, setInvoiceNotes] = useState('Payment via wire transfer or major credit card. Quote reference on all transactions.');

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    {
      id: 'item-new-1',
      category: 'Accommodation',
      description: 'Luxury Boutique Resort & Villa Allocation (4 Nights)',
      quantity: 1,
      unitPrice: 4800,
      amount: 4800,
    },
    {
      id: 'item-new-2',
      category: 'Bespoke Experiences',
      description: 'Private Yacht Charter with Skipper & Marine Permits',
      quantity: 1,
      unitPrice: 1950,
      amount: 1950,
    },
    {
      id: 'item-new-3',
      category: 'Ground Transport',
      description: 'Executive Chauffeur Dedicated Airport & Excursion Transfers',
      quantity: 1,
      unitPrice: 750,
      amount: 750,
    },
  ]);

  // Calculations for new invoice modal
  const newSubtotal = lineItems.reduce((acc, it) => acc + it.amount, 0);
  const newTaxAmount = (newSubtotal * taxRatePercent) / 100;
  const newTotalDue = Math.max(0, newSubtotal + newTaxAmount - depositPaid);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.bookingRef && inv.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalCollected = invoices.reduce((acc, inv) => {
    if (inv.status === 'Paid') return acc + inv.subtotal;
    if (inv.status === 'Partial') return acc + inv.depositPaid;
    return acc;
  }, 0);
  const totalOutstanding = totalBilled - totalCollected;

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: 'item-' + Date.now(),
        category: 'Excursions & Guides',
        description: 'Private Art & Cultural Guided Docent Excursion',
        quantity: 1,
        unitPrice: 500,
        amount: 500,
      },
    ]);
  };

  const handleUpdateLineItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const booking = bookings.find((b) => b.id === selectedBookingId);

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: booking?.id,
      bookingRef: booking?.bookingRef,
      clientId: client.id,
      clientName: client.fullName,
      clientEmail: client.email,
      clientAddress: client.location || 'Client On File',
      issueDate,
      dueDate,
      currency,
      items: lineItems,
      subtotal: newSubtotal,
      taxRatePercent,
      taxAmount: newTaxAmount,
      discountPercent: 0,
      discountAmount: 0,
      depositPaid,
      totalDue: newTotalDue,
      status: depositPaid >= newSubtotal ? 'Paid' : depositPaid > 0 ? 'Partial' : 'Sent',
      notes: invoiceNotes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveInvoice(newInvoice);
    setIsNewInvoiceModalOpen(false);
    setSelectedInvoice(newInvoice);
  };

  const handleMarkAsPaid = (inv: Invoice) => {
    const updated: Invoice = {
      ...inv,
      status: 'Paid',
      depositPaid: inv.subtotal,
      totalDue: 0,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Wire Transfer',
    };
    onSaveInvoice(updated);
    setSelectedInvoice(updated);
    setPaymentRecordedToast(true);
    setTimeout(() => setPaymentRecordedToast(false), 3000);
  };

  const handleSendInvoiceEmail = () => {
    setEmailSentToast(true);
    setTimeout(() => setEmailSentToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {emailSentToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Invoice dispatched to client email with payment instructions.</span>
        </div>
      )}
      {paymentRecordedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>Full payment recorded and receipt generated.</span>
        </div>
      )}

      {/* Header and New Invoice Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Client Invoices & Billing
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            Itemized travel billing, payment tracking, multi-currency invoicing, and receipt generation
          </p>
        </div>

        <button
          onClick={() => {
            setInvoiceNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
            setIsNewInvoiceModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Billed Invoices</span>
          <div className="text-xl font-bold text-neutral-900 mt-1 tabular-nums font-mono">
            ${totalBilled.toLocaleString()} <span className="text-xs font-normal text-neutral-500">USD</span>
          </div>
          <div className="text-2xs text-neutral-400 mt-1 font-mono">{invoices.length} total generated invoices</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Collected Payments</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums font-mono">
            ${totalCollected.toLocaleString()} <span className="text-xs font-normal text-emerald-600">USD</span>
          </div>
          <div className="text-2xs text-neutral-400 mt-1 font-mono">
            {invoices.filter((i) => i.status === 'Paid').length} invoices settled in full
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Outstanding Receivables</span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums font-mono">
            ${totalOutstanding.toLocaleString()} <span className="text-xs font-normal text-amber-600">USD</span>
          </div>
          <div className="text-2xs text-neutral-400 mt-1 font-mono">
            {invoices.filter((i) => i.status === 'Sent' || i.status === 'Partial').length} invoices awaiting final settlement
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice # (e.g. INV-2026-088), client name, or booking ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Status Filter Tabs (Buttons allowed by Constitution) */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-neutral-100">
          {['all', 'paid', 'partial', 'sent', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap capitalize cursor-pointer ${
                statusFilter === tab
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {tab === 'all' ? 'All Invoices' : tab}
            </button>
          ))}
          <span className="text-xs text-neutral-400 ml-auto font-mono whitespace-nowrap pl-2">
            {filteredInvoices.length} results
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-medium text-neutral-600">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client / Traveler</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No invoices matching current search or status filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 group-hover:underline">
                      <div>{inv.invoiceNumber}</div>
                      {inv.bookingRef && (
                        <div className="text-neutral-400 text-2xs">Booking: {inv.bookingRef}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900">{inv.clientName}</div>
                      <div className="text-neutral-500 font-mono text-2xs">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-neutral-400 text-2xs">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-neutral-900 tabular-nums">
                      ${inv.subtotal.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums">
                      <span className={inv.totalDue > 0 ? 'text-amber-700' : 'text-neutral-400'}>
                        ${inv.totalDue.toLocaleString()} {inv.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Zero-pill: clean text with domain color */}
                      <span className={`font-mono text-xs font-medium ${
                        inv.status === 'Paid' ? 'text-emerald-700' :
                        inv.status === 'Partial' ? 'text-blue-700' :
                        inv.status === 'Sent' ? 'text-amber-700' :
                        inv.status === 'Overdue' ? 'text-rose-700' :
                        'text-neutral-500'
                      }`}>
                        {inv.status === 'Partial' ? 'Deposit Paid' : inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        >
                          View / Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Printable PDF Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-neutral-300 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Actions */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-neutral-700">
                  {selectedInvoice.invoiceNumber}
                </span>
                <span className={`font-mono text-xs font-medium ${
                  selectedInvoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  · {selectedInvoice.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedInvoice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark Paid (Full)</span>
                  </button>
                )}
                <button
                  onClick={handleSendInvoiceEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto text-neutral-900 bg-white print:p-0 print:m-0">
              {/* Agency Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-neutral-900 pb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">{settings.agencyName}</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">{settings.tagline}</p>
                  <div className="text-xs text-neutral-600 mt-2 space-y-0.5 font-mono">
                    <div>{settings.address}</div>
                    <div>{settings.phone} · {settings.email}</div>
                    <div>Tax ID: {settings.taxRegistrationNumber}</div>
                  </div>
                </div>

                <div className="sm:text-right font-mono">
                  <div className="text-xs uppercase tracking-widest text-neutral-400">Client Travel Invoice</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-neutral-600 mt-2 space-y-0.5">
                    <div>Date of Issue: <span className="font-semibold">{selectedInvoice.issueDate}</span></div>
                    <div>Payment Due: <span className="font-semibold">{selectedInvoice.dueDate}</span></div>
                    {selectedInvoice.bookingRef && (
                      <div>Booking Ref: <span className="font-semibold">{selectedInvoice.bookingRef}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono border-b border-neutral-200 pb-4">
                <div>
                  <span className="text-neutral-400 uppercase tracking-wider block text-2xs">Billed To Traveler:</span>
                  <div className="text-sm font-bold text-neutral-900 mt-1">{selectedInvoice.clientName}</div>
                  <div className="text-neutral-600">{selectedInvoice.clientEmail}</div>
                  <div className="text-neutral-600">{selectedInvoice.clientAddress}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-neutral-400 uppercase tracking-wider block text-2xs">Payment Status:</span>
                  <div className="text-sm font-bold text-neutral-900 mt-1 uppercase tracking-wide">
                    {selectedInvoice.status}
                  </div>
                  {selectedInvoice.paidDate && (
                    <div className="text-emerald-700">Settled on {selectedInvoice.paidDate} via {selectedInvoice.paymentMethod}</div>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-300 font-mono text-neutral-500 uppercase text-2xs">
                      <th className="py-2.5">Category & Description</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 text-right">Amount ({selectedInvoice.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <span className="font-semibold text-neutral-900 block">{item.description}</span>
                          <span className="font-mono text-2xs text-neutral-500">{item.category}</span>
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums">{item.quantity}</td>
                        <td className="py-3 text-right font-mono tabular-nums">${item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-neutral-200 pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold tabular-nums">${selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Taxes & VAT ({selectedInvoice.taxRatePercent}%):</span>
                      <span className="tabular-nums">${selectedInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.depositPaid > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Paid / Deposit Received:</span>
                      <span className="tabular-nums">-${selectedInvoice.depositPaid.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-300 pt-2">
                    <span>Total Balance Due:</span>
                    <span className="tabular-nums">${selectedInvoice.totalDue.toLocaleString()} {selectedInvoice.currency}</span>
                  </div>
                </div>
              </div>

              {/* Remittance & Bank Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs font-mono">
                <div>
                  <span className="font-bold text-neutral-900 block mb-1">Bank Wire Remittance Information:</span>
                  <div className="text-neutral-600 space-y-0.5">
                    <div>Beneficiary Bank: {settings.bankName}</div>
                    <div>SWIFT / BIC: {settings.swiftBic}</div>
                    <div>IBAN / Account: {settings.ibanOrAccountNumber}</div>
                    <div>Reference: {selectedInvoice.invoiceNumber}</div>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block mb-1">Terms & Conditions:</span>
                  <p className="text-neutral-600 leading-relaxed text-2xs">
                    {settings.termsConditions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Create Client Travel Invoice</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Issue formal itemized billing for client booking or services</p>
              </div>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200/80 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs">
              {/* Traveler & Linked Booking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Client / Billing Party</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Link to Booking (Optional)</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="">None / Custom Service</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookingRef} - {b.destination} (${b.totalAmount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoice Number & Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-2 bg-neutral-50/50">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                  <span className="font-semibold text-neutral-800">Itemized Travel Services ({lineItems.length})</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1 text-2xs font-semibold text-neutral-900 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-neutral-200">
                      <div className="col-span-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateLineItem(item.id, 'category', e.target.value)}
                          className="w-full border border-neutral-200 rounded px-1.5 py-1 text-2xs bg-white"
                        >
                          <option value="Accommodation">Accommodation</option>
                          <option value="Flights & Aviation">Flights & Aviation</option>
                          <option value="Ground Transport">Ground Transport</option>
                          <option value="Excursions & Guides">Excursions & Guides</option>
                          <option value="Bespoke Experiences">Bespoke Experiences</option>
                          <option value="Concierge Fee">Concierge Fee</option>
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Description of service..."
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          required
                          className="w-full border border-neutral-200 rounded px-2 py-1 text-2xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full border border-neutral-200 rounded px-1.5 py-1 text-2xs font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full border border-neutral-200 rounded px-1.5 py-1 text-2xs font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                          className="text-neutral-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Deposit */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 gap-3 text-right font-mono">
                  <div>
                    <label className="block text-2xs text-neutral-500 mb-0.5">Prepaid Deposit ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(Number(e.target.value))}
                      className="border border-neutral-300 rounded px-2 py-1 text-xs w-full"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-neutral-500 text-2xs">Subtotal: ${newSubtotal.toLocaleString()}</div>
                    <div className="text-sm font-bold text-neutral-900">Total Due: ${newTotalDue.toLocaleString()} USD</div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
