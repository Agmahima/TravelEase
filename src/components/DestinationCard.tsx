import { Destination } from '@/types';
import { useRouter } from 'next/navigation';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const router = useRouter();

  const handleExplore = () => {
    // navigate(`/explore?destination=${encodeURIComponent(destination.name)}`);
    router.push(`/explore?destination=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition group">
      <div className="relative h-60">
        <img 
          src={destination.imageUrl} 
          alt={`${destination.name}, ${destination.country}`}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {destination.badge && (
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-medium text-primary">
            {destination.badge}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">{destination.name}, {destination.country}</h3>
          <div className="flex items-center">
            <i className="fas fa-star text-accent text-sm mr-1"></i>
            <span className="text-sm font-medium">{destination.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{destination.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${destination.pricePerPerson}<span className="text-sm font-normal text-gray-500">/person</span></span>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
            onClick={handleExplore}
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
