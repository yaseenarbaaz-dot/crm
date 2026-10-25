import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Itinerary Generation Endpoint
app.post('/api/generate-itinerary', async (req: Request, res: Response) => {
  try {
    const { destination, days = 5, style = 'Bespoke Luxury', travelers = '2 Adults (Couple)', budget = 'Premium', pace = 'Balanced', preferences = '' } = req.body;

    if (!destination || typeof destination !== 'string') {
      res.status(400).json({ error: 'Destination is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return structured fallback response
      res.json({
        success: true,
        source: 'curated_fallback',
        itinerary: generateCuratedFallback(destination, Number(days) || 5, style, travelers, budget),
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a world-class travel director and master itinerary designer for a luxury travel CRM.
Create an exceptional, highly-detailed ${days}-day travel itinerary for "${destination}".
Traveler Profile: ${travelers}
Travel Style: ${style}
Budget Tier: ${budget}
Pace: ${pace}
Special Client Notes/Preferences: ${preferences || 'Curated blend of premier highlights, hidden local gems, and seamless logistics'}

Include:
- Trip Title and an evocative 2-sentence executive overview.
- Suggested Season / Best Time to visit.
- Currency & Estimated Total Budget per person.
- Day-by-Day schedule with exact morning, afternoon, and evening activities with estimated timings, highlights, transport advice, and dining suggestions.
- 5 Curated Local Insider Tips.
- Essential Packing & Readiness Checklist (6 items).
- Key Highlights list.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            destination: { type: Type.STRING },
            durationDays: { type: Type.NUMBER },
            bestSeason: { type: Type.STRING },
            estimatedCostUSD: { type: Type.STRING },
            summary: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  morning: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['time', 'activity', 'location', 'description'],
                  },
                  afternoon: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['time', 'activity', 'location', 'description'],
                  },
                  evening: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['time', 'activity', 'location', 'description'],
                  },
                  hotelRecommendation: { type: Type.STRING },
                  transportNotes: { type: Type.STRING },
                },
                required: ['dayNumber', 'title', 'theme', 'morning', 'afternoon', 'evening'],
              },
            },
            insiderTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            packingEssentials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'tagline', 'destination', 'durationDays', 'summary', 'highlights', 'days', 'insiderTips', 'packingEssentials'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const parsedData = JSON.parse(responseText);
    res.json({
      success: true,
      source: 'gemini',
      itinerary: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating itinerary with Gemini:', error);
    // Return curated fallback gracefully on error
    const { destination = 'Bespoke Tour', days = 5, style = 'Luxury Bespoke', travelers = '2 Adults', budget = 'Premium' } = req.body || {};
    res.json({
      success: true,
      source: 'curated_fallback',
      warning: error?.message || 'Generated via expert travel engine',
      itinerary: generateCuratedFallback(destination, Number(days) || 5, style, travelers, budget),
    });
  }
});

function generateCuratedFallback(destination: string, days: number, style: string, travelers: string, budget: string) {
  const cleanDest = destination.trim();
  const daySchedules = [];

  for (let i = 1; i <= Math.min(Math.max(days, 1), 14); i++) {
    let dayTheme = 'Arrival & First Impressions';
    let morningAct = 'Private VIP airport transfer & hotel check-in';
    let morningLoc = `${cleanDest} Grand Suite`;
    let mornDesc = 'Greeted by private chauffeur, luggage handling, refreshing welcome aperitif and orientation briefing.';
    
    let aftAct = 'Curated historic district walk with personal local docent';
    let aftLoc = `${cleanDest} Historic Quarter`;
    let aftDesc = 'Immerse in the artisan boutiques, architectural landmarks, and relaxed neighborhood cafes.';

    let eveAct = 'Sunset dinner at panoramic rooftop terrace';
    let eveLoc = `${cleanDest} Panorama Dining`;
    let eveDesc = 'Sample regional seasonal tasting menu with paired local reserve wines.';

    if (i === 2) {
      dayTheme = 'Cultural Deep-Dive & Master Artisan Workshops';
      morningAct = 'Private before-hours museum & landmark access';
      morningLoc = `${cleanDest} Heritage Site`;
      mornDesc = 'Skip all queues with exclusive private entry accompanied by leading regional art historian.';
      aftAct = 'Artisan culinary masterclass with Michelin-starred chef';
      aftLoc = 'Historic Culinary Atelier';
      aftDesc = 'Hands-on preparation of regional signature specialties followed by leisurely courtyard lunch.';
      eveAct = 'Evening canal or scenic riverside private cruise';
      eveLoc = `${cleanDest} Waterfront Promenade`;
      eveDesc = 'Champagne twilight navigation enjoying illuminated waterfront facades.';
    } else if (i === 3) {
      dayTheme = 'Nature, Panoramic Vistas & Countryside Excursion';
      morningAct = 'Scenic helicopter or vintage convertible countryside drive';
      morningLoc = `${cleanDest} Valley & Ridge Viewpoint`;
      mornDesc = 'Breathtaking panoramic scenery, bespoke photo stops, and fresh mountain/coastal air.';
      aftAct = 'Private vineyard & organic estate tasting';
      aftLoc = 'Centuries-Old Hilltop Estate';
      aftDesc = 'Cellar reserve tour, barrel sampling with the estate vintner, and charcuterie pairing.';
      eveAct = 'Casual chic bistro dining with live acoustic jazz';
      eveLoc = 'Old Town Piazza';
      eveDesc = 'Relaxed evening soaking in the vibrant local atmosphere and night market stroll.';
    } else if (i === 4) {
      dayTheme = 'Coastal Exploration or Architectural Jewels';
      morningAct = 'Private wooden boat or catamaran coastline exploration';
      morningLoc = `${cleanDest} Marine Reserve & Hidden Coves`;
      mornDesc = 'Crystal turquoise waters, private swimming spots, snorkeling, and sun deck relaxation.';
      aftAct = 'Seaside tavern seafood lunch & boutique shopping';
      aftLoc = 'Fisherman Pier Village';
      aftDesc = 'Catch-of-the-day grilled specialties, hand-crafted leather goods, and local perfumeries.';
      eveAct = 'Opera or classical performance in historic auditorium';
      eveLoc = 'National Opera House';
      eveDesc = 'Reserved premier orchestra seating followed by late-night digestifs.';
    } else if (i >= 5) {
      dayTheme = i === days ? 'Leisurely Mornings, Souvenirs & Farewell' : `Day ${i}: Hidden Gems & Exclusive Retreat`;
      morningAct = i === days ? 'Boutique shopping & souvenir packaging' : 'Spa wellness ritual & thermal baths';
      morningLoc = i === days ? 'Artisan Quarter' : 'Luxury Wellness Sanctuary';
      mornDesc = i === days ? 'Pick up bespoke souvenirs, cured local specialties, and personalized mementos.' : 'Holistic restorative massage and hydrotherapy circuit.';
      aftAct = i === days ? 'Farewell luncheon overlooking the bay' : 'Exclusive access private collection tour';
      aftLoc = `${cleanDest} Grand Terrace`;
      aftDesc = 'Reflect on trip highlights while savoring signature dessert creations.';
      eveAct = i === days ? 'Private departure transfer to international airport' : 'Curated chef table tasting dinner';
      eveLoc = i === days ? 'International Terminal' : 'Michelin Recommended Vault';
      eveDesc = i === days ? 'Seamless expedited check-in and priority lounge access.' : 'Multi-course gastronomic voyage celebrating seasonal ingredients.';
    }

    daySchedules.push({
      dayNumber: i,
      title: `Day ${i}: ${dayTheme}`,
      theme: dayTheme,
      morning: {
        time: '09:00 AM',
        activity: morningAct,
        location: morningLoc,
        description: mornDesc,
      },
      afternoon: {
        time: '02:00 PM',
        activity: aftAct,
        location: aftLoc,
        description: aftDesc,
      },
      evening: {
        time: '07:30 PM',
        activity: eveAct,
        location: eveLoc,
        description: eveDesc,
      },
      hotelRecommendation: `${cleanDest} Belmond or Four Seasons Boutique Resort`,
      transportNotes: 'Dedicated private Mercedes-Benz V-Class chauffeur on call throughout the day.',
    });
  }

  return {
    title: `${cleanDest} Grand Voyage: ${days}-Day ${style}`,
    tagline: `An artfully choreographed bespoke journey through ${cleanDest} crafted for ${travelers}.`,
    destination: cleanDest,
    durationDays: days,
    bestSeason: 'Spring (April – June) or Autumn (September – October)',
    estimatedCostUSD: budget === 'Ultra-Luxury' ? `$${days * 1400} - $${days * 2200} per guest` : budget === 'Premium' ? `$${days * 650} - $${days * 950} per guest` : `$${days * 320} - $${days * 480} per guest`,
    summary: `Experience the quintessential beauty of ${cleanDest} through a seamless itinerary combining priority cultural landmarks, private yacht/scenic excursions, world-class regional gastronomy, and restful luxury. Every detail is timed to minimize queues and maximize unforgettable moments.`,
    highlights: [
      `Private airport concierge and chauffeur-driven transfers throughout`,
      `Exclusive before-hours access to premier cultural landmarks`,
      `Signature private excursion tailored to ${travelers}`,
      `Handpicked culinary reservations from rustic bistros to fine dining`,
      `24/7 dedicated local travel concierge support`,
    ],
    days: daySchedules,
    insiderTips: [
      `Carry small local currency denominations for historic boutique artisans and tip etiquette.`,
      `Book premier dinner reservations at least 3 weeks prior during peak travel seasons.`,
      `Comfortable slip-resistant walking shoes are essential for historic cobblestone pathways.`,
      `Notify your concierge in advance of any dietary restrictions or anniversary celebrations.`,
      `Download offline maps and keep digital copies of passport photo pages in your secure vault.`,
    ],
    packingEssentials: [
      `Smart casual evening attire (many fine dining venues enforce a jacket/dress code)`,
      `Lightweight breathable layers and comfortable walking shoes for city walking`,
      `Universal travel power adapter with surge protector`,
      `High-SPF sunscreen, polarized sunglasses, and sun hat`,
      `Compact waterproof daypack for excursions`,
      `Digital travel insurance documentation and medical emergency card`,
    ],
  };
}

// Dev and Production Vite mounting
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoyageDesk CRM server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
