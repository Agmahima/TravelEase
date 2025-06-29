"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Removed Separator import as it is not found
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plane, 
  ArrowLeftRight, 
  Clock, 
  Calendar,
  Users,
  Filter,
  SortAsc,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wifi,
  Coffee,
  Utensils,
  ArrowLeft
} from 'lucide-react';

interface FlightOffer {
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

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
}

const FlightBookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Get search parameters
  const fromDestination = searchParams.get('from') || '';
  const toDestination = searchParams.get('to') || '';
  const departureDate = searchParams.get('departureDate') || format(new Date(), 'yyyy-MM-dd');
  const returnDate = searchParams.get('returnDate') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const tripType = searchParams.get('tripType') || 'one-way';
  
  // State
  const [searchForm, setSearchForm] = useState({
    from: fromDestination,
    to: toDestination,
    departureDate,
    returnDate,
    adults,
    children,
    tripType
  });
  
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    airlines: [] as string[],
    stops: 'any', // 'any', 'nonstop', '1stop', '2+stops'
    departureTime: 'any', // 'early', 'morning', 'afternoon', 'evening'
    duration: 'any'
  });
  
  const [sortBy, setSortBy] = useState('price'); // 'price', 'duration', 'departure'
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());
  
  // Search flights query
  const { data: flightOffers, isLoading: isSearching, refetch: searchFlights } = useQuery<FlightOffer[]>({
    queryKey: ['flights', searchForm],
    queryFn: async () => {
      const params = new URLSearchParams({
        originCode: searchForm.from,
        destinationCode: searchForm.to,
        dateOfDeparture: searchForm.departureDate,
        adults: searchForm.adults.toString(),
        ...(searchForm.children > 0 && { children: searchForm.children.toString() }),
        ...(searchForm.tripType === 'round-trip' && searchForm.returnDate && { returnDate: searchForm.returnDate }),
        currencyCode: 'USD',
        max: '50'
      });
      
      const response = await apiRequest('GET', `http://localhost:5000/api/flights/flight-search?${params}`);
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!(searchForm.from && searchForm.to && searchForm.departureDate)
  });
  
  // Airport search for autocomplete
  const searchAirports = async (query: string): Promise<Airport[]> => {
    if (query.length < 2) return [];
    
    try {
      const response = await apiRequest('GET', `http://localhost:5000/api/flights/city-and-airport-search?keyword=${query}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching airports:', error);
      return [];
    }
  };
  
  // Book flight mutation
  const bookFlightMutation = useMutation({
    mutationFn: async (flightOffer: FlightOffer) => {
      const response = await apiRequest('POST', 'http://localhost:5000/api/flights/flight-booking', {
        flightOffer,
        travelers: [
          {
            id: '1',
            dateOfBirth: '1990-01-01',
            name: {
              firstName: 'John',
              lastName: 'Doe'
            },
            gender: 'MALE',
            contact: {
              emailAddress: 'john.doe@example.com',
              phones: [{
                deviceType: 'MOBILE',
                countryCallingCode: '1',
                number: '1234567890'
              }]
            }
          }
        ]
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Flight booked successfully!",
        description: "Your flight has been booked. Check your email for confirmation.",
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "There was an error booking your flight.",
        variant: "destructive",
      });
    }
  });
  
  const handleSearch = () => {
    if (!searchForm.from || !searchForm.to || !searchForm.departureDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    searchFlights();
  };
  
  const handleBookFlight = (flight: FlightOffer) => {
    setSelectedFlight(flight);
    bookFlightMutation.mutate(flight);
  };
  
  const toggleFlightDetails = (flightId: string) => {
    const newExpanded = new Set(expandedFlights);
    if (newExpanded.has(flightId)) {
      newExpanded.delete(flightId);
    } else {
      newExpanded.add(flightId);
    }
    setExpandedFlights(newExpanded);
  };
  
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? match[1].replace('H', 'h ') : '';
    const minutes = match[2] ? match[2].replace('M', 'm') : '';
    return `${hours}${minutes}`;
  };
  
  const getStopsText = (segments: any[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Nonstop';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };
  
  const getAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
      'AA': 'American Airlines',
      'DL': 'Delta Air Lines',
      'UA': 'United Airlines',
      'SW': 'Southwest Airlines',
      'AS': 'Alaska Airlines',
      'B6': 'JetBlue Airways',
      'NK': 'Spirit Airlines',
      'F9': 'Frontier Airlines',
      'G4': 'Allegiant Air',
      'SY': 'Sun Country Airlines'
    };
    return airlines[code] || code;
  };
  
  // Filter and sort flights
  const filteredAndSortedFlights = flightOffers
    ?.filter(flight => {
      const price = parseFloat(flight.price.total);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      
      if (filters.airlines.length > 0) {
        const hasAirline = flight.itineraries[0].segments.some(segment => 
          filters.airlines.includes(segment.carrierCode)
        );
        if (!hasAirline) return false;
      }
      
      if (filters.stops !== 'any') {
        const stops = flight.itineraries[0].segments.length - 1;
        if (filters.stops === 'nonstop' && stops !== 0) return false;
        if (filters.stops === '1stop' && stops !== 1) return false;
        if (filters.stops === '2+stops' && stops < 2) return false;
      }
      
      return true;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price.total) - parseFloat(b.price.total);
        case 'duration':
          return a.itineraries[0].duration.localeCompare(b.itineraries[0].duration);
        case 'departure':
          return new Date(a.itineraries[0].segments[0].departure.at).getTime() - 
                 new Date(b.itineraries[0].segments[0].departure.at).getTime();
        default:
          return 0;
      }
    });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Book Flights</h1>
            </div>
            <div className="text-sm text-gray-600">
              {fromDestination} → {toDestination}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Form */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                <div>
                  <Label>From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Origin city"
                      className="pl-10"
                      value={searchForm.from}
                      onChange={(e) => setSearchForm({...searchForm, from: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Destination city"
                      className="pl-10"
                      value={searchForm.to}
                      onChange={(e) => setSearchForm({...searchForm, to: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Departure</Label>
                  <Input
                    type="date"
                    value={searchForm.departureDate}
                    onChange={(e) => setSearchForm({...searchForm, departureDate: e.target.value})}
                  />
                </div>
                
                {searchForm.tripType === 'round-trip' && (
                  <div>
                    <Label>Return</Label>
                    <Input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value})}
                    />
                  </div>
                )}
                
                <div>
                  <Label>Travelers</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      value={searchForm.adults}
                      onChange={(e) => setSearchForm({...searchForm, adults: parseInt(e.target.value)})}
                      className="w-16"
                    />
                    <span className="text-sm text-gray-500">Adults</span>
                  </div>
                </div>
                
                <Button onClick={handleSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700">
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Plane className="mr-2 h-4 w-4" />
                      Search Flights
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              {showFilters && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>Stops</Label>
                    <div className="space-y-2 mt-2">
                      {['any', 'nonstop', '1stop', '2+stops'].map(stop => (
                        <label key={stop} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="stops"
                            value={stop}
                            checked={filters.stops === stop}
                            onChange={(e) => setFilters({...filters, stops: e.target.value})}
                          />
                          <span className="text-sm capitalize">{stop.replace('+', '+ ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Removed Separator */}
                  
                  <div>
                    <Label>Sort by</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        { value: 'price', label: 'Price' },
                        { value: 'duration', label: 'Duration' },
                        { value: 'departure', label: 'Departure Time' }
                      ].map(sort => (
                        <label key={sort.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="sort"
                            value={sort.value}
                            checked={sortBy === sort.value}
                            onChange={(e) => setSortBy(e.target.value)}
                          />
                          <span className="text-sm">{sort.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
          
          {/* Flight Results */}
          <div className="flex-1 space-y-4">
            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedFlights && filteredAndSortedFlights.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {filteredAndSortedFlights.length} flights found
                  </h2>
                  <div className="flex items-center space-x-2">
                    <SortAsc className="h-4 w-4" />
                    <span className="text-sm text-gray-600">Sorted by {sortBy}</span>
                  </div>
                </div>
                
                {filteredAndSortedFlights.map((flight) => {
                  const segment = flight.itineraries[0].segments[0];
                  const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
                  const isExpanded = expandedFlights.has(flight.id);
                  
                  return (
                    <Card key={flight.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {format(new Date(segment.departure.at), 'HH:mm')}
                              </div>
                              <div className="text-sm text-gray-600">{segment.departure.iataCode}</div>
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
                                {format(new Date(lastSegment.arrival.at), 'HH:mm')}
                              </div>
                              <div className="text-sm text-gray-600">{lastSegment.arrival.iataCode}</div>
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
                              ${flight.price.total}
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleFlightDetails(flight.id)}
                              >
                                Details
                                {isExpanded ? (
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                ) : (
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleBookFlight(flight)}
                                disabled={bookFlightMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {bookFlightMutation.isPending && selectedFlight?.id === flight.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Booking...
                                  </>
                                ) : (
                                  'Book Now'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-6 pt-6 border-t">
                            <div className="space-y-4">
                              <h4 className="font-semibold">Flight Details</h4>
                              {flight.itineraries[0].segments.map((seg, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <div className="font-medium">
                                        {format(new Date(seg.departure.at), 'HH:mm')} - {format(new Date(seg.arrival.at), 'HH:mm')}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {seg.departure.iataCode} → {seg.arrival.iataCode}
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      <div>{getAirlineName(seg.carrierCode)} {seg.number}</div>
                                      <div className="text-gray-600">{formatDuration(seg.duration)}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-gray-400">
                                    <Wifi className="h-4 w-4" />
                                    <Coffee className="h-4 w-4" />
                                    <Utensils className="h-4 w-4" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No flights found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or dates to find more options.
                  </p>
                  <Button onClick={handleSearch} variant="outline">
                    Search Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingPage;