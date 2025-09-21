import React, { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Utensils, 
  Dumbbell, 
  Users, 
  Calendar, 
  Clock, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Phone,
  Mail,
  Globe,
  Bed,
  Bath,
  Snowflake,
  Coffee,
  Shield,
  Camera
} from "lucide-react";

// TypeScript interfaces
interface HotelPhoto {
  photo_id: number;
  url_max750: string;
  url_square180: string;
  url_max300: string;
  url_original: string;
  url_max1280?: string;
  url_square60?: string;
  url_640x200?: string;
  last_update_date?: string;
  ratio?: number;
}

interface RoomHighlight {
  id?: number;
  translated_name: string;
  icon?: string;
}

interface BedType {
  name_with_count: string;
  count: number;
  name: string;
  bed_type: number;
  description: string;
  description_imperial: string;
  description_localized: string | null;
}

interface BedConfiguration {
  bed_types: BedType[];
}

interface Room {
  roomId: string;
  roomName: string;
  roomType: string;
  bedConfiguration: BedConfiguration[];
  facilities: string[];
  photos: HotelPhoto[];
  maxOccupancy: number;
  roomSize: number;
  mealPlan: string;
  blockId: string;
  pricing: {
    basePrice: number;
    currency: string;
  };
  policies: any;
  availability: {
    available: boolean;
    roomCount: number;
  };
  highlights: RoomHighlight[];
  privateBathroomCount: number;
  refundable: boolean;
  breakfastIncluded: number;
  roomSurface: {
    squareMeters: number;
    squareFeet: number;
  };
}

interface Facility {
  name: string;
  icon?: string;
}

interface PropertyHighlight {
  name: string;
  icons: Array<{ icon: string; size: number }>;
}

interface PriceBreakdown {
  gross_amount_hotel_currency: {
    amount_rounded: string;
    value: number;
    currency: string;
  };
  gross_amount_per_night: {
    amount_rounded: string;
    value: number;
    currency: string;
  };
  excluded_amount: {
    amount_rounded: string;
    value: number;
    currency: string;
  };
  all_inclusive_amount: {
    amount_rounded: string;
    value: number;
    currency: string;
  };
}

interface HotelInfo {
  hotelId: string;
  hotelName: string;
  hotelNameTranslated: string;
  url: string;
  address: {
    street: string;
    city: string;
    cityTranslated: string;
    district: string;
    country: string;
    countryCode: string;
    zipCode: string;
    addressTranslated: string;
    latitude: number;
    longitude: number;
    distanceToCenter: number;
  };
  starRating: number;
  propertyType: string;
  reviewScore: number;
  reviewCount: number;
  reviewScoreWord: string;
  timezone: string;
  defaultLanguage: string;
}

interface Pricing {
  productPriceBreakdown: PriceBreakdown;
  compositePriceBreakdown: PriceBreakdown;
  currencyCode: string;
  priceTransparencyMode: string;
}

interface Facilities {
  propertyHighlights: PropertyHighlight[];
  facilitiesBlock: Facility[];
  topBenefits: Facility[];
  familyFacilities: string[];
}

interface Availability {
  availableRooms: number;
  maxRoomsInReservation: number;
  soldOut: boolean;
  isClosed: boolean;
  isGeniusDeal: boolean;
  hotelIncludesBreakfast: boolean;
  isFamilyFriendly: boolean;
}

interface HotelDetails {
  hotelInfo: HotelInfo;
  pricing: Pricing;
  facilities: Facilities;
  rooms: Room[];
  policies: any;
  breakfastInfo: {
    reviewScore: number;
    reviewCount: number;
    reviewScoreWord: string;
    rating: number;
  };
  wifiInfo: {
    rating: number;
  };
  importantInfo: string[];
  languages: {
    spoken: string[];
    languageCode: string[];
  };
  availability: Availability;
  lastReservation: {
    time: string;
    country: string | null;
    countrycode: string | null;
  };
  aggregatedData: any;
}

interface HotelDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string | number;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  onSelect: (hotelDetails: HotelDetails) => void;
  makeAuthenticatedApiRequest: (
    method: string,
    url: string,
    data?: any
  ) => Promise<any>;
}

