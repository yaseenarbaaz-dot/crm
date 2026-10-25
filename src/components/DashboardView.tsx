import React from 'react';
import { Booking, Invoice, Itinerary, ClientTraveler } from '../types';
import { NavTab } from './Navigation';
import { 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  Users, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Plane, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Compass
} from 'lucide-react';

interface DashboardViewProps {
  bookings: Booking[];
  invoices: Invoice[];
  itineraries: Itinerary[];
  clients: ClientTraveler[];
  setActiveTab: (tab: NavTab) => void;
  onOpenBooking: (booking: Booking) => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onOpenItinerary: (itinerary: Itinerary) => void;
  onNewBookingClick: () => void;
  onNewItineraryClick: () => void;
  onNewInvoiceClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  invoices,
  itineraries,
  clients,
  setActiveTab,
  onOpenBooking,
  onOpenInvoice,
  onOpenItinerary,
  onNewBookingClick,
  onNewItineraryClick,
  onNewInvoiceClick,
}) => {
  // Financial calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalCollected = invoices.reduce((acc, inv) => {
    if (inv.status === 'Paid') return acc + inv.subtotal;
    if (inv.status === 'Partial') return acc + inv.depositPaid;
    return acc;
  }, 0);
  const totalOutstanding = totalBilled - totalCollected;

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress');
  const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Partial');

  // Sorted upcoming departures
  const upcomingDepartures = [...bookings]
    .filter(b => b.status === 'Confirmed' || b.status === 'In Progress' || b.status === 'Quoted')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Operations & Bookings Radar
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 font-mono">
            <span>VoyageDesk Central Hub</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span>Agency Operations Active</span>
          </div>
        </div>

        {/* Quick action triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewItineraryClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Itinerary</span>
          </button>
          <button
            onClick={onNewInvoiceClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
          <button
            onClick={onNewBookingClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* 4-Column High-Yield KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Active Expeditions</span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {activeBookings.length}
            </span>
            <span className="text-xs text-neutral-500">of {bookings.length} total bookings</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            {bookings.filter(b => b.status === 'Confirmed').length} Confirmed · {bookings.filter(b => b.status === 'Quoted').length} Quoted
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Gross Bookings Value</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              ${totalBilled.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500">USD</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            Avg ${(totalBilled / Math.max(bookings.length, 1)).toFixed(0)} / booking
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Collected Revenue</span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              ${totalCollected.toLocaleString()}
            </span>
            <span className="text-xs text-amber-700 tabular-nums font-mono">
              (${totalOutstanding.toLocaleString()} pending)
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            {invoices.filter(i => i.status === 'Paid').length} invoices settled in full
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Travelers in Roster</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {clients.length}
            </span>
            <span className="text-xs text-neutral-500">profiles</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            {clients.filter(c => c.vipTier === 'Diamond Ambassador' || c.vipTier === 'Gold Elite').length} VIP Diamond & Gold
          </div>
        </div>
      </div>

      {/* Main Operations Split: Upcoming Departures & Invoices Awaiting Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Upcoming Departures Schedule */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Upcoming Client Departures</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Expeditions scheduled for departure and active field operations</p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View all bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {upcomingDepartures.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-500">
                No upcoming departures currently scheduled.
              </div>
            ) : (
              upcomingDepartures.map((booking) => {
                const daysUntil = Math.ceil(
                  (new Date(booking.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={booking.id}
                    onClick={() => onOpenBooking(booking)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Plane className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900 hover:underline">
                            {booking.destination}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">· {booking.bookingRef}</span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          {booking.clientName} ({booking.paxAdults + booking.paxChildren} pax)
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 font-mono">
                          <span>{booking.startDate}</span>
                          <span aria-hidden="true">→</span>
                          <span>{booking.endDate} ({booking.durationDays}d)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                      <span className="font-mono font-semibold text-sm text-neutral-900 tabular-nums">
                        ${booking.totalAmount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-mono text-xs ${
                          booking.status === 'Confirmed' ? 'text-emerald-700' :
                          booking.status === 'In Progress' ? 'text-blue-700' :
                          'text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                        {daysUntil > 0 && (
                          <span className="text-neutral-400 font-mono">({daysUntil}d away)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Invoices Awaiting Settlement */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Invoices & Receivables</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{pendingInvoices.length} invoices pending payment</p>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <span>All invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {pendingInvoices.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-500 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                <span>All invoices are settled!</span>
              </div>
            ) : (
              pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onOpenInvoice(inv)}
                  className="p-3 border border-neutral-200 hover:border-neutral-300 rounded-lg hover:bg-neutral-50/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-neutral-800">{inv.invoiceNumber}</span>
                    <span className={`font-mono text-xs ${
                      inv.status === 'Partial' ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {inv.status === 'Partial' ? 'Deposit Paid' : 'Awaiting Payment'}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 mt-1 truncate">
                    {inv.clientName}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-2 font-mono">
                    <span>Due: {inv.dueDate}</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      ${inv.totalDue.toLocaleString()} {inv.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Invoice CTA */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <button
              onClick={onNewInvoiceClick}
              className="w-full py-2 px-3 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Automated Itineraries Strip */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Curated & AI Automated Itineraries</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Comprehensive day-by-day travel packets ready to assign to travelers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewItineraryClick}
              className="text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate Custom AI Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('itineraries')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Browse All ({itineraries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {itineraries.slice(0, 2).map((itin) => (
            <div
              key={itin.id}
              onClick={() => onOpenItinerary(itin)}
              className="border border-neutral-200 hover:border-neutral-300 rounded-lg p-4 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>{itin.destination}</span>
                  <span>{itin.durationDays} Days / {itin.days.length} Daily Schedules</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mt-1">
                  {itin.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                  {itin.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-mono">{itin.travelStyle} · {itin.budgetTier}</span>
                <span className="font-medium text-neutral-900 hover:underline flex items-center gap-1">
                  <span>Open Itinerary Packet</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
