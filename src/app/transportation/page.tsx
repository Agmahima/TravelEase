"use client";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, parseISO } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import DriverCard from '@/components/DriverCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { drivers, vehicleTypes, serviceTypes } from '@/lib/mockData';
import { Driver, Trip } from '@/types';
import { Car, CalendarIcon, Search, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BOOKING_API_URL, PAYMENTS_API_URL } from '@/lib/config';

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Transportation = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // State
  const [activeTab, setActiveTab] = useState<'trip-based' | 'standalone'>('standalone');
  const [tripStartDate, setTripStartDate] = useState<Date>();
  const [tripEndDate, setTripEndDate] = useState<Date>();
  const [selectedVehicleType, setSelectedVehicleType] = useState("Sedan");
  const [selectedServiceLevel, setSelectedServiceLevel] = useState("Standard Service");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Standalone cab booking state
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [showCabOptions, setShowCabOptions] = useState(false);
  const [selectedCab, setSelectedCab] = useState<any>(null);
  
  // Payment state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Get user trips
  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    enabled: !!user,
  });
  
  // Trip selection
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway',
        variant: 'destructive'
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
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

  const getDays = () => {
    if (!tripStartDate || !tripEndDate) return 0;
    return Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper function to get trip display name
  const getTripDisplayName = (trip: Trip) => {
  if (trip.destinations && trip.destinations.length > 0) return trip.destinations[0].location;
  return 'Trip';
};
  
  const handleProceedToPayment = () => {
    // Validate dates
    if (!tripStartDate || !tripEndDate) {
      toast({
        title: "Dates required",
        description: "Please select your trip dates.",
        variant: "destructive",
      });
      return;
    }

    // Validate based on booking type
    if (activeTab === 'standalone') {
      if (!pickupLocation || !dropLocation || !selectedCab) {
        toast({
          title: "Cab details missing",
          description: "Please enter pickup/drop locations and select a cab.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!selectedVehicleType) {
        toast({
          title: "Vehicle type required",
          description: "Please select a vehicle type.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Pre-fill customer details from user if available
    if (user) {
      setCustomerDetails({
        name: user.fullName || '',
        email: user.email || '',
        phone:  ''
      });
    }
    
    // Show payment dialog
    setShowPaymentDialog(true);
  };

  // Create transportation booking in database
  const createTransportationBooking = async () => {
    try {
      console.log('📝 Creating transportation booking...');
      
      const bookingData = {
        bookingType: activeTab,
        tripId: activeTab === 'trip-based' ? selectedTripId : null,
        pickupLocation: activeTab === 'standalone' ? pickupLocation : undefined,
        dropLocation: activeTab === 'standalone' ? dropLocation : undefined,
        vehicleType: activeTab === 'trip-based' ? selectedVehicleType : selectedCab.type,
        serviceLevel: selectedServiceLevel,
        driverName: selectedDriver?.name || null,
        startDate: tripStartDate?.toISOString(),
        endDate: tripEndDate?.toISOString(),
        price: getServicePrice(),
        status: 'pending',
        paymentStatus: 'pending'
      };
      const response = await fetch(`${BOOKING_API_URL}/api/transportation-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      console.log('✅ Booking created:', result);
      
      return result.booking._id || result.booking.id;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw error;
    }
  };

  // Initiate payment with Razorpay
  const initiatePayment = async (bookingId: string) => {
    try {
      console.log('💳 Initiating payment for booking:', bookingId);

      const response = await fetch(`${PAYMENTS_API_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          bookingId,
          amount: getServicePrice(),
          currency: 'INR',
          paymentType: 'transportation'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      console.log('✅ Payment initiated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      throw error;
    }
  };

  // Open Razorpay checkout
  const openRazorpayCheckout = (paymentData: any, bookingId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_LDXAXgeLRFhPHY',
      amount: paymentData.razorpayOrder.amount,
      currency: paymentData.razorpayOrder.currency,
      name: 'TravelEase',
      description: `Transportation Booking - ${activeTab === 'standalone' ? selectedCab.type : selectedVehicleType}`,
      order_id: paymentData.razorpayOrder.id,
      handler: async function (response: any) {
        console.log('✅ Payment successful:', response);
        await verifyPayment(response, bookingId);
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: function () {
          console.log('⚠️ Payment cancelled');
          setLoading(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.',
            variant: 'destructive'
          });
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
      console.log('✅ Razorpay checkout opened');
    } catch (error) {
      console.error('❌ Error opening Razorpay:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to open payment gateway',
        variant: 'destructive'
      });
    }
  };

  // Verify payment
  const verifyPayment = async (razorpayResponse: any, bookingId: string) => {
    try {
      console.log('🔍 Verifying payment...');
      
      const response = await fetch(`${PAYMENTS_API_URL}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          bookingId,
          paymentType: 'transportation'
        }),
      });

      const data = await response.json();
      console.log('✅ Payment verified:', data);

      if (data.success) {
        setBookingSuccess(true);
        setShowPaymentDialog(false);
        toast({
          title: 'Payment Successful!',
          description: 'Your transportation booking has been confirmed.',
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Payment verification failed. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle payment button click
  const handlePayment = async () => {
    console.log('🎯 Payment button clicked');

    // Validation
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all customer details',
        variant: 'destructive'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email.trim())) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    const phoneDigits = customerDetails.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number (at least 10 digits)',
        variant: 'destructive'
      });
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      toast({
        title: 'Payment Gateway Error',
        description: 'Please refresh the page and try again',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ All validations passed, starting payment flow...');
    setLoading(true);

    try {
      // Step 1: Create booking
      console.log('📝 Step 1: Creating booking...');
      const newBookingId = await createTransportationBooking();
      setBookingId(newBookingId);
      console.log('✅ Booking created:', newBookingId);

      // Step 2: Initiate payment
      console.log('💳 Step 2: Initiating payment...');
      const paymentData = await initiatePayment(newBookingId);
      console.log('✅ Payment initiated:', paymentData);

      // Step 3: Open Razorpay
      console.log('🚀 Step 3: Opening Razorpay checkout...');
      openRazorpayCheckout(paymentData, newBookingId);
    } catch (error: any) {
      console.error('❌ Payment flow error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Success screen
  if (bookingSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booking Type:</span>
                  <span className="text-sm font-medium capitalize">{activeTab}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle:</span>
                  <span className="text-sm font-medium">
                    {activeTab === 'standalone' ? selectedCab?.type : selectedVehicleType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service:</span>
                  <span className="text-sm font-medium">{selectedServiceLevel}</span>
                </div>
                {activeTab === 'standalone' && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Route:</span>
                    <span className="text-sm font-medium">{pickupLocation} → {dropLocation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">{getDays()} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Paid:</span>
                  <span className="font-bold text-lg text-green-600">₹{getServicePrice()}</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                Redirecting to dashboard...
              </p>
              
              <Button
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard Now
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Transportation Services</h1>
            <p className="text-gray-600 mt-2">Book drivers for your entire trip or arrange standalone cab rides</p>
          </div>

          {/* Tabs for booking type selection */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'trip-based' | 'standalone')} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="trip-based">Trip-Based Booking</TabsTrigger>
              <TabsTrigger value="standalone">Standalone Cab</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {activeTab === 'trip-based' ? 'Reserve Your Dedicated Driver' : 'Book a Cab Ride'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'trip-based' 
                    ? 'Have the same driver throughout your entire trip for a seamless experience.' 
                    : 'Book a one-way or round trip cab service for your journey.'}
                </p>
                
                <div className="space-y-6">
                  {/* Trip-Based Booking Content */}
                  {activeTab === 'trip-based' && (
                    <>
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
                                {getTripDisplayName(trip)} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Vehicle Type Selection */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {vehicleTypes.map((vehicle, index) => (
                            <div 
                              key={index} 
                              className={`border rounded-lg p-3 cursor-pointer hover:border-primary text-center transition ${selectedVehicleType === vehicle.type ? 'border-black bg-gray-50' : ''}`}
                              onClick={() => setSelectedVehicleType(vehicle.type)}
                            >
                              <Car className="mx-auto text-primary mb-2 h-6 w-6" />
                              <p className="text-sm font-medium">{vehicle.type}</p>
                              <p className="text-xs text-gray-500">{vehicle.capacity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Standalone Booking Content */}
                  {activeTab === 'standalone' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pickup Location
                        </Label>
                        <Input
                          placeholder="Enter pickup city or address"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Drop Location
                        </Label>
                        <Input
                          placeholder="Enter drop city or address"
                          value={dropLocation}
                          onChange={(e) => setDropLocation(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {/* Search Cab Button */}
                      <Button
                        className="w-full bg-black text-white"
                        onClick={() => setShowCabOptions(true)}
                        disabled={!pickupLocation || !dropLocation}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search Available Cabs
                      </Button>

                      {/* Selected Cab Display */}
                      {selectedCab && (
                        <Card className="border-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Car className="h-6 w-6 text-primary" />
                                <div>
                                  <h4 className="font-semibold">{selectedCab.type}</h4>
                                  <p className="text-sm text-gray-500">Capacity: {selectedCab.capacity}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCabOptions(true)}
                              >
                                Change
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                
                  {/* Common fields for both booking types */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Trip Duration</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={activeTab === 'trip-based' && !!selectedTripId}
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
                              disabled={(date) => date < new Date() || (activeTab === 'trip-based' && !!selectedTripId)}
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
                              disabled={activeTab === 'trip-based' && !!selectedTripId}
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
                              disabled={(date) => !tripStartDate || date < tripStartDate || (activeTab === 'trip-based' && !!selectedTripId)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Service Level</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {serviceTypes.map((service, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition ${selectedServiceLevel === service.name ? 'border-primary bg-gray-50' : ''}`}
                          onClick={() => setSelectedServiceLevel(service.name)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < service.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <p className="font-medium">₹{service.price}<span className="text-sm font-normal text-gray-500">/day</span></p>
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
                              {getDays()} days of service
                            </>
                          ) : (
                            "Select dates to calculate"
                          )}
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        ₹{getServicePrice()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  className="mt-6 w-full bg-primary text-white py-6 rounded-lg hover:bg-opacity-90 transition font-medium"
                  onClick={handleProceedToPayment}
                  disabled={!tripStartDate || !tripEndDate}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
            
            {/* Driver Profiles Section */}
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
                      className="w-full"
                      value={driverSearchQuery}
                      onChange={(e) => setDriverSearchQuery(e.target.value)}
                    />
                    <Button className="ml-2 bg-primary text-white p-2 rounded-lg">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredDrivers.map((driver) => (
                      <DriverCard 
                        key={driver.id} 
                        driver={driver} 
                        onSelect={handleDriverSelect}
                        isSelected={selectedDriver?.id === driver.id}
                      />
                    ))}
                  </div>
                  
                  <Button variant="outline" className="mt-6 w-full border border-primary text-primary">
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
                  <CardTitle className="text-lg">Can I book a cab for just one ride?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Yes! Use our "Standalone Cab" tab to book individual rides between any two locations. 
                  Perfect for airport transfers, day trips, or any one-time transportation needs.</p>
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

        {/* Cab Options Popup */}
        <Dialog open={showCabOptions} onOpenChange={setShowCabOptions}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select a Cab</DialogTitle>
              <DialogDescription>
                Available rides from {pickupLocation} → {dropLocation}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {vehicleTypes.map((cab, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer hover:border-black transition ${
                    selectedCab?.type === cab.type
                      ? "border-black bg-gray-100"
                      : ""
                  }`}
                  onClick={() => setSelectedCab(cab)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{cab.type}</h3>
                      <p className="text-sm text-gray-500">
                        Capacity: {cab.capacity}
                      </p>
                    </div>
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button
                className="w-full bg-black text-white"
                disabled={!selectedCab}
                onClick={() => {
                  setShowCabOptions(false);
                  toast({
                    title: "Cab Selected",
                    description: `${selectedCab.type} selected successfully.`,
                  });
                }}
              >
                Confirm Cab Selection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Payment</DialogTitle>
              <DialogDescription>
                Enter your details to proceed with the booking
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Booking Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <span className="text-sm font-medium">
                      {activeTab === 'standalone' ? selectedCab?.type : selectedVehicleType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service:</span>
                    <span className="text-sm font-medium">{selectedServiceLevel}</span>
                  </div>
                  {activeTab === 'standalone' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Route:</span>
                      <span className="text-sm font-medium">{pickupLocation} → {dropLocation}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium">{getDays()} days</span>
                  </div>
                  {selectedDriver && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Driver:</span>
                      <span className="text-sm font-medium">{selectedDriver.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-green-600">₹{getServicePrice()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="payment-name">Full Name *</Label>
                  <Input
                    id="payment-name"
                    placeholder="John Doe"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="payment-email">Email Address *</Label>
                  <Input
                    id="payment-email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="payment-phone">Phone Number *</Label>
                  <Input
                    id="payment-phone"
                    placeholder="+91 9999999999"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  />
                </div>
              </div>

              {!razorpayLoaded && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading payment gateway...
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${getServicePrice()}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Transportation;