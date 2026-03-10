"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Plane,
  Hotel,
  Car,
  Users,
  MapPin,
  CreditCard,
  Check,
  ArrowRight,
  Star,
  Loader2,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HotelDetailsOverlay from "@/components/HotelDetailsOverlay";
import { BOOKING_API_URL, PAYMENTS_API_URL } from "@/lib/config";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentStepProps {
  selectedItems: {
    flight?: any;
    hotel?: any;
    cab?: any;
  };
  tripId: string;
  userId: string | number;
  travelers: any[];
  getTripDuration: () => number;
  getTotalAmount: () => number;
  onPaymentSuccess: (bookingId: string) => void;
}

// Types based on your trip planner
interface Activity {
  title: string;
  description?: string;
  time?: string;
  duration?: string;
  location?: string;
  cost?: string;
  category?: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  city?: string;
  activities: Activity[];
}

interface Itinerary {
  destination: string;
  days: ItineraryDay[];
  totalDays?: number;
}

interface TripData {
  id?: string;
  _id?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  destinations?: Array<{
    location: string;
    daysToStay: number;
  }>;
  transportationOptions?: Array<{
    fromDestination: number;
    toDestination: number;
    mode: "train" | "bus" | "car" | "flight";
    booked: boolean;
  }>;
  preferences?: {
    activities?: string[];
    budget?: string;
    travelStyle?: string;
    notes?: string;
  };
  itinerary?: Itinerary;
  status?: string;
}

// Real flight data interface
interface RealFlightOffer {
  id: string;
  source: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
  }>;
}

// Mock hotel data - in real app, this would come from an API based on destinations
const generateMockHotels = (city: string) => [
  {
    id: "h1",
    name: `Hotel ${city} Central`,
    rating: 4.5,
    location: `City Center, ${city}`,
    price: 180,
    amenities: ["Free WiFi", "Breakfast", "Air Conditioning"],
    image: "/api/placeholder/300/200",
  },
  {
    id: "h2",
    name: `Grand Hotel ${city}`,
    rating: 4.2,
    location: `Historic District, ${city}`,
    price: 220,
    amenities: ["Free WiFi", "Gym", "Restaurant"],
    image: "/api/placeholder/300/200",
  },
];

const mockCabs = [
  {
    id: "c1",
    type: "Economy",
    vehicle: "Toyota Camry or similar",
    price: 500,
    capacity: 4,
    features: ["AC", "GPS Navigation"],
  },
  {
    id: "c2",
    type: "Premium",
    vehicle: "Mercedes E-Class or similar",
    price: 1000,
    capacity: 4,
    features: ["AC", "GPS Navigation", "WiFi", "Premium Audio"],
  },
];

