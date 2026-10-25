import React, { useState } from 'react';
import { Booking, BookingStatus, BookingSegment, TripType, ClientTraveler, Itinerary, Invoice } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Plane, 
  FileText, 
  Map, 
  ChevronRight, 
  Printer, 
  Check, 
  Clock, 
  AlertCircle,
  ExternalLink,
  X,
  CreditCard
} from 'lucide-react';
import { DestinationGraphic } from './DestinationGraphic';

interface BookingsViewProps {
  bookings: Booking[];
  clients: ClientTraveler[];
  itineraries: Itinerary[];
  invoices: Invoice[];
  onSaveBooking: (booking: Booking) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenItineraryById: (itinId: string) => void;
  onOpenInvoiceById: (invoiceId: string) => void;
  onCreateInvoiceForBooking: (booking: Booking) => void;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  clients,
  itineraries,
  invoices,
  onSaveBooking,
  onSelectBooking,
  onOpenItineraryById,
  onOpenInvoiceById,
  onCreateInvoiceForBooking,
  selectedBooking,
  setSelectedBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isVoucherPrintModalOpen, setIsVoucherPrintModalOpen] = useState(false);

  // New Booking Form State
  const [newClientMode, setNewClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('2026-06-15');
  const [endDate, setEndDate] = useState('2026-06-22');
  const [paxAdults, setPaxAdults] = useState(2);
  const [paxChildren, setPaxChildren] = useState(0);
  const [tripType, setTripType] = useState<TripType>('Bespoke Luxury');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [totalAmount, setTotalAmount] = useState(12500);
  const [currency, setCurrency] = useState('USD');
  const [depositAmount, setDepositAmount] = useState(3125);
  const [isDepositPaid, setIsDepositPaid] = useState(true);
  const [assignedConsultant, setAssignedConsultant] = useState('Julian Thorne (Senior Director)');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedItinId, setSelectedItinId] = useState<string>('');

  // New segment for selected booking
  const [newSegmentType, setNewSegmentType] = useState<'Flight' | 'Hotel' | 'Transfer' | 'Activity' | 'Yacht'>('Hotel');
  const [newSegmentTitle, setNewSegmentTitle] = useState('');
  const [newSegmentDetails, setNewSegmentDetails] = useState('');
  const [newSegmentCode, setNewSegmentCode] = useState('');
  const [newSegmentDate, setNewSegmentDate] = useState('');
  const [showAddSegmentForm, setShowAddSegmentForm] = useState(false);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || b.tripType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalClientName = clientName;
    let finalClientEmail = clientEmail;
    let finalClientPhone = clientPhone;
    let finalClientId = 'cli-custom-' + Date.now();

    if (newClientMode === 'existing') {
      const foundClient = clients.find((c) => c.id === selectedClientId);
      if (foundClient) {
        finalClientName = foundClient.fullName;
        finalClientEmail = foundClient.email;
        finalClientPhone = foundClient.phone;
        finalClientId = foundClient.id;
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRef = `VOY-2026-${randomSuffix}`;

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingRef: newRef,
      clientId: finalClientId,
      clientName: finalClientName || 'Private Traveler',
      clientEmail: finalClientEmail || 'client@email.com',
      clientPhone: finalClientPhone || '+1 (555) 000-0000',
      destination: destination || 'Bespoke Private Expedition',
      startDate,
      endDate,
      durationDays,
      paxAdults: Number(paxAdults) || 2,
      paxChildren: Number(paxChildren) || 0,
      tripType,
      status,
      totalAmount: Number(totalAmount) || 0,
      currency,
      depositAmount: Number(depositAmount) || 0,
      isDepositPaid,
      assignedConsultant,
      linkedItineraryId: selectedItinId || undefined,
      segments: [
        {
          type: 'Hotel',
          title: `${destination} Luxury Suite Allocation`,
          details: `Confirmed for ${paxAdults + paxChildren} guests`,
          confirmationCode: `CONF-${randomSuffix}`,
          date: startDate,
          status: 'Confirmed',
        },
      ],
      specialRequests,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveBooking(newBooking);
    setIsNewBookingModalOpen(false);
    setSelectedBooking(newBooking);
  };

  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newSegmentTitle) return;

    const newSegment: BookingSegment = {
      type: newSegmentType,
      title: newSegmentTitle,
      details: newSegmentDetails || 'Confirmed segment',
      confirmationCode: newSegmentCode || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newSegmentDate || selectedBooking.startDate,
      status: 'Confirmed',
    };

    const updatedBooking: Booking = {
      ...selectedBooking,
      segments: [...selectedBooking.segments, newSegment],
    };

    onSaveBooking(updatedBooking);
    setSelectedBooking(updatedBooking);
    setNewSegmentTitle('');
    setNewSegmentDetails('');
    setNewSegmentCode('');
    setShowAddSegmentForm(false);
  };

  const handleUpdateStatus = (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      status: newStatus,
    };
    onSaveBooking(updated);
    setSelectedBooking(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Bookings & Reservations
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            Manage client itineraries, reservations, flight segments, and confirmation vouchers
          </p>
        </div>

        <button
          onClick={() => setIsNewBookingModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Booking</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, destination, or ref code (e.g. VOY-2026-108)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>

          {/* Trip Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">Style:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">All Styles</option>
              <option value="Bespoke Luxury">Bespoke Luxury</option>
              <option value="Cultural Discovery">Cultural Discovery</option>
              <option value="Adventure & Nature">Adventure & Nature</option>
              <option value="Romantic Honeymoon">Romantic Honeymoon</option>
              <option value="Corporate Retreat">Corporate Retreat</option>
            </select>
          </div>
        </div>

        {/* Interactive Filter Tabs / Segmented Controls (Buttons allowed by Constitution) */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-neutral-100">
          {['all', 'confirmed', 'in progress', 'quoted', 'completed', 'inquiry'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap capitalize cursor-pointer ${
                statusFilter === tab
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {tab === 'all' ? 'All Bookings' : tab}
            </button>
          ))}
          <span className="text-xs text-neutral-400 ml-auto font-mono whitespace-nowrap pl-2">
            {filteredBookings.length} matches
          </span>
        </div>
      </div>

      {/* Bookings High-Density Data Grid / Cards */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-medium text-neutral-600">
                <th className="py-3 px-4">Ref & Destination</th>
                <th className="py-3 px-4">Client / Traveler</th>
                <th className="py-3 px-4">Trip Dates & Pax</th>
                <th className="py-3 px-4 text-right">Total Price</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-neutral-500 text-2xs">{b.bookingRef}</div>
                      <div className="font-semibold text-neutral-900 group-hover:underline">{b.destination}</div>
                      <div className="text-neutral-400 text-2xs font-mono">{b.tripType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900">{b.clientName}</div>
                      <div className="text-neutral-500 font-mono text-2xs">{b.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-neutral-800">{b.startDate} → {b.endDate}</div>
                      <div className="text-neutral-500 text-2xs">{b.durationDays} days · {b.paxAdults + b.paxChildren} travelers</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                      ${b.totalAmount.toLocaleString()} {b.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${b.isDepositPaid ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        <span>{b.isDepositPaid ? 'Paid' : 'Unpaid'}</span>
                        <span className="text-neutral-400 text-2xs">(${b.depositAmount.toLocaleString()})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Zero-pill: clean text with domain color */}
                      <span className={`font-mono text-xs font-medium ${
                        b.status === 'Confirmed' ? 'text-emerald-700' :
                        b.status === 'In Progress' ? 'text-blue-700' :
                        b.status === 'Quoted' ? 'text-amber-700' :
                        b.status === 'Completed' ? 'text-neutral-700' :
                        'text-neutral-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        >
                          Manage
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

      {/* Selected Booking Detail Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50/60">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
                  <span>Booking Reference: {selectedBooking.bookingRef}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedBooking.tripType}</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mt-1">
                  {selectedBooking.destination}
                </h2>
                <div className="text-xs text-neutral-600 mt-0.5">
                  Traveler: <span className="font-semibold">{selectedBooking.clientName}</span> · {selectedBooking.paxAdults + selectedBooking.paxChildren} guests
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200/80 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Destination Visual Banner */}
              <DestinationGraphic destination={selectedBooking.destination} variant="card" className="rounded-lg shadow-2xs" />

              {/* Status & Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block">Status</span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as BookingStatus)}
                    className="font-semibold text-neutral-900 bg-white border border-neutral-200 rounded px-1.5 py-0.5 mt-0.5 focus:outline-none"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <span className="text-neutral-500 block">Total Investment</span>
                  <span className="font-semibold text-neutral-900 text-sm tabular-nums mt-0.5 block">
                    ${selectedBooking.totalAmount.toLocaleString()} {selectedBooking.currency}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Deposit Status</span>
                  <span className="font-semibold text-neutral-900 mt-0.5 block">
                    {selectedBooking.isDepositPaid ? '✓ Paid ($' + selectedBooking.depositAmount.toLocaleString() + ')' : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Trip Dates</span>
                  <span className="text-neutral-900 mt-0.5 block">
                    {selectedBooking.startDate} ({selectedBooking.durationDays}d)
                  </span>
                </div>
              </div>

              {/* Linked Modules: Itinerary & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Linked Itinerary */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                    <span className="flex items-center gap-1.5">
                      <Map className="w-4 h-4 text-amber-600" />
                      <span>Linked Travel Itinerary</span>
                    </span>
                    {selectedBooking.linkedItineraryId && (
                      <button
                        onClick={() => {
                          setSelectedBooking(null);
                          onOpenItineraryById(selectedBooking.linkedItineraryId!);
                        }}
                        className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 mt-2">
                    {selectedBooking.linkedItineraryId ? (
                      <div>
                        <span className="font-medium text-neutral-900">
                          {itineraries.find((i) => i.id === selectedBooking.linkedItineraryId)?.title || 'Assigned Itinerary Packet'}
                        </span>
                        <div className="text-neutral-500 mt-0.5">Comprehensive day-by-day activities & local insider guide attached.</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-neutral-400">No itinerary attached yet.</span>
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(null);
                              onOpenItineraryById(itineraries[0]?.id || '');
                            }}
                            className="text-xs font-medium text-neutral-900 underline cursor-pointer"
                          >
                            Attach or create itinerary packet →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Invoice */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Client Invoice</span>
                    </span>
                    {selectedBooking.linkedInvoiceId ? (
                      <button
                        onClick={() => {
                          setSelectedBooking(null);
                          onOpenInvoiceById(selectedBooking.linkedInvoiceId!);
                        }}
                        className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Invoice</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onCreateInvoiceForBooking(selectedBooking)}
                        className="text-xs font-medium text-neutral-900 hover:underline cursor-pointer"
                      >
                        + Generate Invoice
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 mt-2">
                    {selectedBooking.linkedInvoiceId ? (
                      <div>
                        <span className="font-mono text-neutral-900 font-medium">
                          {invoices.find((i) => i.id === selectedBooking.linkedInvoiceId)?.invoiceNumber || 'INV-Generated'}
                        </span>
                        <div className="text-neutral-500 mt-0.5">
                          Status: {invoices.find((i) => i.id === selectedBooking.linkedInvoiceId)?.status || 'Active'} · ${selectedBooking.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400">Invoice not yet billed. Click generate to create itemized travel invoice.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Segments (Flights, Accommodations, Charters) */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Travel Segments & Confirmations ({selectedBooking.segments.length})
                  </h3>
                  <button
                    onClick={() => setShowAddSegmentForm(!showAddSegmentForm)}
                    className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Segment</span>
                  </button>
                </div>

                {/* Add Segment Form */}
                {showAddSegmentForm && (
                  <form onSubmit={handleAddSegment} className="my-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Type</label>
                        <select
                          value={newSegmentType}
                          onChange={(e) => setNewSegmentType(e.target.value as any)}
                          className="w-full border border-neutral-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="Flight">Flight</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Transfer">Ground Transfer</option>
                          <option value="Activity">Activity / Docent</option>
                          <option value="Yacht">Yacht / Marine</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-neutral-600 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. British Airways Club World / Hotel Belmond Suite"
                          value={newSegmentTitle}
                          onChange={(e) => setNewSegmentTitle(e.target.value)}
                          required
                          className="w-full border border-neutral-300 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Confirmation Code</label>
                        <input
                          type="text"
                          placeholder="e.g. BA-7789 or SIR-4421"
                          value={newSegmentCode}
                          onChange={(e) => setNewSegmentCode(e.target.value)}
                          className="w-full border border-neutral-300 rounded px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={newSegmentDate}
                          onChange={(e) => setNewSegmentDate(e.target.value)}
                          className="w-full border border-neutral-300 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1">Notes / Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Deluxe Sea View Suite with breakfast included"
                        value={newSegmentDetails}
                        onChange={(e) => setNewSegmentDetails(e.target.value)}
                        className="w-full border border-neutral-300 rounded px-2 py-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddSegmentForm(false)}
                        className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer"
                      >
                        Save Segment
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-3 divide-y divide-neutral-100">
                  {selectedBooking.segments.map((seg, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xs font-semibold uppercase text-neutral-500">[{seg.type}]</span>
                          <span className="font-medium text-neutral-900">{seg.title}</span>
                          <span className="font-mono text-neutral-400">({seg.confirmationCode})</span>
                        </div>
                        <div className="text-neutral-500 mt-0.5">{seg.details} · {seg.date}</div>
                      </div>
                      <span className="text-emerald-700 font-mono text-2xs font-medium">✓ {seg.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Special Traveler Preferences & Concierge Notes:</span>
                  <span>{selectedBooking.specialRequests}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setIsVoucherPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Travel Voucher</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Travel Voucher Modal */}
      {isVoucherPrintModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-300 shadow-2xl p-8 space-y-6 my-8 text-neutral-900">
            {/* Agency Header on Voucher */}
            <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
              <div>
                <span className="text-xl font-bold tracking-tight uppercase">VoyageDesk Global Journeys</span>
                <p className="text-xs text-neutral-500 font-mono">Official Travel Confirmation Voucher</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-neutral-900">{selectedBooking.bookingRef}</div>
                <div className="text-neutral-500">Issued: {selectedBooking.createdAt}</div>
              </div>
            </div>

            {/* Voucher Details Table */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-neutral-200 pb-4">
              <div>
                <span className="text-neutral-500 block">Lead Guest / Traveler</span>
                <span className="font-semibold text-neutral-900 text-sm block mt-0.5">{selectedBooking.clientName}</span>
                <span className="text-neutral-600 block">{selectedBooking.clientEmail}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Destination & Dates</span>
                <span className="font-semibold text-neutral-900 text-sm block mt-0.5">{selectedBooking.destination}</span>
                <span className="text-neutral-600 block">{selectedBooking.startDate} to {selectedBooking.endDate} ({selectedBooking.durationDays} Days)</span>
              </div>
            </div>

            {/* Confirmed Segments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Confirmed Services & Allocations</h4>
              <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200 text-xs">
                {selectedBooking.segments.map((seg, i) => (
                  <div key={i} className="p-3 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-neutral-900">[{seg.type}] {seg.title}</div>
                      <div className="text-neutral-600 mt-0.5">{seg.details}</div>
                      <div className="text-neutral-400 font-mono text-2xs mt-1">Date: {seg.date}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-neutral-900 block">{seg.confirmationCode}</span>
                      <span className="text-emerald-700 text-2xs">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions & Concierge Support */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs space-y-1 font-mono">
              <div className="font-semibold text-neutral-900">24/7 Global Concierge Dispatch:</div>
              <div className="text-neutral-600">Emergency Operations Desk: +1 (415) 890-4420 · concierge@voyagedesk.travel</div>
              <div className="text-neutral-500 text-2xs mt-2">
                Present this voucher along with government-issued photo passport upon arrival at flight gates and boutique hotel check-in desks.
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <button
                onClick={() => setIsVoucherPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Create New Tour & Travel Booking</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Register client reservation and initiate travel workflow</p>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200/80 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="p-6 space-y-4 text-xs">
              {/* Traveler Selection Mode */}
              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700">Client / Traveler Profile</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewClientMode('existing')}
                    className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                      newClientMode === 'existing' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    Select Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewClientMode('new')}
                    className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                      newClientMode === 'new' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    + Enter New Traveler
                  </button>
                </div>

                {newClientMode === 'existing' ? (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.email}) - {c.vipTier}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required={newClientMode === 'new'}
                      className="border border-neutral-300 rounded-lg p-2"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required={newClientMode === 'new'}
                      className="border border-neutral-300 rounded-lg p-2"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="border border-neutral-300 rounded-lg p-2"
                    />
                  </div>
                )}
              </div>

              {/* Destination & Trip Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Amalfi Coast & Capri, Italy"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Trip Style</label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value as TripType)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Bespoke Luxury">Bespoke Luxury</option>
                    <option value="Cultural Discovery">Cultural Discovery</option>
                    <option value="Adventure & Nature">Adventure & Nature</option>
                    <option value="Romantic Honeymoon">Romantic Honeymoon</option>
                    <option value="Corporate Retreat">Corporate Retreat</option>
                    <option value="Family Expedition">Family Expedition</option>
                  </select>
                </div>
              </div>

              {/* Dates & Pax */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={paxAdults}
                    onChange={(e) => setPaxAdults(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={paxChildren}
                    onChange={(e) => setPaxChildren(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Financial & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Total Amount ($ USD)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Deposit ($ USD)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Inquiry">Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Deposit Paid Toggle & Link Itinerary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDepositPaid}
                    onChange={(e) => setIsDepositPaid(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="font-medium text-neutral-800">Deposit is already authorized/paid</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-mono">Link Itinerary:</span>
                  <select
                    value={selectedItinId}
                    onChange={(e) => setSelectedItinId(e.target.value)}
                    className="border border-neutral-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="">None (Create later)</option>
                    {itineraries.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.destination} ({it.durationDays}d)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Special Traveler Requests & Concierge Notes</label>
                <textarea
                  rows={2}
                  placeholder="Anniversary celebration, dietary preferences, private guide preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  Confirm & Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
