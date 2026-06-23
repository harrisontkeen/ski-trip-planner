import axios from 'axios'
import { readFileSync } from 'fs'

// Curated resort database with verified coordinates, airports, and URLs.
// Loaded once at startup and injected into the prompt so the model recommends
// real resorts with real data instead of hallucinating coords and dead links.
const RESORTS = JSON.parse(
  readFileSync(new URL('../data/resorts.json', import.meta.url), 'utf-8')
)

export async function buildTripPlan(inputs) {
  const {
    budget, budgetType, departureLocation, startDate, endDate,
    skillLevel, tripType, preferredRegion, passType, groupSize, flexibility,
    extras
  } = inputs

  const groupCount = Number(groupSize) || 1

  const totalBudget = budgetType === 'per person'
    ? Number(budget) * groupCount
    : Number(budget)

  const perPersonBudget = budgetType === 'per person'
    ? Number(budget)
    : Math.round(Number(budget) / groupCount)

  // Trip length, derived from the selected dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const msPerDay = 1000 * 60 * 60 * 24
  const nights = Math.round((end - start) / msPerDay)
  const validLength = Number.isFinite(nights) && nights >= 0
  const tripDays = validLength ? nights + 1 : null
  const durationLabel = validLength
    ? `${tripDays} day${tripDays === 1 ? '' : 's'} / ${nights} night${nights === 1 ? '' : 's'}`
    : 'unspecified length'

  // Filter the verified resort DB by the user's pass so the model picks from
  // real resorts (and copies their real coords / airport / URLs).
  const passCandidates = RESORTS.filter(r => {
    if (passType === 'Ikon') return r.passType === 'Ikon' || r.passType === 'none'
    if (passType === 'Epic') return r.passType === 'Epic' || r.passType === 'none'
    return true // none / flexible → consider all
  })
  const resortReference = passCandidates
    .map(r => `${r.name} | ${r.region}, ${r.country} | ${r.passType} pass | ${r.lat},${r.lng} | airport ${r.nearestAirport} | site ${r.website} | tickets ${r.tickets}`)
    .join('\n')

  const prompt = `
You are an expert ski trip planner. Based on the following user inputs, generate a detailed ski trip plan.

CRITICAL FORMATTING RULES:
- departureAirport must be ONLY a 3-letter IATA code (e.g. "BOS"). No extra text.
- nearestAirport must be ONLY a 3-letter IATA code (e.g. "SLC"). No extra text.
- notes in budgetBreakdown must always be a plain string, never an object.
- topResorts must contain EXACTLY 3 resort recommendations, no more, no less.
- itinerary must have one entry per day of the trip, covering arrival through departure.
- Each itinerary day must have a "day" number, "title", "description", and "activities" array of 3-5 specific actionable items.
- itinerary activities should be specific to the recommended resorts and region, not generic.
- Each itinerary day must also include a "type" field — one of "travel", "ski", "rest", "explore", "departure" — used for visual styling. Day 1 is usually "travel" and the final day "departure".
- Return ONLY valid JSON, no extra text, no markdown fences.
- itinerary must have a MAXIMUM of 14 day entries regardless of trip length. For longer trips, group multiple days together (e.g. "Days 3-5: Powder Days at Snowbird").
- PREFER resorts from the VERIFIED RESORT DATABASE below that match the user's region(s) and criteria. When you use one, copy its exact name, its lat/lng into mapboxCoords, its site into websiteUrl, its tickets URL into bookingUrl, and its airport as the nearestAirport. Only invent a resort if none in the list fit the request.

USER INPUTS:
- Budget: $${totalBudget} total ($${perPersonBudget} per person) for ${groupSize} people
- Departure Location: ${departureLocation} (use this for flight suggestions)
- Dates: ${startDate} to ${endDate} (${durationLabel})
- Skill Level: ${skillLevel} (beginner/intermediate/advanced/expert)
- Trip Type: ${tripType} (resort/backcountry/hybrid)
- Preferred Region(s): ${Array.isArray(preferredRegion) ? preferredRegion.join(', ') : preferredRegion}
${preferredRegion.length > 1 ? `- Note: User selected multiple regions. Recommend the single best region based on their other criteria (budget, skill level, dates, pass type) and explain why. Do not try to split resorts across regions unless the user specifically asked for a multi-destination trip in the extras field.` : ''}
- Pass Type: ${passType} (Ikon/Epic/none/flexible)
- Flexibility: ${flexibility}
- Additional preferences / extras: ${extras || 'none specified'}

VERIFIED RESORT DATABASE (real resorts with verified coordinates, airports, and URLs — prefer these):
${resortReference}

Return ONLY valid JSON in this exact structure, no extra text:
{
  "summary": "2-3 sentence overview of the recommended trip",
  "topResorts": [
    {
      "name": "Resort Name",
      "region": "Colorado",
      "passType": "Ikon",
      "skillMatch": "intermediate-advanced",
      "whyRecommended": "Short reason",
      "estimatedLiftTicket": 120,
      "websiteUrl": "https://...",
      "bookingUrl": "https://...",
      "mapboxCoords": { "lat": 39.48, "lng": -106.06 }
    }
  ],
  "flightSuggestions": [
    {
      "departureAirport": "BOS",
      "nearestAirport": "SLC",
      "nearestAirportFull": "Salt Lake City International Airport",
      "searchUrl": "https://www.google.com/flights/..."
    }
  ],
  "lodgingSuggestions": [
    {
      "type": "hotel or airbnb",
      "description": "Ski-in/ski-out lodge",
      "searchUrl": "https://www.airbnb.com/s/..."
    }
  ],
  "rentalCarUrl": "https://www.kayak.com/cars/...",
  "budgetBreakdown": {
    "flights": 400,
    "lodging": 600,
    "liftTickets": 300,
    "rentalCar": 200,
    "food": 150,
    "total": 1650,
    "notes": "A single string with budget tips and caveats. Must be a plain string, never an object."
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival Day",
      "type": "travel",
      "description": "Brief overview of the day",
      "activities": ["Pick up rental car at SLC", "Drive to resort (~45 min)", "Check into lodging", "Explore the village and grab dinner"]
    },
    {
      "day": 2,
      "title": "First Day on the Mountain",
      "type": "ski",
      "description": "Brief overview of the day",
      "activities": ["Morning warm-up on groomed blues", "Ski school lesson if beginner", "Afternoon powder runs", "Après-ski at the lodge"]
    }
  ],
  "bestTimeToBook": "Book flights 6-8 weeks out for best prices"
}
  `

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  )

  const text = response.data.content[0].text
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse Claude response as JSON:', cleaned)
    throw new Error('Claude returned malformed JSON. Try again or reduce response complexity.')
  }
}