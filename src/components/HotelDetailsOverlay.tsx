// import React, { useState, useEffect } from "react";
// import {
//   X,
//   MapPin,
//   Star,
//   Wifi,
//   Car,
//   Utensils,
//   Dumbbell,
//   Users,
//   Calendar,
//   Clock,
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   Bed,
//   Coffee,
//   Camera,
// } from "lucide-react";

// interface RatehawkPhoto {
//   url:      string;
//   thumb:    string;
//   category: string;
// }

// interface RatehawkAmenity {
//   name:   string;
//   group:  string;
//   isFree: boolean;
// }

// interface RatehawkDescriptionSection {
//   title:      string;
//   paragraphs: string[];
// }

// interface RatehawkMetapolicies {
//   parking?: Array<{
//     currency:      string;
//     inclusion:     string;
//     territory_type: string;
//     price:         string;
//     price_unit:    string;
//   }>;
//   pets?:    any[];
//   shuttle?: any[];
//   [key: string]:  any;
// }

// // This is what controller returns inside response.data
// interface RatehawkHotelDetails {
//   hotelInfo: {
//     hotelId:      string;
//     hid?:         number;
//     hotelName:    string;
//     kind?:        string;            // "hotel" | "resort" | "hostel"

//     address?: {
//       full?:   string;
//       street?: string;
//     };

//     contact?: {
//       phone?: string;
//       email?: string;
//     };

//     coordinates?: {
//       lat?: number;
//       lng?: number;
//     };

//     starRating?:  number | null;
//     hotelChain?:  string;

//     // RateHawk photos — array of objects with url + thumb + category
//     photos?:    RatehawkPhoto[];
//     mainPhoto?: string | null;       // first photo url

//     // Structured amenities with free/paid flag
//     amenities?: RatehawkAmenity[];

//     // Rich description sections from RateHawk
//     description?: RatehawkDescriptionSection[];

//     // Check-in / check-out times
//     checkInTime?:  string;
//     checkOutTime?: string;

//     // Metapolicies (parking costs, shuttle, pets)
//     metapolicies?:   RatehawkMetapolicies;
//     metapolicyNote?: string;

//     // Legacy Google fields — kept so existing JSX doesn't break
//     // Will be empty/undefined for RateHawk hotels
//     googleRating?:       number;
//     googleReviewCount?:  number;
//     googleAddress?:      string;
//     googleMapsUrl?:      string;
//     nearbyAttractions?:  Array<{
//       name:        string;
//       distanceKm:  number;
//       rating?:     number;
//       vicinity?:   string;
//     }>;
//   };

//   // offer is minimal for RateHawk — hotel/info has no live pricing
//   // real price comes from search results via book_hash
//   offer: {
//     id:           string;
//     checkInTime?:  string;
//     checkOutTime?: string;
//     available?:    boolean;

//     // These fields kept for backward compat with JSX that reads them
//     // They will be undefined for RateHawk — handle with fallbacks
//     checkInDate?:  string;
//     checkOutDate?: string;
//     room?: {
//       type?:          string;
//       typeEstimated?: {
//         category?: string;
//         bedType?:  string;
//         beds?:     number;
//       };
//       description?: {
//         text: string;
//         lang: string;
//       };
//     };
//     guests?: {
//       adults:      number;
//       childAges?:  number[];
//     };
//     price?: {
//       currency: string;
//       total:    string;
//       base:     string;
//       taxes?:   Array<{
//         code:         string;
//         description?: string;
//         amount?:      string;
//         percentage?:  string;
//         included:     boolean;
//       }>;
//     };
//     policies?: {
//       paymentType?:  string;
//       cancellation?: any;
//       checkInTime?:  string;
//       checkOutTime?: string;
//       prepay?:       any;
//     };
//   };
// }


// // ✅ NEW: Updated interfaces for Amadeus data
// interface AmadeusHotelDetails {
//   hotelInfo: {
//     hotelId: string;
//     hotelName: string;
//     chainCode?: string;
//     address?: {
//       state?: string;
//       country?: string;
//     };
//     contact?: Record<string, unknown>;
//     amenities?: string[];
//     photos?: string[]; // Google Places photos
//     googleRating?: number;
//     googleReviewCount?: number;
//     googleAddress?: string;
//     googleMapsUrl?: string;
//     coordinates?: { lat: number; lng: number };
//     // ✅ ADD THIS
//     nearbyAttractions?: Array<{
//       name: string;
//       distanceKm: number;
//       rating?: number;
//       vicinity?: string;
//     }>;
//   };
//   offer: {
//     id: string;
//     checkInDate: string;
//     checkOutDate: string;
//     room: {
//       type: string;
//       typeEstimated?: {
//         category: string;
//         bedType?: string;
//         beds?: number;
//       };
//       description?: {
//         text: string;
//         lang: string;
//       };
//     };
//     guests: {
//       adults: number;
//       childAges?: number[];
//     };
//     price: {
//       currency: string;
//       total: string;
//       base: string;
//       taxes?: Array<{
//         code: string;
//         description?: string;
//         amount?: string;
//         percentage?: string;
//         included: boolean;
//       }>;
//       variations?: {
//         changes: Array<{
//           startDate: string;
//           endDate: string;
//           base: string;
//         }>;
//       };
//     };
//     policies: {
//       paymentType?: string;
//       cancellation?: any;
//       checkInTime?: string;
//       checkOutTime?: string;
//       prepay?: any;
//     };
//   };
// }

