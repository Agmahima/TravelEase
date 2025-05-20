import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Search } from 'lucide-react';

interface SearchWidgetProps {
  onSearch: (searchParams: any) => void;
  minimal?: boolean;
}

const SearchWidget = ({ onSearch, minimal = false }: SearchWidgetProps) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  
  const handleSearch = () => {
    if (!destination || !checkIn || !checkOut) return;
    
    onSearch({
      destination,
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd')
    });
  };

  if (minimal) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <Button onClick={handleSearch} className="bg-primary hover:bg-opacity-90">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden p-1">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-secondary">Where would you like to go?</h2>
      </div>
      
      <div className="grid md:grid-cols-4 gap-2 p-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="City, country" 
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check in</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary relative text-left">
                <CalendarIcon className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                {checkIn ? format(checkIn, 'PPP') : <span className="text-gray-400">Select date</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check out</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary relative text-left">
                <CalendarIcon className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                {checkOut ? format(checkOut, 'PPP') : <span className="text-gray-400">Select date</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
                disabled={(date) => !checkIn || date < checkIn || date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2 flex items-end">
          <Button 
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center"
            onClick={handleSearch}
            disabled={!destination || !checkIn || !checkOut}
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Search</span>
          </Button>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center text-sm">
          <span className="text-primary font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            AI-powered suggestions
          </span>
        </div>
        <div className="flex items-center">
          <button className="text-sm text-gray-700 hover:text-primary transition">Advanced Options</button>
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;
