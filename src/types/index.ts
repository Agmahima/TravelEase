export interface Destination {
    id: number;
    name: string;
    country: string;
    description: string;
    imageUrl: string;
    rating: string;
    pricePerPerson: number;
    badge?: string;
  }
  
  export interface Trip {
    id: number;
    userId: number;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    children?: number;
    itinerary?: any;
    preferences?: any;
    status: string;
  }
  
  export interface TransportationBooking {
    id: number;
    tripId: number;
    userId: number;
    driverName?: string;
    vehicleType: string;
    serviceLevel: string;
    startDate: string;
    endDate: string;
    status: string;
    price: number;
  }
  
  export interface Driver {
    id: number;
    name: string;
    location: string;
    languages: string[];
    rating: number;
    reviewCount: number;
    years: string;
    specialization: string;
    image: string;
  }
  
  export interface VehicleType {
    type: string;
    icon: string;
    capacity: string;
  }
  
  export interface ServiceType {
    name: string;
    rating: number;
    features: string[];
    missing: string[];
    price: number;
  }
  
  export interface Activity {
    time: string;
    title: string;
    description: string;
    location: string;
    cost: string;
    category: "morning" | "lunch" | "afternoon" | "evening";
    booked: boolean;
  }
  
  export interface ItineraryDay {
    day: number;
    date: string;
    activities: Activity[];
  }
  
  export interface Feature {
    icon: string;
    title: string;
    description: string;
  }
  
  export interface Testimonial {
    rating: number;
    text: string;
    name: string;
    trip: string;
    image: string;
  }
  
  export interface SearchParams {
    destination: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
    preferences?: string[];
  }
  