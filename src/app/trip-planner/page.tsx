"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import ItineraryDay from "@/components/ItineraryDay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateItinerary, Itinerary, Activity } from "@/lib/openai";
import { DestinationStop, TransportationOption } from "../../../shared/schema";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  Map,
  MapPin,
  User,
  X,
  Car,
  Train,
  Plane,
  Bus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const TripPlanner = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get trip ID from URL if it exists
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get("id");

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [destinations, setDestinations] = useState<DestinationStop[]>([
    { location: "", daysToStay: 2 },
  ]);
  const [newDestination, setNewDestination] = useState<string>("");
  const [newDaysToStay, setNewDaysToStay] = useState<number>(1);
  
  // For compatibility with existing code
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedPreferenceInput, setSelectedPreferenceInput] = useState("");
  const [budget, setBudget] = useState("medium");
  const [travelStyle, setTravelStyle] = useState("");
  const [notes, setNotes] = useState("");
  
  // Transportation preferences
  const [transportationOptions, setTransportationOptions] = useState<
    TransportationOption[]
  >([]);
  const [transportationMode, setTransportationMode] = useState<string>("");
  
  // Itinerary state
  const [generatedItinerary, setGeneratedItinerary] =
    useState<Itinerary | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);

  useEffect(() => {
    if (tripIdFromUrl) {
      setTripId(tripIdFromUrl);
    }
  }, [tripIdFromUrl]);

  // Fetch trip data if tripId is present
  interface TripData {
    destination?: string;
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    destinations?: DestinationStop[];
    transportationOptions?: TransportationOption[];
    preferences?: {
      activities?: string[];
      budget?: string;
      travelStyle?: string;
      notes?: string;
    };
    itinerary?: Itinerary;
  }

  const { data: tripData, isLoading: isTripLoading } = useQuery<TripData>({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const response = await makeAuthenticatedApiRequest("GET", `/api/trips/${tripId}`);
      return response;
    },
    enabled: !!tripId && !!user && !authLoading,
  });

  // Improved API request function with better error handling
  const makeAuthenticatedApiRequest = async (method: string, url: string, data?: any) => {
    console.log("=== AUTHENTICATED API REQUEST ===");
    console.log("Method:", method);
    console.log("URL:", url);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    };

    if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`http://localhost:5000${url}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || "Unknown error" };
        }
        
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          router.push("/login");
          throw new Error("Authentication expired. Please log in again.");
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Create trip mutation - simplified without userId
  const createTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      console.log("=== CREATE TRIP MUTATION ===");
      
      if (authLoading) {
        throw new Error("Authentication is still loading, please wait.");
      }

      // Don't include userId - let backend extract from token
      const dataForApi = {
        destinations: tripData.destinations?.map((dest: any) => ({
          city: dest.location,
          days: dest.daysToStay,
        })) || [],
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        adults: tripData.adults,
        children: tripData.children,
        preferences: {
          travelMode: "flight",
          hotelType:
            tripData.preferences?.budget === "luxury"
              ? "5-star"
              : tripData.preferences?.budget === "medium"
              ? "3-star"
              : "2-star",
          activities: tripData.preferences?.activities || [],
          budget: tripData.preferences?.budget || "medium",
          travelStyle: tripData.preferences?.travelStyle || "",
          notes: tripData.preferences?.notes || "",
        },
        status: "planned",
        itinerary: tripData.itinerary || null, // Include itinerary if available
      };

      return makeAuthenticatedApiRequest("POST", "/api/trips", dataForApi);
    },
    onSuccess: (data) => {
      console.log("=== TRIP CREATED SUCCESS ===");
      const newTripId = data.id?.toString() || data._id?.toString();
      setTripId(newTripId);
      toast({
        title: "Trip created successfully!",
        description: "Your trip has been saved.",
      });
      
      const newUrl = `/trip-planner?id=${newTripId}`;
      router.push(newUrl);
    },
    onError: (error: any) => {
      console.error("=== TRIP CREATION ERROR ===");
      console.error("Error:", error);
      toast({
        title: "Error creating trip",
        description: error.message || "There was a problem saving your trip.",
        variant: "destructive",
      });
    },
  });

  // Update trip mutation - simplified without userId
  const updateTripMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log("Updating trip with ID:", id);
      
      // Don't include userId - let backend extract from token
      return makeAuthenticatedApiRequest("PATCH", `/api/trips/${id}`, data);
    },
    onSuccess: (data) => {
      console.log("Trip updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      toast({
        title: "Trip updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating trip:", error);
      toast({
        title: "Error updating trip",
        description: error.message || "There was a problem updating your trip.",
        variant: "destructive",
      });
    },
  });

  // Load trip data when available
  // useEffect(() => {
  //   if (tripData) {
  //     setDestination(tripData.destination || "");
  //     setStartDate(new Date(tripData.startDate || ""));
  //     setEndDate(new Date(tripData.endDate || ""));
  //     setAdults(tripData.adults ?? 2);
  //     setChildren(tripData.children || 0);
      
  //     if (tripData.destinations && tripData.destinations.length) {
  //       setDestinations(tripData.destinations);
  //     } else if (tripData.destination) {
  //       setDestinations([{ location: tripData.destination, daysToStay: 3 }]);
  //     }
      
  //     if (tripData.transportationOptions && tripData.transportationOptions.length) {
  //       setTransportationOptions(tripData.transportationOptions);
  //     }
      
  //     if (tripData.preferences) {
  //       if (tripData.preferences.activities) {
  //         setPreferences(tripData.preferences.activities);
  //       }
  //       if (tripData.preferences.budget) {
  //         setBudget(tripData.preferences.budget);
  //       }
  //       if (tripData.preferences.travelStyle) {
  //         setTravelStyle(tripData.preferences.travelStyle);
  //       }
  //       if (tripData.preferences.notes) {
  //         setNotes(tripData.preferences.notes);
  //       }
  //     }
      
  //     if (tripData.itinerary) {
  //       setGeneratedItinerary(tripData.itinerary);
  //       setCurrentStep(3);
  //     } else {
  //       setCurrentStep(2);
  //     }
  //   }
  // }, [tripData]);

  // Fix the useEffect that loads trip data
useEffect(() => {
  if (tripData) {
    setDestination(tripData.destination || "");
    setStartDate(new Date(tripData.startDate || ""));
    setEndDate(new Date(tripData.endDate || ""));
    setAdults(tripData.adults ?? 2);
    setChildren(tripData.children || 0);
    
    // FIX: Handle different data structures from backend
    if (tripData.destinations && tripData.destinations.length) {
      // Map backend format to frontend format
      const mappedDestinations = tripData.destinations.map(dest => ({
        location:  dest.location || "", // Handle both city and location properties
        daysToStay:  dest.daysToStay || 1 // Handle both days and daysToStay properties
      }));
      setDestinations(mappedDestinations);
    } else if (tripData.destination) {
      setDestinations([{ location: tripData.destination, daysToStay: 3 }]);
    }
    
    if (tripData.transportationOptions && tripData.transportationOptions.length) {
      setTransportationOptions(tripData.transportationOptions);
    }
    
    if (tripData.preferences) {
      if (tripData.preferences.activities) {
        setPreferences(tripData.preferences.activities);
      }
      if (tripData.preferences.budget) {
        setBudget(tripData.preferences.budget);
      }
      if (tripData.preferences.travelStyle) {
        setTravelStyle(tripData.preferences.travelStyle);
      }
      if (tripData.preferences.notes) {
        setNotes(tripData.preferences.notes);
      }
    }
    
    if (tripData.itinerary) {
      setGeneratedItinerary(tripData.itinerary);
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  }
}, [tripData]);

  useEffect(() => {
    document.title = "Plan Your Trip - TravelEase";
    
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  // Preference handlers
  const availablePreferences = [
    "Museums & Culture",
    "Outdoor Activities",
    "Food & Dining",
    "Shopping",
    "Historical Sites",
    "Beaches",
    "Adventure",
    "Relaxation",
    "Nightlife",
    "Family-Friendly",
    "Luxury",
    "Budget-Friendly",
  ].filter((pref) => !preferences.includes(pref));

  const handleAddPreference = () => {
    if (selectedPreferenceInput && !preferences.includes(selectedPreferenceInput)) {
      setPreferences([...preferences, selectedPreferenceInput]);
      setSelectedPreferenceInput("");
    }
  };

  const handleRemovePreference = (preference: string) => {
    setPreferences(preferences.filter((p) => p !== preference));
  };

  // Multi-destination handlers
  const handleAddDestination = () => {
    if (newDestination && newDaysToStay > 0) {
      setDestinations([
        ...destinations,
        { location: newDestination, daysToStay: newDaysToStay },
      ]);
      setNewDestination("");
      setNewDaysToStay(1);
    } else {
      toast({
        title: "Invalid destination",
        description: "Please provide both a destination name and number of days to stay.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDestination = (
    index: number,
    field: "location" | "daysToStay",
    value: string | number
  ) => {
    const newDestinations = [...destinations];
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: value,
    };
    setDestinations(newDestinations);
  };

  const handleRemoveDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove",
        description: "You need at least one destination for your trip.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalDays = () => {
    return destinations.reduce((total, dest) => total + dest.daysToStay, 0);
  };

  // Transportation handlers (keeping existing functionality)
  const handleSetTransportationMode = (
    fromIndex: number,
    toIndex: number,
    mode: "train" | "bus" | "car" | "flight"
  ) => {
    const existingOptionIndex = transportationOptions.findIndex(
      (opt) => opt.fromDestination === fromIndex && opt.toDestination === toIndex
    );
    
    if (existingOptionIndex >= 0) {
      const updatedOptions = [...transportationOptions];
      updatedOptions[existingOptionIndex] = {
        ...updatedOptions[existingOptionIndex],
        mode,
      };
      setTransportationOptions(updatedOptions);
    } else {
      setTransportationOptions([
        ...transportationOptions,
        {
          fromDestination: fromIndex,
          toDestination: toIndex,
          mode,
          booked: false,
        },
      ]);
    }
  };

  const getTransportationMode = (
    fromIndex: number,
    toIndex: number
  ): "train" | "bus" | "car" | "flight" | undefined => {
    const option = transportationOptions.find(
      (opt) => opt.fromDestination === fromIndex && opt.toDestination === toIndex
    );
    return option?.mode;
  };

  const handleBookTransportation = (fromIndex: number, toIndex: number) => {
    const optionIndex = transportationOptions.findIndex(
      (opt) => opt.fromDestination === fromIndex && opt.toDestination === toIndex
    );
    
    if (optionIndex >= 0) {
      const option = transportationOptions[optionIndex];
      const fromDestination = destinations[fromIndex];
      const toDestination = destinations[toIndex];
      
      if (option.mode === "flight") {
        let travelDate = new Date(startDate || new Date());
        for (let i = 0; i < fromIndex; i++) {
          travelDate = addDays(travelDate, destinations[i].daysToStay);
        }
        travelDate = addDays(travelDate, fromDestination.daysToStay);
        
        const searchParams = new URLSearchParams({
          from: fromDestination.location,
          to: toDestination.location,
          departureDate: format(travelDate, "yyyy-MM-dd"),
          adults: adults.toString(),
          children: children.toString(),
          tripType: "one-way",
        });
        
        router.push(`/flight-booking?${searchParams.toString()}`);
        return;
      }
      
      const updatedOptions = [...transportationOptions];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        booked: true,
      };
      setTransportationOptions(updatedOptions);
      
      if (tripId) {
        updateTripMutation.mutate({
          id: tripId,
          data: { transportationOptions: updatedOptions },
        });
      }
      
      toast({
        title: "Transportation Booked!",
        description: `Your transportation from ${fromDestination.location} to ${toDestination.location} has been booked.`,
      });
    }
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!startDate || !endDate) {
        toast({
          title: "Dates required",
          description: "Please select your travel dates.",
          variant: "destructive",
        });
        return;
      }
      
      if (destinations.length === 0 || destinations.every((d) => !d.location.trim())) {
        toast({
          title: "Destinations required",
          description: "Please add at least one valid destination.",
          variant: "destructive",
        });
        return;
      }
      
      const primaryDestination = destinations[0].location;
      const tripData = {
        destination: primaryDestination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        adults,
        children,
        destinations: destinations,
        transportationOptions: transportationOptions,
        preferences: {
          activities: preferences,
          budget,
          travelStyle,
          notes,
        },
      };
      
      if (tripId) {
        updateTripMutation.mutate({ id: tripId, data: tripData });
      } else {
        createTripMutation.mutate(tripData);
      }
      
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleGenerateItinerary();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

 const handleGenerateItinerary = async () => {
  console.log("=== GENERATE ITINERARY HANDLER ===");
  
  // DETAILED DEBUGGING - Add these logs
  console.log("=== DESTINATION DEBUG START ===");
  console.log("destinations array:", destinations);
  console.log("destinations length:", destinations.length);
  console.log("destinations JSON:", JSON.stringify(destinations, null, 2));
  
  // Check each destination individually
  destinations.forEach((dest, index) => {
    console.log(`Destination ${index}:`, dest);
    console.log(`  - location: "${dest?.location}"`);
    console.log(`  - location type:`, typeof dest?.location);
    console.log(`  - location length:`, dest?.location?.length);
    console.log(`  - trimmed location: "${dest?.location?.trim()}"`);
    console.log(`  - daysToStay:`, dest?.daysToStay);
  });
  console.log("=== DESTINATION DEBUG END ===");
  
  if (!startDate || !endDate) {
    console.log("Start date or end date is missing");
    toast({
      title: "Dates required",
      description: "Please select your travel dates.",
      variant: "destructive",
    });
    return;
  }
  
  if (!destinations || destinations.length === 0) {
    console.log("No destinations array or empty array");
    toast({
      title: "Destinations required",
      description: "Please add at least one destination.",
      variant: "destructive",
    });
    return;
  }

  // More detailed validation with logging
  console.log("=== VALIDATION DEBUG ===");
  const validDestinations = destinations.filter((dest, index) => {
    console.log(`Checking destination ${index}:`, dest);
    
    const hasDestination = dest && dest.location;
    console.log(`  - Has destination object and location:`, hasDestination);
    
    const isString = typeof dest?.location === 'string';
    console.log(`  - Location is string:`, isString);
    
    const hasContent = dest?.location?.trim().length > 0;
    console.log(`  - Has content after trim:`, hasContent);
    
    const isValid = hasDestination && isString && hasContent;
    console.log(`  - Is valid:`, isValid);
    
    return isValid;
  });

  console.log("Valid destinations after filtering:", validDestinations);
  console.log("Valid destinations count:", validDestinations.length);

  if (validDestinations.length === 0) {
    console.log("=== VALIDATION FAILED ===");
    console.log("No valid destinations found after filtering");
    
    // Show exactly what we found
    console.log("Reasons for validation failure:");
    destinations.forEach((dest, index) => {
      if (!dest) {
        console.log(`Destination ${index}: is null/undefined`);
      } else if (!dest.location) {
        console.log(`Destination ${index}: has no location property`);
      } else if (typeof dest.location !== 'string') {
        console.log(`Destination ${index}: location is not a string (${typeof dest.location})`);
      } else if (dest.location.trim().length === 0) {
        console.log(`Destination ${index}: location is empty or whitespace only`);
      }
    });
    
    toast({
      title: "Invalid destinations",
      description: "Please enter at least one valid destination name.",
      variant: "destructive",
    });
    return;
  }

  setIsGeneratingItinerary(true);
  
  try {
    const primaryDestination = validDestinations[0].location.trim();
    console.log("Using primary destination:", primaryDestination);

    const itineraryRequest = {
      destination: primaryDestination,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      destinations: validDestinations,
      transportationOptions: transportationOptions,
      preferences: {
        activities: preferences,
        interests: preferences,
        budget,
        travelStyle,
        notes,
      },
    };

    console.log("Final itinerary request:", itineraryRequest);

    const itinerary = await generateItinerary(itineraryRequest);
    
    const enhancedItinerary: Itinerary = {
      ...itinerary,
      destinations: validDestinations,
      transportationOptions: transportationOptions,
    };

    setGeneratedItinerary(enhancedItinerary);

    if (tripId) {
      updateTripMutation.mutate({
        id: tripId,
        data: { itinerary: enhancedItinerary },
      });
    }

    setCurrentStep(3);
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    toast({
      title: "Error generating itinerary",
      description: error.message || "There was a problem generating your itinerary.",
      variant: "destructive",
    });
  } finally {
    setIsGeneratingItinerary(false);
  }
};
  // Activity handlers
  const handleEditActivity = (activity: Activity) => {
    toast({
      title: "Edit Activity",
      description: `Editing ${activity.title} - This feature will be implemented soon.`,
    });
  };

  const handleDeleteActivity = (activity: Activity) => {
    if (!generatedItinerary) return;
    
    const updatedItinerary = {
      ...generatedItinerary,
      days: generatedItinerary.days.map((day) => {
        if (day.day === selectedDayIndex) {
          return {
            ...day,
            activities: day.activities.filter((a) => a.title !== activity.title),
          };
        }
        return day;
      }),
    };
    
    setGeneratedItinerary(updatedItinerary);
    
    if (tripId) {
      updateTripMutation.mutate({
        id: tripId,
        data: { itinerary: updatedItinerary },
      });
    }
    
    toast({
      title: "Activity removed",
      description: `${activity.title} has been removed from your itinerary.`,
    });
  };

  const handleSaveItinerary = () => {
    if (tripId && generatedItinerary) {
      updateTripMutation.mutate({
        id: tripId,
        data: {
          itinerary: generatedItinerary,
          status: "planned",
        },
      });
      
      toast({
        title: "Itinerary saved",
        description: "Your itinerary has been saved successfully.",
      });
      
      router.push("/dashboard");
    }
  };

  // Fixed handleBookTrip function
  const handleBookTrip = async () => {
    console.log("=== BOOK TRIP HANDLER ===");
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book your trip.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    
    if (!generatedItinerary) {
      toast({
        title: "No itinerary generated",
        description: "Please generate an itinerary before booking your trip.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!tripId) {
        // Create new trip with confirmed status and itinerary
        const tripData = {
          destination: destinations[0]?.location || destination,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          adults,
          children,
          destinations: destinations,
          transportationOptions: transportationOptions,
          preferences: {
            activities: preferences,
            budget,
            travelStyle,
            notes,
          },
          itinerary: generatedItinerary,
          status: "confirmed", // Set status as confirmed for booking
        };
        
        console.log("Creating new trip with booking:", tripData);
        
        // Use the create mutation but with confirmed status
        const result = await makeAuthenticatedApiRequest("POST", "/api/trips", {
          destinations: tripData.destinations?.map((dest: any) => ({
            location: dest.location,
            daysToStay: dest.daysToStay,
          })) || [],
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          adults: tripData.adults,
          children: tripData.children,
          preferences: {
            travelMode: "flight",
            hotelType:
              tripData.preferences?.budget === "luxury"
                ? "5-star"
                : tripData.preferences?.budget === "medium"
                ? "3-star"
                : "2-star",
            activities: tripData.preferences?.activities || [],
            budget: tripData.preferences?.budget || "medium",
            travelStyle: tripData.preferences?.travelStyle || "",
            notes: tripData.preferences?.notes || "",
          },
          itinerary: tripData.itinerary,
          status: "confirmed", // Confirmed status for booking
        });
        
        const newTripId = result.id?.toString() || result._id?.toString();
        setTripId(newTripId);
        
        toast({
          title: "Trip booked successfully!",
          description: "Your trip has been booked and saved.",
        });
        
        // Navigate to dashboard or booking confirmation
        router.push("/dashboard");
        
      } else {
        // Update existing trip with confirmed status and itinerary
        console.log("Updating existing trip with booking confirmation");
        
        await updateTripMutation.mutateAsync({
          id: tripId,
          data: {
            itinerary: generatedItinerary,
            status: "confirmed",
            transportationOptions: transportationOptions,
          },
        });
        
        toast({
          title: "Trip booked successfully!",
          description: "Your trip has been confirmed and saved.",
        });
        
        // Navigate to dashboard
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error booking trip:", error);
      toast({
        title: "Error booking trip",
        description: error.message || "There was a problem booking your trip.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        {/* Progress Steps */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-primary" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  1
                </div>
                <span className="text-xs">Trip Details</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-primary" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  2
                </div>
                <span className="text-xs">Preferences</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-primary" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 3 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  3
                </div>
                <span className="text-xs">Itinerary</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Plan Your Trip</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="destination">Your Multi-Destination Trip</Label>
                        <span className="text-xs text-gray-500">Total days: {calculateTotalDays()}</span>
                      </div>
                      
                      {/* Destinations list */}
                      <div className="space-y-3 mb-4">
                        {destinations.map((dest, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                            <div className="flex-grow">
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="City, country or region"
                                  className="pl-10"
                                  value={dest.location}
                                  onChange={(e) => handleUpdateDestination(index, "location", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                min="1"
                                value={dest.daysToStay}
                                onChange={(e) => handleUpdateDestination(index, "daysToStay", parseInt(e.target.value))}
                                className="text-center"
                              />
                              <Label className="text-xs block text-center mt-1">Days</Label>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveDestination(index)}
                              variant="destructive"
                              size="sm"
                              disabled={destinations.length === 1}
                              className="h-8 px-2"
                            >
                              <X className="h-5 w-5 mr-1" /> Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new destination */}
                      <div className="flex items-end gap-2 p-3 border rounded-md border-dashed">
                        <div className="flex-grow">
                          <Label htmlFor="newDestination" className="mb-1 block text-xs">New Destination</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="newDestination"
                              placeholder="City, country or region"
                              className="pl-10"
                              value={newDestination}
                              onChange={(e) => setNewDestination(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={newDaysToStay}
                            onChange={(e) => setNewDaysToStay(parseInt(e.target.value))}
                            className="text-center"
                          />
                          <Label className="text-xs block text-center mt-1">Days</Label>
                        </div>
                        <Button type="button" onClick={handleAddDestination} variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                      
                      {/* Transportation options */}
                      {destinations.length > 1 && (
                        <div className="mt-6 space-y-4">
                          <h3 className="text-sm font-semibold">Transportation Between Destinations</h3>
                          <div className="space-y-3">
                            {destinations.map((dest, index) => {
                              if (index === destinations.length - 1) return null;
                              
                              const nextDest = destinations[index + 1];
                              const selectedMode = getTransportationMode(index, index + 1);
                              const isBooked = transportationOptions.find(
                                (opt) => opt.fromDestination === index && opt.toDestination === index + 1 && opt.booked
                              );
                              
                              return (
                                <div key={`transport-${index}`} className="p-3 border rounded-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium">{dest.location}</span>
                                      <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium">{nextDest.location}</span>
                                    </div>
                                    {isBooked ? (
                                      <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">Booked</span>
                                    ) : selectedMode ? (
                                      <Button size="sm" onClick={() => handleBookTransportation(index, index + 1)}>
                                        Book Now
                                      </Button>
                                    ) : null}
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[
                                      { mode: "train", icon: Train, label: "Train" },
                                      { mode: "bus", icon: Bus, label: "Bus" },
                                      { mode: "car", icon: Car, label: "Car" },
                                      { mode: "flight", icon: Plane, label: "Flight" },
                                    ].map(({ mode, icon: Icon, label }) => (
                                      <button
                                        key={mode}
                                        type="button"
                                        onClick={() => handleSetTransportationMode(index, index + 1, mode as any)}
                                        className={`flex flex-col items-center justify-center p-2 border rounded-md transition ${
                                          selectedMode === mode
                                            ? "border-primary bg-primary/10"
                                            : "hover:border-primary/50"
                                        }`}
                                      >
                                        <Icon className={`h-6 w-6 ${
                                          selectedMode === mode ? "text-primary" : "text-gray-500"
                                        }`} />
                                        <span className={`text-xs mt-1 ${
                                          selectedMode === mode ? "text-primary font-medium" : "text-gray-600"
                                        }`}>
                                          {label}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Date and travelers selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>When are you going?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "MMM d, yyyy") : <span>Start date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => {
                                setStartDate(date);
                                if (date && (!endDate || date > endDate)) {
                                  setEndDate(addDays(date, 3));
                                }
                              }}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "MMM d, yyyy") : <span>End date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              disabled={(date) => !startDate || date < startDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Travelers</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between border rounded-md px-3 py-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Adults</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => adults > 1 && setAdults(adults - 1)}
                            >
                              -
                            </Button>
                            <span>{adults}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setAdults(adults + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border rounded-md px-3 py-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Children</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => children > 0 && setChildren(children - 1)}
                            >
                              -
                            </Button>
                            <span>{children}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setChildren(children + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button
                      className="bg-primary"
                      onClick={handleNextStep}
                      disabled={createTripMutation.isPending || updateTripMutation.isPending}
                    >
                      {createTripMutation.isPending || updateTripMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Preferences
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Trip Preferences</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Tell us what you enjoy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Activities & Interests</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {preferences.map((preference) => (
                        <div
                          key={preference}
                          className="bg-primary bg-opacity-10 text-primary text-sm px-3 py-1 rounded-full flex items-center"
                        >
                          {preference}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePreference(preference)}
                            className="h-5 w-5 p-0 ml-1 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {preferences.length === 0 && (
                        <span className="text-sm text-gray-500">Add some activities or interests you enjoy</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 border rounded p-2"
                        value={selectedPreferenceInput}
                        onChange={(e) => setSelectedPreferenceInput(e.target.value)}
                      >
                        <option value="">Select an interest</option>
                        {availablePreferences.map((pref) => (
                          <option key={pref} value={pref}>
                            {pref}
                          </option>
                        ))}
                      </select>
                      <Button variant="outline" onClick={handleAddPreference} disabled={!selectedPreferenceInput}>
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["budget", "medium", "luxury"].map((budgetType) => (
                        <Button
                          key={budgetType}
                          variant={budget === budgetType ? "default" : "outline"}
                          className={budget === budgetType ? "bg-primary" : ""}
                          onClick={() => setBudget(budgetType)}
                        >
                          {budgetType.charAt(0).toUpperCase() + budgetType.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    <select
                      id="travelStyle"
                      className="w-full border rounded p-2"
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                    >
                      <option value="">Select a travel style</option>
                      <option value="relaxed">Relaxed - Take it easy</option>
                      <option value="balanced">Balanced - Mix of activities and rest</option>
                      <option value="intensive">Intensive - Pack in as much as possible</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or preferences?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Back
                    </Button>
                    <Button
                      className="bg-primary"
                      onClick={handleNextStep}
                      disabled={isGeneratingItinerary}
                    >
                      {isGeneratingItinerary ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Itinerary...
                        </>
                      ) : (
                        <>
                          Generate Itinerary
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Itinerary */}
          {currentStep === 3 && (
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Your Personalized Itinerary</h1>
              {isGeneratingItinerary ? (
                <Card className="p-8 text-center">
                  <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-bold mb-2">Generating Your Itinerary</h2>
                  <p className="text-gray-600 mb-4">
                    Our AI is creating a personalized plan for your trip. This might take a minute...
                  </p>
                </Card>
              ) : generatedItinerary ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <Map className="mr-2 h-5 w-5" />
                          {generatedItinerary.destination} Itinerary
                        </CardTitle>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          {startDate && endDate ? (
                            <span>
                              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")} (
                              {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                            </span>
                          ) : (
                            <span>Trip dates</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="day-view" className="mt-2">
                        <TabsList className="grid grid-cols-2 w-full md:w-64 mb-4">
                          <TabsTrigger value="day-view">Day View</TabsTrigger>
                          <TabsTrigger value="map-view">Map View</TabsTrigger>
                        </TabsList>
                        <TabsContent value="day-view" className="mt-0">
                          <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex space-x-4 pb-4">
                              {generatedItinerary.days.map((day) => (
                                <div
                                  key={day.day}
                                  className="flex-shrink-0 w-20 text-center cursor-pointer"
                                  onClick={() => setSelectedDayIndex(day.day)}
                                >
                                  <div
                                    className={`${
                                      selectedDayIndex === day.day
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 hover:bg-primary hover:text-white"
                                    } px-2 py-3 rounded-lg transition`}
                                  >
                                    <div className="font-bold">Day {day.day}</div>
                                    <div className="text-xs">
                                      {new Date(day.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {generatedItinerary.days.find((day) => day.day === selectedDayIndex) && (
                            <ItineraryDay
                              day={generatedItinerary.days.find((day) => day.day === selectedDayIndex)!}
                              onEditActivity={handleEditActivity}
                              onDeleteActivity={handleDeleteActivity}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="map-view" className="mt-0">
                          <div className="bg-gray-100 rounded-lg p-6 text-center">
                            <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p>Map view will be available soon.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Back to Preferences
                    </Button>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleSaveItinerary}
                        disabled={updateTripMutation.isPending}
                      >
                        {updateTripMutation.isPending ? "Saving..." : "Save Itinerary"}
                      </Button>
                      <Button
                        className="bg-primary"
                        onClick={handleBookTrip}
                        disabled={updateTripMutation.isPending}
                      >
                        {updateTripMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Book This Trip"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Itinerary Generated Yet</h2>
                  <p className="text-gray-600 mb-4">
                    Click the button below to generate a personalized itinerary for your trip.
                  </p>
                  <Button
                    className="bg-primary"
                    onClick={handleGenerateItinerary}
                    disabled={isGeneratingItinerary}
                  >
                    {isGeneratingItinerary ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Itinerary"
                    )}
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TripPlanner;