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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Transportation Made Easy</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Book drivers for your entire trip duration or arrange individual transfers.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Reserve Your Dedicated Driver</h3>
              <p className="text-gray-600 mb-6">Have the same driver throughout your entire trip for a seamless experience.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal relative pl-10"
                          >
                            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            {tripStartDate ? format(tripStartDate, "PPP") : <span className="text-gray-400">Start date</span>}
                          </Button>
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
                    </div>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal relative pl-10"
                          >
                            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            {tripEndDate ? format(tripEndDate, "PPP") : <span className="text-gray-400">End date</span>}
                          </Button>
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {vehicleTypes.map((vehicle, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-3 cursor-pointer hover:border-primary text-center ${selectedVehicleType === vehicle.type ? 'border-primary bg-primary bg-opacity-5' : ''}`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Level</label>
                  <div className="grid grid-cols-2 gap-4">
                    {serviceTypes.map((service, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedServiceLevel === service.name ? 'border-primary bg-primary bg-opacity-5' : ''}`}
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
              
              <Button className="mt-6 w-full bg-primary text-white py-6 rounded-lg hover:bg-opacity-90 transition font-medium">
                Check Driver Availability
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
                
                <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
                  {filteredDrivers.map((driver) => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
                
                <Button variant="outline" className="mt-6 w-full border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition font-medium">
                  View All Drivers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransportationSection;
