"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plane, 
  Train, 
  Hotel, 
  Car, 
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Check,
  ArrowRight,
  Star,
  Wifi,
  Coffee,
  Utensils,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Mock data structures
const mockItinerary = {
  id: '1',
  destination: 'Paris, France',
  days: [
    {
      day: 1,
      date: '2025-07-25',
      city: 'Paris',
      activities: [
        'Visit Eiffel Tower',
        'Louvre Museum',
        'Seine River Cruise'
      ]
    },
    {
      day: 2,
      date: '2025-07-26',
      city: 'Paris',
      activities: [
        'Notre-Dame Cathedral',
        'Champs-Élysées',
        'Arc de Triomphe'
      ]
    }
  ],
  travelers: 2,
  budget: 2000
};

const mockFlights = [
  {
    id: 'f1',
    airline: 'Air France',
    departure: { time: '14:30', airport: 'JFK', city: 'New York' },
    arrival: { time: '06:45+1', airport: 'CDG', city: 'Paris' },
    duration: '7h 15m',
    price: 650,
    stops: 'Nonstop'
  },
  {
    id: 'f2',
    airline: 'Delta Airlines',
    departure: { time: '22:15', airport: 'JFK', city: 'New York' },
    arrival: { time: '12:30+1', airport: 'CDG', city: 'Paris' },
    duration: '8h 15m',
    price: 580,
    stops: '1 Stop'
  }
];

const mockHotels = [
  {
    id: 'h1',
    name: 'Hotel Le Marais',
    rating: 4.5,
    location: 'Le Marais, Paris',
    price: 180,
    amenities: ['Free WiFi', 'Breakfast', 'Air Conditioning'],
    image: '/api/placeholder/300/200'
  },
  {
    id: 'h2',
    name: 'Grand Hotel Opera',
    rating: 4.2,
    location: 'Opera District, Paris',
    price: 220,
    amenities: ['Free WiFi', 'Gym', 'Restaurant'],
    image: '/api/placeholder/300/200'
  }
];

const mockCabs = [
  {
    id: 'c1',
    type: 'Economy',
    vehicle: 'Toyota Camry or similar',
    price: 45,
    capacity: 4,
    features: ['AC', 'GPS Navigation']
  },
  {
    id: 'c2',
    type: 'Premium',
    vehicle: 'Mercedes E-Class or similar',
    price: 75,
    capacity: 4,
    features: ['AC', 'GPS Navigation', 'WiFi', 'Premium Audio']
  }
];

