import React, { useState } from 'react';
import { ClientTraveler } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  X,
  CreditCard,
  Heart
} from 'lucide-react';

interface ClientsViewProps {
  clients: ClientTraveler[];
  onSaveClient: (client: ClientTraveler) => void;
  onBookTripForClient: (client: ClientTraveler) => void;
  onGenerateItinForClient: (client: ClientTraveler) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onSaveClient,
  onBookTripForClient,
  onGenerateItinForClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vipFilter, setVipFilter] = useState<string>('all');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientTraveler | null>(null);

  // New Client Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [vipTier, setVipTier] = useState<ClientTraveler['vipTier']>('Gold Elite');
  const [passportNumberMasked, setPassportNumberMasked] = useState('USA •••••');
  const [passportExpiry, setPassportExpiry] = useState('2028-12-31');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = vipFilter === 'all' || c.vipTier === vipFilter;

    return matchesSearch && matchesTier;
  });

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const newClient: ClientTraveler = {
      id: 'cli-' + Date.now(),
      fullName,
      email,
      phone,
      location,
      vipTier,
      totalTrips: 1,
      lifetimeSpendUSD: 15000,
      passportNumberMasked: passportNumberMasked || 'USA •••••',
      passportExpiry: passportExpiry || '2028-12-31',
      dietaryNotes,
      emergencyContact: {
        name: emergencyName || 'Family Member',
        relationship: 'Emergency Contact',
        phone: emergencyPhone || phone,
      },
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveClient(newClient);
    setIsAddClientModalOpen(false);
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setDietaryNotes('');
    setNotes('');
  };

  const isPassportExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    return expiry - now < sixMonthsMs;
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Client Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Traveler Directory & CRM
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            Client profiles, VIP tiers, passport validity checks, preferences, and travel history
          </p>
        </div>

        <button
          onClick={() => setIsAddClientModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Traveler Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, email, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">Tier:</span>
            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none"
            >
              <option value="all">All VIP Tiers</option>
              <option value="Diamond Ambassador">Diamond Ambassador</option>
              <option value="Gold Elite">Gold Elite</option>
              <option value="Silver Voyager">Silver Voyager</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traveler Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const expiringSoon = isPassportExpiringSoon(client.passportExpiry);

          return (
            <div
              key={client.id}
              className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 shadow-2xs flex flex-col justify-between transition-all"
            >
              <div>
                {/* Top Row: Name and VIP Tier */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{client.fullName}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mt-0.5">
                      <span>{client.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>Member since {client.createdAt}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-neutral-700">
                    {client.vipTier}
                  </span>
                </div>

                {/* Contact & LTV Strip */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-100 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 text-2xs block">Lifetime Spend:</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      ${client.lifetimeSpendUSD.toLocaleString()} USD
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-2xs block">Trips Taken:</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {client.totalTrips} Expeditions
                    </span>
                  </div>
                </div>

                {/* Passport & Compliance Check */}
                <div className="mt-3 p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between bg-neutral-50 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                    <span className="text-neutral-700">Passport: {client.passportNumberMasked}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {expiringSoon ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Expiring {client.passportExpiry}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500">Valid until {client.passportExpiry}</span>
                    )}
                  </div>
                </div>

                {/* Preferences & Dietary Notes */}
                {client.dietaryNotes && (
                  <div className="mt-3 text-xs text-neutral-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <span className="font-semibold text-amber-900 block mb-0.5">Preferences & Dietary:</span>
                    <span>{client.dietaryNotes}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <div className="text-xs text-neutral-500 truncate font-mono">
                  {client.email}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onBookTripForClient(client)}
                    className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                  >
                    + Book Trip
                  </button>
                  <button
                    onClick={() => onGenerateItinForClient(client)}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                  >
                    AI Itinerary
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Traveler Profile Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Add New Traveler Profile</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Register client preferences, passport, and VIP tier in CRM</p>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Full Traveler Name(s)</label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance & Marcus Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">VIP Tier</label>
                  <select
                    value={vipTier}
                    onChange={(e) => setVipTier(e.target.value as any)}
                    className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Diamond Ambassador">Diamond Ambassador</option>
                    <option value="Gold Elite">Gold Elite</option>
                    <option value="Silver Voyager">Silver Voyager</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">City, Country</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Passport (Country & Masked)</label>
                  <input
                    type="text"
                    placeholder="e.g. USA •••••4981"
                    value={passportNumberMasked}
                    onChange={(e) => setPassportNumberMasked(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Passport Expiration Date</label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dietary Preferences & Champagne Welcome Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Pescatarian, gluten-sensitive; prefers champagne welcome"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">General Travel Concierge Notes</label>
                <textarea
                  rows={2}
                  placeholder="Room preferences (high floor sea view), favorite airline alliances, private chauffeur notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  Save Traveler Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
