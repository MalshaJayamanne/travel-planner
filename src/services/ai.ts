import { GoogleGenAI } from '@google/genai';

// Ensure you have GEMINI_API_KEY in your .env.local
const ai = new GoogleGenAI({});

export type ItineraryDay = {
  day: number;
  activities: string;
};

export async function generateItinerary(
  destination: string,
  days: number,
  budget: number,
  preferences: { interests: string; travelStyle: string } | null
): Promise<ItineraryDay[]> {
  const interests = preferences?.interests || "General sightseeing";
  const travelStyle = preferences?.travelStyle || "Balanced";

  const prompt = `
You are an expert travel planner. Create a daily itinerary for a trip to ${destination} for ${days} days.
The total estimated budget is $${budget}.
The user's interests are: ${interests}.
The user's travel style is: ${travelStyle}.

Output the itinerary strictly in a JSON array format. Each item in the array represents a day and must have exactly two keys: "day" (a number) and "activities" (a string detailing the plan for morning, afternoon, and evening).

Example format:
[
  { "day": 1, "activities": "Morning: Visit the central museum. Afternoon: Relax in the city park. Evening: Enjoy a nice dinner at a local restaurant." },
  { "day": 2, "activities": "Morning: Hike the nearby mountain. Afternoon: Visit a local cafe. Evening: See a show." }
]

Do not include any markdown formatting like \`\`\`json, just output the raw JSON array string.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawText = response.text || "[]";
    // Clean up any potential markdown code blocks
    const cleanText = rawText.replace(/```json\n?|\n?```/gi, '').trim();
    
    const parsed = JSON.parse(cleanText) as ItineraryDay[];
    return parsed;
  } catch (error) {
    console.error("Failed to generate or parse AI itinerary:", error);
    throw new Error("Failed to generate itinerary. Please try again.");
  }
}
