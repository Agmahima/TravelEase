import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      checkOut: format(checkOut, 'yyyy-MM-dd'),
    });
  };

  if (minimal) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          />
        </div>
        <Button
          onClick={handleSearch}
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          className="text-white font-bold"
        >
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-pink-100">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-pink-100"
        style={{ background: 'linear-gradient(90deg, #fff0f6, #fdf4ff)' }}
      >
        <h2 className="text-lg font-semibold text-pink-900">Where would you like to go?</h2>
      </div>

      {/* Fields */}
      <div className="grid md:grid-cols-4 gap-3 p-5">
        {/* Destination */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-pink-400 h-4 w-4" />
            <input
              type="text"
              placeholder="City"
              className="w-full pl-10 pr-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-sm bg-pink-50/50"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        {/* Check In */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide">
            Check in
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center pl-10 pr-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 relative text-left text-sm bg-pink-50/50">
                <CalendarIcon className="absolute left-3 top-3 text-pink-400 h-4 w-4" />
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

        {/* Check Out */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wide">
            Check out
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center pl-10 pr-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 relative text-left text-sm bg-pink-50/50">
                <CalendarIcon className="absolute left-3 top-3 text-pink-400 h-4 w-4" />
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

        {/* Search Button */}
        <div className="space-y-1 flex items-end">
          <Button
            className="w-full text-white py-2 px-4 rounded-xl transition flex items-center justify-center font-bold shadow-md"
            style={{ background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' }}
            onClick={handleSearch}
            disabled={!destination || !checkIn || !checkOut}
          >
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, #fff0f6, #fdf4ff)' }}
      >
        <span className="text-pink-600 text-sm font-medium flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          AI-powered suggestions
        </span>
        <button className="text-sm text-pink-700 hover:text-purple-700 transition font-medium">
          Advanced Options
        </button>
      </div>
    </div>
  );
};

export default SearchWidget;