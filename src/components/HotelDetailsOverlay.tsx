import React, { useState, useEffect } from "react";
import { 
  X, MapPin, Star, Wifi, Car, Utensils, Dumbbell, Users, 
  Calendar, Clock, CreditCard, ChevronLeft, ChevronRight, Loader2,
  Phone, Mail, Globe, Bed, Bath, Snowflake, Coffee, Shield, Camera
} from "lucide-react";

// ✅ NEW: Updated interfaces for Amadeus data
interface AmadeusHotelDetails {
  hotelInfo: {
    hotelId: string;
    hotelName: string;
    chainCode?: string;
    address?: {
      state?: string;
      country?: string;
    };
    contact?: {};
    amenities?: string[];
    photos?: string[]; // Google Places photos
    googleRating?: number;
    googleReviewCount?: number;
    googleAddress?: string;
  };
  offer: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    room: {
      type: string;
      typeEstimated?: {
        category: string;
        bedType?: string;
        beds?: number;
      };
      description?: {
        text: string;
        lang: string;
      };
    };
    guests: {
      adults: number;
      childAges?: number[];
    };
    price: {
      currency: string;
      total: string;
      base: string;
      taxes?: Array<{
        code: string;
        description?: string;
        amount?: string;
        percentage?: string;
        included: boolean;
      }>;
      variations?: {
        changes: Array<{
          startDate: string;
          endDate: string;
          base: string;
        }>;
      };
    };
    policies: {
      paymentType?: string;
      cancellation?: any;
      checkInTime?: string;
      checkOutTime?: string;
      prepay?: any;
    };
  };
}

interface HotelDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string; 
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  onSelect: (hotelDetails: AmadeusHotelDetails) => void;
  makeAuthenticatedApiRequest: (
    method: string,
    url: string,
    data?: any
  ) => Promise<any>;
}

