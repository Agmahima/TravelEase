"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, parseISO } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import DriverCard from '@/components/DriverCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { drivers, vehicleTypes, serviceTypes } from '@/lib/mockData';
import { Driver, Trip } from '@/types';
import { Car, CalendarIcon, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Transportation = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [tripStartDate, setTripStartDate] = useState<Date>();
  const [tripEndDate, setTripEndDate] = useState<Date>();
  const [selectedVehicleType, setSelectedVehicleType] = useState("Standard");
  const [selectedServiceLevel, setSelectedServiceLevel] = useState("Standard Service");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get user trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    enabled: !!user,
  });
  
  // Trip selection
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', 'http://localhost:5000/api/transportation-bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['http://localhost:5000/api/transportation-bookings'] });
      setShowConfirmation(true);
    },
    onError: (error) => {
      toast({
        title: "Error creating booking",
        description: error.message || "There was a problem with your booking.",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    document.title = 'Transportation - TravelEase';
    
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
    //   navigate('/login');
    router.push('/login');
    }
    
    // Add Font Awesome script for icons
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
    script.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    document.body.appendChild(script);
    
    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, authLoading, router]);
  
  // If a trip is selected, update the dates
  useEffect(() => {
    if (selectedTripId && trips) {
      const selectedTrip = trips.find((trip: Trip) => trip.id === selectedTripId);
      if (selectedTrip) {
        setTripStartDate(parseISO(selectedTrip.startDate.toString()));
        setTripEndDate(parseISO(selectedTrip.endDate.toString()));
      }
    }
  }, [selectedTripId, trips]);
  
  const filteredDrivers = drivers.filter(driver => {
    if (!driverSearchQuery) return true;
    const query = driverSearchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.languages.some(lang => lang.toLowerCase().includes(query)) ||
      driver.location.toLowerCase().includes(query)
    );
  });
  
  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };
  
  const getServicePrice = () => {
    const serviceType = serviceTypes.find(service => service.name === selectedServiceLevel);
    const pricePerDay = serviceType ? serviceType.price : 49;
    
    if (!tripStartDate || !tripEndDate) return 0;
    
    const days = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return pricePerDay * days;
  };
  
  const handleBookDriver = () => {
    if (!tripStartDate || !tripEndDate) {
      toast({
        title: "Dates required",
        description: "Please select your trip dates.",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      tripId: selectedTripId || -1, // Use -1 as a placeholder if no trip is selected
      driverName: selectedDriver?.name || null,
      vehicleType: selectedVehicleType,
      serviceLevel: selectedServiceLevel,
      startDate: tripStartDate.toISOString(),
      endDate: tripEndDate.toISOString(),
      price: getServicePrice()
    };
    
    createBookingMutation.mutate(bookingData);
  };
  
  const handleGoToDashboard = () => {
    // navigate('/dashboard');
    router.push('/dashboard');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Transportation Services</h1>
            <p className="text-gray-600 mt-2">Book drivers for your entire trip duration or arrange individual transfers</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">Reserve Your Dedicated Driver</h3>
                <p className="text-gray-600 mb-6">Have the same driver throughout your entire trip for a seamless experience.</p>
                
                <div className="space-y-6">
                  {/* Trip Selection */}
                  {trips && trips.length > 0 && (
                    <div>
                      <Label htmlFor="tripSelect">Select an existing trip (optional)</Label>
                      <select
                        id="tripSelect"
                        className="w-full border rounded p-2 mt-1"
                        value={selectedTripId || ""}
                        onChange={(e) => setSelectedTripId(e.target.value ? parseInt(e.target.value) : null)}
                      >
                        <option value="">Create a new booking</option>
                        {trips.map((trip: Trip) => (
                          <option key={trip.id} value={trip.id}>
                            {trip.destination} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Trip Duration</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={!!selectedTripId}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tripStartDate ? format(tripStartDate, "PPP") : <span>Start date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={tripStartDate}
                              onSelect={(date) => {
                                setTripStartDate(date);
                                if (date && (!tripEndDate || date > tripEndDate)) {
                                  setTripEndDate(addDays(date, 3));
                                }
                              }}
                              initialFocus
                              disabled={(date) => date < new Date() || !!selectedTripId}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={!!selectedTripId}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tripEndDate ? format(tripEndDate, "PPP") : <span>End date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={tripEndDate}
                              onSelect={setTripEndDate}
                              initialFocus
                              disabled={(date) => !tripStartDate || date < tripStartDate || !!selectedTripId}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {vehicleTypes.map((vehicle, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-3 cursor-pointer hover:border-primary text-center ${selectedVehicleType === vehicle.type ? 'border-black bg-white bg-opacity-5' : ''}`}
                          onClick={() => setSelectedVehicleType(vehicle.type)}
                        >
                          <i className={`fas fa-${vehicle.icon} text-primary text-2xl mb-2`}></i>
                          <p className="text-sm font-medium">{vehicle.type}</p>
                          <p className="text-xs text-gray-500">{vehicle.capacity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Service Level</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {serviceTypes.map((service, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedServiceLevel === service.name ? 'border-primary bg-white bg-opacity-5' : ''}`}
                          onClick={() => setSelectedServiceLevel(service.name)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < service.rating ? 'text-accent' : 'text-gray-300'}`}></i>
                              ))}
                            </div>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1 mb-2">
                            {service.features.map((feature, i) => (
                              <li key={i} className="flex items-center">
                                <i className="fas fa-check text-primary text-xs mr-2"></i> {feature}
                              </li>
                            ))}
                            {service.missing.map((feature, i) => (
                              <li key={i} className="flex items-center">
                                <i className="fas fa-times text-gray-400 text-xs mr-2"></i> {feature}
                              </li>
                            ))}
                          </ul>
                          <p className="font-medium">${service.price}<span className="text-sm font-normal text-gray-500">/day</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Card className="mt-6 border border-primary border-dashed bg-primary bg-opacity-5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Total Price</h4>
                        <p className="text-sm text-gray-600">
                          {tripStartDate && tripEndDate ? (
                            <>
                              {Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24))} days of service
                            </>
                          ) : (
                            "Select dates to calculate"
                          )}
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        ${getServicePrice()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  className="mt-6 w-full bg-primary text-white py-6 rounded-lg hover:bg-opacity-90 transition font-medium"
                  onClick={handleBookDriver}
                  disabled={!tripStartDate || !tripEndDate || createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Booking...
                    </>
                  ) : (
                    selectedDriver ? `Book ${selectedDriver.name}` : "Book a Driver"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                <div className="h-48 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="Premium transportation" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                  <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-xl font-bold">Driver Profiles</h3>
                    <p className="text-sm">Choose your preferred driver based on ratings and reviews</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <Input
                      type="text"
                      placeholder="Search by name, language, or location"
                      className="w-full border rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary focus:border-primary"
                      value={driverSearchQuery}
                      onChange={(e) => setDriverSearchQuery(e.target.value)}
                    />
                    <Button className="ml-2 bg-primary text-white p-2 rounded-lg">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                    {filteredDrivers.map((driver) => (
                      <DriverCard 
                        key={driver.id} 
                        driver={driver} 
                        onSelect={handleDriverSelect}
                      />
                    ))}
                  </div>
                  
                  <Button variant="outline" className="mt-6 w-full border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition font-medium">
                    View All Drivers
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does the driver service work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Our driver service provides a dedicated driver for your entire trip duration. 
                  You can book a driver in advance, and they'll be available to take you to all 
                  your planned destinations, providing a hassle-free transportation experience.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I book a driver for just one day?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Yes, you can book a driver for as short as one day or for your entire trip duration. 
                  Our flexible booking system allows you to select the exact dates you need transportation services.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's included in the premium service?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Premium service includes an experienced driver, luxury vehicle options, 
                  personalized itinerary planning, guided tours, airport transfers, and 24/7 
                  customer support. It's perfect for travelers seeking a more comprehensive experience.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel or modify my booking?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Yes, you can cancel or modify your booking up to 48 hours before the scheduled 
                  start time without any penalties. For changes made within 48 hours, 
                  a fee may apply depending on the service level selected.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Booking Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Booking Confirmed
              </DialogTitle>
              <DialogDescription>
                Your transportation booking has been successfully confirmed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Service Type:</span>
                      <span className="text-sm">{selectedVehicleType} - {selectedServiceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Dates:</span>
                      <span className="text-sm">
                        {tripStartDate && tripEndDate ? (
                          `${format(tripStartDate, "MMM d")} - ${format(tripEndDate, "MMM d, yyyy")}`
                        ) : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Driver:</span>
                      <span className="text-sm">
                        {selectedDriver ? selectedDriver.name : "To be assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-semibold">${getServicePrice()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button 
                className="w-full bg-primary"
                onClick={handleGoToDashboard}
              >
                View My Bookings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Transportation;