const TravelBookingFlow = () => {
  const [bookingStep, setBookingStep] = useState('confirmation'); // confirmation, transportation, hotels, cabs, payment
  const [selectedBookings, setSelectedBookings] = useState({
    transportation: true,
    hotels: true,
    cabs: true
  });
  const [selectedItems, setSelectedItems] = useState<{
    flight: typeof mockFlights[number] | null;
    hotel: typeof mockHotels[number] | null;
    cab: typeof mockCabs[number] | null;
  }>({
    flight: null,
    hotel: null,
    cab: null
  });
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [bookingDetails, setBookingDetails] = useState({
    travelers: 2,
    checkIn: '2025-07-25',
    checkOut: '2025-07-27',
    rooms: 1
  });

  const stepConfig = {
    confirmation: { title: 'Booking Confirmation', icon: Check },
    transportation: { title: 'Transportation', icon: Plane },
    hotels: { title: 'Hotels', icon: Hotel },
    cabs: { title: 'Local Transport', icon: Car },
    payment: { title: 'Payment', icon: CreditCard }
  };

  const getBookingSteps = () => {
    const steps = ['confirmation'];
    if (selectedBookings.transportation) steps.push('transportation');
    if (selectedBookings.hotels) steps.push('hotels');
    if (selectedBookings.cabs) steps.push('cabs');
    steps.push('payment');
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getBookingSteps();
    return steps.indexOf(bookingStep);
  };

  const getTotalAmount = () => {
    let total = 0;
    if (selectedItems.flight) total += selectedItems.flight.price * bookingDetails.travelers;
    if (selectedItems.hotel) total += selectedItems.hotel.price * 2; // 2 nights
    if (selectedItems.cab) total += selectedItems.cab.price * 2; // per day
    return total;
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
      setBookingStep(steps[currentIndex - 1]);
    }
  };

  const toggleExpanded = (id: unknown) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Step Components
  const BookingConfirmation = () => (
    <Card>
      <CardHeader>
        <CardTitle>What would you like to book?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`cursor-pointer transition-all ${selectedBookings.transportation ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-4">
              <div 
                className="flex items-center space-x-3"
                onClick={() => setSelectedBookings({...selectedBookings, transportation: !selectedBookings.transportation})}
              >
                <Checkbox checked={selectedBookings.transportation} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span className="font-medium">Flights/Trains</span>
                  </div>
                  <p className="text-sm text-gray-600">Book transportation to your destination</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${selectedBookings.hotels ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-4">
              <div 
                className="flex items-center space-x-3"
                onClick={() => setSelectedBookings({...selectedBookings, hotels: !selectedBookings.hotels})}
              >
                <Checkbox checked={selectedBookings.hotels} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Hotel className="h-5 w-5" />
                    <span className="font-medium">Hotels</span>
                  </div>
                  <p className="text-sm text-gray-600">Find accommodation for your stay</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${selectedBookings.cabs ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-4">
              <div 
                className="flex items-center space-x-3"
                onClick={() => setSelectedBookings({...selectedBookings, cabs: !selectedBookings.cabs})}
              >
                <Checkbox checked={selectedBookings.cabs} />
                <div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span className="font-medium">Local Transport</span>
                  </div>
                  <p className="text-sm text-gray-600">Book cabs and local transportation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Your Itinerary Summary</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Destination:</strong> {mockItinerary.destination}</p>
            <p><strong>Duration:</strong> {mockItinerary.days.length} days</p>
            <p><strong>Travelers:</strong> {bookingDetails.travelers} people</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TransportationStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Choose Your Flight</h2>
        <Badge variant="outline">
          {mockFlights.length} options available
        </Badge>
      </div>

      {mockFlights.map((flight) => (
        <Card key={flight.id} className={`cursor-pointer transition-all ${selectedItems.flight?.id === flight.id ? 'ring-2 ring-blue-500' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold">{flight.departure.time}</div>
                  <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                  <div className="text-xs text-gray-500">{flight.departure.city}</div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <div className="text-sm text-gray-600">{flight.duration}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-px bg-gray-300"></div>
                    <Plane className="h-4 w-4 text-gray-400" />
                    <div className="w-12 h-px bg-gray-300"></div>
                  </div>
                  <div className="text-xs text-gray-500">{flight.stops}</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold">{flight.arrival.time}</div>
                  <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                  <div className="text-xs text-gray-500">{flight.arrival.city}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600">{flight.airline}</div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  ${flight.price}
                </div>
                <div className="text-xs text-gray-500">per person</div>
                <Button
                  onClick={() => setSelectedItems({...selectedItems, flight})}
                  variant={selectedItems.flight?.id === flight.id ? "default" : "outline"}
                >
                  {selectedItems.flight?.id === flight.id ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const HotelsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Choose Your Hotel</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Check-in: {bookingDetails.checkIn}</span>
          <span>Check-out: {bookingDetails.checkOut}</span>
          <span>{bookingDetails.rooms} room, {bookingDetails.travelers} guests</span>
        </div>
      </div>

      {mockHotels.map((hotel) => (
        <Card key={hotel.id} className={`cursor-pointer transition-all ${selectedItems.hotel?.id === hotel.id ? 'ring-2 ring-blue-500' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <Hotel className="h-8 w-8 text-gray-400" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{hotel.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{hotel.location}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${hotel.price}
                    </div>
                    <div className="text-xs text-gray-500">per night</div>
                    <Button
                      className="mt-2"
                      onClick={() => setSelectedItems({...selectedItems, hotel})}
                      variant={selectedItems.hotel?.id === hotel.id ? "default" : "outline"}
                    >
                      {selectedItems.hotel?.id === hotel.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  {hotel.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const CabsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Choose Local Transportation</h2>
        <Badge variant="outline">
          Daily transportation for {mockItinerary.days.length} days
        </Badge>
      </div>

      {mockCabs.map((cab) => (
        <Card key={cab.id} className={`cursor-pointer transition-all ${selectedItems.cab?.id === cab.id ? 'ring-2 ring-blue-500' : ''}`}>
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
                    <span className="text-sm text-gray-600">Up to {cab.capacity} passengers</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {cab.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  ${cab.price}
                </div>
                <div className="text-xs text-gray-500">per day</div>
                <Button
                  className="mt-2"
                  onClick={() => setSelectedItems({...selectedItems, cab})}
                  variant={selectedItems.cab?.id === cab.id ? "default" : "outline"}
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

  const PaymentStep = () => (
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
                    <p className="font-medium">{selectedItems.flight.airline}</p>
                    <p className="text-sm text-gray-600">
                      {selectedItems.flight.departure.airport} → {selectedItems.flight.arrival.airport}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${selectedItems.flight.price * bookingDetails.travelers}</p>
                  <p className="text-xs text-gray-600">{bookingDetails.travelers} travelers</p>
                </div>
              </div>
            )}

            {selectedItems.hotel && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hotel className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{selectedItems.hotel.name}</p>
                    <p className="text-sm text-gray-600">2 nights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${selectedItems.hotel.price * 2}</p>
                  <p className="text-xs text-gray-600">2 nights</p>
                </div>
              </div>
            )}

            {selectedItems.cab && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{selectedItems.cab.type} Cab</p>
                    <p className="text-sm text-gray-600">{mockItinerary.days.length} days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${selectedItems.cab.price * mockItinerary.days.length}</p>
                  <p className="text-xs text-gray-600">{mockItinerary.days.length} days</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-2xl text-green-600">${getTotalAmount()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input id="cardName" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" />
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
              Pay ${getTotalAmount()}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (bookingStep) {
      case 'confirmation':
        return <BookingConfirmation />;
      case 'transportation':
        return <TransportationStep />;
      case 'hotels':
        return <HotelsStep />;
      case 'cabs':
        return <CabsStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <BookingConfirmation />;
    }
  };

  const canProceed = () => {
    switch (bookingStep) {
      case 'confirmation':
        return Object.values(selectedBookings).some(Boolean);
      case 'transportation':
        return !selectedBookings.transportation || selectedItems.flight;
      case 'hotels':
        return !selectedBookings.hotels || selectedItems.hotel;
      case 'cabs':
        return !selectedBookings.cabs || selectedItems.cab;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {getBookingSteps().map((step, index) => {
                const StepIcon = stepConfig[step as keyof typeof stepConfig].icon;
                const isActive = step === bookingStep;
                const isCompleted = index < getCurrentStepIndex();
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'bg-blue-100 text-blue-700' : 
                      isCompleted ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <StepIcon className="h-5 w-5" />
                      <span className="font-medium">{stepConfig[step as keyof typeof stepConfig].title}</span>
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
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={getCurrentStepIndex() === 0}
          >
            Back
          </Button>

          <div className="flex items-center space-x-4">
            {bookingStep !== 'payment' && (
              <div className="text-sm text-gray-600">
                Estimated Total: ${getTotalAmount()}
              </div>
            )}
            
            {bookingStep !== 'payment' && (
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
  );
};

export default TravelBookingFlow;