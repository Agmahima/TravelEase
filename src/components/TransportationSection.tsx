// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { vehicleTypes, serviceTypes, drivers } from '@/lib/mockData';
// import DriverCard from './DriverCard';
// import { format } from 'date-fns';
// import { CalendarIcon, Search } from 'lucide-react';

// const TransportationSection = () => {
//   const [tripStartDate, setTripStartDate] = useState<Date>();
//   const [tripEndDate, setTripEndDate] = useState<Date>();
//   const [selectedVehicleType, setSelectedVehicleType] = useState("Standard");
//   const [selectedServiceLevel, setSelectedServiceLevel] = useState("Standard Service");
//   const [driverSearchQuery, setDriverSearchQuery] = useState("");

//   const filteredDrivers = drivers.filter(driver => {
//     if (!driverSearchQuery) return true;
//     const query = driverSearchQuery.toLowerCase();
//     return (
//       driver.name.toLowerCase().includes(query) ||
//       driver.languages.some(lang => lang.toLowerCase().includes(query)) ||
//       driver.location.toLowerCase().includes(query)
//     );
//   });

//   return (
//     <section
//       className="py-20"
//       style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #fdf4ff 100%)' }}
//     >
//       <div className="container mx-auto px-4">

//         {/* Header */}
//         <div className="text-center mb-14">
         
//           <h2
//             className="text-3xl md:text-4xl font-bold mb-4"
//             style={{
//               background: 'linear-gradient(135deg, #be185d, #a855f7)',
//               WebkitBackgroundClip: 'text',
//               WebkitTextFillColor: 'transparent',
//             }}
//           >
//             Transportation Made Easy
//           </h2>
//           <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
//             Book drivers for your entire trip duration or arrange individual transfers.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">

//           {/* Left — Booking Form */}
//           <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
//             {/* Card top border */}
//             <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />

//             <div className="p-7">
//               <h3 className="text-xl font-bold text-pink-900 mb-1">Reserve Your Dedicated Driver</h3>
//               <p className="text-pink-800/60 text-sm mb-7">
//                 Have the same driver throughout your entire trip for a seamless experience.
//               </p>

//               <div className="space-y-6">

//                 {/* Trip Duration */}
//                 <div>
//                   <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
//                     Trip Duration
//                   </label>
//                   <div className="grid grid-cols-2 gap-3">
//                     {/* Start Date */}
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-pink-200 rounded-xl text-sm text-left bg-pink-50/50 hover:border-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
//                           <CalendarIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
//                           <span className={tripStartDate ? 'text-pink-900' : 'text-gray-400'}>
//                             {tripStartDate ? format(tripStartDate, 'dd MMM yyyy') : 'Start date'}
//                           </span>
//                         </button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0">
//                         <Calendar
//                           mode="single"
//                           selected={tripStartDate}
//                           onSelect={setTripStartDate}
//                           initialFocus
//                           disabled={(date) => date < new Date()}
//                         />
//                       </PopoverContent>
//                     </Popover>

//                     {/* End Date */}
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-pink-200 rounded-xl text-sm text-left bg-pink-50/50 hover:border-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
//                           <CalendarIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
//                           <span className={tripEndDate ? 'text-pink-900' : 'text-gray-400'}>
//                             {tripEndDate ? format(tripEndDate, 'dd MMM yyyy') : 'End date'}
//                           </span>
//                         </button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0">
//                         <Calendar
//                           mode="single"
//                           selected={tripEndDate}
//                           onSelect={setTripEndDate}
//                           initialFocus
//                           disabled={(date) => !tripStartDate || date < tripStartDate}
//                         />
//                       </PopoverContent>
//                     </Popover>
//                   </div>
//                 </div>