// interface HotelDetailsOverlayProps {
//   isOpen: boolean;
//   onClose: () => void;
//   offerId: string;
//   checkInDate: string;
//   checkOutDate: string;
//   adults: number;
//   children?: number;
//   onSelect: (hotelDetails: RatehawkHotelDetails) => void;
//   makeAuthenticatedApiRequest: (
//     method: string,
//     url: string,
//     data?: any,
//   ) => Promise<any>;
// }

// const HotelDetailsOverlay: React.FC<HotelDetailsOverlayProps> = ({
//   isOpen,
//   onClose,
//   offerId,
//   checkInDate,
//   checkOutDate,
//   adults,
//   children = 0,
//   onSelect,
//   makeAuthenticatedApiRequest,
// }) => {
//   const [hotelDetails, setHotelDetails] = useState<AmadeusHotelDetails | null>(
//     null,
//   );
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isOpen && offerId) {
//       fetchHotelDetails();
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen, offerId]);

//   const fetchHotelDetails = async () => {
//     setIsLoading(true);
//     setError(null);

//     console.log("🏨 Fetching hotel details for offerId:", offerId);

//     try {
//       if (!offerId) {
//         throw new Error("Offer ID is required");
//       }

//       // ✅ FIXED: Use correct API path
//       const apiUrl = `/api/hotels/details?offerId=${offerId}`;
//       console.log("🌐 API URL:", apiUrl);

//       const response = await makeAuthenticatedApiRequest("GET", apiUrl);
//       console.log("✅ Hotel details response:", response);

//       if (response?.success && response?.data) {
//         setHotelDetails(response.data);
//           console.log('nearbyAttractions on frontend:', response.data.hotelInfo?.nearbyAttractions);

//       } else {
//         throw new Error("No data received from API");
//       }

//       setCurrentImageIndex(0);
//     } catch (error: any) {
//       console.error("❌ Error fetching hotel details:", error);
//       setError(`Failed to load hotel details: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ FIXED: Get photos from Google Places (not room photos)
//   const getHotelPhotos = (): string[] => {
//     return hotelDetails?.hotelInfo?.photos || [];
//   };

//   const nextImage = (): void => {
//     const photos = getHotelPhotos();
//     if (photos.length > 0) {
//       setCurrentImageIndex((prev) => (prev + 1) % photos.length);
//     }
//   };

//   const prevImage = (): void => {
//     const photos = getHotelPhotos();
//     if (photos.length > 0) {
//       setCurrentImageIndex(
//         (prev) => (prev - 1 + photos.length) % photos.length,
//       );
//     }
//   };

//   const getFacilityIcon = (amenity: string): React.ReactElement => {
//     const name = amenity.toLowerCase();
//     if (name.includes("wifi") || name.includes("internet"))
//       return <Wifi className="h-4 w-4 text-blue-500" />;
//     if (name.includes("parking") || name.includes("car"))
//       return <Car className="h-4 w-4 text-gray-500" />;
//     if (name.includes("restaurant") || name.includes("food"))
//       return <Utensils className="h-4 w-4 text-orange-500" />;
//     if (name.includes("fitness") || name.includes("gym"))
//       return <Dumbbell className="h-4 w-4 text-red-500" />;
//     if (name.includes("crib") || name.includes("children"))
//       return <Users className="h-4 w-4 text-purple-500" />;
//     if (name.includes("coffee"))
//       return <Coffee className="h-4 w-4 text-amber-500" />;
//     return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
//   };

//   const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   const handleSelectHotel = (): void => {
//     if (hotelDetails && onSelect) {
//       onSelect(hotelDetails);
//       onClose();
//     }
//   };

//   // ✅ FIXED: Calculate nights
//   const calculateNights = (): number => {
//     const checkIn = new Date(checkInDate);
//     const checkOut = new Date(checkOutDate);
//     return Math.ceil(
//       (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       onClick={handleOverlayClick}
//     >
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

//       <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
//         <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Hotel Details</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Complete information about your selected hotel
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//           >
//             <X className="h-5 w-5 text-gray-600" />
//           </button>
//         </div>

