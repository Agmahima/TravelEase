"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  MapPinIcon,
  Users,
  PlusCircle,
  Briefcase,
  Car,
  Clock,
  BarChart,
  XCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Trip, TransportationBooking } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better deal",
  "Medical / health reasons",
  "Work or personal emergency",
  "Travel restrictions",
  "Other",
];

// CANCEL BOOKING MODEL
interface CancelBookingModalProps {
  open: boolean;
  booking: { bookingId: string; paymentId?: string; totalPaid?: number; destination: string; dates: string } | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

type ModalStep = "confirm" | "processing" | "done" | "error";

const CancelBookingModel = ({open, booking,onClose, onSuccess}: CancelBookingModalProps) => {
  const [step, setStep] = useState<ModalStep>("confirm");
  const [reason, setReason] = useState("");
   const [customReason, setCustomReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setStep("confirm");
      setReason("");
      setCustomReason("");
      setErrorMsg("");
    }
  }, [open]);

    const effectiveReason = reason === "Other" ? customReason.trim() : reason;

    const handleCancel = async () => {
    if (!effectiveReason || !booking) return;
    setStep("processing");

    try {
      const token = localStorage.getItem("authToken");

      // Step 1 — Cancel the booking
      const cancelRes = await fetch(
        `http://localhost:5000/api/bookings/${booking.bookingId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reason: effectiveReason,
            cancelledAt: new Date().toISOString(),
          }),
        }
      );

      if (!cancelRes.ok) {
        const err = await cancelRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to cancel booking");
      }    

      setStep("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step !== "processing") onClose(); }}>
      <DialogContent className="sm:max-w-md">

        {/* ── Confirm step ── */}
        {step === "confirm" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <DialogTitle>Cancel Booking?</DialogTitle>
              </div>
              <DialogDescription className="text-left space-y-1">
                <span className="block font-medium text-gray-800">{booking.destination}</span>
                <span className="block text-sm text-gray-500">{booking.dates}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Refund badge */}
            {booking.totalPaid && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                Refund eligible: ₹{booking.totalPaid.toLocaleString("en-IN")}
              </div>
            )}

            {/* Reason selector */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Reason for cancellation</p>
              <div className="flex flex-wrap gap-2">
                {CANCELLATION_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all
                      ${reason === r
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {reason === "Other" && (
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
                  placeholder="Please describe your reason…"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Keep Booking
              </Button>
              <Button
                onClick={handleCancel}
                disabled={!effectiveReason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>

            <p className="text-xs text-gray-400 text-center -mt-2">
              Cancellation is irreversible. Refunds take 5–7 business days.
            </p>
          </>
        )}

        {/* ── Processing step ── */}
        {step === "processing" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Loader2 className="h-10 w-10 text-gray-900 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-gray-900">Cancelling your booking…</p>
              <p className="text-sm text-gray-500 mt-1">Initiating refund to original payment method</p>
            </div>
          </div>
        )}

        {/* ── Done step ── */}
        {step === "done" && (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Booking Cancelled</p>
              <p className="text-sm text-gray-500 mt-1">
                {booking.totalPaid
                  ? `Your refund of ₹${booking.totalPaid.toLocaleString("en-IN")} has been initiated.`
                  : "Your booking has been successfully cancelled."}
                <br />
                Expect it within 5–7 business days.
              </p>
            </div>
            <Button
              onClick={() => { onSuccess(booking.bookingId); onClose(); }}
              className="bg-gray-900 hover:bg-gray-800 text-white w-full"
            >
              Done
            </Button>
          </div>
        )}

        {/* ── Error step ── */}
        {step === "error" && (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Something went wrong</p>
              <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
              <Button
                onClick={() => setStep("confirm")}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const token = localStorage.getItem("token");

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  const queryClient = useQueryClient();

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    bookingId: string;
    paymentId?: string;
    totalPaid?: number;
    destination: string;
    dates: string;
  }>({ open: false, bookingId: "", destination: "", dates: "" });

  useEffect(() => {
    document.title = "My Trips - TravelEase";

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login");
    }

    // Add Font Awesome script for icons
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js";
    script.integrity =
      "sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==";
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    document.body.appendChild(script);

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, authLoading, router]);

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      console.log("token: ", token);

      const res = await fetch("http://localhost:5000/api/trips", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ JWT sent here
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch trips");
      }
      return res.json();
    },
    // initialData: [],
    enabled: !!user,
  });

  const { data: transportationBookings = [], isLoading: bookingsLoading } =
    useQuery<TransportationBooking[]>({
      queryKey: ["http://localhost:5000/api/transportation-bookings"],
      enabled: !!user,
    });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return res.json();
    },
    enabled: !!user,
  });

  const paidTripIds = new Set(
    bookings
      .filter((b: any) => b.paymentSummary?.paymentStatus === "paid")
      .map((b: any) => (typeof b.tripId === "object" ? b.tripId._id : b.tripId))
  );
  console.log("Trips:", trips);
  console.log("Bookings:", bookings);

  console.log(
    "Paid bookings:",
    bookings.filter((b: any) => b.paymentSummary?.paymentStatus === "paid")
  );

  console.log("Paid Trip IDs:", [...paidTripIds]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = bookings.filter(
    (booking: any) =>
      booking.status === "confirmed" &&
      booking.paymentSummary?.paymentStatus === "paid" &&
      new Date(booking.tripId?.startDate) >= new Date()
  );

  const pastTrips = bookings.filter(
    (booking: any) =>
      booking.status === "confirmed" &&
      booking.paymentSummary?.paymentStatus === "paid" &&
      new Date(booking.tripId?.startDate) < new Date()
  );

   // Called when modal cancel succeeds — optimistically update the bookings list
  const handleCancelSuccess = (bookingId: string) => {
    queryClient.setQueryData(["bookings"], (old: any[]) =>
      (old ?? []).map((b: any) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
  };

  // Open modal — extract all needed data from the booking object
  const openCancelModal = (booking: any) => {
    const trip = booking.tripId;
    const origin = trip?.destinations?.[0]?.location ?? "–";
    const final = trip?.destinations?.[trip.destinations.length - 1]?.location ?? "–";
    const startFmt = trip?.startDate ? format(parseISO(trip.startDate.toString()), "MMM d, yyyy") : "";
    const endFmt = trip?.endDate ? format(parseISO(trip.endDate.toString()), "MMM d, yyyy") : "";

    setCancelModal({
      open: true,
      bookingId: booking._id,
      paymentId: booking.paymentId, // add this field to your booking population if needed
      totalPaid: booking.pricing?.totalAmount,
      destination: `${origin} → ${final}`,
      dates: `${startFmt} – ${endFmt}`,
    });
  };


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
            <p className="text-gray-600 mt-1">
              Manage your travel plans and bookings
            </p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-primary flex items-center gap-2"
            onClick={() => router.push("/trip-planner")}
          >
            <PlusCircle size={16} />
            Plan New Trip
          </Button>
        </div>

        <Tabs
          defaultValue="upcoming"
          className="space-y-6"
          onValueChange={setActiveTab}
        >
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
                {upcomingTrips.map((booking: any) => (
                  <TripCard
                    key={booking._id}
                    trip={booking.tripId}
                    router={router}
                     onCancelClick={() => openCancelModal(booking)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming trips
                </h3>
                <p className="text-gray-500 mb-6">
                  Start planning your next adventure!
                </p>
                <Button
                  className="bg-primary"
                  onClick={() => router.push("/trip-planner")}
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
                {pastTrips.map((booking: any) => (
                  <TripCard key={booking.id} trip={booking.tripId} router={router} isPast />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No past trips
                </h3>
                <p className="text-gray-500">
                  Your completed trips will appear here.
                </p>
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
                {transportationBookings.map(
                  (booking: TransportationBooking) => (
                    <TransportationCard key={booking.id} booking={booking} />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transportation bookings
                </h3>
                <p className="text-gray-500 mb-6">
                  Book a driver for your next trip!
                </p>
                <Button
                  className="bg-primary"
                  onClick={() => router.push("/transportation")}
                >
                  Book Transportation
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Cancel Modal — single instance mounted at page level */}
      <CancelBookingModel
        open={cancelModal.open}
        booking={cancelModal.open ? cancelModal : null}
        onClose={() => setCancelModal((prev) => ({ ...prev, open: false }))}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};

interface TripCardProps {
  trip: Trip;
  router: any;
  isPast?: boolean;
  onCancelClick?: () => void;
}

const TripCard = ({ trip, router, isPast = false, onCancelClick }: TripCardProps) => {
  // Format dates
  const startDate = parseISO(trip.startDate.toString());
  const endDate = parseISO(trip.endDate.toString());
  const formattedStartDate = format(startDate, "MMM d, yyyy");
  const formattedEndDate = format(endDate, "MMM d, yyyy");
  const mainDestination = trip.destinations[0]?.location;
  const origin = trip.destinations?.[0]?.location;
  const finalDestination =
    trip.destinations?.[trip.destinations.length - 1]?.location;

  // Calculate trip duration
  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img
          src={`https://source.unsplash.com/600x400/?${encodeURIComponent(
            mainDestination
          )}`}
          alt={mainDestination}
          className="w-full h-full object-cover"
        />

        {!isPast && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-white">Upcoming</Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>
          {origin} → {finalDestination}
        </CardTitle>
        <CardDescription className="flex items-center">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {formattedStartDate} - {formattedEndDate} ({duration}{" "}
          {duration === 1 ? "day" : "days"})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="mr-1 h-4 w-4" />
          <span>
            {origin} → {finalDestination}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-1 h-4 w-4" />
          <span>
            {trip.adults} {trip.adults === 1 ? "Adult" : "Adults"}
            {trip.children
              ? ` & ${trip.children} ${
                  trip.children === 1 ? "Child" : "Children"
                }`
              : ""}
          </span>
        </div>
        {trip.itinerary && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="mr-2">
              {Object.keys(trip.itinerary).length} Activities
            </Badge>
            <Badge variant="outline">
              {trip.status === "confirmed" ? "Booked" : "Planning"}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(`/trip-planner?id=${trip.id}`)}
        >
          {isPast ? "View Details" : "Modify Trip"}
        </Button>
        {!isPast && (
          <Button
            variant="destructive"
            onClick={onCancelClick}
            className="bg-primary text-white"
          >
            Cancel Booking
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
  const formattedStartDate = format(startDate, "MMM d, yyyy");
  const formattedEndDate = format(endDate, "MMM d, yyyy");

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
          <Badge
            className={`${
              booking.status === "booked"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {booking.status === "booked" ? "Confirmed" : "Pending"}
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
          <span>
            {Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )}{" "}
            days of service
          </span>
        </div>
        <div className="flex items-center font-medium">
          <span>Total: ${booking.price}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" className="mr-2">
          Contact Driver
        </Button>
        <Button className="bg-primary">Manage Booking</Button>
      </CardFooter>
    </Card>
  );
};

export default Dashboard;