const TravelBookingFlow = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Get trip ID from URL or localStorage
  const [tripId, setTripId] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState("confirmation");

  const [selectedBookings, setSelectedBookings] = useState({
    transportation: true,
    hotels: true,
    cabs: true,
  });

  const [selectedItems, setSelectedItems] = useState<{
    flight: any | null;
    hotel: any | null;
    cab: any | null;
  }>({
    flight: null,
    hotel: null,
    cab: null,
  });

  const [bookingDetails, setBookingDetails] = useState({
    travelers: 2,
    checkIn: "",
    checkOut: "",
    rooms: 1,
  });

  // Real flight data state
  const [realFlights, setRealFlights] = useState<RealFlightOffer[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);

  const [realHotels, setRealHotels] = useState<any[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [selectedHotelForDetails, setSelectedHotelForDetails] =
    useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [isLoadingHotelDetails, setIsLoadingHotelDetails] = useState(false);

  const [showHotelOverlay, setShowHotelOverlay] = useState<boolean>(false);
  const [selectedHotelForOverlay, setSelectedHotelForOverlay] =
    useState<any>(null);
  const [flightSearchSessionId, setFlightSearchSessionId] = useState<
    string | null
  >(null);
  const [hotelSearchSessionId, setHotelSearchSessionId] = useState<
    string | null
  >(null);

  const [travelers, setTravelers] = useState<any[]>([]);

  const token = localStorage.getItem("authToken");

  const { data: tripData, isLoading: isTripLoading } = useQuery<TripData>({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const response = await makeAuthenticatedApiRequest(
        "GET",
        `/api/trips/${tripId}`
      );
      return response;
    },
    enabled: !!tripId && !!user && !authLoading,
  });

  // Initialize trip ID
  useEffect(() => {
    const urlTripId = searchParams.get("tripId");
    const storedTripId = localStorage.getItem("currentTripId");

    if (urlTripId) {
      setTripId(urlTripId);
    } else if (storedTripId) {
      setTripId(storedTripId);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tripData) {
      setBookingDetails((prev) => ({
        ...prev,
        travelers: (tripData.adults || 2) + (tripData.children || 0),
        checkIn: tripData.startDate
          ? new Date(tripData.startDate).toISOString().split("T")[0]
          : "",
        checkOut: tripData.endDate
          ? new Date(tripData.endDate).toISOString().split("T")[0]
          : "",
      }));
    }
  }, [tripData]);

  useEffect(() => {
    if (
      bookingStep === "transportation" &&
      selectedBookings.transportation &&
      realFlights.length === 0
    ) {
      const loadFlights = async () => {
        setIsLoadingFlights(true);
        try {
          const flights = await generateRealFlights();
          console.log("Loaded flights:", flights);
          setRealFlights(flights);

          if (flights.length > 0) {
            const saveResponse = await makeAuthenticatedApiRequest(
              "POST",
              "/api/search-results/flights/save",
              {
                tripId: tripId,
                userId: user?.id,
                searchParams: {
                  originCode:
                    flights[0]?.itineraries[0]?.segments[0]?.departure
                      ?.iataCode || "DEL",
                  destinationCode:
                    flights[0]?.itineraries[0]?.segments.slice(-1)[0]?.arrival
                      ?.iataCode || "BOM",
                  departureDate: tripData?.startDate,
                  returnDate: tripData?.endDate,
                  adults: tripData?.adults || 2,
                  children: tripData?.children || 0,
                },
                resultCount: flights.length,
              }
            );

            if (saveResponse.success) {
              setFlightSearchSessionId(saveResponse.searchSessionId);
            }
          }
        } catch (error) {
          console.error("Error loading flights:", error);
          toast({
            title: "Error loading flights",
            description: "Unable to load flight data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingFlights(false);
        }
      };

      loadFlights();
    }
  }, [bookingStep, selectedBookings.transportation, tripData]);

  useEffect(() => {
    if (
      bookingStep === "hotels" &&
      selectedBookings.hotels &&
      realHotels.length === 0
    ) {
      const loadHotels = async () => {
        setIsLoadingHotels(true);
        try {
          if (!tripData?.destinations || tripData.destinations.length === 0) {
            throw new Error("No destinations found");
          }

          const firstDestination = tripData.destinations[0].location;
          const cityCode = await getCityCode(firstDestination);

          const checkInDate = tripData.startDate
            ? new Date(tripData.startDate).toISOString().split("T")[0]
            : format(new Date(), "yyyy-MM-dd");

          const checkOutDate = tripData.endDate
            ? new Date(tripData.endDate).toISOString().split("T")[0]
            : format(addDays(new Date(), getTripDuration()), "yyyy-MM-dd");

          const hotels = await searchRealHotels(
            cityCode,
            checkInDate,
            checkOutDate
          );
          setRealHotels(hotels);
          console.log("Loaded hotels:", hotels);

          if (hotels.length > 0) {
            try {
              const savedResponse = await makeAuthenticatedApiRequest(
                "POST",
                "/api/search-results/hotels/save",
                {
                  tripId,
                  userId: user?.id,
                  searchParams: {
                    destId: cityCode, // ✅ Changed from location to destId
                    destination: firstDestination, // ✅ Added destination city name
                    checkinDate: new Date(checkInDate), // ✅ Changed to checkinDate (lowercase 'i') and convert to Date
                    checkoutDate: new Date(checkOutDate),
                    adults: tripData?.adults || 2,
                    children: tripData?.children || 0,
                  },
                  hotels,
                }
              );

              if (savedResponse.success) {
                setHotelSearchSessionId(savedResponse.searchSessionId);
              }
            } catch (err) {
              console.error("Failed to save hotels:", err);
            }
          }
        } catch (error) {
          console.error("Error loading hotels:", error);
          toast({
            title: "Error loading hotels",
            description: "Unable to load hotel data. Please try again.",
            variant: "destructive",
          });
          // Fallback to mock data on error
          const firstDestination =
            tripData?.destinations?.[0]?.location || "City";
          setRealHotels(generateMockHotels(firstDestination));
        } finally {
          setIsLoadingHotels(false);
        }
      };

      loadHotels();
    }
  }, [bookingStep, selectedBookings.hotels, tripData]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    if (tripData && user) {
      // Create travelers based on trip adults/children
      const adultsCount = tripData.adults || 2;
      const childrenCount = tripData.children || 0;
      const totalTravelers = adultsCount + childrenCount;

      // Generate travelers array
      const travelersArray = Array.from(
        { length: totalTravelers },
        (_, index) => ({
          _id: user.id, // Use same user ID for now (or fetch actual traveler profiles)
          id: user.id,
          name: index === 0 ? user.fullName : `Traveler ${index + 1}`,
          isLeadTraveler: index === 0,
          type: index < adultsCount ? "adult" : "child",
        })
      );

      setTravelers(travelersArray);
      console.log("👥 Travelers initialized:", travelersArray);
    }
  }, [tripData, user]);

  // API request helper
  const makeAuthenticatedApiRequest = async (
    method: string,
    url: string,
    data?: any
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    };

    if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BOOKING_API_URL}${url}`, options);

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

      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  // Fetch trip data

  // Helper functions for flight data
  const getCoordinates = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          cityName
        )}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            "User-Agent": "FlightBookingApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        console.log(`No coordinates found for: ${cityName}`);
        return null;
      }

      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };

      console.log(`Coordinates for ${cityName}:`, coordinates);
      return coordinates;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  const getNearbyAirportCode = async (lat: number, lon: number) => {
    const amadeusAccessToken =
      process.env.NEXT_PUBLIC_AMADEUS_ACCESS_TOKEN ||
      "7UGGS1udRouzXnlxwqQGlI1OIpPC";

    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${lat}&longitude=${lon}&radius=100&page%5Blimit%5D=5&page%5Boffset%5D=0&sort=relevance`,
        {
          headers: {
            Authorization: `Bearer ${amadeusAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.data || data.data.length === 0) {
        console.log(`No nearby airports found for coordinates: ${lat}, ${lon}`);
        return null;
      }

      const airports = data.data.filter(
        (location: { subType: string; iataCode: any }) =>
          location.subType === "AIRPORT" && location.iataCode
      );

      if (airports.length === 0) {
        console.log("No airports found in the nearby locations");
        return null;
      }

      const nearestAirport = airports[0];
      console.log(
        `Nearest airport: ${nearestAirport.name} (${nearestAirport.iataCode})`
      );

      return nearestAirport.iataCode;
    } catch (error) {
      console.error("Error fetching nearby airport:", error);
      return null;
    }
  };

  const searchAirportCode = async (cityName: string) => {
    try {
      const response = await makeAuthenticatedApiRequest(
        "GET",
        `/api/flights/city-and-airport-search/${encodeURIComponent(cityName)}`
      );

      if (response?.data?.[0]?.iataCode) {
        return response.data[0].iataCode;
      }

      // Fallback to coordinates lookup
      const coordinates = await getCoordinates(cityName);
      if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
        return await getNearbyAirportCode(coordinates.lat, coordinates.lng);
      }

      return null;
    } catch (error) {
      console.error("Error searching airport code:", error);
      return null;
    }
  };

  // Generate real flights function
  // Replace your existing generateRealFlights function with this fixed version
  const generateRealFlights = async (): Promise<RealFlightOffer[]> => {
    if (!tripData?.destinations || tripData.destinations.length === 0)
      return [];

    try {
      const firstDestination = tripData.destinations[0].location;
      const secondDestination =
        tripData.destinations[1]?.location || firstDestination;
      console.log("First Destination:", firstDestination);
      console.log("Second Destination:", secondDestination);

      // Get origin and destination airport codes
      const originCode = await searchAirportCode(firstDestination);
      const destinationCode = await searchAirportCode(secondDestination);

      if (!originCode || !destinationCode) {
        console.error("Could not find airport codes", {
          originCode,
          destinationCode,
        });
        return [];
      }

      console.log("Found airport codes:", { originCode, destinationCode });

      // Format dates properly - ensure they're in YYYY-MM-DD format
      const formatDateForApi = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // This gives YYYY-MM-DD format
      };

      const departureDate = tripData.startDate
        ? formatDateForApi(tripData.startDate)
        : format(new Date(), "yyyy-MM-dd");

      const params = new URLSearchParams({
        originCode,
        destinationCode,
        dateOfDeparture: departureDate,
        adults: (tripData.adults || 2).toString(),
        currencyCode: "INR",
        max: "20",
      });

      if (tripData.children && tripData.children > 0) {
        params.append("children", tripData.children.toString());
      }

      // Only add return date if it's a round trip and we have an end date
      if (tripData.endDate && tripData.endDate !== tripData.startDate) {
        const returnDate = formatDateForApi(tripData.endDate);
        params.append("returnDate", returnDate);
      }

      console.log("API Parameters:", params.toString());
      console.log("Full API URL:", `/api/flights/flight-search?${params}`);

      const response = await makeAuthenticatedApiRequest(
        "GET",
        `/api/flights/flight-search?${params}`
      );

      console.log("Flight search response:", response);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching real flights:", error);
      return [];
    }
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;

    const hours = match[1] ? match[1].replace("H", "h ") : "";
    const minutes = match[2] ? match[2].replace("M", "m") : "";
    return `${hours}${minutes}`;
  };

  const getStopsText = (segments: any[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return "Nonstop";
    if (stops === 1) return "1 Stop";
    return `${stops} Stops`;
  };

  const getAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
      AA: "American Airlines",
      DL: "Delta Air Lines",
      UA: "United Airlines",
      SW: "Southwest Airlines",
      AS: "Alaska Airlines",
      B6: "JetBlue Airways",
      NK: "Spirit Airlines",
      F9: "Frontier Airlines",
      G4: "Allegiant Air",
      SY: "Sun Country Airlines",
      AF: "Air France",
      KL: "KLM",
      LH: "Lufthansa",
      BA: "British Airways",
      EK: "Emirates",
      QR: "Qatar Airways",
    };
    return airlines[code] || code;
  };


  const searchDestinationId = async (cityName: string) => {
    try {
      console.log("searching destination id for :", cityName);
      const result = await makeAuthenticatedApiRequest(
        "GET",
        `/api/hotels/search-destinations?query=${encodeURIComponent(cityName)}`
      );
      console.log("Destination search response :", result);

      if (result.success && result.data.length > 0) {
        // ✅ Get the first supported destination
        const destination = result.data[0];
        console.log("🆔 Found destination:", destination);

        // ✅ Use cityCode instead of placeId
        const cityCode = destination.cityCode;
        console.log("🆔 City Code:", cityCode);

        if (!cityCode) {
          throw new Error(
            `City code not found for ${cityName}. This city may not be supported.`
          );
        }

        return cityCode; // ✅ Return IATA code, not placeId
      }

      throw new Error(`No results found for ${cityName}`);
    } catch (error) {
      console.error("Error searching destination:", error);
      return null;
    }
  };

  const searchRealHotels = async (
    destinationName: string,
    checkIn: string,
    checkOut: string
  ) => {
    try {
      setIsLoadingHotels(true);

      const cityCode = await searchDestinationId(destinationName);
      if (!cityCode) {
        throw new Error("Could not find city code for the destination");
      }

      const result = await makeAuthenticatedApiRequest(
        "GET",
        `/api/hotels/search?cityCode=${cityCode}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${
          tripData?.adults || 2
        }&rooms=1`
      );

      console.log("Hotels search result:", result);

      if (result.success && result.data?.hotels) {
        return result.data.hotels;
      }

      return [];
    } catch (error) {
      console.error("Error fetching hotels:", error);
      throw error;
    } finally {
      setIsLoadingHotels(false);
    }
  };



  const getHotelDetails = async (offerId: string) => {
    try {
      setIsLoadingHotelDetails(true);

      // ✅ Amadeus uses offerId, not hotel_id + dates
      // The offer already contains all booking details (dates, guests, pricing)
      const params = new URLSearchParams({
        offerId: offerId,
      });

      const response = await makeAuthenticatedApiRequest(
        "GET",
        `/api/hotels/details?offerId=${offerId}` // ✅ Changed endpoint
      );

      setHotelDetails(response);
      return response;
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast({
        title: "Error loading hotel details",
        description: "Unable to load hotel details. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingHotelDetails(false);
    }
  };
  // Replace the existing useEffect for loading hotels with this:
  useEffect(() => {
    if (
      bookingStep === "hotels" &&
      selectedBookings.hotels &&
      realHotels.length === 0
    ) {
      const loadHotels = async () => {
        setIsLoadingHotels(true);
        try {
          if (!tripData?.destinations || tripData.destinations.length === 0) {
            throw new Error("No destinations found");
          }

          const firstDestination = tripData.destinations[0].location;

          const checkInDate = tripData.startDate
            ? new Date(tripData.startDate).toISOString().split("T")[0]
            : format(new Date(), "yyyy-MM-dd");

          const checkOutDate = tripData.endDate
            ? new Date(tripData.endDate).toISOString().split("T")[0]
            : format(addDays(new Date(), getTripDuration()), "yyyy-MM-dd");

          const hotels = await searchRealHotels(
            firstDestination,
            checkInDate,
            checkOutDate
          );
          setRealHotels(hotels);
        } catch (error) {
          console.error("Error loading hotels:", error);
          toast({
            title: "Error loading hotels",
            description: "Unable to load hotel data. Please try again.",
            variant: "destructive",
          });
          // Fallback to empty array on error
          setRealHotels([]);
        } finally {
          setIsLoadingHotels(false);
        }
      };

      loadHotels();
    }
  }, [bookingStep, selectedBookings.hotels, tripData]);

  const getCityCode = async (cityName: string) => {
    // You might want to create a mapping or use a geocoding service
    // For now, here's a basic implementation using common codes:
    const cityCodeMap: { [key: string]: string } = {
      delhi: "DEL",
      mumbai: "BOM",
      bangalore: "BLR",
      chennai: "MAA",
      kolkata: "CCU",
      hyderabad: "HYD",
      pune: "PNQ",
      ahmedabad: "AMD",
      jaipur: "JAI",
      lucknow: "LKO",
      "new york": "NYC",
      "los angeles": "LAX",
      chicago: "CHI",
      miami: "MIA",
      "las vegas": "LAS",
      "san francisco": "SFO",
      london: "LON",
      paris: "PAR",
      tokyo: "TYO",
      dubai: "DXB",
    };

    const normalizedCity = cityName.toLowerCase().trim();
    return (
      cityCodeMap[normalizedCity] || cityName.substring(0, 3).toUpperCase()
    );
  };



  const stepConfig = {
    confirmation: { title: "Booking Confirmation", icon: Check },
    transportation: { title: "Transportation", icon: Plane },
    hotels: { title: "Hotels", icon: Hotel },
    cabs: { title: "Local Transport", icon: Car },
    payment: { title: "Payment", icon: CreditCard },
  };

  const getBookingSteps = () => {
    const steps = ["confirmation"];
    if (selectedBookings.transportation) steps.push("transportation");
    if (selectedBookings.hotels) steps.push("hotels");
    if (selectedBookings.cabs) steps.push("cabs");
    steps.push("payment");
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getBookingSteps();
    return steps.indexOf(bookingStep);
  };

  const getTotalAmount = () => {
    let total = 0;
    const travelerCount = travelers.length || bookingDetails.travelers || 1; // ✅ Use travelers state

    if (selectedItems.flight) {
      const price =
        typeof selectedItems.flight.price === "object"
          ? parseFloat(selectedItems.flight.price.total)
          : selectedItems.flight.price;
      total += price * travelerCount;
    }
    if (selectedItems.hotel) {
      // Use totalPrice that was calculated when hotel was selected
      const hotelPrice = selectedItems.hotel.totalPrice || 0;
      console.log("Hotel pricing debug:", {
        totalPrice: selectedItems.hotel.totalPrice,
        nights: selectedItems.hotel.nights,
        hotelPrice,
        selectedHotel: selectedItems.hotel,
      });
      total += hotelPrice;
    }
    if (selectedItems.cab) {
      const days = getTripDuration();
      total += selectedItems.cab.price * days;
    }
    return Math.round(total);
  };

  const getTripDuration = () => {
    if (tripData?.startDate && tripData?.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      return Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return tripData?.itinerary?.totalDays || 2;
  };

  const handleNext = () => {
    const steps = getBookingSteps();
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setBookingStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = getBookingSteps();
    const currentIndex = getCurrentStepIndex();

    if (currentIndex > 0) {
      // Navigate to previous booking step
      setBookingStep(steps[currentIndex - 1]);
    } else {
      // On first step, go back to the previous page (trip results with itinerary)
      router.back(); // This uses browser history to go to the exact previous page
    }
  };

  // Loading state
  if (authLoading || isTripLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your trip details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (!tripData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4">
              No trip data found. Please go back and plan your trip first.
            </p>
            <Button onClick={() => router.push("/trip-planner")}>
              Plan New Trip
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Step Components
  const BookingConfirmation = () => (
    <Card>
      <CardHeader>
        <CardTitle>What would you like to book?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              selectedBookings.transportation ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-4">
              <div
                className="flex items-center space-x-3"
                onClick={() =>
                  setSelectedBookings({
                    ...selectedBookings,
                    transportation: !selectedBookings.transportation,
                  })
                }
              >
                <Checkbox checked={selectedBookings.transportation} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span className="font-medium">Flights/Transportation</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Book transportation to your destinations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              selectedBookings.hotels ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-4">
              <div
                className="flex items-center space-x-3"
                onClick={() =>
                  setSelectedBookings({
                    ...selectedBookings,
                    hotels: !selectedBookings.hotels,
                  })
                }
              >
                <Checkbox checked={selectedBookings.hotels} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Hotel className="h-5 w-5" />
                    <span className="font-medium">Hotels</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Find accommodation for your stay
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              selectedBookings.cabs ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-4">
              <div
                className="flex items-center space-x-3"
                onClick={() =>
                  setSelectedBookings({
                    ...selectedBookings,
                    cabs: !selectedBookings.cabs,
                  })
                }
              >
                <Checkbox checked={selectedBookings.cabs} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span className="font-medium">Local Transport</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Book cabs and local transportation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">Your Trip Summary</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Primary Destination:</strong>{" "}
              {tripData.itinerary?.destination || tripData.destination}
            </p>
            <p>
              <strong>Duration:</strong> {getTripDuration()} days
            </p>
            <p>
              <strong>Travelers:</strong> {tripData.adults || 2} adults
              {tripData.children ? `, ${tripData.children} children` : ""}
            </p>
            <p>
              <strong>Dates:</strong>{" "}
              {tripData.startDate
                ? new Date(tripData.startDate).toLocaleDateString()
                : ""}{" "}
              -{" "}
              {tripData.endDate
                ? new Date(tripData.endDate).toLocaleDateString()
                : ""}
            </p>

            {tripData.destinations && tripData.destinations.length > 0 && (
              <div>
                <strong>Destinations:</strong>
                <ul className="ml-4 mt-1">
                  {tripData.destinations.map((dest, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>• {dest.location}</span>
                      <span className="text-xs">({dest.daysToStay} days)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tripData.preferences?.budget && (
              <p>
                <strong>Budget:</strong>{" "}
                {tripData.preferences.budget.charAt(0).toUpperCase() +
                  tripData.preferences.budget.slice(1)}
              </p>
            )}
          </div>

          {tripData.itinerary && tripData.itinerary.days.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Sample Activities:</h4>
              <div className="text-xs text-gray-600">
                {tripData.itinerary.days.slice(0, 2).map((day, index) => (
                  <div key={index}>
                    <strong>Day {day.day}:</strong>{" "}
                    {day.activities
                      .slice(0, 3)
                      .map((a) => a.title)
                      .join(", ")}
                    {day.activities.length > 3 && "..."}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TransportationStep = () => {
    const handleFlightSelect = async (flight: any) => {
      try {
        setSelectedItems({ ...selectedItems, flight });

        // Calculate total price for all travelers
        const pricePerPerson = parseFloat(
          flight.price?.total || flight.price || 0
        );
        const totalTravelers =
          travelers.length || bookingDetails.travelers || 1;
        const totalFlightPrice = pricePerPerson * totalTravelers;

        console.log("💰 Flight pricing:", {
          pricePerPerson,
          totalTravelers,
          totalFlightPrice,
          travelers: travelers.length,
        });
        // Prepare travelers data - ensure we have valid IDs
        const travelersData =
          travelers.length > 0
            ? travelers.map((t, idx) => ({
                travelerId: t._id || t.id || user?.id, // Ensure string ID
                type:
                  t.type || (idx < (tripData?.adults || 2) ? "adult" : "child"),
                name: t.name || user?.fullName || `Traveler ${idx + 1}`,
              }))
            : Array.from({ length: totalTravelers }, (_, idx) => ({
                travelerId: user?.id,
                type: idx < (tripData?.adults || 2) ? "adult" : "child",
                name: user?.fullName || `Traveler ${idx + 1}`,
              }));

        const token = localStorage.getItem("authToken");

        console.log("👥 Sending travelers data:", travelersData);

        const response = await fetch(
          `${BOOKING_API_URL}/api/flights/flight-booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              flight,
              name: {
                first: user?.fullName || "John",
                last: user?.fullName || "Doe",
              },
              userId: user?.id, // ✅ from logged-in user
              tripId, // ✅ if available
              bookingId: null, // ✅ if user is modifying an existing booking
              travelers: travelersData,
              totalTravelers,
              totalPrice: totalFlightPrice,
              pricePerPerson,
            }),
          }
        );
        //     const travelersList = travelers.map((traveler, index) => ({
        //   travelerId: traveler._id || traveler.id || currentUserId,
        //   isLeadTraveler: index === 0 // First traveler is lead
        // }));

        const data = await response.json();
        console.log("Flight Data", data.data);

        if (!response.ok) {
          console.error("❌ Failed to save flight booking:", data);
          toast({
            title: "Booking Failed",
            description: data.message || "Could not save your flight booking.",
            variant: "destructive",
          });
          return;
        }

        console.log("✅ Flight booking saved:", data);
        toast({
          title: "Flight Booked!",
          description: "Your flight has been saved successfully.",
        });

        // optionally update local state with new bookingId
        if (data.data?.parentBookingId) {
          localStorage.setItem("currentBookingId", data.data.parentBookingId);
        }
      } catch (error) {
        console.error("Error saving flight booking:", error);
        toast({
          title: "Network Error",
          description: "Could not connect to booking service.",
          variant: "destructive",
        });
      }
    };

    if (isLoadingFlights) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading real flight options...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choose Your Transportation</h2>
          <Badge variant="outline">
            {realFlights.length} real flights available
          </Badge>
        </div>

        {tripData.destinations && tripData.destinations.length > 1 && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">
              Multi-Destination Trip
            </h3>
            <p className="text-sm text-yellow-700">
              You have multiple destinations. We'll help you book transportation
              between:
            </p>
            <div className="mt-2 text-sm">
              {tripData.destinations.map((dest, index) => (
                <span key={index}>
                  {dest.location}
                  {index < tripData.destinations!.length - 1 && (
                    <ArrowRight className="inline h-4 w-4 mx-2" />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {realFlights.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No flights available
              </h3>
              <p className="text-gray-600 mb-4">
                No flights found for your destination. Please check your travel
                dates or destination.
              </p>
            </CardContent>
          </Card>
        ) : (
          realFlights.map((flight) => {
            const segment = flight.itineraries[0].segments[0];
            const lastSegment =
              flight.itineraries[0].segments[
                flight.itineraries[0].segments.length - 1
              ];
            const pricePerPerson = parseFloat(flight.price.total);
            console.log("PricePerPerson :", pricePerPerson);

            return (
              <Card
                key={flight.id}
                className={`cursor-pointer transition-all ${
                  selectedItems.flight?.id === flight.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {format(new Date(segment.departure.at), "HH:mm")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {segment.departure.iataCode}
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-1">
                        <div className="text-sm text-gray-600">
                          {formatDuration(flight.itineraries[0].duration)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-px bg-gray-300"></div>
                          <Plane className="h-4 w-4 text-gray-400" />
                          <div className="w-12 h-px bg-gray-300"></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {getStopsText(flight.itineraries[0].segments)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {format(new Date(lastSegment.arrival.at), "HH:mm")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {lastSegment.arrival.iataCode}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          {getAirlineName(segment.carrierCode)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {segment.carrierCode} {segment.number}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        ${pricePerPerson.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>
                      <Button
                        onClick={() => handleFlightSelect(flight)}
                        // setSelectedItems({ ...selectedItems, flight })

                        variant={
                          selectedItems.flight?.id === flight.id
                            ? "default"
                            : "outline"
                        }
                      >
                        {selectedItems.flight?.id === flight.id
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  // Replace the existing HotelsStep component with this updated version:
  const HotelsStep = () => {
    const nights = getTripDuration();

    const handleHotelSelect = async (hotel: any) => {
      // If already selected, return
      if (selectedItems.hotel?.hotelId === hotel.hotelId) return;

      const checkInDate = tripData?.startDate
        ? new Date(tripData.startDate).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd");

      const checkOutDate = tripData?.endDate
        ? new Date(tripData.endDate).toISOString().split("T")[0]
        : format(addDays(new Date(), getTripDuration()), "yyyy-MM-dd");

      const nights = getTripDuration() ;
      const pricePerNight =
  hotel.pricing?.total ||
  hotel.pricing?.base ||
  0;

const totalPrice = Math.round(pricePerNight * nights);

      try {
        setSelectedHotelForDetails(hotel);

        const details = await getHotelDetails(hotel.offerId); // ✅ Changed

        // Prepare payload to send to backend
        const payload = {
          tripId,
          userId: user?.id,
          offerId: hotel.offerId,
          hotelDetails: {
            hotelId: hotel.hotelId,
            hotelName: hotel.hotelName,
            address: hotel.address,
            starRating: hotel.starRating,
            propertyType: hotel.propertyType,
          },
          stayDetails: {
            searchParams: {
              roomQuantity: 1,
              adults: 2,
              children: 0,
              checkIn: checkInDate,
              checkOut: checkOutDate,
            },

            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            rooms: [
              {
                roomType: details?.roomType || "Standard",
                assignedTravelers: [], // will be updated later
                occupancy: { adults: 2, children: 0 },
              },
            ],
          },
          leadGuest: {
            travelerId: tripData._id, // ✅ Add this if available
          },
          pricing: {
  basePrice: pricePerNight,
  totalPrice: totalPrice,
  currency: hotel.pricing?.currency || "INR",
},
          apiDetails: {
            hotelId: hotel.id || hotel.hotelId,
            provider: "Amadeus",
          },

          specialRequests: "",
          additionalServices: [],
        };

        // 🟢 Save selected hotel in backend (as draft booking)
        const response = await fetch(
         `${BOOKING_API_URL}/api/hotels/bookings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include", // ✅ include session cookie
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          console.log("✅ Hotel booking saved successfully:", result);
          localStorage.setItem("currentBookingId", result.data.parentBookingId);
          setSelectedItems({
            ...selectedItems,
            hotel: {
              ...hotel,
              details,
              nights,
              totalPrice: Math.round(pricePerNight * nights),
              status: "draft",
              hotelBookingId: result.data.hotelBookingId,
            },
          });
        } else {
          console.error("❌ Failed to save hotel booking:", result);
        }
      } catch (error) {
        console.error("❌ Error selecting hotel:", error);
      }
    };

    if (isLoadingHotels) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>
                Searching hotels in {tripData?.destinations?.[0]?.location}...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choose Your Hotels</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Check-in: {bookingDetails.checkIn}</span>
            <span>Check-out: {bookingDetails.checkOut}</span>
            <span>
              {nights} nights, {bookingDetails.travelers} guests
            </span>
            <Badge variant="outline">{realHotels.length} hotels found</Badge>
          </div>
        </div>

        {tripData?.destinations && tripData.destinations.length > 1 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              Hotels for Each Destination
            </h3>
            <p className="text-sm text-blue-700">
              You'll need accommodation in each city. We're showing options for
              your primary destination:
            </p>
            <div className="mt-2 text-sm font-medium">
              {tripData.destinations[0].location}
            </div>
          </div>
        )}

        {realHotels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hotels available
              </h3>
              <p className="text-gray-600 mb-4">
                No hotels found for your destination and dates. Please check
                your travel dates.
              </p>
            </CardContent>
          </Card>
        ) : (
          realHotels.map((hotel) => {
            const isSelected = selectedItems.hotel?.hotelId === hotel.hotelId;
            const isLoadingThis =
              selectedHotelForDetails?.hotelId === hotel.hotelId &&
              isLoadingHotelDetails;

            const hotelName = hotel.hotelName || "Hotel";
            const hotelAddress =
              typeof hotel.address === "string"
                ? hotel.address
                : hotel.address?.line1
                ? `${hotel.address.line1}${
                    hotel.address.cityName ? ", " + hotel.address.cityName : ""
                  }`
                : hotel.city || tripData?.destinations?.[0]?.location || "";

            const grossPrice = hotel.pricing?.total || hotel.pricing?.base || 0;

            const currency = hotel.pricing?.currency || "INR";

            const rating = hotel.reviewScore || 0;
            const reviewCount = hotel.reviewCount || 0;
            const starRating = hotel.starRating || 0;
            const reviewScoreWord = hotel.reviewScoreWord || "";
            const isGeniusDeal = hotel.isGeniusDeal || false;
            const soldOut = hotel.soldOut || false;

            // Check if hotel has strikethrough price (discount)
            const strikethroughPrice =
              hotel.priceBreakdown?.strikethroughPrice?.value;
            const hasDiscount =
              strikethroughPrice && strikethroughPrice > grossPrice;

            // Get facilities (if any)
            const facilities = hotel.facilities?.slice(0, 4) || [];

            return (
              <Card
                key={hotel.hotelId}
                className={`cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-blue-500" : ""
                } ${isLoadingThis ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Hotel Image */}
                    <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {hotel.mainPhoto ? (
                        <img
                          src={hotel.mainPhoto}
                          alt={hotelName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML =
                              '<div class="h-8 w-8 text-gray-400"><svg>...</svg></div>';
                          }}
                        />
                      ) : (
                        <Hotel className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {hotelName}
                            </h3>
                            {isGeniusDeal && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                Genius Deal
                              </Badge>
                            )}
                            {soldOut && (
                              <Badge variant="destructive" className="text-xs">
                                Sold Out
                              </Badge>
                            )}
                          </div>

                          {/* Star Rating */}
                          {starRating > 0 && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center">
                                {[...Array(starRating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                                <span className="ml-1 text-xs text-gray-600">
                                  {starRating} star
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Review Score */}
                          {rating > 0 && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center">
                                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  {rating}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {reviewScoreWord}{" "}
                                  {reviewCount > 0 &&
                                    `(${reviewCount} reviews)`}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Address */}
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {typeof hotel.address === "string"
                                ? hotel.address
                                : hotel.address?.line1 ||
                                  hotel.address?.cityName ||
                                  hotel.city
                                ? `${hotel.address?.line1 || ""} ${
                                    hotel.address?.cityName || hotel.city || ""
                                  }, ${
                                    hotel.address?.countryCode ||
                                    hotel.country ||
                                    ""
                                  }`
                                : tripData?.destinations?.[0]?.location ||
                                  "Location not available"}
                            </span>
                          </div>

                          {/* Distance (if available) */}
                          {hotel.distance && hotel.distance > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {hotel.distance} km from city center
                            </p>
                          )}

                          {/* Check-in/Check-out times */}
                          {(hotel.checkinTime || hotel.checkoutTime) && (
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {hotel.checkinTime && (
                                <span>Check-in: {hotel.checkinTime}</span>
                              )}
                              {hotel.checkoutTime && (
                                <span>Check-out: {hotel.checkoutTime}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price and Selection */}
                        <div className="text-right ml-4">
                          {hasDiscount && (
                            <div className="text-sm text-gray-500 line-through">
                              {currency} {Math.round(strikethroughPrice)}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-green-600">
                            {currency} {Math.round(grossPrice)}
                          </div>
                          <div className="text-xs text-gray-500">per night</div>
                          <div className="text-xs text-gray-500">
                            Total: {currency} {Math.round(grossPrice * nights)}
                          </div>

                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                console.log("=== HOTEL DEBUG ===");
                                console.log("Full hotel object:", hotel);
                                console.log("hotel.hotelId:", hotel.hotelId);
                                console.log("hotel.hotel_id:", hotel.hotel_id);
                                console.log("hotel.id:", hotel.id);
                                console.log("Object keys:", Object.keys(hotel));
                                console.log("==================");

                                setSelectedHotelForOverlay(hotel);
                                setShowHotelOverlay(true);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleHotelSelect(hotel)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                              disabled={isLoadingThis || soldOut}
                            >
                              {isLoadingThis
                                ? "Loading..."
                                : soldOut
                                ? "Unavailable"
                                : isSelected
                                ? "Selected"
                                : "Select"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Facilities */}
                      {facilities.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3 flex-wrap">
                          {facilities.map((facility: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs mb-1"
                            >
                              {facility.name || facility}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  const CabsStep = () => {
    const days = getTripDuration();

    const handleCabSelect = async (cab: any) => {
  try {
    const days = getTripDuration();
    const totalPrice = cab.price * days;

    const payload = {
      tripId,
      vehicleType: cab.vehicle,
      serviceLevel: cab.type,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      price: totalPrice
    };

    const response = await fetch(
      `${BOOKING_API_URL}/api/transportation-bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      setSelectedItems({
        ...selectedItems,
        cab: {
          ...cab,
          totalPrice,
          transportationBookingId: result.data.transportationBookingId
        }
      });

      // 🔥 IMPORTANT - Save parent booking ID
      localStorage.setItem("currentBookingId", result.data.parentBookingId);
    }

  } catch (error) {
    console.error("Cab booking error:", error);
  }
};


    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choose Local Transportation</h2>
          <Badge variant="outline">Daily transportation for {days} days</Badge>
        </div>

        {mockCabs.map((cab) => (
          <Card
            key={cab.id}
            className={`cursor-pointer transition-all ${
              selectedItems.cab?.id === cab.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Car className="h-8 w-8 text-gray-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{cab.type}</h3>
                    <p className="text-sm text-gray-600">{cab.vehicle}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Up to {cab.capacity} passengers
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {cab.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    INR{cab.price}
                  </div>
                  <div className="text-xs text-gray-500">per day</div>
                  <div className="text-xs text-gray-500">
                    Total: INR{cab.price * days}
                  </div>
                  <Button
                    className="mt-2"
                    onClick={() => handleCabSelect(cab)}
                    variant={
                      selectedItems.cab?.id === cab.id ? "default" : "outline"
                    }
                  >
                    {selectedItems.cab?.id === cab.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const PaymentStepFlightDisplay = () => {
    if (!selectedItems.flight) return null;

    const flight = selectedItems.flight as RealFlightOffer;
    const segment = flight.itineraries[0].segments[0];
    const lastSegment =
      flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
    const price = parseFloat(flight.price.total);

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Plane className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">{getAirlineName(segment.carrierCode)}</p>
            <p className="text-sm text-gray-600">
              {segment.departure.iataCode} → {lastSegment.arrival.iataCode}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(segment.departure.at), "MMM dd, HH:mm")} -{" "}
              {format(new Date(lastSegment.arrival.at), "MMM dd, HH:mm")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${price * bookingDetails.travelers}</p>
          <p className="text-xs text-gray-600">
            {bookingDetails.travelers} travelers
          </p>
        </div>
      </div>
    );
  };

  const PaymentStep: React.FC<PaymentStepProps> = ({
    selectedItems,
    tripId,
    userId,
    travelers,
    getTripDuration,
    getTotalAmount,
    onPaymentSuccess,
  }) => {
    const [loading, setLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const { toast } = useToast();

    const [customerDetails, setCustomerDetails] = useState({
      name: user?.fullName || "",
      email: user?.email || "",
      phone: "",
    });

    const nights = getTripDuration() ;
    const days = getTripDuration();

    // Load Razorpay SDK once when component mounts
    useEffect(() => {
      if (!razorpayLoaded) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => {
          if (typeof window.Razorpay !== "undefined") {
            console.log("✅ Razorpay SDK loaded successfully");
            setRazorpayLoaded(true);
          } else {
            console.error("❌ Razorpay SDK failed to load");
            toast({
              title: "Error",
              description: "Failed to load payment gateway",
              variant: "destructive",
            });
          }
        };

        script.onerror = () => {
          console.error("❌ Failed to load Razorpay script");
          toast({
            title: "Error",
            description: "Failed to load payment gateway",
            variant: "destructive",
          });
        };

        document.body.appendChild(script);

        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      }
    }, []);

    // Initiate payment
    const initiatePayment = async (bookingId: string) => {
      try {
        // Get userId - check multiple sources
        const currentUserId = userId || user?.id;

        if (!currentUserId) {
          throw new Error("User ID not found. Please login again.");
        }

        console.log("💳 Initiating payment for booking:", bookingId);
        console.log("👤 Using userId:", currentUserId);
        console.log("🚀 FRONTEND SENDING AMOUNT:", getTotalAmount());

        const response = await fetch(
          `${PAYMENTS_API_URL}/api/payment/initiate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
              bookingId,
              userId: currentUserId, // Use the resolved userId
              amount: getTotalAmount(),
              currency: "INR",
              paymentType: "booking",

              serviceAllocation: [
                ...(selectedItems.flight
                  ? [
                      {
                        serviceType: "flight",
                        serviceId: selectedItems.flight.id,
                        allocatedAmount: parseFloat(
                          selectedItems.flight.price?.total ||
                            selectedItems.flight.price ||
                            0
                        ),
                        currency: "INR",
                      },
                    ]
                  : []),
                ...(selectedItems.hotel
                  ? [
                      {
                        serviceType: "hotel",
                        serviceId:
                          selectedItems.hotel.hotelBookingId ||
                          selectedItems.hotel.hotelId,
                        allocatedAmount: selectedItems.hotel.totalPrice || 0,
                        currency: "INR",
                      },
                    ]
                  : []),
                ...(selectedItems.cab
                  ? [
                      {
                        serviceType: "cab",
                        serviceId: selectedItems.cab.id,
                        allocatedAmount: selectedItems.cab.price * days,
                        currency: "INR",
                      },
                    ]
                  : []),
              ],
            }),
          }
        );

        const data = await response.json();

        console.log("💳 Payment initiation response:", data);

        if (!data.success || !data.payment) {
          throw new Error(data.error || "Payment initiation failed");
        }

        // return data;
        return {
          success: true,
          razorpayOrder: {
            id: data.payment.razorpayOrderId,
            amount: data.payment.amount,
            currency: data.payment.currency,
          },
          key: data.payment.key,
        };
      } catch (error: any) {
        console.error("❌ Payment initiation error:", error);
        throw new Error(error.message || "Failed to initiate payment");
      }
    };

    // Verify payment
    const verifyPayment = async (razorpayResponse: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}, bookingId: string) => {
      try {
        console.log("🔍 Verifying payment:", razorpayResponse);

        const response = await fetch(
          `${PAYMENTS_API_URL}/api/payment/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              bookingId,
            }),
          }
        );

        const data = await response.json();

        console.log("✅ Payment verification response:", data);

        if (!data.success) {
          throw new Error(data.error || "Payment verification failed");
        }

        toast({
          title: "Payment Successful! 🎉",
          description: "Your booking has been confirmed",
        });

        // Call success callback
        onPaymentSuccess(bookingId);
      } catch (error: unknown) {
        console.error("❌ Payment verification error:", error);
        const errMsg = (error as Error).message || "Payment verification failed";
        toast({ title: "Test Failed", description: errMsg, variant: "destructive" });
        setLoading(false);
      }
    };

    // Open Razorpay checkout
    const openRazorpayCheckout = (paymentData: {
  key: string;
  razorpayOrder: { id: string; amount: number; currency: string };
}, bookingId: string) => {
      console.log("🚀 openRazorpayCheckout called");
      console.log("📦 Payment data received:", paymentData);
      console.log("🆔 Booking ID:", bookingId);
      console.log(
        "🔍 Window.Razorpay exists:",
        typeof window.Razorpay !== "undefined"
      );

      if (!window.Razorpay) {
        console.error("❌ Razorpay SDK not loaded on window");
        toast({
          title: "Error",
          description: "Payment gateway not loaded. Please refresh the page.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!paymentData || !paymentData.razorpayOrder) {
        console.error("❌ Invalid payment data:", paymentData);
        toast({
          title: "Error",
          description: "Invalid payment data received",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const options = {
        // key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_LDXAXgeLRFhPHY',
        key: paymentData.key,
        // amount: paymentData.razorpayOrder.amount,
        currency: paymentData.razorpayOrder.currency,
        order_id: paymentData.razorpayOrder.id,
        name: "Travel Booking",
        description: `Booking Payment - ${bookingId.substring(0, 8)}...`,
        image: "/logo.png", // Add your logo
        handler: async (response:  {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
          console.log("✅ Payment handler called:", response);
          await verifyPayment(response, bookingId);
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        notes: {
          bookingId: bookingId,
          tripId: tripId,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            console.log("❌ Payment modal dismissed by user");
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment",
              variant: "destructive",
            });
          },
        },
      };

      // Final verification
      console.log("🔬 Options check:", {
        hasAmount: "amount" in options,
        keys: Object.keys(options),
      });

      console.log("🔧 Razorpay options:", {
        key: options.key.substring(0, 10) + "...",
        // amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        name: options.name,
      });

      try {
        console.log("🎬 Creating Razorpay instance...");
        const razorpay = new window.Razorpay(options);

        console.log("✅ Razorpay instance created:", razorpay);

        razorpay.on("payment.failed", function (response:  {
  error: { description: string };
}) {
          console.error("❌ Payment failed event:", response.error);
          toast({
            title: "Payment Failed",
            description:
              response.error.description || "Payment could not be processed",
            variant: "destructive",
          });
          setLoading(false);
        });

        console.log("🎯 Calling razorpay.open()...");
        razorpay.open();
        console.log("✅ Razorpay.open() called successfully");
      } catch (error: unknown) {
        console.error("❌ Error in openRazorpayCheckout:", error);
        console.error("❌ Error stack:", (error as Error).stack);
        toast({
          title: "Error",
          description: "Failed to open payment gateway: " + (error as Error).message,
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    // Main payment handler
    const handlePayment = async () => {
      console.log("🎯 Payment button clicked");
      console.log("🔍 Current state:", {
        razorpayLoaded,
        loading,
        customerDetails,
        windowRazorpay: typeof window.Razorpay,
      });

      // Validation
      if (
        !customerDetails.name ||
        !customerDetails.email ||
        !customerDetails.phone
      ) {
        console.warn("⚠️ Missing customer details:", customerDetails);
        toast({
          title: "Missing Information",
          description:
            "Please fill in all customer details (Name, Email, and Phone)",
          variant: "destructive",
        });
        return;
      }

      // Trim whitespace
      const trimmedEmail = customerDetails.email.trim();
      const trimmedPhone = customerDetails.phone.trim();

      if (!trimmedEmail || !trimmedPhone) {
        console.warn("⚠️ Empty fields after trim");
        toast({
          title: "Missing Information",
          description: "Please fill in all customer details",
          variant: "destructive",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        console.warn("⚠️ Invalid email:", trimmedEmail);
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      // More lenient phone validation - just check if it has digits
      const phoneDigits = trimmedPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        console.warn("⚠️ Invalid phone:", trimmedPhone);
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (at least 10 digits)",
          variant: "destructive",
        });
        return;
      }

      // Check if Razorpay is actually available
      if (typeof window.Razorpay === "undefined") {
        console.error("❌ Razorpay not available on window object");
        toast({
          title: "Payment Gateway Error",
          description: "Please refresh the page and try again",
          variant: "destructive",
        });
        return;
      }

      if (!razorpayLoaded) {
        console.warn("⚠️ Razorpay state not loaded yet");
        toast({
          title: "Please Wait",
          description: "Payment gateway is loading...",
          variant: "default",
        });
        return;
      }

      console.log("✅ All validations passed, starting payment flow...");
      setLoading(true);

      try {
       
        const bookingId = localStorage.getItem("currentBookingId");

        if (!bookingId) {
          throw new Error("Booking ID not received and no tripId available");
        }

        // Step 2: Initiate payment
        console.log("💳 Step 2: Initiating payment...");
        const paymentData = await initiatePayment(bookingId);
        console.log("✅ Payment initiated:", paymentData);

        if (!paymentData || !paymentData.razorpayOrder) {
          throw new Error("Invalid payment data received");
        }

        // Step 3: Open Razorpay
        console.log("🚀 Step 3: Opening Razorpay checkout...");
        console.log("🔑 Razorpay Order ID:", paymentData.razorpayOrder.id);
        openRazorpayCheckout(paymentData, bookingId);
      } catch (error: any) {
        console.error("❌ Payment flow error:", error);
        console.error("❌ Error stack:", error.stack);
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.flight && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Flight</p>
                      <p className="text-sm text-gray-600">
                        {selectedItems.flight.itineraries?.[0]?.segments?.[0]
                          ?.departure?.iataCode || "DEP"}{" "}
                        →
                        {selectedItems.flight.itineraries?.[0]?.segments?.slice(
                          -1
                        )[0]?.arrival?.iataCode || "ARR"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹
                      {parseFloat(
                        selectedItems.flight.price?.total ||
                          selectedItems.flight.price ||
                          0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {selectedItems.hotel && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Hotel className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {selectedItems.hotel.hotelName || "Hotel"}
                      </p>
                      <p className="text-sm text-gray-600">{nights} nights</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹{selectedItems.hotel.totalPrice || 0}
                    </p>
                    <p className="text-xs text-gray-600">{nights} nights</p>
                  </div>
                </div>
              )}

              {selectedItems.cab && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">
                        {selectedItems.cab.type} Cab
                      </p>
                      <p className="text-sm text-gray-600">{days} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹{selectedItems.cab.price * days}
                    </p>
                    <p className="text-xs text-gray-600">{days} days</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-2xl text-green-600">
                    ₹{getTotalAmount()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 9999999999"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      phone: e.target.value,
                    })
                  }
                  className={!customerDetails.phone ? "border-red-300" : ""}
                  required
                />
                {!customerDetails.phone && (
                  <p className="text-xs text-red-500">
                    Phone number is required
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Enter at least 10 digits
                </p>
              </div>

              {!razorpayLoaded && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading payment gateway...
                  </p>
                </div>
              )}

              {razorpayLoaded && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                   {" 💳 You'll be redirected to a secure Razorpay payment gateway"}
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : !razorpayLoaded ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `Pay ₹${getTotalAmount()}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {'By clicking "Pay", you agree to our terms and conditions'}
              </p>

              {/* Debug Test Button - Remove in production */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    console.log("🧪 Testing Razorpay directly...");
                    if (typeof window.Razorpay === "undefined") {
                      console.error("❌ Razorpay not loaded");
                      toast({
                        title: "Razorpay Not Loaded",
                        description: "SDK is not available",
                        variant: "destructive",
                      });
                      return;
                    }

                    const testOptions = {
                      key: "rzp_test_LDXAXgeLRFhPHY",
                      amount: 100,
                      currency: "INR",
                      name: "Test Payment",
                      description: "Testing Razorpay Integration",
                      handler: function (response:{
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
                        console.log("✅ Test payment success:", response);
                        toast({
                          title: "Test Successful",
                          description: "Razorpay is working correctly",
                        });
                      },
                      prefill: {
                        name: "Test User",
                        email: "test@example.com",
                        contact: "9999999999",
                      },
                      theme: {
                        color: "#16a34a",
                      },
                    };

                    try {
                      const rzp = new window.Razorpay(testOptions);
                      rzp.open();
                      console.log("✅ Test Razorpay opened");
                    } catch (error) {
                      console.error("❌ Test failed:", error);
                      toast({
                        title: "Test Failed",
                        description: String(error),
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  🧪 Test Razorpay (Dev Only)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  const renderStepContent = () => {
    switch (bookingStep) {
      case "confirmation":
        return <BookingConfirmation />;
      case "transportation":
        return <TransportationStep />;
      case "hotels":
        return <HotelsStep />;
      case "cabs":
        return <CabsStep />;
      case "payment":
        return (
          <PaymentStep
            selectedItems={selectedItems}
            tripId={tripId || ""}
            userId={(user?.id || (user as any)?._id)?.toString() || ""}
            travelers={travelers} // We'll fix this below
            getTripDuration={getTripDuration}
            getTotalAmount={getTotalAmount}
            onPaymentSuccess={(bookingId) => {
              toast({
                title: "Payment Successful! 🎉",
                description: "Your booking has been confirmed",
              });
              // Navigate to success page
              // router.push(`/booking/success?bookingId=${bookingId}`);
              setTimeout(() => {
                router.push("/dashboard");
              }, 1500);
            }}
          />
        );
      default:
        return <BookingConfirmation />;
    }
  };

  const canProceed = () => {
    switch (bookingStep) {
      case "confirmation":
        return Object.values(selectedBookings).some(Boolean);
      case "transportation":
        return !selectedBookings.transportation || selectedItems.flight;
      case "hotels":
        return !selectedBookings.hotels || selectedItems.hotel;
      case "cabs":
        return !selectedBookings.cabs || selectedItems.cab;
      default:
        return true;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Trip Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Book Your Trip</h1>
            <p className="text-gray-600">
              Complete your booking for{" "}
              {tripData.itinerary?.destination || tripData.destination}
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {getBookingSteps().map((step, index) => {
                  const StepIcon =
                    stepConfig[step as keyof typeof stepConfig].icon;
                  const isActive = step === bookingStep;
                  const isCompleted = index < getCurrentStepIndex();

                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                        <span className="font-medium">
                          {stepConfig[step as keyof typeof stepConfig].title}
                        </span>
                      </div>
                      {index < getBookingSteps().length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <div className="mb-6">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              {getCurrentStepIndex() === 0 ? "Back to Trip Planner" : "Back"}
            </Button>

            <div className="flex items-center space-x-4">
              {bookingStep !== "payment" && (
                <div className="text-sm text-gray-600">
                  Estimated Total: INR {getTotalAmount()}
                </div>
              )}

              {bookingStep !== "payment" && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {showHotelOverlay && selectedHotelForOverlay && (
        <HotelDetailsOverlay
          isOpen={showHotelOverlay}
          onClose={() => setShowHotelOverlay(false)}
          offerId={selectedHotelForOverlay.offerId}
          checkInDate={bookingDetails.checkIn}
          checkOutDate={bookingDetails.checkOut}
          adults={tripData?.adults || 2}
          children={tripData?.children || 0}
          onSelect={(hotelDetails) => {
            const nights = getTripDuration() - 1;

            // ✅ FIX: Use Amadeus pricing structure
            const basePrice = parseFloat(
              hotelDetails.offer?.price?.base ||
                hotelDetails.offer?.price?.total ||
                "0"
            );
            const totalPrice = parseFloat(
              hotelDetails.offer?.price?.total || "0"
            );
            const currency = hotelDetails.offer?.price?.currency || "USD";

            console.log("📊 Hotel selected from overlay:", {
              hotelName: hotelDetails.hotelInfo?.hotelName,
              basePrice,
              totalPrice,
              currency,
              nights,
            });

            setSelectedItems({
              ...selectedItems,
              hotel: {
                // ✅ Map Amadeus structure to your selected items format
                hotelId: hotelDetails.hotelInfo?.hotelId,
                hotelName: hotelDetails.hotelInfo?.hotelName,
                offerId: hotelDetails.offer?.id,

                // Address info
                address: {
                  street: hotelDetails.hotelInfo?.googleAddress || "",
                  city: hotelDetails.hotelInfo?.address?.state || "",
                  country: hotelDetails.hotelInfo?.address?.country || "",
                },

                // Coordinates
                coordinates: hotelDetails.hotelInfo?.address || {},

                // Rating
                rating: hotelDetails.hotelInfo?.googleRating,
                reviewCount: hotelDetails.hotelInfo?.googleReviewCount,

                // Photos
                photos: hotelDetails.hotelInfo?.photos || [],
                mainPhoto: hotelDetails.hotelInfo?.photos?.[0] || null,

                // Pricing
                pricing: {
                  currency: currency,
                  total: totalPrice,
                  base: basePrice,
                  taxes: hotelDetails.offer?.price?.taxes || [],
                },

                // Room info
                room: {
                  type: hotelDetails.offer?.room?.type,
                  description: hotelDetails.offer?.room?.description?.text,
                  typeEstimated: hotelDetails.offer?.room?.typeEstimated,
                },

                // Policies
                policies: hotelDetails.offer?.policies,

                // Calculated values
                nights,
                totalPrice, // Total for all nights

                // Store full details for later use
                details: hotelDetails,

                // Status
                status: "draft",
              },
            });

            setShowHotelOverlay(false);

            toast({
              title: "Hotel Selected! 🏨",
              description: `${hotelDetails.hotelInfo?.hotelName} has been added to your booking.`,
            });
          }}
          makeAuthenticatedApiRequest={makeAuthenticatedApiRequest}
        />
      )}
    </div>
  );
};

export default TravelBookingFlow;