//         <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-20">
//               <div className="text-center">
//                 <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
//                 <p className="text-lg text-gray-600 font-medium">
//                   Loading hotel details...
//                 </p>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="flex items-center justify-center py-20">
//               <div className="text-center max-w-md">
//                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <X className="h-8 w-8 text-red-500" />
//                 </div>
//                 <p className="text-lg text-gray-900 font-medium mb-2">
//                   Oops! Something went wrong
//                 </p>
//                 <p className="text-red-600 mb-4">{error}</p>
//                 <button
//                   onClick={fetchHotelDetails}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           ) : hotelDetails ? (
//             <div className="p-6">
//               {/* Hero section */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//                 {/* Image Gallery */}
//                 <div className="space-y-4">
//                   <div className="relative">
//                     {getHotelPhotos().length > 0 ? (
//                       <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
//                         <img
//                           src={getHotelPhotos()[currentImageIndex]}
//                           alt={`Hotel ${currentImageIndex + 1}`}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             (e.target as HTMLImageElement).src =
//                               "https://via.placeholder.com/800x600?text=Hotel+Photo";
//                           }}
//                         />
//                       </div>
//                     ) : (
//                       <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
//                         <div className="text-center">
//                           <Camera className="h-16 w-16 text-gray-400 mx-auto mb-3" />
//                           <p className="text-gray-500 font-medium">
//                             No images available
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Navigation buttons */}
//                     {getHotelPhotos().length > 1 && (
//                       <>
//                         <button
//                           onClick={prevImage}
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
//                         >
//                           <ChevronLeft className="h-5 w-5 text-gray-700" />
//                         </button>
//                         <button
//                           onClick={nextImage}
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
//                         >
//                           <ChevronRight className="h-5 w-5 text-gray-700" />
//                         </button>

//                         <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
//                           {currentImageIndex + 1} / {getHotelPhotos().length}
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   {/* Thumbnail strip */}
//                   {getHotelPhotos().length > 1 && (
//                     <div className="flex space-x-2 overflow-x-auto pb-2">
//                       {getHotelPhotos()
//                         .slice(0, 6)
//                         .map((photo, index) => (
//                           <button
//                             key={index}
//                             onClick={() => setCurrentImageIndex(index)}
//                             className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
//                               currentImageIndex === index
//                                 ? "border-blue-500"
//                                 : "border-gray-200"
//                             }`}
//                           >
//                             <img
//                               src={photo}
//                               alt={`Thumbnail ${index + 1}`}
//                               className="w-full h-full object-cover"
//                             />
//                           </button>
//                         ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Hotel Info */}
//                 <div className="space-y-6">
//                   <div>
//                     <h2 className="text-3xl font-bold text-gray-900 mb-3">
//                       {hotelDetails.hotelInfo?.hotelName}
//                     </h2>

//                     {hotelDetails.hotelInfo?.chainCode && (
//                       <p className="text-sm text-gray-600 mb-3">
//                         Chain: {hotelDetails.hotelInfo.chainCode}
//                       </p>
//                     )}

//                     {/* Google Rating */}
//                     {hotelDetails.hotelInfo?.googleRating && (
//                       <div className="flex items-center space-x-3 mb-4">
//                         <div className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-lg">
//                           {hotelDetails.hotelInfo.googleRating}
//                         </div>
//                         <div>
//                           <div className="flex items-center">
//                             {[
//                               ...Array(
//                                 Math.floor(hotelDetails.hotelInfo.googleRating),
//                               ),
//                             ].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 className="h-4 w-4 fill-yellow-400 text-yellow-400"
//                               />
//                             ))}
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             {hotelDetails.hotelInfo.googleReviewCount?.toLocaleString()}{" "}
//                             reviews
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Address */}
//                     {hotelDetails.hotelInfo?.googleAddress && (
//                       <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                         <div className="flex items-start space-x-3">
//                           <MapPin className="h-5 w-5 text-gray-400 mt-1" />
//                           <p className="text-sm text-gray-700">
//                             {hotelDetails.hotelInfo.googleAddress}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Pricing Card */}
//                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-gray-700 font-medium">
//                           Total Price
//                         </span>
//                         <div className="text-right">
//                           <div className="text-3xl font-bold text-green-700">
//                             {hotelDetails.offer?.price?.currency}{" "}
//                             {parseFloat(
//                               hotelDetails.offer?.price?.total || "0",
//                             ).toFixed(2)}
//                           </div>
//                           <div className="text-sm text-gray-600">
//                             {hotelDetails.offer?.price?.currency}{" "}
//                             {(
//                               parseFloat(
//                                 hotelDetails.offer?.price?.total || "0",
//                               ) / calculateNights()
//                             ).toFixed(2)}{" "}
//                             per night
//                           </div>
//                         </div>
//                       </div>

