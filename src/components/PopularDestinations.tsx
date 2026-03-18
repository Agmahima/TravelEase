import { useQuery } from '@tanstack/react-query';
import DestinationCard from './DestinationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BOOKING_API_URL } from '@/lib/config';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const PopularDestinations = () => {
  const { data: destinations, isLoading, error } = useQuery<Array<{ id: string; [key: string]: any }>>({
    queryKey: ['destinations'],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${BOOKING_API_URL}/api/destinations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch destinations");
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    return (
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #fdf4ff 0%, #fff0f6 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #be185d, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Error Loading Destinations
          </h2>
          <p className="text-pink-500">Failed to load destinations. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #fdf4ff 0%, #fff0f6 100%)' }}
    >
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #be185d, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Popular Destinations
            </h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-purple-600 transition-colors group"
          >
            View all
            <span className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </span>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm"
              >
                <Skeleton className="h-60 w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-2/3 mb-3" style={{ background: '#fce7f3' }} />
                  <Skeleton className="h-4 w-full mb-2" style={{ background: '#fce7f3' }} />
                  <Skeleton className="h-4 w-3/4 mb-4" style={{ background: '#fce7f3' }} />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3" style={{ background: '#fce7f3' }} />
                    <Skeleton className="h-9 w-24 rounded-xl" style={{ background: '#fce7f3' }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            destinations?.slice(0, 3).map((destination: any) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default PopularDestinations;