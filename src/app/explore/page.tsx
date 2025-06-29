"use client";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWidget from '@/components/SearchWidget';
import DestinationCard from '@/components/DestinationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Destination } from '@/types';
import { SearchIcon, X, Calendar, Users, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const Explore = () => {

    const { user, isLoading: authLoading } = useAuth();
      const router = useRouter();
      
      // Redirect to login if not authenticated
      useEffect(() => {
        if (!authLoading && !user) {
          router.push('/login');
        }
      }, [user, authLoading, router]);
//   const urlParams = new URLSearchParams(window.location.search);
//   const initialDestination = urlParams.get('destination') || '';
//   const initialCheckIn = urlParams.get('checkIn') || '';
//   const initialCheckOut = urlParams.get('checkOut') || '';
  
//   const [searchParams, setSearchParams] = useState({
//     destination: initialDestination,
//     checkIn: initialCheckIn,
//     checkOut: initialCheckOut,
//   });
const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
  });
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialDestination = urlParams.get('destination') || '';
    const initialCheckIn = urlParams.get('checkIn') || '';
    const initialCheckOut = urlParams.get('checkOut') || '';

    setSearchParams({
      destination: initialDestination,
      checkIn: initialCheckIn,
      checkOut: initialCheckOut,
    });
  }, []);
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  
  const { data: destinations, isLoading, error } = useQuery<Destination[]>({
    queryKey: ['http://localhost:5000/api/destinations'],
  });
  
  useEffect(() => {
    document.title = 'Explore Destinations - TravelEase';
    
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
  }, []);
  
  const handleSearch = (params: any) => {
    setSearchParams(params);
  };
  
  const handleFilterToggle = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const clearFilters = () => {
    setActiveFilters([]);
    setMinPrice(null);
    setMaxPrice(null);
  };
  
  // Filter destinations based on search and filters
  const filteredDestinations = destinations?.filter((destination: Destination) => {
    // Search by destination name or country
    const matchesSearch = searchParams.destination 
      ? (destination.name.toLowerCase().includes(searchParams.destination.toLowerCase()) || 
         destination.country.toLowerCase().includes(searchParams.destination.toLowerCase()))
      : true;
    
    // Filter by price
    const matchesPrice = (minPrice === null || destination.pricePerPerson >= minPrice) && 
                         (maxPrice === null || destination.pricePerPerson <= maxPrice);
    
    // Filter by other active filters (simplified for demo)
    // In a real app, you would have more complex filtering logic based on destination attributes
    const matchesFilters = activeFilters.length === 0 || 
      (activeFilters.includes('Popular') && destination.badge === 'Most Popular') ||
      (activeFilters.includes('Hot Deal') && destination.badge === 'Hot Deal') ||
      (activeFilters.includes('Beach') && destination.description.toLowerCase().includes('beach')) ||
      (activeFilters.includes('Cultural') && destination.description.toLowerCase().includes('cultur'));
    
    return matchesSearch && matchesPrice && matchesFilters;
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Search Section */}
        <section className="bg-primary bg-opacity-10 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Explore Destinations</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <SearchWidget onSearch={handleSearch} minimal />
            </div>
          </div>
        </section>
        
        {/* Filters and Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="w-full md:w-1/4">
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    {(activeFilters.length > 0 || minPrice || maxPrice) && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-primary">
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Price Range
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm text-gray-500">Min ($)</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded mt-1"
                          placeholder="Min"
                          value={minPrice || ''}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Max ($)</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded mt-1"
                          placeholder="Max"
                          value={maxPrice || ''}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Trip Type */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Trip Type
                    </h3>
                    <div className="space-y-2">
                      {['Popular', 'Hot Deal', 'Beach', 'Cultural', 'Adventure', 'Historical'].map((filter) => (
                        <div key={filter} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`filter-${filter}`}
                            checked={activeFilters.includes(filter)}
                            onChange={() => handleFilterToggle(filter)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`filter-${filter}`} className="ml-2 text-sm text-gray-700">
                            {filter}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Travel Dates */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Travel Dates
                    </h3>
                    <div className="text-sm text-gray-600">
                      {searchParams.checkIn && searchParams.checkOut ? (
                        <div className="flex justify-between items-center">
                          <span>{searchParams.checkIn} - {searchParams.checkOut}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSearchParams({...searchParams, checkIn: '', checkOut: ''})}
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No dates selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Results */}
              <div className="w-full md:w-3/4">
                {/* Active Filters */}
                {(activeFilters.length > 0 || minPrice || maxPrice) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activeFilters.map(filter => (
                      <div key={filter} className="bg-primary bg-opacity-10 text-primary text-sm px-3 py-1 rounded-full flex items-center">
                        {filter}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterToggle(filter)}
                          className="h-5 w-5 p-0 ml-1 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(minPrice || maxPrice) && (
                      <div className="bg-primary bg-opacity-10 text-primary text-sm px-3 py-1 rounded-full flex items-center">
                        {minPrice && maxPrice ? `$${minPrice} - $${maxPrice}` : 
                         minPrice ? `Min $${minPrice}` : `Max $${maxPrice}`}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {setMinPrice(null); setMaxPrice(null);}}
                          className="h-5 w-5 p-0 ml-1 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {!isLoading && 
                      `${filteredDestinations?.length || 0} ${filteredDestinations?.length === 1 ? 'Destination' : 'Destinations'} Found`
                    }
                  </h2>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                    <select className="p-2 border rounded text-sm">
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Top Rated</option>
                      <option>Most Popular</option>
                    </select>
                  </div>
                </div>
                
                {/* Results Grid */}
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md">
                        <Skeleton className="h-60 w-full" />
                        <div className="p-5">
                          <Skeleton className="h-8 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load destinations. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : (filteredDestinations?.length ?? 0) > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(filteredDestinations ?? []).map((destination: Destination) => (
                      <DestinationCard
                        key={destination.id}
                        destination={destination}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    <Button 
                      onClick={clearFilters} 
                      className="mt-4 bg-primary"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
