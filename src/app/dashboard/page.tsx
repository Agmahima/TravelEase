"use client";
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarIcon,
  MapPinIcon,
  Users,
  PlusCircle,
  Briefcase,
  Car,
  Clock,
  BarChart,
} from 'lucide-react';
import { Trip, TransportationBooking } from '@/types';

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  useEffect(() => {
    document.title = 'My Trips - TravelEase';
    
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
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
  
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['http://localhost:5000/api/trips'],
    queryFn: async () => [], // Replace with actual API call
    initialData: [],
    enabled: !!user,
  });
  
  const { data: transportationBookings = [], isLoading: bookingsLoading } = useQuery<TransportationBooking[]>({
    queryKey: ['http://localhost:5000/api/transportation-bookings'],
    enabled: !!user,
  });
  
  // Separate trips by status
  const upcomingTrips = trips?.filter((trip: Trip) => 
    new Date(trip.startDate) > new Date() || trip.status === 'upcoming'
  );
  
  const pastTrips = trips?.filter((trip: Trip) => 
    new Date(trip.startDate) < new Date() && trip.status !== 'upcoming'
  );
  
  // Loading state
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Skeleton className="h-12 w-1/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/4 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-gray-600 mt-1">Manage your travel plans and bookings</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-primary flex items-center gap-2"
            onClick={() => router.push('/trip-planner')}
          >
            <PlusCircle size={16} />
            Plan New Trip
          </Button>
        </div>
        
        <Tabs defaultValue="upcoming" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
            <TabsTrigger value="past">Past Trips</TabsTrigger>
            <TabsTrigger value="transportation">Transportation</TabsTrigger>
          </TabsList>
          
          {/* Upcoming Trips Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            {tripsLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-xl" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Skeleton className="h-7 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-1/2 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingTrips?.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingTrips.map((trip: Trip) => (
                  <TripCard key={trip.id} trip={trip} router={router} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h3>
                <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
                <Button 
                  className="bg-primary"
                  onClick={() => router.push('/trip-planner')}
                >
                  Plan a Trip
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Past Trips Tab */}
          <TabsContent value="past" className="space-y-6">
            {tripsLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2].map((item) => (
                  <Card key={item} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-xl" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Skeleton className="h-7 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-1/2 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pastTrips?.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pastTrips.map((trip: Trip) => (
                  <TripCard key={trip.id} trip={trip} router={router} isPast />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past trips</h3>
                <p className="text-gray-500">Your completed trips will appear here.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Transportation Tab */}
          <TabsContent value="transportation" className="space-y-6">
            {bookingsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((item) => (
                  <Card key={item}>
                    <CardHeader>
                      <Skeleton className="h-7 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : transportationBookings?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {transportationBookings.map((booking: TransportationBooking) => (
                  <TransportationCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transportation bookings</h3>
                <p className="text-gray-500 mb-6">Book a driver for your next trip!</p>
                <Button 
                  className="bg-primary"
                  onClick={() => router.push('/transportation')}
                >
                  Book Transportation
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

interface TripCardProps {
  trip: Trip;
  router: any;
  isPast?: boolean;
}

const TripCard = ({ trip, router, isPast = false }: TripCardProps) => {
  // Format dates
  const startDate = parseISO(trip.startDate.toString());
  const endDate = parseISO(trip.endDate.toString());
  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');
  
  // Calculate trip duration
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={`https://source.unsplash.com/featured/?${encodeURIComponent(trip.destination)},travel`}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        {!isPast && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-white">Upcoming</Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{trip.destination}</CardTitle>
        <CardDescription className="flex items-center">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {formattedStartDate} - {formattedEndDate} ({duration} {duration === 1 ? 'day' : 'days'})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="mr-1 h-4 w-4" />
          <span>{trip.destination}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-1 h-4 w-4" />
          <span>{trip.adults} {trip.adults === 1 ? 'Adult' : 'Adults'}{trip.children ? ` & ${trip.children} ${trip.children === 1 ? 'Child' : 'Children'}` : ''}</span>
        </div>
        {trip.itinerary && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="mr-2">
              {Object.keys(trip.itinerary).length} Activities
            </Badge>
            <Badge variant="outline">
              {trip.status === 'confirmed' ? 'Booked' : 'Planning'}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/trip-planner?id=${trip.id}`)}
        >
          {isPast ? 'View Details' : 'Modify Trip'}
        </Button>
        {!isPast && (
          <Button 
            className="bg-primary"
            onClick={() => router.push(`/trip-planner?id=${trip.id}`)}
          >
            Continue Planning
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface TransportationCardProps {
  booking: TransportationBooking;
}

const TransportationCard = ({ booking }: TransportationCardProps) => {
  // Format dates
  const startDate = parseISO(booking.startDate.toString());
  const endDate = parseISO(booking.endDate.toString());
  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {booking.vehicleType} - {booking.serviceLevel}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {formattedStartDate} - {formattedEndDate}
            </CardDescription>
          </div>
          <Badge className={`${booking.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {booking.status === 'booked' ? 'Confirmed' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {booking.driverName && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{booking.driverName}</p>
              <p className="text-xs text-gray-500">Driver</p>
            </div>
          </div>
        )}
        <div className="flex items-center text-sm">
          <Car className="mr-2 h-4 w-4 text-gray-500" />
          <span>{booking.vehicleType} vehicle</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="mr-2 h-4 w-4 text-gray-500" />
          <span>{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days of service</span>
        </div>
        <div className="flex items-center font-medium">
          <span>Total: ${booking.price}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" className="mr-2">
          Contact Driver
        </Button>
        <Button className="bg-primary">
          Manage Booking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Dashboard;