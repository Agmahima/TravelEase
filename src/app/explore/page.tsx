"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWidget from '@/components/SearchWidget';
import DestinationCard from '@/components/DestinationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Destination } from '@/types';
import { SearchIcon, X, Calendar, Users, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { BOOKING_API_URL } from '@/lib/config';

const gradientStyle = { background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' };
const gradientText = {
  background: 'linear-gradient(135deg, #be185d, #a855f7)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
};

const Explore = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const [searchParams, setSearchParams] = useState({
    destination: '', checkIn: '', checkOut: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams({
      destination: urlParams.get('destination') || '',
      checkIn: urlParams.get('checkIn') || '',
      checkOut: urlParams.get('checkOut') || '',
    });
  }, []);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('default');

  const { data: destinations, isLoading, error } = useQuery<Destination[]>({
    queryKey: ['destinations'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BOOKING_API_URL}/api/destinations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch destinations');
      return response.json();
    },
  });

  useEffect(() => {
    document.title = 'Explore Destinations - TravelEase';
  }, []);

  const handleSearch = (params: any) => setSearchParams(params);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setMinPrice(null);
    setMaxPrice(null);
  };

  const filteredDestinations = destinations?.filter((destination: Destination) => {
    const matchesSearch = searchParams.destination
      ? destination.name.toLowerCase().includes(searchParams.destination.toLowerCase()) ||
        destination.country.toLowerCase().includes(searchParams.destination.toLowerCase())
      : true;
    const matchesPrice =
      (minPrice === null || destination.pricePerPerson >= minPrice) &&
      (maxPrice === null || destination.pricePerPerson <= maxPrice);
    const matchesFilters =
      activeFilters.length === 0 ||
      (activeFilters.includes('Popular') && destination.badge === 'Most Popular') ||
      (activeFilters.includes('Hot Deal') && destination.badge === 'Hot Deal') ||
      (activeFilters.includes('Beach') && destination.description.toLowerCase().includes('beach')) ||
      (activeFilters.includes('Cultural') && destination.description.toLowerCase().includes('cultur'));
    return matchesSearch && matchesPrice && matchesFilters;
  })?.sort((a, b) => {
    if (sortBy === 'price-low') return a.pricePerPerson - b.pricePerPerson;
    if (sortBy === 'price-high') return b.pricePerPerson - a.pricePerPerson;
    if (sortBy === 'rated') return parseFloat(b.rating) - parseFloat(a.rating);
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #fdf4ff 100%)' }}>

        {/* Hero Search Section */}
        <section className="py-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-6">
              <span className="inline-block text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full mb-3">
                Discover India
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-1" style={gradientText}>
                Explore Destinations
              </h1>
              <p className="text-pink-800/60 text-sm">
                Find your perfect getaway from our curated collection
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="h-1 w-full" style={gradientStyle} />
              <div className="p-4">
                <SearchWidget onSearch={handleSearch} minimal />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Filters Sidebar */}
              <div className="w-full md:w-1/4">
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden sticky top-4">
                  <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="text-base font-bold text-pink-900">Filters</h2>
                      {(activeFilters.length > 0 || minPrice || maxPrice) && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-semibold text-pink-600 hover:text-purple-600 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Price Range
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-pink-400 mb-1 block">Min (₹)</label>
                          <input
                            type="number"
                            className="w-full p-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            placeholder="Min"
                            value={minPrice || ''}
                            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-pink-400 mb-1 block">Max (₹)</label>
                          <input
                            type="number"
                            className="w-full p-2 border border-pink-200 rounded-xl text-sm bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            placeholder="Max"
                            value={maxPrice || ''}
                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trip Type */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Trip Type
                      </h3>
                      <div className="space-y-2.5">
                        {['Popular', 'Hot Deal', 'Beach', 'Cultural', 'Adventure', 'Historical'].map((filter) => (
                          <label
                            key={filter}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                              style={activeFilters.includes(filter)
                                ? { borderColor: '#ec4899', background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                                : { borderColor: '#fce7f3' }}
                              onClick={() => handleFilterToggle(filter)}
                            >
                              {activeFilters.includes(filter) && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span
                              className="text-sm transition-colors"
                              style={{ color: activeFilters.includes(filter) ? '#be185d' : '#9d8fa0' }}
                              onClick={() => handleFilterToggle(filter)}
                            >
                              {filter}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Travel Dates */}
                    <div>
                      <h3 className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Travel Dates
                      </h3>
                      {searchParams.checkIn && searchParams.checkOut ? (
                        <div
                          className="flex justify-between items-center p-2.5 rounded-xl border border-pink-100 text-xs"
                          style={{ background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }}
                        >
                          <span className="text-pink-700 font-medium">
                            {searchParams.checkIn} → {searchParams.checkOut}
                          </span>
                          <button
                            onClick={() => setSearchParams({ ...searchParams, checkIn: '', checkOut: '' })}
                            className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors ml-2 flex-shrink-0"
                          >
                            <X className="h-3 w-3 text-pink-600" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-pink-300 italic">No dates selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="w-full md:w-3/4">

                {/* Active Filter Pills */}
                {(activeFilters.length > 0 || minPrice || maxPrice) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activeFilters.map(filter => (
                      <div
                        key={filter}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                        style={gradientStyle}
                      >
                        {filter}
                        <button onClick={() => handleFilterToggle(filter)} className="hover:opacity-70">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {(minPrice || maxPrice) && (
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                        style={gradientStyle}
                      >
                        {minPrice && maxPrice ? `₹${minPrice} - ₹${maxPrice}` :
                          minPrice ? `Min ₹${minPrice}` : `Max ₹${maxPrice}`}
                        <button onClick={() => { setMinPrice(null); setMaxPrice(null); }} className="hover:opacity-70">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Results Header */}
                <div className="mb-5 flex justify-between items-center">
                  <h2 className="text-lg font-bold" style={gradientText}>
                    {!isLoading &&
                      `${filteredDestinations?.length || 0} ${filteredDestinations?.length === 1 ? 'Destination' : 'Destinations'} Found`
                    }
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pink-400">Sort by:</span>
                    <select
                      className="p-2 border border-pink-200 rounded-xl text-xs bg-pink-50/50 text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rated">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
                        <Skeleton className="h-48 w-full" style={{ background: '#fce7f3' }} />
                        <div className="p-4">
                          <Skeleton className="h-5 w-2/3 mb-2" style={{ background: '#fce7f3' }} />
                          <Skeleton className="h-3 w-full mb-1" style={{ background: '#fce7f3' }} />
                          <Skeleton className="h-3 w-3/4 mb-4" style={{ background: '#fce7f3' }} />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-1/3" style={{ background: '#fce7f3' }} />
                            <Skeleton className="h-8 w-20 rounded-xl" style={{ background: '#fce7f3' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <X className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="font-bold text-red-700 mb-1">Failed to load destinations</h3>
                    <p className="text-sm text-red-400">Please try again later.</p>
                  </div>
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
                  <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}
                    >
                      <SearchIcon className="h-7 w-7 text-pink-300" />
                    </div>
                    <h3 className="text-lg font-bold text-pink-900 mb-2">No destinations found</h3>
                    <p className="text-sm text-pink-400 mb-5">Try adjusting your search or filter criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="text-white px-6 py-2.5 rounded-xl font-bold text-sm"
                      style={gradientStyle}
                    >
                      Clear Filters
                    </button>
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