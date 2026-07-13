import { GoogleGenAI } from '@google/genai';

// GoogleGenAI v2 auto-reads GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export type ItineraryActivityData = {
  title: string;
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  status?: string;
  travelTime?: string;
  suggestedAttraction?: string;
  notes?: string;
  locked?: boolean;
};

export type ItineraryDay = {
  day: number;
  activities: string;
  activityItems: ItineraryActivityData[];
};

export type MustIncludePlace = {
  day: number;
  place: string;
  preferredTime?: "Morning" | "Afternoon" | "Evening";
};

export async function generateItinerary(
  destination: string,
  days: number,
  budget: number,
  preferences: { interests: string; travelStyle: string } | null,
  mustIncludePlaces?: MustIncludePlace[]
): Promise<ItineraryDay[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your .env.local file.");
  }

  const interests = preferences?.interests || "General sightseeing";
  const travelStyle = preferences?.travelStyle || "Balanced";

  // Build must-include constraint block
  let mustIncludeBlock = "";
  if (mustIncludePlaces && mustIncludePlaces.length > 0) {
    const lines = mustIncludePlaces.map((p) => {
      const timeHint = p.preferredTime ? ` at ${p.preferredTime}` : " (fit at best time)";
      return `  - Day ${p.day}: MUST include "${p.place}"${timeHint}.`;
    });
    mustIncludeBlock = `
IMPORTANT — The user has requested these specific places be included. You MUST incorporate each one exactly as listed on the specified day and at the specified time slot. Build the rest of that day's activities around it:
${lines.join("\n")}
`;
  }

  const prompt = `
You are an expert travel planner. Create a detailed daily itinerary for a trip to ${destination} for ${days} days.
The total estimated budget is LKR ${budget}.
The user's interests are: ${interests}.
The user's travel style is: ${travelStyle}.
${mustIncludeBlock}
Output the itinerary strictly in a JSON array format. Each item in the array represents a day and must have exactly three keys: "day" (a number), "activities" (a short summary string of the day's events), and "activityItems" (an array of exactly 3 objects representing activities: one for Morning, one for Afternoon, and one for Evening).

Each activity object in "activityItems" must have:
- "title": a short stop name or simple activity title.
- "timeOfDay": strictly one of "Morning", "Afternoon", or "Evening".
- "travelTime": a short estimate such as "30 min" or "2 hr".
- "suggestedAttraction": a specific place or attraction to visit.
- "notes": a short useful note about timing, access, or what to expect.
- "locked": a boolean set to false.

Keep the plan concise and focused on places to visit. Avoid unnecessary restaurant or hotel recommendations unless they are essential. Do not add excessive details or long descriptions.

Example format:
[
  {
    "day": 1,
    "activities": "Explore the main historical sites and a relaxing city park.",
    "activityItems": [
      { "title": "Museum visit", "timeOfDay": "Morning", "travelTime": "15 min", "suggestedAttraction": "National Museum", "notes": "Book ahead for exhibits", "locked": false },
      { "title": "Garden break", "timeOfDay": "Afternoon", "travelTime": "20 min", "suggestedAttraction": "Botanical Gardens", "notes": "Good for a short break", "locked": false },
      { "title": "Old town stroll", "timeOfDay": "Evening", "travelTime": "10 min", "suggestedAttraction": "Old Town", "notes": "Nice evening walk", "locked": false }
    ]
  }
]

Do not include any markdown formatting like \`\`\`json, just output the raw JSON array string.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawText = response.text ?? "[]";
    // Clean up any potential markdown code blocks
    const cleanText = rawText
      .replace(/```json\n?|\n?```/gi, '')
      .replace(/```\n?|\n?```/gi, '')
      .trim();

    if (!cleanText || cleanText === "[]") {
      throw new Error("AI returned an empty response. Please try again.");
    }

    const parsed = JSON.parse(cleanText) as ItineraryDay[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("AI returned an unexpected format. Please try again.");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to generate or parse AI itinerary:", error);

    if (error instanceof SyntaxError) {
      throw new Error("AI returned malformed data. Please try generating again.");
    }

    if (error instanceof Error && error.message.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or missing. Please check your configuration.");
    }

    throw error instanceof Error ? error : new Error("Failed to generate itinerary. Please try again.");
  }
}
