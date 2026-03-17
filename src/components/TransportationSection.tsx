import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { vehicleTypes, serviceTypes, drivers } from '@/lib/mockData';
import DriverCard from './DriverCard';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';

const TransportationSection = () => {
  const [tripStartDate, setTripStartDate] = useState<Date>();
  const [tripEndDate, setTripEndDate] = useState<Date>();
  const [selectedVehicleType, setSelectedVehicleType] = useState("Standard");
  const [selectedServiceLevel, setSelectedServiceLevel] = useState("Standard Service");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  const filteredDrivers = drivers.filter(driver => {
    if (!driverSearchQuery) return true;
    const query = driverSearchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.languages.some(lang => lang.toLowerCase().includes(query)) ||
      driver.location.toLowerCase().includes(query)
    );
  });

  return (
    <section
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #fdf4ff 100%)' }}
    >
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
         
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #be185d, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Transportation Made Easy
          </h2>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            Book drivers for your entire trip duration or arrange individual transfers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Left — Booking Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
            {/* Card top border */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />

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
                    {/* Start Date */}
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
                          mode="single"
                          selected={tripStartDate}
                          onSelect={setTripStartDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* End Date */}
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
                          mode="single"
                          selected={tripEndDate}
                          onSelect={setTripEndDate}
                          initialFocus
                          disabled={(date) => !tripStartDate || date < tripStartDate}
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
                        className={`border rounded-xl p-3 cursor-pointer text-center transition-all duration-200 ${
                          selectedVehicleType === vehicle.type
                            ? 'border-pink-400 bg-pink-50 shadow-sm'
                            : 'border-pink-100 hover:border-pink-300'
                        }`}
                      >
                        <i
                          className={`fas fa-${vehicle.icon} text-xl mb-1.5`}
                          style={{
                            color: selectedVehicleType === vehicle.type ? '#ec4899' : '#c084fc',
                          }}
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
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedServiceLevel === service.name
                            ? 'border-pink-400 bg-pink-50 shadow-sm'
                            : 'border-pink-100 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-pink-900 text-sm">{service.name}</h4>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className="fas fa-star text-xs"
                                style={{ color: i < service.rating ? '#f59e0b' : '#e5e7eb' }}
                              />
                            ))}
                          </div>
                        </div>
                        <ul className="text-xs text-pink-800/70 space-y-1 mb-3">
                          {service.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <i className="fas fa-check text-pink-500 text-xs" />
                              {feature}
                            </li>
                          ))}
                          {service.missing.map((feature, i) => (
                            <li key={i} className="flex items-center gap-1.5 opacity-40">
                              <i className="fas fa-times text-gray-400 text-xs" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <p className="font-bold text-pink-700 text-sm">
                          ₹{service.price}
                          <span className="text-xs font-normal text-pink-400">/day</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="mt-6 w-full text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' }}
              >
                Check Driver Availability
              </button>
            </div>
          </div>

          {/* Right — Driver Profiles */}
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col">
            {/* Hero image */}
            <div className="h-48 relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Premium transportation"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(190,24,93,0.85) 0%, rgba(168,85,247,0.4) 60%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-4 left-5 text-white">
                <h3 className="text-lg font-bold">Driver Profiles</h3>
                <p className="text-xs text-pink-200">Choose based on ratings, language & location</p>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              {/* Search */}
              <div className="flex items-center gap-2 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-pink-400" />
                  <input
                    type="text"
                    placeholder="Search by name, language, or location"
                    className="w-full pl-9 pr-3 py-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="p-2.5 rounded-xl text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Driver list */}
              <div className="space-y-3 flex-1 max-h-64 overflow-y-auto pr-1">
                {filteredDrivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>

              <button
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors"
              >
                View All Drivers
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TransportationSection;