const HotelDetailsOverlay: React.FC<HotelDetailsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  hotelId, 
  checkInDate, 
  checkOutDate, 
  adults, 
  children = 0,
  onSelect,
  makeAuthenticatedApiRequest 
}) => {
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("=== HotelDetailsOverlay useEffect ===");
    console.log("isOpen:", isOpen);
    console.log("hotelId:", hotelId);
    console.log("hotelId type:", typeof hotelId);
    console.log("hotelId truthy:", !!hotelId);
    console.log("=====================================");
    
    if (isOpen && hotelId) {
      fetchHotelDetails();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, hotelId, checkInDate, checkOutDate, adults, children]);

  const fetchHotelDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    // Enhanced debug logging
    console.log("🏨 Fetching hotel details for:", {
      hotelId,
      hotelIdType: typeof hotelId,
      hotelIdString: String(hotelId),
      checkInDate,
      checkOutDate,
      adults,
      children
    });

    try {
      // Enhanced validation with better error messages
      if (!hotelId || hotelId === undefined || hotelId === null || hotelId === '' || hotelId === 'undefined') {
        console.error("❌ Hotel ID validation failed:", { 
          hotelId, 
          type: typeof hotelId, 
          stringified: String(hotelId) 
        });
        throw new Error(`Hotel ID is required. Received: "${hotelId}" (${typeof hotelId})`);
      }
      
      if (!checkInDate || !checkOutDate) {
        throw new Error("Check-in and check-out dates are required");
      }

      // Convert hotelId to string to ensure it's properly formatted
      const hotelIdString = String(hotelId);
      console.log("🆔 Using hotel ID:", hotelIdString);

      const params = new URLSearchParams({
        hotel_id: hotelIdString, // Add hotel_id as query parameter
        arrival_date: checkInDate,
        departure_date: checkOutDate,
        adults: adults.toString(),
        room_qty: '1',
        units: 'metric',
        temperature_unit: 'c',
        languagecode: 'en-us',
        currency_code: 'EUR'
      });

      if (children && children > 0) {
        params.append("children_age", "1,17");
      }

      // Updated API path to match your backend route structure
      const apiUrl = `/${hotelIdString}/details?${params.toString()}`;
      console.log("🌐 Full API URL:", `http://localhost:5000${apiUrl}`);
      console.log("📋 Request params:", Object.fromEntries(params.entries()));

      const response = await makeAuthenticatedApiRequest("GET", apiUrl);

      console.log("✅ Hotel details response:", response);

      // Handle the response structure from your API
      if (response && response.success && response.data) {
        setHotelDetails(response.data);
      } else if (response && response.data) {
        setHotelDetails(response.data);
      } else if (response) {
        setHotelDetails(response);
      } else {
        throw new Error("No data received from API");
      }
      
      setCurrentImageIndex(0);
    } catch (error: any) {
      console.error("❌ Error fetching hotel details:", error);
      console.error("❌ Error stack:", error.stack);
      setError(`Failed to load hotel details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomPhotos = (): HotelPhoto[] => {
    if (!hotelDetails?.rooms || !Array.isArray(hotelDetails.rooms) || hotelDetails.rooms.length === 0) return [];
    
    const firstRoom = hotelDetails.rooms[0];
    return firstRoom.photos || [];
  };

  const nextImage = (): void => {
    const photos = getRoomPhotos();
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevImage = (): void => {
    const photos = getRoomPhotos();
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const getFacilityIcon = (facilityName: string): React.ReactElement => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4 text-blue-500" />;
    if (name.includes('parking') || name.includes('car')) return <Car className="h-4 w-4 text-gray-500" />;
    if (name.includes('restaurant') || name.includes('food') || name.includes('dining')) return <Utensils className="h-4 w-4 text-orange-500" />;
    if (name.includes('fitness') || name.includes('gym')) return <Dumbbell className="h-4 w-4 text-red-500" />;
    if (name.includes('family') || name.includes('children')) return <Users className="h-4 w-4 text-purple-500" />;
    if (name.includes('pool') || name.includes('swimming')) return <div className="h-4 w-4 bg-blue-500 rounded-full" />;
    if (name.includes('breakfast') || name.includes('coffee')) return <Coffee className="h-4 w-4 text-amber-500" />;
    if (name.includes('air conditioning') || name.includes('ac')) return <Snowflake className="h-4 w-4 text-cyan-500" />;
    if (name.includes('safe') || name.includes('security')) return <Shield className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Close modal when clicking on the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectHotel = (): void => {
    if (hotelDetails && onSelect) {
      onSelect(hotelDetails);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Details</h1>
            <p className="text-sm text-gray-500 mt-1">Complete information about your selected hotel</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg text-gray-600 font-medium">Loading hotel details...</p>
                <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the information</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-lg text-gray-900 font-medium mb-2">Oops! Something went wrong</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchHotelDetails}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : hotelDetails ? (
            <div className="p-6">
              {/* Hero section with images and basic info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative">
                    {getRoomPhotos().length > 0 ? (
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={getRoomPhotos()[currentImageIndex]?.url_max750}
                          alt={`Hotel room ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = "flex";
                            }
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                          <p className="text-gray-500">Image not available</p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Camera className="h-8 w-8 text-gray-500" />
                          </div>
                          <p className="text-gray-500 font-medium">No images available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation buttons */}
                    {getRoomPhotos().length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentImageIndex + 1} / {getRoomPhotos().length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail strip */}
                  {getRoomPhotos().length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {getRoomPhotos().slice(0, 6).map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={photo.url_square180}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hotel Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {hotelDetails.hotelInfo?.hotelName}
                    </h2>
                    
                    {/* Star Rating */}
                    {hotelDetails.hotelInfo?.starRating && (
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(hotelDetails.hotelInfo.starRating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-gray-600 font-medium">
                          {hotelDetails.hotelInfo.starRating} Star Hotel
                        </span>
                      </div>
                    )}

                    {/* Review Score */}
                    {hotelDetails.hotelInfo?.reviewScore && (
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-lg">
                          {hotelDetails.hotelInfo.reviewScore}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {hotelDetails.hotelInfo.reviewScoreWord}
                          </p>
                          <p className="text-sm text-gray-500">
                            Based on {hotelDetails.hotelInfo.reviewCount?.toLocaleString()} reviews
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{hotelDetails.hotelInfo?.address?.street}</p>
                          <p className="text-gray-600">{hotelDetails.hotelInfo?.address?.city}, {hotelDetails.hotelInfo?.address?.country}</p>
                          {hotelDetails.hotelInfo?.address?.distanceToCenter && (
                            <p className="text-gray-500 mt-1">
                              {hotelDetails.hotelInfo.address.distanceToCenter.toFixed(1)} km from city center
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Total Price for Stay</span>
                        <div className="text-right">
                          {hotelDetails.pricing?.compositePriceBreakdown?.gross_amount_hotel_currency && (
                            <div className="text-3xl font-bold text-green-700">
                              {hotelDetails.pricing.compositePriceBreakdown.gross_amount_hotel_currency.amount_rounded}
                            </div>
                          )}
                          {hotelDetails.pricing?.compositePriceBreakdown?.gross_amount_per_night && (
                            <div className="text-sm text-gray-600">
                              {hotelDetails.pricing.compositePriceBreakdown.gross_amount_per_night.amount_rounded} per night
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {hotelDetails.pricing?.compositePriceBreakdown?.excluded_amount && 
                       hotelDetails.pricing.compositePriceBreakdown.excluded_amount.value > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-700 font-medium">
                            Additional charges: {hotelDetails.pricing.compositePriceBreakdown.excluded_amount.amount_rounded}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">Taxes and fees not included in the base price</p>
                        </div>
                      )}
                      
                      {hotelDetails.availability?.hotelIncludesBreakfast && (
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                          <Coffee className="h-4 w-4" />
                          <span className="font-medium">Breakfast included</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Booking</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Check-in: <strong>{new Date(checkInDate).toLocaleDateString()}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Check-out: <strong>{new Date(checkOutDate).toLocaleDateString()}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Guests: <strong>{adults} adults{children > 0 && `, ${children} children`}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities Section */}
              {hotelDetails.facilities?.facilitiesBlock && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Most Popular Facilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotelDetails.facilities.facilitiesBlock.map((facility: Facility, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {getFacilityIcon(facility.name)}
                        <span className="text-gray-700 font-medium">{facility.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Highlights */}
              {hotelDetails.facilities?.propertyHighlights && hotelDetails.facilities.propertyHighlights.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Highlights</h3>
                  <div className="flex flex-wrap gap-3">
                    {hotelDetails.facilities.propertyHighlights.map((highlight: PropertyHighlight, index: number) => (
                      <div key={index} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                        {getFacilityIcon(highlight.name)}
                        <span className="text-gray-700 font-medium text-sm">{highlight.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Details */}
              {hotelDetails.rooms && Array.isArray(hotelDetails.rooms) && hotelDetails.rooms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Room Details</h3>
                  {hotelDetails.rooms.map((room: Room, roomIndex: number) => (
                    <div key={roomIndex} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-semibold text-gray-900">{room.roomName}</h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Max occupancy: {room.maxOccupancy}</p>
                            <p className="text-sm text-gray-600">Room size: {room.roomSize} m²</p>
                          </div>
                        </div>
                        
                        {room.roomType && (
                          <p className="text-gray-700 leading-relaxed">{room.roomType}</p>
                        )}
                        
                        {room.highlights && room.highlights.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Room Features</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {room.highlights.map((highlight: RoomHighlight, index: number) => (
                                <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 rounded-lg p-2">
                                  {getFacilityIcon(highlight.translated_name)}
                                  <span className="text-gray-700">{highlight.translated_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {room.bedConfiguration && room.bedConfiguration.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <Bed className="h-4 w-4 text-blue-600" />
                              <span>Bed Configuration</span>
                            </h5>
                            {room.bedConfiguration.map((config: BedConfiguration, configIndex: number) => (
                              <div key={configIndex} className="text-sm text-gray-700">
                                {config.bed_types.map((bed: BedType, bedIndex: number) => (
                                  <span key={bedIndex} className="inline-block mr-4 mb-1 bg-white px-3 py-1 rounded-full font-medium">
                                    {bed.name_with_count}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {room.mealPlan && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-green-700">
                              <Utensils className="h-4 w-4" />
                              <span className="font-medium">{room.mealPlan}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Important Information */}
              {hotelDetails.importantInfo && hotelDetails.importantInfo.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h3>
                  <div className="space-y-3">
                    {hotelDetails.importantInfo.map((info: string, index: number) => (
                      <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-800 leading-relaxed">{info}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakfast Information */}
              {hotelDetails.breakfastInfo && hotelDetails.breakfastInfo.rating > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Breakfast</h3>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Coffee className="h-6 w-6 text-orange-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">Breakfast Rating</span>
                          <div className="bg-orange-600 text-white text-sm font-bold px-2 py-1 rounded">
                            {hotelDetails.breakfastInfo.rating}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {hotelDetails.breakfastInfo.reviewScoreWord} - Based on {hotelDetails.breakfastInfo.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WiFi Information */}
              {hotelDetails.wifiInfo && hotelDetails.wifiInfo.rating > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">WiFi</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">WiFi Rating</span>
                          <div className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                            {hotelDetails.wifiInfo.rating}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Free WiFi available</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Languages Spoken */}
              {hotelDetails.languages && hotelDetails.languages.spoken.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotelDetails.languages.spoken.map((lang: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {lang === 'en-gb' ? 'English' : lang === 'hi' ? 'Hindi' : lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Reservation Info */}
              {hotelDetails.lastReservation && hotelDetails.lastReservation.time && (
                <div className="mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800 font-medium">
                        Last booked: {hotelDetails.lastReservation.time}
                        {hotelDetails.lastReservation.country && ` from ${hotelDetails.lastReservation.country}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Total for your stay</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hotelDetails.pricing?.compositePriceBreakdown?.gross_amount_hotel_currency?.amount_rounded || 
                       hotelDetails.pricing?.productPriceBreakdown?.gross_amount_hotel_currency?.amount_rounded || 
                       "Price unavailable"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleSelectHotel}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                    >
                      Select This Hotel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsOverlay;