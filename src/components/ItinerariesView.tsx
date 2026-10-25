import React, { useState } from 'react';
import { Itinerary, ItineraryDay, ItineraryActivity, Booking, ClientTraveler } from '../types';
import { DestinationGraphic } from './DestinationGraphic';
import { 
  Sparkles, 
  Map, 
  Calendar, 
  Clock, 
  Compass, 
  Printer, 
  Plus, 
  CheckCircle2, 
  Share2, 
  Hotel, 
  Car, 
  Info, 
  CheckSquare, 
  Edit3, 
  Trash2, 
  X,
  ExternalLink,
  ChevronRight,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

interface ItinerariesViewProps {
  itineraries: Itinerary[];
  bookings: Booking[];
  clients: ClientTraveler[];
  onSaveItinerary: (itinerary: Itinerary) => void;
  onLinkItineraryToBooking: (itineraryId: string, bookingId: string) => void;
  selectedItinerary: Itinerary | null;
  setSelectedItinerary: (itinerary: Itinerary | null) => void;
  onOpenBookingById: (bookingId: string) => void;
}

const DESTINATION_PRESETS = [
  { name: 'Amalfi Coast & Capri, Italy', style: 'Bespoke Luxury', days: 5 },
  { name: 'Kyoto & Tokyo, Japan', style: 'Cultural Discovery', days: 6 },
  { name: 'Swiss Alps & St. Moritz, Switzerland', style: 'Bespoke Luxury', days: 7 },
  { name: 'Serengeti & Ngorongoro Safari, Tanzania', style: 'Adventure & Nature', days: 7 },
  { name: 'Santorini & Crete, Greece', style: 'Romantic Honeymoon', days: 5 },
  { name: 'Reykjavik & Golden Circle, Iceland', style: 'Adventure & Nature', days: 5 },
  { name: 'Bali & Ubud Rainforest Retreat, Indonesia', style: 'Bespoke Luxury', days: 6 },
];

export const ItinerariesView: React.FC<ItinerariesViewProps> = ({
  itineraries,
  bookings,
  clients,
  onSaveItinerary,
  onLinkItineraryToBooking,
  selectedItinerary,
  setSelectedItinerary,
  onOpenBookingById,
}) => {
  const [activeItin, setActiveItin] = useState<Itinerary>(selectedItinerary || itineraries[0]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedBookingForLink, setSelectedBookingForLink] = useState(bookings[0]?.id || '');

  // Generator form inputs
  const [destInput, setDestInput] = useState('');
  const [daysInput, setDaysInput] = useState(5);
  const [styleInput, setStyleInput] = useState('Bespoke Luxury');
  const [travelersInput, setTravelersInput] = useState('Couple (2 Adults)');
  const [budgetInput, setBudgetInput] = useState('Premium');
  const [paceInput, setPaceInput] = useState('Balanced');
  const [preferencesInput, setPreferencesInput] = useState('');

  // Editing activity state
  const [editingDayNumber, setEditingDayNumber] = useState<number | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [editTime, setEditTime] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Update activeItin when selectedItinerary prop changes
  React.useEffect(() => {
    if (selectedItinerary) {
      setActiveItin(selectedItinerary);
      setActiveDayIndex(0);
    }
  }, [selectedItinerary]);

  const handleSelectPreset = (preset: { name: string; style: string; days: number }) => {
    setDestInput(preset.name);
    setStyleInput(preset.style);
    setDaysInput(preset.days);
  };

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destInput.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Analyzing destination geography, premier sights and luxury lodging...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Choreographing day-by-day morning, afternoon, and evening timelines...');
      }, 900);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Curating local insider advice and packing readiness checklist...');
      }, 1900);

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destInput.trim(),
          days: Number(daysInput) || 5,
          style: styleInput,
          travelers: travelersInput,
          budget: budgetInput,
          pace: paceInput,
          preferences: preferencesInput,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();
      if (data && data.itinerary) {
        const generated = data.itinerary;
        const newItin: Itinerary = {
          id: 'itin-' + Date.now(),
          title: generated.title || `${destInput} Curated Journey`,
          tagline: generated.tagline || `Artfully planned ${daysInput}-day expedition in ${destInput}`,
          destination: generated.destination || destInput,
          durationDays: Number(daysInput) || 5,
          travelStyle: styleInput,
          travelersProfile: travelersInput,
          budgetTier: budgetInput,
          bestSeason: generated.bestSeason || 'Spring to Autumn',
          estimatedCostUSD: generated.estimatedCostUSD || `$${daysInput * 750} total`,
          summary: generated.summary || 'A bespoke luxury itinerary crafted with precision.',
          highlights: generated.highlights || [
            'Private airport concierge transfers',
            'Exclusive cultural landmark docent tours',
            'Handpicked boutique hotel allocations',
          ],
          days: generated.days || [],
          insiderTips: generated.insiderTips || [
            'Notify concierge of special dietary requests in advance.',
            'Carry small local currency denominations for artisan shops.',
          ],
          packingEssentials: generated.packingEssentials || [
            'Smart casual evening attire',
            'Comfortable walking shoes for city tours',
            'Universal power adapters',
          ],
          createdAt: new Date().toISOString().split('T')[0],
        };

        onSaveItinerary(newItin);
        setActiveItin(newItin);
        setSelectedItinerary(newItin);
        setActiveDayIndex(0);
        setIsGeneratorModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEditActivity = (dayNum: number, period: 'morning' | 'afternoon' | 'evening', act: ItineraryActivity) => {
    setEditingDayNumber(dayNum);
    setEditingPeriod(period);
    setEditTime(act.time);
    setEditActivity(act.activity);
    setEditLocation(act.location);
    setEditDesc(act.description);
  };

  const handleSaveActivityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDayNumber) return;

    const updatedDays = activeItin.days.map((day) => {
      if (day.dayNumber === editingDayNumber) {
        return {
          ...day,
          [editingPeriod]: {
            time: editTime,
            activity: editActivity,
            location: editLocation,
            description: editDesc,
          },
        };
      }
      return day;
    });

    const updatedItin: Itinerary = {
      ...activeItin,
      days: updatedDays,
    };

    setActiveItin(updatedItin);
    onSaveItinerary(updatedItin);
    setEditingDayNumber(null);
  };

  const handleLinkToBookingSubmit = () => {
    if (!selectedBookingForLink) return;
    onLinkItineraryToBooking(activeItin.id, selectedBookingForLink);
    setIsLinkModalOpen(false);
  };

  const currentDay = activeItin.days[activeDayIndex] || activeItin.days[0];

  return (
    <div className="space-y-6">
      {/* Header and Generator Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Automated Itinerary Planning
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            AI-powered day-by-day expedition builder with morning, afternoon, evening activities and traveler packets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate New AI Itinerary</span>
          </button>
        </div>
      </div>

      {/* Itinerary Selector Strip */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider pl-2 pr-1 shrink-0">
          Saved Itineraries:
        </span>
        {itineraries.map((it) => (
          <button
            key={it.id}
            onClick={() => {
              setActiveItin(it);
              setSelectedItinerary(it);
              setActiveDayIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeItin.id === it.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <span>{it.destination}</span>
            <span className="text-neutral-400 font-mono ml-1.5 text-2xs">({it.durationDays}d)</span>
          </button>
        ))}
      </div>

      {/* Main Itinerary Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 of 12 spans): Day-by-Day Detailed Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Banner with Destination Artwork */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <DestinationGraphic destination={activeItin.destination} variant="banner" />
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <span>{activeItin.travelStyle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeItin.budgetTier}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeItin.bestSeason}</span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mt-1">
                    {activeItin.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Assign to Booking</span>
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Traveler Packet</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed mt-4">
                {activeItin.summary}
              </p>

              {/* Highlights Pill-Free Bullet List */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2 font-mono">
                  Curated Expedition Highlights
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-800">
                  {activeItin.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">·</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 font-mono">
                Daily Schedule Timeline ({activeItin.days.length} Days)
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                Viewing Day {activeDayIndex + 1} of {activeItin.days.length}
              </span>
            </div>

            {/* Day Selector Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {activeItin.days.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 text-left ${
                    activeDayIndex === idx
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span className="block font-bold">Day {day.dayNumber}</span>
                  <span className="block text-2xs opacity-80 truncate max-w-[120px]">{day.theme}</span>
                </button>
              ))}
            </div>

            {/* Current Day Schedule Cards */}
            {currentDay && (
              <div className="space-y-4 pt-2">
                <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-neutral-900">
                      Day {currentDay.dayNumber}: {currentDay.title}
                    </span>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{currentDay.theme}</p>
                  </div>
                  {currentDay.hotelRecommendation && (
                    <div className="text-xs text-neutral-700 flex items-center gap-1.5 font-mono">
                      <Hotel className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{currentDay.hotelRecommendation}</span>
                    </div>
                  )}
                </div>

                {/* Morning Activity */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-neutral-900 uppercase font-mono tracking-wider">Morning Slot</span>
                      <span className="text-neutral-500 font-mono">({currentDay.morning.time})</span>
                    </div>
                    <button
                      onClick={() => handleStartEditActivity(currentDay.dayNumber, 'morning', currentDay.morning)}
                      className="text-neutral-400 hover:text-neutral-900 flex items-center gap-1 text-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-sm font-semibold text-neutral-900">{currentDay.morning.activity}</h4>
                    <div className="text-2xs font-mono text-neutral-500 mt-0.5">Location: {currentDay.morning.location}</div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{currentDay.morning.description}</p>
                  </div>
                </div>

                {/* Afternoon Activity */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-neutral-900 uppercase font-mono tracking-wider">Afternoon Slot</span>
                      <span className="text-neutral-500 font-mono">({currentDay.afternoon.time})</span>
                    </div>
                    <button
                      onClick={() => handleStartEditActivity(currentDay.dayNumber, 'afternoon', currentDay.afternoon)}
                      className="text-neutral-400 hover:text-neutral-900 flex items-center gap-1 text-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-sm font-semibold text-neutral-900">{currentDay.afternoon.activity}</h4>
                    <div className="text-2xs font-mono text-neutral-500 mt-0.5">Location: {currentDay.afternoon.location}</div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{currentDay.afternoon.description}</p>
                  </div>
                </div>

                {/* Evening Activity */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-neutral-900 uppercase font-mono tracking-wider">Evening Slot</span>
                      <span className="text-neutral-500 font-mono">({currentDay.evening.time})</span>
                    </div>
                    <button
                      onClick={() => handleStartEditActivity(currentDay.dayNumber, 'evening', currentDay.evening)}
                      className="text-neutral-400 hover:text-neutral-900 flex items-center gap-1 text-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-sm font-semibold text-neutral-900">{currentDay.evening.activity}</h4>
                    <div className="text-2xs font-mono text-neutral-500 mt-0.5">Location: {currentDay.evening.location}</div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{currentDay.evening.description}</p>
                  </div>
                </div>

                {/* Day Logistics Footer */}
                {currentDay.transportNotes && (
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2 font-mono">
                    <Car className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>Logistics: {currentDay.transportNotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 of 12 spans): Insider Tips, Packing Checklist & Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-3 font-mono text-xs">
            <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-2xs">
              Expedition Overview
            </h3>
            <div className="divide-y divide-neutral-100 space-y-2">
              <div className="flex justify-between pt-1">
                <span className="text-neutral-500">Destination:</span>
                <span className="font-medium text-neutral-900">{activeItin.destination}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Duration:</span>
                <span className="font-medium text-neutral-900">{activeItin.durationDays} Days</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Traveler Profile:</span>
                <span className="font-medium text-neutral-900">{activeItin.travelersProfile}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Cost Benchmark:</span>
                <span className="font-medium text-neutral-900">{activeItin.estimatedCostUSD}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Optimal Window:</span>
                <span className="font-medium text-neutral-900">{activeItin.bestSeason}</span>
              </div>
            </div>
          </div>

          {/* Local Insider Tips */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 font-mono">
                Local Insider Intelligence
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-700">
              {activeItin.insiderTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0 mt-0.5 font-mono">{i + 1}.</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Packing & Readiness Checklist */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 font-mono">
                Readiness & Packing Guide
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-neutral-700">
              {activeItin.packingEssentials.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingDayNumber && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-neutral-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Edit Day {editingDayNumber} {editingPeriod.toUpperCase()} Activity
              </h3>
              <button
                onClick={() => setEditingDayNumber(null)}
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivityEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Time</label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  placeholder="e.g. 09:30 AM"
                  className="w-full border border-neutral-300 rounded p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Activity Title</label>
                <input
                  type="text"
                  value={editActivity}
                  onChange={(e) => setEditActivity(e.target.value)}
                  required
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Description & Logistics</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                  className="w-full border border-neutral-300 rounded p-2 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingDayNumber(null)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Itinerary to Booking Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-neutral-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Assign Itinerary to Booking</h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-600">
              Select an active client reservation to link <span className="font-semibold text-neutral-900">{activeItin.title}</span>.
            </div>
            <div>
              <select
                value={selectedBookingForLink}
                onChange={(e) => setSelectedBookingForLink(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 text-xs bg-white"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingRef} · {b.clientName} ({b.destination})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkToBookingSubmit}
                className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 cursor-pointer"
              >
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Traveler Packet Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-neutral-300 shadow-2xl p-8 space-y-6 my-8 text-neutral-900">
            {/* Travel Dossier Cover Header */}
            <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
              <div>
                <span className="text-xl font-bold tracking-tight uppercase">VoyageDesk Private Dossier</span>
                <p className="text-xs text-neutral-500 font-mono">Client Official Travel Packet & Daily Schedule</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-neutral-900">{activeItin.destination}</div>
                <div className="text-neutral-500">{activeItin.durationDays} Days · {activeItin.travelStyle}</div>
              </div>
            </div>

            {/* Itinerary Executive Summary */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-neutral-900">{activeItin.title}</h2>
              <p className="text-xs text-neutral-700 leading-relaxed">{activeItin.summary}</p>
            </div>

            {/* Day-by-Day Complete Program for Traveler */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono border-b border-neutral-200 pb-1">
                Day-by-Day Program of Events
              </h3>
              <div className="space-y-4 text-xs">
                {activeItin.days.map((day) => (
                  <div key={day.dayNumber} className="border border-neutral-200 rounded-lg p-4 space-y-2 bg-neutral-50/50">
                    <div className="flex items-center justify-between font-bold text-neutral-900 border-b border-neutral-200 pb-1.5">
                      <span>Day {day.dayNumber}: {day.title}</span>
                      <span className="font-mono text-2xs text-neutral-500">{day.hotelRecommendation}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="font-mono font-semibold text-amber-800 text-2xs uppercase">Morning ({day.morning.time})</span>
                        <div className="font-semibold text-neutral-900 mt-0.5">{day.morning.activity}</div>
                        <div className="text-neutral-500 text-2xs font-mono">{day.morning.location}</div>
                        <p className="text-neutral-600 text-2xs mt-1">{day.morning.description}</p>
                      </div>

                      <div>
                        <span className="font-mono font-semibold text-orange-800 text-2xs uppercase">Afternoon ({day.afternoon.time})</span>
                        <div className="font-semibold text-neutral-900 mt-0.5">{day.afternoon.activity}</div>
                        <div className="text-neutral-500 text-2xs font-mono">{day.afternoon.location}</div>
                        <p className="text-neutral-600 text-2xs mt-1">{day.afternoon.description}</p>
                      </div>

                      <div>
                        <span className="font-mono font-semibold text-indigo-800 text-2xs uppercase">Evening ({day.evening.time})</span>
                        <div className="font-semibold text-neutral-900 mt-0.5">{day.evening.activity}</div>
                        <div className="text-neutral-500 text-2xs font-mono">{day.evening.location}</div>
                        <p className="text-neutral-600 text-2xs mt-1">{day.evening.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Travel Packet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Automated Itinerary Generator Modal */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Automated AI Itinerary Planner</h2>
                  <p className="text-xs text-neutral-500 font-mono">Create comprehensive tailored day-by-day itineraries instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsGeneratorModalOpen(false)}
                disabled={isGenerating}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGenerating ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-base font-semibold text-neutral-900">Architecting Your Journey</h3>
                <p className="text-xs text-neutral-500 font-mono animate-pulse max-w-md mx-auto">
                  {generationStep}
                </p>
              </div>
            ) : (
              <form onSubmit={handleGenerateItinerary} className="p-6 space-y-4 text-xs">
                {/* Popular Inspiration Presets */}
                <div>
                  <span className="block text-2xs uppercase tracking-wider text-neutral-500 font-mono mb-1.5 font-semibold">
                    Instant Inspiration Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DESTINATION_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2.5 py-1 rounded-md border text-2xs font-medium cursor-pointer transition-colors ${
                          destInput === preset.name
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Input */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Target Destination / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Amalfi Coast & Capri, Italy or Tokyo, Hakone & Kyoto..."
                    value={destInput}
                    onChange={(e) => setDestInput(e.target.value)}
                    required
                    className="w-full border border-neutral-300 rounded-lg p-2 text-xs"
                  />
                </div>

                {/* Duration & Style */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Duration (Days): {daysInput}</label>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={daysInput}
                      onChange={(e) => setDaysInput(Number(e.target.value))}
                      className="w-full accent-neutral-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-2xs text-neutral-400 font-mono">
                      <span>3 Days</span>
                      <span>7 Days</span>
                      <span>12 Days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Travel Style</label>
                    <select
                      value={styleInput}
                      onChange={(e) => setStyleInput(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Bespoke Luxury">Bespoke Luxury</option>
                      <option value="Cultural Discovery">Cultural Discovery</option>
                      <option value="Adventure & Nature">Adventure & Nature</option>
                      <option value="Romantic Honeymoon">Romantic Honeymoon</option>
                      <option value="Food & Wine Connoisseur">Food & Wine Connoisseur</option>
                      <option value="Family Expedition">Family Expedition</option>
                    </select>
                  </div>
                </div>

                {/* Travelers Profile & Budget Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Travelers Profile</label>
                    <select
                      value={travelersInput}
                      onChange={(e) => setTravelersInput(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Couple (2 Adults)">Couple (2 Adults)</option>
                      <option value="Solo Adventurer">Solo Adventurer</option>
                      <option value="Family (2 Adults, 2 Kids)">Family (2 Adults, 2 Kids)</option>
                      <option value="Group of Friends (4 Adults)">Group of Friends (4 Adults)</option>
                      <option value="Executive / VIP Dignitary">Executive / VIP Dignitary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Budget Tier</label>
                    <select
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Premium">Premium ($500-800/day)</option>
                      <option value="Ultra-Luxury">Ultra-Luxury ($1200+/day)</option>
                      <option value="Curated Boutique">Curated Boutique ($350-500/day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Exploration Pace</label>
                    <select
                      value={paceInput}
                      onChange={(e) => setPaceInput(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Balanced">Balanced</option>
                      <option value="Leisurely & Relaxed">Leisurely & Relaxed</option>
                      <option value="High-Energy & Active">High-Energy & Active</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Special Traveler Preferences & Concierge Guidance (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Private boat charters, vegetarian dining, historical museum docents, anniversary surprises..."
                    value={preferencesInput}
                    onChange={(e) => setPreferencesInput(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsGeneratorModalOpen(false)}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Complete Itinerary</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
