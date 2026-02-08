// Updated PaymentStep Component with Backend Integration
// This shows the COMPLETE flow from frontend to backend

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Car, Plane } from 'lucide-react';
// import { toast } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Declare Razorpay on window
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
  userId: string;
  travelers: any[];
  getTripDuration: () => number;
  getTotalAmount: () => number;
  onPaymentSuccess: (bookingId: string) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  selectedItems,
  tripId,
  userId,
  travelers,
  getTripDuration,
  getTotalAmount,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const nights = getTripDuration() - 1;
  const days = getTripDuration();

  /**
   * STEP 1: Create Booking in Draft Status
   * This calls your Booking Service (Port 5000)
   */
  const createDraftBooking = async () => {
    try {
      // Prepare booking data
      const bookingData = {
        tripId,
        userId,
        travelers: travelers.map(t => ({
          travelerId: t.id,
          isLeadTraveler: t.isLead || false
        })),
        services: {
          flights: selectedItems.flight ? [selectedItems.flight.id] : [],
          hotels: selectedItems.hotel ? [selectedItems.hotel.id] : [],
          cabs: selectedItems.cab ? [selectedItems.cab.id] : [],
          activities: []
        },
        pricing: {
          totalAmount: getTotalAmount(),
          currency: 'USD',
          breakdown: {
            flights: selectedItems.flight?.price || 0,
            hotels: selectedItems.hotel ? selectedItems.hotel.price * nights : 0,
            cabs: selectedItems.cab ? selectedItems.cab.price * days : 0,
            taxes: 0,
            fees: 0,
            discounts: 0
          }
        },
        bookingChannel: 'web',
        specialRequests: ''
      };

      console.log('Creating draft booking...', bookingData);

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if you have authentication
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }

      console.log('Draft booking created:', data.booking._id);
      return data.booking._id;

    } catch (error: any) {
      console.error('Create booking error:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  };

  /**
   * STEP 2: Initiate Payment
   * This calls Payment Service (Port 5001) which then validates with Booking Service
   */
  const initiatePayment = async (bookingId: string) => {
    try {
      console.log('Initiating payment for booking:', bookingId);

      const response = await fetch('http://localhost:5001/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          userId,
          amount: getTotalAmount(),
          currency: 'USD',
          paymentType: 'booking',
          customerDetails: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone
          },
          serviceAllocation: [
            ...(selectedItems.flight ? [{
              serviceType: 'flight',
              serviceId: selectedItems.flight.id,
              allocatedAmount: selectedItems.flight.price,
              currency: 'USD'
            }] : []),
            ...(selectedItems.hotel ? [{
              serviceType: 'hotel',
              serviceId: selectedItems.hotel.id,
              allocatedAmount: selectedItems.hotel.price * nights,
              currency: 'USD'
            }] : []),
            ...(selectedItems.cab ? [{
              serviceType: 'cab',
              serviceId: selectedItems.cab.id,
              allocatedAmount: selectedItems.cab.price * days,
              currency: 'USD'
            }] : [])
          ]
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      console.log('Payment initiated:', data.razorpayOrder.id);
      return data;

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      throw new Error(error.message || 'Failed to initiate payment');
    }
  };

  /**
   * STEP 3: Open Razorpay Checkout
   */
  const openRazorpayCheckout = (paymentData: any, bookingId: string) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx',
      amount: paymentData.razorpayOrder.amount,
      currency: paymentData.razorpayOrder.currency,
      order_id: paymentData.razorpayOrder.id,
      name: 'Your Travel Company',
      description: `Booking Payment - ${paymentData.payment.bookingReference}`,
      image: '/logo.png', // Your logo
      handler: async (response: any) => {
        // Payment successful - verify it
        await verifyPayment(response, bookingId);
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone
      },
      theme: {
        color: '#16a34a' // Green color to match your design
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process',
            variant: 'destructive'
          });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  /**
   * STEP 4: Verify Payment
   * This calls Payment Service which then confirms the booking
   */
  const verifyPayment = async (razorpayResponse: any, bookingId: string) => {
    try {
      console.log('Verifying payment...');

      const response = await fetch('http://localhost:5001/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      console.log('Payment verified successfully!');

      // Show success message
      toast({
        title: 'Payment Successful! 🎉',
        description: 'Your booking has been confirmed',
        variant: 'default'
      });

      // Call parent component's success handler
      onPaymentSuccess(bookingId);

      // Redirect to success page
      // window.location.href = `/booking/success/${bookingId}`;

    } catch (error: any) {
      console.error('Payment verification error:', error);
      
      toast({
        title: 'Payment Verification Failed',
        description: error.message || 'Please contact support',
        variant: 'destructive'
      });

      setLoading(false);
    }
  };

  /**
   * MAIN PAYMENT HANDLER
   * This orchestrates the entire payment flow
   */
  const handlePayment = async () => {
    // Validate customer details
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all customer details',
        variant: 'destructive'
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    // Validate phone
    if (customerDetails.phone.length < 10) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Create draft booking on Port 5000
      const newBookingId = await createDraftBooking();
      setBookingId(newBookingId);

      // STEP 2: Initiate payment on Port 5001 
      // (This will validate booking by calling back to Port 5000)
      const paymentData = await initiatePayment(newBookingId);

      // STEP 3: Open Razorpay
      openRazorpayCheckout(paymentData, newBookingId);

      // STEP 4 happens in the Razorpay handler callback

    } catch (error: any) {
      console.error('Payment flow error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
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
                      {selectedItems.flight.from} → {selectedItems.flight.to}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${selectedItems.flight.price}</p>
                </div>
              </div>
            )}

            {selectedItems.hotel && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hotel className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{selectedItems.hotel.name}</p>
                    <p className="text-sm text-gray-600">{nights} nights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${selectedItems.hotel.price * nights}
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
                    ${selectedItems.cab.price * days}
                  </p>
                  <p className="text-xs text-gray-600">{days} days</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-2xl text-green-600">
                  ${getTotalAmount()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form - Now collecting customer details for Razorpay */}
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
                onChange={(e) => setCustomerDetails({
                  ...customerDetails,
                  name: e.target.value
                })}
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
                onChange={(e) => setCustomerDetails({
                  ...customerDetails,
                  email: e.target.value
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 123-4567"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({
                  ...customerDetails,
                  phone: e.target.value
                })}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💳 You'll be redirected to a secure payment gateway
              </p>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : (
                `Pay $${getTotalAmount()}`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By clicking "Pay", you agree to our terms and conditions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStep;

function useToast(): { toast: any; } {
    throw new Error('Function not implemented.');
}
