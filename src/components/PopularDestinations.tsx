import { useQuery } from '@tanstack/react-query';
import DestinationCard from './DestinationCard';
import { Skeleton } from '@/components/ui/skeleton';

const PopularDestinations = () => {
  const { data: destinations, isLoading, error } = useQuery<Array<{ id: string; [key: string]: any }>>({
    queryKey: ['http://localhost:5000/api/destinations'],
  });

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Error Loading Destinations</h2>
            <p className="text-red-500">Failed to load destinations. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Popular Destinations</h2>
          <a href="/explore" className="text-primary font-medium hover:underline">
            View all <i className="fas fa-arrow-right ml-1"></i>
          </a>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
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
