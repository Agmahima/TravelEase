// import { AIItineraryRequest } from "@shared/schema";
import { AIItineraryRequest } from "../../shared/schema";
import { apiRequest } from "./queryClient";

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: string;
  category: "morning" | "lunch" | "afternoon" | "evening" | "other";
  booked: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  location?: string;        // ADD THIS LINE
  activities: Activity[];
  accommodation?: string;   // ADD THIS LINE
  transportation?: string;  // ADD THIS LINE
  meals?: {                // ADD THIS ENTIRE MEALS OBJECT
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  estimatedCost?: number;  // ADD THIS LINE
}

export interface Itinerary {
  destination: string; // Main destination (for backwards compatibility)
  destinations?: {
    location: string;
    daysToStay: number;
  }[];
  transportationOptions?: {
    fromDestination: number;
    toDestination: number;
    mode: 'train' | 'bus' | 'car' | 'flight';
    booked: boolean;
  }[];
  days: ItineraryDay[];
}

export async function generateItinerary(request: AIItineraryRequest): Promise<Itinerary> {
  try {
    // First check if we're authenticated
    try {
      await apiRequest('GET', '/api/auth/me');
    } catch (authError) {
      if (authError instanceof Error && authError.message.includes('401')) {
        throw new Error('Please log in to generate an itinerary');
      }
    }
    
    // Then make the itinerary request
    const response = await apiRequest('POST', '/api/generate-itinerary', request);
    return await response.json();
  } catch (error) {
    console.error("Failed to generate itinerary:", error);
    
    // Pass through the specific error message if it exists
    if (error instanceof Error) {
      const message = error.message;
      
      // Handle specific error types
      if (message.includes('API key')) {
        throw new Error('OpenAI API key configuration issue. Please contact support.');
      } else if (message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw error; // Re-throw the specific error with its message
      }
    } else {
      // Fallback generic error
      throw new Error("Failed to generate itinerary. Please try again.");
    }
  }
}