//                 {/* Vehicle Type */}
//                 <div>
//                   <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
//                     Vehicle Type
//                   </label>
//                   <div className="grid grid-cols-3 gap-2">
//                     {vehicleTypes.map((vehicle, index) => (
//                       <div
//                         key={index}
//                         onClick={() => setSelectedVehicleType(vehicle.type)}
//                         className={`border rounded-xl p-3 cursor-pointer text-center transition-all duration-200 ${
//                           selectedVehicleType === vehicle.type
//                             ? 'border-pink-400 bg-pink-50 shadow-sm'
//                             : 'border-pink-100 hover:border-pink-300'
//                         }`}
//                       >
//                         <i
//                           className={`fas fa-${vehicle.icon} text-xl mb-1.5`}
//                           style={{
//                             color: selectedVehicleType === vehicle.type ? '#ec4899' : '#c084fc',
//                           }}
//                         />
//                         <p className="text-xs font-semibold text-pink-900">{vehicle.type}</p>
//                         <p className="text-xs text-pink-400">{vehicle.capacity}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Service Level */}
//                 <div>
//                   <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
//                     Service Level
//                   </label>
//                   <div className="grid grid-cols-2 gap-3">
//                     {serviceTypes.map((service, index) => (
//                       <div
//                         key={index}
//                         onClick={() => setSelectedServiceLevel(service.name)}
//                         className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
//                           selectedServiceLevel === service.name
//                             ? 'border-pink-400 bg-pink-50 shadow-sm'
//                             : 'border-pink-100 hover:border-pink-300'
//                         }`}
//                       >
//                         <div className="flex justify-between items-center mb-2">
//                           <h4 className="font-semibold text-pink-900 text-sm">{service.name}</h4>
//                           <div className="flex gap-0.5">
//                             {[...Array(5)].map((_, i) => (
//                               <i
//                                 key={i}
//                                 className="fas fa-star text-xs"
//                                 style={{ color: i < service.rating ? '#f59e0b' : '#e5e7eb' }}
//                               />
//                             ))}
//                           </div>
//                         </div>
//                         <ul className="text-xs text-pink-800/70 space-y-1 mb-3">
//                           {service.features.map((feature, i) => (
//                             <li key={i} className="flex items-center gap-1.5">
//                               <i className="fas fa-check text-pink-500 text-xs" />
//                               {feature}
//                             </li>
//                           ))}
//                           {service.missing.map((feature, i) => (
//                             <li key={i} className="flex items-center gap-1.5 opacity-40">
//                               <i className="fas fa-times text-gray-400 text-xs" />
//                               {feature}
//                             </li>
//                           ))}
//                         </ul>
//                         <p className="font-bold text-pink-700 text-sm">
//                           ₹{service.price}
//                           <span className="text-xs font-normal text-pink-400">/day</span>
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 className="mt-6 w-full text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
//                 style={{ background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' }}
//               >
//                 Check Driver Availability
//               </button>
//             </div>
//           </div>

//           {/* Right — Driver Profiles */}
//           <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col">
//             {/* Hero image */}
//             <div className="h-48 relative flex-shrink-0">
//               <img
//                 src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
//                 alt="Premium transportation"
//                 className="w-full h-full object-cover"
//               />
//               <div
//                 className="absolute inset-0"
//                 style={{
//                   background: 'linear-gradient(to top, rgba(190,24,93,0.85) 0%, rgba(168,85,247,0.4) 60%, transparent 100%)',
//                 }}
//               />
//               <div className="absolute bottom-4 left-5 text-white">
//                 <h3 className="text-lg font-bold">Driver Profiles</h3>
//                 <p className="text-xs text-pink-200">Choose based on ratings, language & location</p>
//               </div>
//             </div>

//             <div className="p-6 flex flex-col flex-1">
//               {/* Search */}
//               <div className="flex items-center gap-2 mb-5">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-pink-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, language, or location"
//                     className="w-full pl-9 pr-3 py-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
//                     value={driverSearchQuery}
//                     onChange={(e) => setDriverSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   className="p-2.5 rounded-xl text-white flex-shrink-0"
//                   style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
//                 >
//                   <Search className="h-4 w-4" />
//                 </button>
//               </div>