const HotelDetailsOverlay: React.FC<HotelDetailsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  offerId,
  checkInDate, 
  checkOutDate, 
  adults, 
  children = 0,
  onSelect,
  makeAuthenticatedApiRequest 
}) => {
  const [hotelDetails, setHotelDetails] = useState<AmadeusHotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchHotelDetails();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, offerId]);

  const fetchHotelDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log("🏨 Fetching hotel details for offerId:", offerId);

    try {
      if (!offerId) {
        throw new Error('Offer ID is required');
      }

      // ✅ FIXED: Use correct API path
      const apiUrl = `/api/hotels/details?offerId=${offerId}`;
      console.log("🌐 API URL:", apiUrl);

      const response = await makeAuthenticatedApiRequest("GET", apiUrl);
      console.log("✅ Hotel details response:", response);

      if (response?.success && response?.data) {
        setHotelDetails(response.data);
      } else {
        throw new Error("No data received from API");
      }
      
      setCurrentImageIndex(0);
    } catch (error: any) {
      console.error("❌ Error fetching hotel details:", error);
      setError(`Failed to load hotel details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Get photos from Google Places (not room photos)
  const getHotelPhotos = (): string[] => {
    return hotelDetails?.hotelInfo?.photos || [];
  };

  const nextImage = (): void => {
    const photos = getHotelPhotos();
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevImage = (): void => {
    const photos = getHotelPhotos();
    if (photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const getFacilityIcon = (amenity: string): React.ReactElement => {
    const name = amenity.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4 text-blue-500" />;
    if (name.includes('parking') || name.includes('car')) return <Car className="h-4 w-4 text-gray-500" />;
    if (name.includes('restaurant') || name.includes('food')) return <Utensils className="h-4 w-4 text-orange-500" />;
    if (name.includes('fitness') || name.includes('gym')) return <Dumbbell className="h-4 w-4 text-red-500" />;
    if (name.includes('crib') || name.includes('children')) return <Users className="h-4 w-4 text-purple-500" />;
    if (name.includes('coffee')) return <Coffee className="h-4 w-4 text-amber-500" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
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

  // ✅ FIXED: Calculate nights
  const calculateNights = (): number => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
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

        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg text-gray-600 font-medium">Loading hotel details...</p>
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
              {/* Hero section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative">
                    {getHotelPhotos().length > 0 ? (
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={getHotelPhotos()[currentImageIndex]}
                          alt={`Hotel ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Hotel+Photo';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No images available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation buttons */}
                    {getHotelPhotos().length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                        
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentImageIndex + 1} / {getHotelPhotos().length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail strip */}
                  {getHotelPhotos().length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {getHotelPhotos().slice(0, 6).map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={photo}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {hotelDetails.hotelInfo?.hotelName}
                    </h2>
                    
                    {hotelDetails.hotelInfo?.chainCode && (
                      <p className="text-sm text-gray-600 mb-3">
                        Chain: {hotelDetails.hotelInfo.chainCode}
                      </p>
                    )}

                    {/* Google Rating */}
                    {hotelDetails.hotelInfo?.googleRating && (
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-lg">
                          {hotelDetails.hotelInfo.googleRating}
                        </div>
                        <div>
                          <div className="flex items-center">
                            {[...Array(Math.floor(hotelDetails.hotelInfo.googleRating))].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {hotelDetails.hotelInfo.googleReviewCount?.toLocaleString()} reviews
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {hotelDetails.hotelInfo?.googleAddress && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                          <p className="text-sm text-gray-700">{hotelDetails.hotelInfo.googleAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Total Price</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-700">
                            {hotelDetails.offer?.price?.currency} {parseFloat(hotelDetails.offer?.price?.total || '0').toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {hotelDetails.offer?.price?.currency} {(parseFloat(hotelDetails.offer?.price?.total || '0') / calculateNights()).toFixed(2)} per night
                          </div>
                        </div>
                      </div>
                      
                      {/* Tax info */}
                      {hotelDetails.offer?.price?.taxes && hotelDetails.offer.price.taxes.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-700 font-medium">Taxes & Fees</p>
                          {hotelDetails.offer.price.taxes.map((tax, idx) => (
                            <p key={idx} className="text-xs text-orange-600 mt-1">
                              {tax.code}: {tax.percentage}% {tax.included ? '(included)' : '(not included)'}
                            </p>
                          ))}
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
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Nights: <strong>{calculateNights()}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {hotelDetails.hotelInfo?.amenities && hotelDetails.hotelInfo.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotelDetails.hotelInfo.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getFacilityIcon(amenity)}
                        <span className="text-gray-700 font-medium capitalize">
                          {amenity.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Details */}
              {hotelDetails.offer?.room && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Room Details</h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {hotelDetails.offer.room.typeEstimated?.category?.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Room Type: {hotelDetails.offer.room.type}
                        </p>
                      </div>
                      
                      {hotelDetails.offer.room.description?.text && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {hotelDetails.offer.room.description.text}
                          </p>
                        </div>
                      )}

                      {hotelDetails.offer.room.typeEstimated?.bedType && (
                        <div className="flex items-center space-x-2">
                          <Bed className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700">
                            Bed Type: <strong>{hotelDetails.offer.room.typeEstimated.bedType}</strong>
                          </span>
                        </div>
                      )}

                      {hotelDetails.offer.room.typeEstimated?.beds && (
                        <div className="flex items-center space-x-2">
                          <Bed className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700">
                            Number of beds: <strong>{hotelDetails.offer.room.typeEstimated.beds}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Policies */}
              {hotelDetails.offer?.policies && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Policies</h3>
                  <div className="space-y-3">
                    {hotelDetails.offer.policies.paymentType && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-800">
                          <strong>Payment:</strong> {hotelDetails.offer.policies.paymentType}
                        </p>
                      </div>
                    )}
                    {hotelDetails.offer.policies.checkInTime && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-800">
                          <strong>Check-in:</strong> {hotelDetails.offer.policies.checkInTime}
                        </p>
                      </div>
                    )}
                    {hotelDetails.offer.policies.checkOutTime && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-800">
                          <strong>Check-out:</strong> {hotelDetails.offer.policies.checkOutTime}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Total for your stay</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hotelDetails.offer?.price?.currency} {parseFloat(hotelDetails.offer?.price?.total || '0').toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {calculateNights()} nights • {hotelDetails.offer?.guests?.adults} adults
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleSelectHotel}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg"
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