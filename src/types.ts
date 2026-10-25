export type BookingStatus = 'Inquiry' | 'Quoted' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export type PaymentStatus = 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue';

export type TripType = 'Bespoke Luxury' | 'Cultural Discovery' | 'Adventure & Nature' | 'Romantic Honeymoon' | 'Corporate Retreat' | 'Family Expedition';

export interface ClientTraveler {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  vipTier: 'Standard' | 'Silver Voyager' | 'Gold Elite' | 'Diamond Ambassador';
  totalTrips: number;
  lifetimeSpendUSD: number;
  passportNumberMasked: string;
  passportExpiry: string;
  dietaryNotes: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes: string;
  createdAt: string;
}

export interface BookingSegment {
  type: 'Flight' | 'Hotel' | 'Transfer' | 'Activity' | 'Yacht';
  title: string;
  details: string;
  confirmationCode: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Waitlisted';
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. VOY-2026-891
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  paxAdults: number;
  paxChildren: number;
  tripType: TripType;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  depositAmount: number;
  isDepositPaid: boolean;
  assignedConsultant: string;
  linkedItineraryId?: string;
  linkedInvoiceId?: string;
  segments: BookingSegment[];
  specialRequests: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Accommodation' | 'Flights & Aviation' | 'Ground Transport' | 'Excursions & Guides' | 'Bespoke Experiences' | 'Travel Insurance' | 'Concierge Fee';
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-104
  bookingId?: string;
  bookingRef?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'JPY' | 'CAD';
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  depositPaid: number;
  totalDue: number;
  status: PaymentStatus;
  paidDate?: string;
  paymentMethod?: 'Wire Transfer' | 'Credit Card' | 'Stripe Direct' | 'Corporate Account';
  notes: string;
  createdAt: string;
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  location: string;
  description: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  morning: ItineraryActivity;
  afternoon: ItineraryActivity;
  evening: ItineraryActivity;
  hotelRecommendation?: string;
  transportNotes?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  tagline: string;
  destination: string;
  durationDays: number;
  travelStyle: TripType | string;
  travelersProfile: string;
  budgetTier: string;
  bestSeason: string;
  estimatedCostUSD: string;
  summary: string;
  highlights: string[];
  days: ItineraryDay[];
  insiderTips: string[];
  packingEssentials: string[];
  bookingId?: string;
  clientName?: string;
  createdAt: string;
}

export interface AgencySettings {
  agencyName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  taxRegistrationNumber: string;
  bankName: string;
  swiftBic: string;
  ibanOrAccountNumber: string;
  defaultCurrency: string;
  termsConditions: string;
}