//               {/* Driver list */}
//               <div className="space-y-3 flex-1 max-h-64 overflow-y-auto pr-1">
//                 {filteredDrivers.map((driver) => (
//                   <DriverCard key={driver.id} driver={driver} />
//                 ))}
//               </div>

//               <button
//                 className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors"
//               >
//                 View All Drivers
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default TransportationSection;

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { vehicleTypes, serviceTypes, drivers } from '@/lib/mockData';
import DriverCard from './DriverCard';
import { format } from 'date-fns';
import { CalendarIcon, Search, Star, X, Loader2, Check } from 'lucide-react';
import { Driver } from '@/types';

const gradientStyle = { background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' };
const gradientText = {
  background: 'linear-gradient(135deg, #be185d, #a855f7)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
};

const TransportationSection = () => {
  const [tripStartDate, setTripStartDate] = useState<Date>();
  const [tripEndDate, setTripEndDate] = useState<Date>();
  const [selectedVehicleType, setSelectedVehicleType] = useState("Standard");
  const [selectedServiceLevel, setSelectedServiceLevel] = useState("Standard Service");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Availability state
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // View All Drivers modal
  const [showAllDriversModal, setShowAllDriversModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const filteredDrivers = drivers.filter(driver => {
    if (!driverSearchQuery) return true;
    const query = driverSearchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.languages.some(lang => lang.toLowerCase().includes(query)) ||
      driver.location.toLowerCase().includes(query)
    );
  });

  const modalFilteredDrivers = drivers.filter(driver => {
    const matchesSearch = !modalSearchQuery ||
      driver.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      driver.languages.some(lang => lang.toLowerCase().includes(modalSearchQuery.toLowerCase())) ||
      driver.location.toLowerCase().includes(modalSearchQuery.toLowerCase());

    const matchesLanguage = selectedLanguage === 'All' ||
      driver.languages.includes(selectedLanguage);

    return matchesSearch && matchesLanguage;
  });

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleCheckAvailability = async () => {
    if (!tripStartDate || !tripEndDate) return;

    setIsCheckingAvailability(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAvailabilityChecked(true);
    setIsCheckingAvailability(false);

    // Scroll to driver list
    document.getElementById('driver-list-section')?.scrollIntoView({
      behavior: 'smooth', block: 'start'
    });
  };

  const getDays = () => {
    if (!tripStartDate || !tripEndDate) return 0;
    return Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getServicePrice = () => {
    const service = serviceTypes.find(s => s.name === selectedServiceLevel);
    return (service?.price || 0) * getDays();
  };

  return (
    <section
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #fdf4ff 100%)' }}
    >
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full mb-3">
            Local Transport
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={gradientText}>
            Transportation Made Easy
          </h2>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            Book drivers for your entire trip duration or arrange individual transfers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Left — Booking Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
            <div className="h-1 w-full" style={gradientStyle} />
            <div className="p-7">
              <h3 className="text-xl font-bold text-pink-900 mb-1">Reserve Your Dedicated Driver</h3>
              <p className="text-pink-800/60 text-sm mb-7">
                Have the same driver throughout your entire trip for a seamless experience.
              </p>

              <div className="space-y-6">

                {/* Trip Duration */}
                <div>
                  <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
                    Trip Duration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-pink-200 rounded-xl text-sm text-left bg-pink-50/50 hover:border-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
                          <CalendarIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                          <span className={tripStartDate ? 'text-pink-900' : 'text-gray-400'}>
                            {tripStartDate ? format(tripStartDate, 'dd MMM yyyy') : 'Start date'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single" selected={tripStartDate} onSelect={setTripStartDate}
                          initialFocus disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-pink-200 rounded-xl text-sm text-left bg-pink-50/50 hover:border-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
                          <CalendarIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                          <span className={tripEndDate ? 'text-pink-900' : 'text-gray-400'}>
                            {tripEndDate ? format(tripEndDate, 'dd MMM yyyy') : 'End date'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single" selected={tripEndDate} onSelect={setTripEndDate}
                          initialFocus disabled={(date) => !tripStartDate || date < tripStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {vehicleTypes.map((vehicle, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedVehicleType(vehicle.type)}
                        className="border rounded-xl p-3 cursor-pointer text-center transition-all duration-200"
                        style={selectedVehicleType === vehicle.type
                          ? { borderColor: '#ec4899', background: '#fff0f6' }
                          : { borderColor: '#fce7f3' }}
                      >
                        <i
                          className={`fas fa-${vehicle.icon} text-xl mb-1.5`}
                          style={{ color: selectedVehicleType === vehicle.type ? '#ec4899' : '#c084fc' }}
                        />
                        <p className="text-xs font-semibold text-pink-900">{vehicle.type}</p>
                        <p className="text-xs text-pink-400">{vehicle.capacity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Level */}
                <div>
                  <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide mb-2">
                    Service Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceTypes.map((service, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedServiceLevel(service.name)}
                        className="border rounded-xl p-4 cursor-pointer transition-all duration-200"
                        style={selectedServiceLevel === service.name
                          ? { borderColor: '#ec4899', background: '#fff0f6' }
                          : { borderColor: '#fce7f3' }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-pink-900 text-sm">{service.name}</h4>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star text-xs"
                                style={{ color: i < service.rating ? '#f59e0b' : '#e5e7eb' }} />
                            ))}
                          </div>
                        </div>
                        <ul className="text-xs text-pink-800/70 space-y-1 mb-3">
                          {service.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <i className="fas fa-check text-pink-500 text-xs" />{feature}
                            </li>
                          ))}
                          {service.missing.map((feature, i) => (
                            <li key={i} className="flex items-center gap-1.5 opacity-40">
                              <i className="fas fa-times text-gray-400 text-xs" />{feature}
                            </li>
                          ))}
                        </ul>
                        <p className="font-bold text-pink-700 text-sm">
                          ₹{service.price}<span className="text-xs font-normal text-pink-400">/day</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Driver Summary */}
              {selectedDriver && (
                <div
                  className="mt-5 p-3 rounded-xl border border-pink-100 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }}
                >
                  <img
                    src={selectedDriver.image}
                    className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-pink-900">{selectedDriver.name}</p>
                    <p className="text-xs text-pink-400">
                      {selectedDriver.specialization} · ⭐ {selectedDriver.rating}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="text-xs text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Price Summary */}
              {tripStartDate && tripEndDate && (
                <div
                  className="mt-5 p-3 rounded-xl border border-pink-100 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }}
                >
                  <div>
                    <p className="text-xs text-pink-400">Estimated Total</p>
                    <p className="text-xs text-pink-400">{getDays()} days · {selectedServiceLevel}</p>
                  </div>
                  <p className="text-xl font-bold" style={gradientText}>₹{getServicePrice()}</p>
                </div>
              )}

              {/* Check Availability Button */}
              <button
                className="mt-5 w-full text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={gradientStyle}
                onClick={handleCheckAvailability}
                disabled={isCheckingAvailability || !tripStartDate || !tripEndDate}
              >
                {isCheckingAvailability ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Checking Availability...</>
                ) : availabilityChecked ? (
                  <><Check className="h-4 w-4" />Available — Select a Driver Below</>
                ) : (
                  'Check Driver Availability'
                )}
              </button>

              {!tripStartDate || !tripEndDate ? (
                <p className="text-xs text-pink-300 text-center mt-2">
                  Select dates to check availability
                </p>
              ) : null}
            </div>
          </div>

          {/* Right — Driver Profiles */}
          <div
            id="driver-list-section"
            className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col"
          >
            <div className="h-48 relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2070&q=80"
                alt="Premium transportation"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(190,24,93,0.85) 0%, rgba(168,85,247,0.4) 60%, transparent 100%)' }}
              />
              <div className="absolute bottom-4 left-5 text-white">
                <h3 className="text-lg font-bold">Driver Profiles</h3>
                <p className="text-xs text-pink-200">Choose based on ratings, language & location</p>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">

              {/* Availability Banner */}
              {availabilityChecked && (
                <div
                  className="mb-4 p-3 rounded-xl border border-pink-100 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={gradientStyle}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-pink-900">
                      {filteredDrivers.length} drivers available 🎉
                    </p>
                    <p className="text-xs text-pink-400">
                      {format(tripStartDate!, 'dd MMM')} — {format(tripEndDate!, 'dd MMM yyyy')} · {selectedVehicleType}
                    </p>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-pink-400" />
                  <input
                    type="text"
                    placeholder="Search by name, language, or location"
                    className="w-full pl-9 pr-3 py-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="p-2.5 rounded-xl text-white flex-shrink-0"
                  style={gradientStyle}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Driver List */}
              <div className="space-y-3 flex-1 max-h-64 overflow-y-auto pr-1">
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      onSelect={handleDriverSelect}
                      isSelected={selectedDriver?.id === driver.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-pink-300">No drivers found</p>
                  </div>
                )}
              </div>

              <button
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors"
                onClick={() => setShowAllDriversModal(true)}
              >
                View All Drivers ({drivers.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View All Drivers Modal */}
      {showAllDriversModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllDriversModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-1 w-full" style={gradientStyle} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <div>
                <h2 className="text-lg font-bold text-pink-900">All Drivers</h2>
                <p className="text-xs text-pink-400">{drivers.length} drivers available on TravelEase</p>
              </div>
              <button
                onClick={() => setShowAllDriversModal(false)}
                className="p-2 rounded-full hover:bg-pink-50 transition-colors"
              >
                <X className="h-5 w-5 text-pink-400" />
              </button>
            </div>

            {/* Search & Language Filter */}
            <div className="px-6 py-4 border-b border-pink-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Search by name, language, location..."
                  className="w-full pl-9 pr-3 py-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Hindi', 'English', 'Rajasthani', 'Marwari', 'Gujarati'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                    style={selectedLanguage === lang
                      ? gradientStyle
                      : { border: '1.5px solid #fce7f3', color: '#be185d', background: '#fff' }}
                  >
                    <span className={selectedLanguage === lang ? 'text-white' : ''}>{lang}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver List */}
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
              {modalFilteredDrivers.length > 0 ? (
                modalFilteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer"
                    style={selectedDriver?.id === driver.id
                      ? { borderColor: '#ec4899', background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }
                      : { borderColor: '#fce7f3' }}
                    onClick={() => {
                      handleDriverSelect(driver);
                      setShowAllDriversModal(false);
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={driver.image}
                        alt={driver.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-pink-200"
                      />
                      {selectedDriver?.id === driver.id && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={gradientStyle}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-pink-900">{driver.name}</h4>
                        {selectedDriver?.id === driver.id && (
                          <span className="text-xs text-white px-2 py-0.5 rounded-full" style={gradientStyle}>
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-pink-400 mb-1">{driver.location}</p>
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-pink-700">{driver.rating}</span>
                          <span className="text-xs text-pink-300">({driver.reviewCount})</span>
                        </div>
                        <span className="text-xs text-pink-400">{driver.years} exp</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {driver.languages.map((lang) => (
                          <span key={lang} className="text-xs bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-lg">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-pink-400 mb-2">{driver.specialization}</p>
                      <button
                        className="text-xs text-white px-3 py-1.5 rounded-lg font-semibold"
                        style={gradientStyle}
                      >
                        {selectedDriver?.id === driver.id ? 'Selected ✓' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-pink-300">No drivers match your search</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-pink-100">
              <button
                onClick={() => setShowAllDriversModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TransportationSection;