//                       {/* Tax info */}
//                       {hotelDetails.offer?.price?.taxes &&
//                         hotelDetails.offer.price.taxes.length > 0 && (
//                           <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
//                             <p className="text-sm text-orange-700 font-medium">
//                               Taxes & Fees
//                             </p>
//                             {hotelDetails.offer.price.taxes.map((tax, idx) => (
//                               <p
//                                 key={idx}
//                                 className="text-xs text-orange-600 mt-1"
//                               >
//                                 {tax.code}: {tax.percentage}%{" "}
//                                 {tax.included ? "(included)" : "(not included)"}
//                               </p>
//                             ))}
//                           </div>
//                         )}
//                     </div>
//                   </div>

//                   {/* Booking Summary */}
//                   <div className="bg-blue-50 rounded-lg p-4 space-y-3">
//                     <h3 className="font-semibold text-gray-900 mb-2">
//                       Your Booking
//                     </h3>
//                     <div className="grid grid-cols-1 gap-3 text-sm">
//                       <div className="flex items-center space-x-3">
//                         <Calendar className="h-4 w-4 text-blue-600" />
//                         <span className="text-gray-700">
//                           Check-in:{" "}
//                           <strong>
//                             {new Date(checkInDate).toLocaleDateString()}
//                           </strong>
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-3">
//                         <Calendar className="h-4 w-4 text-blue-600" />
//                         <span className="text-gray-700">
//                           Check-out:{" "}
//                           <strong>
//                             {new Date(checkOutDate).toLocaleDateString()}
//                           </strong>
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-3">
//                         <Users className="h-4 w-4 text-blue-600" />
//                         <span className="text-gray-700">
//                           Guests:{" "}
//                           <strong>
//                             {adults} adults
//                             {children > 0 && `, ${children} children`}
//                           </strong>
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-3">
//                         <Clock className="h-4 w-4 text-blue-600" />
//                         <span className="text-gray-700">
//                           Nights: <strong>{calculateNights()}</strong>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Amenities */}
//               {hotelDetails.hotelInfo?.amenities &&
//                 hotelDetails.hotelInfo.amenities.length > 0 && (
//                   <div className="mb-8">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-6">
//                       Amenities
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {hotelDetails.hotelInfo.amenities.map(
//                         (amenity, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
//                           >
//                             {getFacilityIcon(amenity)}
//                             <span className="text-gray-700 font-medium capitalize">
//                               {amenity.replace(/_/g, " ").toLowerCase()}
//                             </span>
//                           </div>
//                         ),
//                       )}
//                     </div>
//                   </div>
//                 )}

//               {/* Room Details */}
//               {hotelDetails.offer?.room && (
//                 <div className="mb-8">
//                   <h3 className="text-2xl font-bold text-gray-900 mb-6">
//                     Room Details
//                   </h3>
//                   <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="text-xl font-semibold text-gray-900 mb-2">
//                           {hotelDetails.offer.room.typeEstimated?.category?.replace(
//                             /_/g,
//                             " ",
//                           )}
//                         </h4>
//                         <p className="text-sm text-gray-600">
//                           Room Type: {hotelDetails.offer.room.type}
//                         </p>
//                       </div>

//                       {hotelDetails.offer.room.description?.text && (
//                         <div className="bg-blue-50 rounded-lg p-4">
//                           <p className="text-sm text-gray-700 leading-relaxed">
//                             {hotelDetails.offer.room.description.text}
//                           </p>
//                         </div>
//                       )}

//                       {hotelDetails.offer.room.typeEstimated?.bedType && (
//                         <div className="flex items-center space-x-2">
//                           <Bed className="h-5 w-5 text-blue-600" />
//                           <span className="text-gray-700">
//                             Bed Type:{" "}
//                             <strong>
//                               {hotelDetails.offer.room.typeEstimated.bedType}
//                             </strong>
//                           </span>
//                         </div>
//                       )}

//                       {hotelDetails.offer.room.typeEstimated?.beds && (
//                         <div className="flex items-center space-x-2">
//                           <Bed className="h-5 w-5 text-blue-600" />
//                           <span className="text-gray-700">
//                             Number of beds:{" "}
//                             <strong>
//                               {hotelDetails.offer.room.typeEstimated.beds}
//                             </strong>
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Policies */}
//               {hotelDetails.offer?.policies && (
//                 <div className="mb-8">
//                   <h3 className="text-2xl font-bold text-gray-900 mb-4">
//                     Policies
//                   </h3>
//                   <div className="space-y-3">
//                     {hotelDetails.offer.policies.paymentType && (
//                       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
//                         <p className="text-sm text-gray-800">
//                           <strong>Payment:</strong>{" "}
//                           {hotelDetails.offer.policies.paymentType}
//                         </p>
//                       </div>
//                     )}
//                     {hotelDetails.offer.policies.checkInTime && (
//                       <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//                         <p className="text-sm text-gray-800">
//                           <strong>Check-in:</strong>{" "}
//                           {hotelDetails.offer.policies.checkInTime}
//                         </p>
//                       </div>
//                     )}
//                     {hotelDetails.offer.policies.checkOutTime && (
//                       <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//                         <p className="text-sm text-gray-800">
//                           <strong>Check-out:</strong>{" "}
//                           {hotelDetails.offer.policies.checkOutTime}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Nearby Tourist Attractions */}
//               {hotelDetails.hotelInfo?.nearbyAttractions &&
//                 hotelDetails.hotelInfo.nearbyAttractions.length > 0 && (
//                   <div className="mb-8">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-4">
//                       Nearby Attractions
//                     </h3>
//                     <p className="text-sm text-gray-500 mb-4">
//                       Distances from this hotel
//                     </p>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {hotelDetails.hotelInfo.nearbyAttractions.map(
//                         (spot, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-colors"
//                           >
//                             <div className="flex items-center space-x-3">
//                               <div className="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
//                                 <MapPin className="h-4 w-4 text-amber-700" />
//                               </div>
//                               <div>
//                                 <p className="font-medium text-gray-900 text-sm">
//                                   {spot.name}
//                                 </p>
//                                 {spot.rating && (
//                                   <div className="flex items-center space-x-1 mt-0.5">
//                                     <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                                     <span className="text-xs text-gray-500">
//                                       {spot.rating}
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             {/* Distance badge */}
//                             <div className="flex-shrink-0 ml-3">
//                               <span
//                                 className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
//                                   spot.distanceKm <= 2
//                                     ? "bg-green-100 text-green-700" // walking distance
//                                     : spot.distanceKm <= 5
//                                       ? "bg-blue-100 text-blue-700" // short cab ride
//                                       : "bg-gray-100 text-gray-600" // further away
//                                 }`}
//                               >
//                                 {spot.distanceKm} km
//                               </span>
//                             </div>
//                           </div>
//                         ),
//                       )}
//                     </div>

//                     {/* Distance legend */}
//                     <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
//                       <span className="flex items-center space-x-1">
//                         <span className="w-3 h-3 rounded-full bg-green-200 inline-block" />
//                         <span>≤ 2 km — walkable</span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <span className="w-3 h-3 rounded-full bg-blue-200 inline-block" />
//                         <span>≤ 5 km — short ride</span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
//                         <span>5+ km — further away</span>
//                       </span>
//                     </div>
//                   </div>
//                 )}

//               {/* Action Buttons */}
//               <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-6">
//                 <div className="flex items-center justify-between">
//                   <div className="text-left">
//                     <p className="text-sm text-gray-500">Total for your stay</p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {hotelDetails.offer?.price?.currency}{" "}
//                       {parseFloat(
//                         hotelDetails.offer?.price?.total || "0",
//                       ).toFixed(2)}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       {calculateNights()} nights •{" "}
//                       {hotelDetails.offer?.guests?.adults} adults
//                     </p>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={onClose}
//                       className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={handleSelectHotel}
//                       className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg"
//                     >
//                       Select This Hotel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HotelDetailsOverlay;


import React, { useState, useEffect } from "react";
import {
  X, MapPin, Star, Wifi, Car, Utensils, Dumbbell, Users,
  Calendar, Clock, ChevronLeft, ChevronRight, Loader2,
  Bed, Coffee, Camera, Info,
} from "lucide-react";

// ── Interfaces updated for RateHawk hotel/info response ───────────────────────

interface RatehawkPhoto {
  url:      string;
  thumb:    string;
  category: string;
}

interface RatehawkAmenity {
  name:   string;
  group:  string;
  isFree: boolean;
}

interface RatehawkDescriptionSection {
  title:      string;
  paragraphs: string[];
}

interface RatehawkMetapolicies {
  parking?: Array<{
    currency:      string;
    inclusion:     string;
    territory_type: string;
    price:         string;
    price_unit:    string;
  }>;
  pets?:    any[];
  shuttle?: any[];
  [key: string]:  any;
}

// This is what controller returns inside response.data
interface RatehawkHotelDetails {
  hotelInfo: {
    hotelId:      string;
    hid?:         number;
    hotelName:    string;
    kind?:        string;            // "hotel" | "resort" | "hostel"

    address?: {
      full?:   string;
      street?: string;
    };

    contact?: {
      phone?: string;
      email?: string;
    };

    coordinates?: {
      lat?: number;
      lng?: number;
    };

    starRating?:  number | null;
    hotelChain?:  string;

    // RateHawk photos — array of objects with url + thumb + category
    photos?:    RatehawkPhoto[];
    mainPhoto?: string | null;       // first photo url

    // Structured amenities with free/paid flag
    amenities?: RatehawkAmenity[];

    // Rich description sections from RateHawk
    description?: RatehawkDescriptionSection[];

    // Check-in / check-out times
    checkInTime?:  string;
    checkOutTime?: string;

    // Metapolicies (parking costs, shuttle, pets)
    metapolicies?:   RatehawkMetapolicies;
    metapolicyNote?: string;

    // Legacy Google fields — kept so existing JSX doesn't break
    // Will be empty/undefined for RateHawk hotels
    googleRating?:       number;
    googleReviewCount?:  number;
    googleAddress?:      string;
    googleMapsUrl?:      string;
    nearbyAttractions?:  Array<{
      name:        string;
      distanceKm:  number;
      rating?:     number;
      vicinity?:   string;
    }>;
  };

  // offer is minimal for RateHawk — hotel/info has no live pricing
  // real price comes from search results via book_hash
  offer: {
    id:           string;
    checkInTime?:  string;
    checkOutTime?: string;
    available?:    boolean;

    // These fields kept for backward compat with JSX that reads them
    // They will be undefined for RateHawk — handle with fallbacks
    checkInDate?:  string;
    checkOutDate?: string;
    room?: {
      type?:          string;
      typeEstimated?: {
        category?: string;
        bedType?:  string;
        beds?:     number;
      };
      description?: {
        text: string;
        lang: string;
      };
    };
    guests?: {
      adults:      number;
      childAges?:  number[];
    };
    price?: {
      currency: string;
      total:    string;
      base:     string;
      taxes?:   Array<{
        code:         string;
        description?: string;
        amount?:      string;
        percentage?:  string;
        included:     boolean;
      }>;
    };
    policies?: {
      paymentType?:  string;
      cancellation?: any;
      checkInTime?:  string;
      checkOutTime?: string;
      prepay?:       any;
    };
  };
}

interface HotelDetailsOverlayProps {
  isOpen:       boolean;
  onClose:      () => void;
  offerId:      string;           // now receives hotelId (RateHawk id)
  selectedHotel?: any;
  checkInDate:  string;
  checkOutDate: string;
  adults:       number;
  children?:    number;
  onSelect:     (hotelDetails: RatehawkHotelDetails) => void;
  makeAuthenticatedApiRequest: (
    method: string,
    url:    string,
    data?:  any,
  ) => Promise<any>;
}

// ── Component ─────────────────────────────────────────────────────────────────

const HotelDetailsOverlay: React.FC<HotelDetailsOverlayProps> = ({
  isOpen,
  onClose,
  offerId,
  selectedHotel,
  checkInDate,
  checkOutDate,
  adults,
  children = 0,
  onSelect,
  makeAuthenticatedApiRequest,
}) => {
  const [hotelDetails, setHotelDetails] = useState<RatehawkHotelDetails | null>(null);
  const [isLoading, setIsLoading]         = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchHotelDetails();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, offerId]);

  const fetchHotelDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!offerId) throw new Error("Hotel ID is required");

      // Backend accepts both hotelId and offerId for backward compat
      const response = await makeAuthenticatedApiRequest(
        "GET",
        `/api/hotels/details?hotelId=${offerId}`
      );

      if (response?.success && response?.data) {
        setHotelDetails(response.data);
      } else {
        throw new Error("No data received from API");
      }
      setCurrentImageIndex(0);
    } catch (error: any) {
      console.error("Error fetching hotel details:", error);
      setError(`Failed to load hotel details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // RateHawk returns photos as objects — extract url strings for display
  // const getPhotoUrls = (): string[] => {
  //   const photos = hotelDetails?.hotelInfo?.photos;
  //   if (!photos || photos.length === 0) return [];
  //   // photos is RatehawkPhoto[] — each has url and thumb
  //   return photos.map((p) => p.url).filter(Boolean);
  // };

  const getPhotoUrls = (): string[] => {
  const detailPhotos =
    hotelDetails?.hotelInfo?.photos?.map((p) => p.url).filter(Boolean) || [];

  const selectedHotelPhotos =
    selectedHotel?.photos?.filter(Boolean) || [];

  const selectedMainPhoto =
    selectedHotel?.mainPhoto ? [selectedHotel.mainPhoto] : [];

  const allPhotos = [
    ...detailPhotos,
    ...selectedMainPhoto,
    ...selectedHotelPhotos,
  ].filter(Boolean);

  return Array.from(new Set(allPhotos));
};

const getRoomPhotoUrls = (): string[] => {
  const roomPhotos =
    hotelDetails?.hotelInfo?.photos
      ?.filter((p) =>
        (p.category || "").toLowerCase().includes("room") ||
        (p.category || "").toLowerCase().includes("apartment") ||
        (p.category || "").toLowerCase().includes("bed")
      )
      .map((p) => p.url)
      .filter(Boolean) || [];

  return Array.from(new Set(roomPhotos));
};

  const nextImage = () => {
    const photos = getPhotoUrls();
    if (photos.length > 0) setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    const photos = getPhotoUrls();
    if (photos.length > 0)
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const getFacilityIcon = (amenityName: string): React.ReactElement => {
    const name = amenityName.toLowerCase();
    if (name.includes("wifi") || name.includes("internet"))
      return <Wifi className="h-4 w-4 text-blue-500" />;
    if (name.includes("parking") || name.includes("car"))
      return <Car className="h-4 w-4 text-gray-500" />;
    if (name.includes("restaurant") || name.includes("food"))
      return <Utensils className="h-4 w-4 text-orange-500" />;
    if (name.includes("fitness") || name.includes("gym"))
      return <Dumbbell className="h-4 w-4 text-red-500" />;
    if (name.includes("children") || name.includes("family"))
      return <Users className="h-4 w-4 text-purple-500" />;
    if (name.includes("coffee") || name.includes("breakfast"))
      return <Coffee className="h-4 w-4 text-amber-500" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSelectHotel = () => {
    if (hotelDetails && onSelect) {
      onSelect(hotelDetails);
      onClose();
    }
  };

  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 1;
    const checkIn  = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Resolve check-in/out time from multiple possible locations in response
  const getCheckInTime  = () =>
    hotelDetails?.hotelInfo?.checkInTime  ||
    hotelDetails?.offer?.checkInTime      ||
    hotelDetails?.offer?.policies?.checkInTime  || "14:00";

  const getCheckOutTime = () =>
    hotelDetails?.hotelInfo?.checkOutTime ||
    hotelDetails?.offer?.checkOutTime     ||
    hotelDetails?.offer?.policies?.checkOutTime || "12:00";

  if (!isOpen) return null;

  const photoUrls = getPhotoUrls();
  const roomPhotoUrls = getRoomPhotoUrls();


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete information about your selected hotel
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg text-gray-600 font-medium">Loading hotel details...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-lg text-gray-900 font-medium mb-2">Something went wrong</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchHotelDetails}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && hotelDetails && (
            <div className="p-6">

              {/* ── Hero: photos + basic info ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Photo gallery */}
                <div className="space-y-4">
                  <div className="relative">
                    {photoUrls.length > 0 ? (
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={photoUrls[currentImageIndex]}
                          alt={`Hotel photo ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/800x600?text=Hotel+Photo";
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

                    {photoUrls.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentImageIndex + 1} / {photoUrls.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {photoUrls.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {photoUrls.slice(0, 8).map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                          }`}
                        >
                          <img src={url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hotel info */}
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Hotel kind badge e.g. "Resort", "Hostel" */}
                      {hotelDetails.hotelInfo?.kind && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                          {hotelDetails.hotelInfo.kind}
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {hotelDetails.hotelInfo?.hotelName}
                    </h2>

                    {/* Star rating from RateHawk */}
                   {Number(hotelDetails.hotelInfo?.starRating || selectedHotel?.starRating || 0) > 0 && (
  <div className="flex items-center gap-1 mb-3">
    {[...Array(Math.floor(Number(hotelDetails.hotelInfo?.starRating || selectedHotel?.starRating || 0)))].map((_, i) => (

                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
  {Math.floor(Number(hotelDetails.hotelInfo?.starRating || selectedHotel?.starRating || 0))}-star hotel
                        </span>
                      </div>
                    )}

                    {/* Google rating — shown only if present (legacy) */}
                    {hotelDetails.hotelInfo?.googleRating && (
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-lg">
                          {hotelDetails.hotelInfo.googleRating}
                        </div>
                        <p className="text-sm text-gray-600">
                          {hotelDetails.hotelInfo.googleReviewCount?.toLocaleString()} reviews
                        </p>
                      </div>
                    )}

                    {/* Address */}
                    {(hotelDetails.hotelInfo?.address?.full || hotelDetails.hotelInfo?.googleAddress) && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">
                            {hotelDetails.hotelInfo.address?.full || hotelDetails.hotelInfo.googleAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {(hotelDetails.hotelInfo?.contact?.phone || hotelDetails.hotelInfo?.contact?.email) && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {hotelDetails.hotelInfo.contact.phone && (
                          <p>Phone: {hotelDetails.hotelInfo.contact.phone}</p>
                        )}
                        {hotelDetails.hotelInfo.contact.email && (
                          <p>Email: {hotelDetails.hotelInfo.contact.email}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Booking summary */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Your Booking</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Check-in: <strong>{new Date(checkInDate).toLocaleDateString()}</strong>
                          <span className="text-gray-500 ml-2">after {getCheckInTime()}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">
                          Check-out: <strong>{new Date(checkOutDate).toLocaleDateString()}</strong>
                          <span className="text-gray-500 ml-2">before {getCheckOutTime()}</span>
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
                          Duration: <strong>{calculateNights()} nights</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedHotel?.pricing && (
  <div className="bg-green-50 rounded-lg p-4">
    <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-green-600">
        {selectedHotel.pricing.currency}{" "}
        {Math.round(selectedHotel.pricing.showPrice ?? selectedHotel.pricing.total ?? 0)}
      </p>
      <p className="text-sm text-gray-600">
        Current rate for your selected stay
      </p>
    </div>
  </div>
)}


                  {/* Room details from selected search result */}
{selectedHotel?.room && (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
      <Bed className="h-4 w-4 text-blue-600" />
      Room Details
    </h3>

    <div className="space-y-2 text-sm text-gray-700">
      <p>
        <strong>Room Type:</strong> {selectedHotel.room?.type || "Standard Room"}
      </p>

      {selectedHotel.room?.description && (
        <p>
          <strong>Description:</strong> {selectedHotel.room.description}
        </p>
      )}

      {selectedHotel.room?.bedType && (
        <p>
          <strong>Bed Type:</strong> {selectedHotel.room.bedType}
        </p>
      )}
    </div>

    {roomPhotoUrls.length > 0 && (
      <div>
        <p className="text-sm font-medium text-gray-800 mb-2">Room Images</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {roomPhotoUrls.slice(0, 6).map((url, index) => (
            <div key={index} className="h-28 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={url}
                alt={`Room ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}


                  {/* Pricing note — RateHawk hotel/info has no live rate */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        Final price is shown on the hotel list. Select this hotel to confirm your booking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Description sections from RateHawk ── */}
              {hotelDetails.hotelInfo?.description &&
                hotelDetails.hotelInfo.description.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">About this hotel</h3>
                  <div className="space-y-4">
                    {hotelDetails.hotelInfo.description.map((section, idx) => (
                      <div key={idx}>
                        {section.title && (
                          <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
                        )}
                        {section.paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="text-sm text-gray-600 leading-relaxed mb-2">
                            {para}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Amenities — RateHawk groups with free/paid flag ── */}
              {hotelDetails.hotelInfo?.amenities &&
                hotelDetails.hotelInfo.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h3>
                  {/* Group by group name */}
                  {Object.entries(
                    hotelDetails.hotelInfo.amenities.reduce((acc: Record<string, RatehawkAmenity[]>, a) => {
                      if (!acc[a.group]) acc[a.group] = [];
                      acc[a.group].push(a);
                      return acc;
                    }, {})
                  ).map(([group, items]) => (
                    <div key={group} className="mb-4">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((amenity, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              amenity.isFree ? "bg-green-50" : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getFacilityIcon(amenity.name)}
                              <span className="text-sm text-gray-700">{amenity.name}</span>
                            </div>
                            {!amenity.isFree && (
                              <span className="text-xs text-orange-600 font-medium">Paid</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Metapolicies (parking, shuttle, pets) ── */}
              {hotelDetails.hotelInfo?.metapolicies && (
                (() => {
                  const mp = hotelDetails.hotelInfo.metapolicies;
                  const hasParking = mp.parking && mp.parking.length > 0;
                  const hasShuttle = mp.shuttle && mp.shuttle.length > 0;
                  if (!hasParking && !hasShuttle) return null;
                  return (
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Policies</h3>
                      <div className="space-y-3">
                        {/* Check-in / Check-out times */}
                        <div className="flex gap-4">
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex-1">
                            <p className="text-sm text-gray-800">
                              <strong>Check-in:</strong> after {getCheckInTime()}
                            </p>
                          </div>
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex-1">
                            <p className="text-sm text-gray-800">
                              <strong>Check-out:</strong> before {getCheckOutTime()}
                            </p>
                          </div>
                        </div>

                        {hasParking && mp.parking!.map((p, i) => (
                          <div key={i} className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-800">
                              <strong>Parking:</strong>{" "}
                              {p.inclusion === "not_included"
                                ? `Available at extra cost — ${p.currency} ${p.price} ${p.price_unit?.replace(/_/g, " ")}`
                                : "Included"}
                            </p>
                          </div>
                        ))}

                        {hasShuttle && mp.shuttle!.map((s: any, i: number) => (
                          <div key={i} className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-800">
                              <strong>Airport shuttle:</strong>{" "}
                              {s.inclusion === "not_included"
                                ? `Available at extra cost — ${s.currency} ${s.price}`
                                : "Included"}
                            </p>
                          </div>
                        ))}

                        {hotelDetails.hotelInfo?.metapolicyNote && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-800">
                              {hotelDetails.hotelInfo.metapolicyNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* ── Nearby attractions (kept from old version) ── */}
              {hotelDetails.hotelInfo?.nearbyAttractions &&
                hotelDetails.hotelInfo.nearbyAttractions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nearby Attractions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hotelDetails.hotelInfo.nearbyAttractions.map((spot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{spot.name}</p>
                            {spot.rating && (
                              <div className="flex items-center space-x-1 mt-0.5">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-500">{spot.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          spot.distanceKm <= 2
                            ? "bg-green-100 text-green-700"
                            : spot.distanceKm <= 5
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {spot.distanceKm} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Action buttons ── */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {calculateNights()} nights · {adults} adults
                      {children > 0 && ` · ${children} children`}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Check-in after {getCheckInTime()} · Check-out before {getCheckOutTime()}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsOverlay;