import React from 'react';
import { Compass, Calendar, FileText, Map, Users, Settings, Plus, Sparkles } from 'lucide-react';

export type NavTab = 'dashboard' | 'bookings' | 'invoices' | 'itineraries' | 'clients' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onNewBookingClick: () => void;
  onNewItineraryClick: () => void;
  pendingInvoicesCount: number;
  activeBookingsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onNewBookingClick,
  onNewItineraryClick,
  pendingInvoicesCount,
  activeBookingsCount,
}) => {
  return (
    <>
      {/* Top Bar adhering strictly to the 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element, 1 line, no pills) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
            >
              VoyageDesk
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
                activeTab === 'dashboard' ? 'text-neutral-900 border-neutral-900 font-semibold' : 'border-transparent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'bookings' ? 'text-neutral-900 border-neutral-900 font-semibold' : 'border-transparent'
              }`}
            >
              <span>Bookings</span>
              {activeBookingsCount > 0 && (
                <span className="text-xs font-mono text-neutral-500">({activeBookingsCount})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'invoices' ? 'text-neutral-900 border-neutral-900 font-semibold' : 'border-transparent'
              }`}
            >
              <span>Invoices</span>
              {pendingInvoicesCount > 0 && (
                <span className="text-xs font-mono text-amber-700">({pendingInvoicesCount} due)</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('itineraries')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
                activeTab === 'itineraries' ? 'text-neutral-900 border-neutral-900 font-semibold' : 'border-transparent'
              }`}
            >
              Itineraries
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
                activeTab === 'clients' ? 'text-neutral-900 border-neutral-900 font-semibold' : 'border-transparent'
              }`}
            >
              Travelers
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onNewItineraryClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Automated AI Itinerary Generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Planner</span>
            </button>
            <button
              onClick={onNewBookingClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center justify-around border-t border-neutral-200/80 px-2 py-2 overflow-x-auto text-xs font-medium text-neutral-600 bg-neutral-50/90">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'invoices' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'itineraries' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Itineraries
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'clients' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Travelers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : ''
            }`}
          >
            Agency
          </button>
        </div>
      </header>
    </>
  );
};
