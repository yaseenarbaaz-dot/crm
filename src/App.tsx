/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Booking, 
  ClientTraveler, 
  Invoice, 
  Itinerary, 
  AgencySettings 
} from './types';
import { 
  loadSavedData, 
  saveAllData, 
  resetDemoData, 
  DEFAULT_AGENCY_SETTINGS,
  INITIAL_BOOKINGS,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_ITINERARIES
} from './data/mockData';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { BookingsView } from './components/BookingsView';
import { InvoicesView } from './components/InvoicesView';
import { ItinerariesView } from './components/ItinerariesView';
import { ClientsView } from './components/ClientsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientTraveler[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [settings, setSettings] = useState<AgencySettings>(DEFAULT_AGENCY_SETTINGS);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSavedData();
    setBookings(loaded.bookings);
    setClients(loaded.clients);
    setInvoices(loaded.invoices);
    setItineraries(loaded.itineraries);
    setSettings(loaded.settings);
    setDataLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!dataLoaded) return;
    saveAllData({
      bookings,
      clients,
      invoices,
      itineraries,
      settings,
    });
  }, [bookings, clients, invoices, itineraries, settings, dataLoaded]);

  // Handlers
  const handleSaveBooking = (booking: Booking) => {
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === booking.id);
      if (exists) {
        return prev.map((b) => (b.id === booking.id ? booking : b));
      }
      return [booking, ...prev];
    });
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === invoice.id);
      if (exists) {
        return prev.map((i) => (i.id === invoice.id ? invoice : i));
      }
      return [invoice, ...prev];
    });

    // If invoice is linked to a booking, update the booking's linkedInvoiceId
    if (invoice.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === invoice.bookingId ? { ...b, linkedInvoiceId: invoice.id } : b))
      );
    }
  };

  const handleSaveItinerary = (itinerary: Itinerary) => {
    setItineraries((prev) => {
      const exists = prev.some((it) => it.id === itinerary.id);
      if (exists) {
        return prev.map((it) => (it.id === itinerary.id ? itinerary : it));
      }
      return [itinerary, ...prev];
    });
  };

  const handleSaveClient = (client: ClientTraveler) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) {
        return prev.map((c) => (c.id === client.id ? client : c));
      }
      return [client, ...prev];
    });
  };

  const handleSaveSettings = (newSettings: AgencySettings) => {
    setSettings(newSettings);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all Tour & Travels CRM data to initial demo records?')) {
      resetDemoData();
      setBookings(INITIAL_BOOKINGS);
      setClients(INITIAL_CLIENTS);
      setInvoices(INITIAL_INVOICES);
      setItineraries(INITIAL_ITINERARIES);
      setSettings(DEFAULT_AGENCY_SETTINGS);
      setSelectedBooking(null);
      setSelectedInvoice(null);
      setSelectedItinerary(null);
    }
  };

  const handleLinkItineraryToBooking = (itineraryId: string, bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, linkedItineraryId: itineraryId } : b))
    );
    setActiveTab('bookings');
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking) {
      setSelectedBooking({ ...targetBooking, linkedItineraryId: itineraryId });
    }
  };

  const handleCreateInvoiceForBooking = (booking: Booking) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: `INV-2026-${randomSuffix}`,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      clientId: booking.clientId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientAddress: 'Client Billing Address on File',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: booking.startDate,
      currency: 'USD',
      items: [
        {
          id: 'item-1',
          description: `${booking.destination} Full Bespoke Expedition (${booking.durationDays} Days, ${booking.paxAdults + booking.paxChildren} Pax)`,
          category: 'Accommodation',
          quantity: 1,
          unitPrice: booking.totalAmount,
          amount: booking.totalAmount,
        },
      ],
      subtotal: booking.totalAmount,
      taxRatePercent: 0,
      taxAmount: 0,
      discountPercent: 0,
      discountAmount: 0,
      depositPaid: booking.isDepositPaid ? booking.depositAmount : 0,
      totalDue: booking.totalAmount - (booking.isDepositPaid ? booking.depositAmount : 0),
      status: booking.isDepositPaid ? 'Partial' : 'Sent',
      notes: 'Automated invoice issued for confirmed reservation.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    handleSaveInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    setActiveTab('invoices');
  };

  const handleBookTripForClient = (client: ClientTraveler) => {
    setActiveTab('bookings');
  };

  const handleGenerateItinForClient = (client: ClientTraveler) => {
    setActiveTab('itineraries');
  };

  const pendingInvoicesCount = invoices.filter(
    (i) => i.status === 'Sent' || i.status === 'Partial' || i.status === 'Overdue'
  ).length;

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'In Progress'
  ).length;

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-mono text-xs text-neutral-500">
        Loading VoyageDesk Operations Console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewBookingClick={() => {
          setActiveTab('bookings');
          setSelectedBooking(null);
        }}
        onNewItineraryClick={() => {
          setActiveTab('itineraries');
        }}
        pendingInvoicesCount={pendingInvoicesCount}
        activeBookingsCount={activeBookingsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            bookings={bookings}
            invoices={invoices}
            itineraries={itineraries}
            clients={clients}
            setActiveTab={setActiveTab}
            onOpenBooking={(b) => {
              setSelectedBooking(b);
              setActiveTab('bookings');
            }}
            onOpenInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveTab('invoices');
            }}
            onOpenItinerary={(itin) => {
              setSelectedItinerary(itin);
              setActiveTab('itineraries');
            }}
            onNewBookingClick={() => {
              setActiveTab('bookings');
            }}
            onNewItineraryClick={() => {
              setActiveTab('itineraries');
            }}
            onNewInvoiceClick={() => {
              setActiveTab('invoices');
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
            clients={clients}
            itineraries={itineraries}
            invoices={invoices}
            onSaveBooking={handleSaveBooking}
            onSelectBooking={(b) => setSelectedBooking(b)}
            onOpenItineraryById={(itinId) => {
              const it = itineraries.find((i) => i.id === itinId);
              if (it) setSelectedItinerary(it);
              setActiveTab('itineraries');
            }}
            onOpenInvoiceById={(invoiceId) => {
              const inv = invoices.find((i) => i.id === invoiceId);
              if (inv) setSelectedInvoice(inv);
              setActiveTab('invoices');
            }}
            onCreateInvoiceForBooking={handleCreateInvoiceForBooking}
            selectedBooking={selectedBooking}
            setSelectedBooking={setSelectedBooking}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            bookings={bookings}
            clients={clients}
            settings={settings}
            onSaveInvoice={handleSaveInvoice}
            selectedInvoice={selectedInvoice}
            setSelectedInvoice={setSelectedInvoice}
            onOpenBookingById={(bId) => {
              const b = bookings.find((bk) => bk.id === bId);
              if (b) setSelectedBooking(b);
              setActiveTab('bookings');
            }}
          />
        )}

        {activeTab === 'itineraries' && (
          <ItinerariesView
            itineraries={itineraries}
            bookings={bookings}
            clients={clients}
            onSaveItinerary={handleSaveItinerary}
            onLinkItineraryToBooking={handleLinkItineraryToBooking}
            selectedItinerary={selectedItinerary}
            setSelectedItinerary={setSelectedItinerary}
            onOpenBookingById={(bId) => {
              const b = bookings.find((bk) => bk.id === bId);
              if (b) setSelectedBooking(b);
              setActiveTab('bookings');
            }}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            onSaveClient={handleSaveClient}
            onBookTripForClient={handleBookTripForClient}
            onGenerateItinForClient={handleGenerateItinForClient}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetDemoData={handleResetData}
          />
        )}
      </main>

      {/* Discreet Footer adhering to anti-slop guidelines */}
      <footer className="border-t border-neutral-200 bg-white py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>
            <span>VoyageDesk Global Journeys CRM</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Bespoke Travel Management System</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Agency Profile & Remittance
            </button>
            <span aria-hidden="true">·</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
