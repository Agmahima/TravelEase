import { Driver } from '@/types';
import { Badge } from '@/components/ui/badge';

interface DriverCardProps {
  driver: Driver;
  onSelect?: (driver: Driver) => void;
}

const DriverCard = ({ driver, onSelect }: DriverCardProps) => {
  return (
    <div 
      className="border rounded-lg p-4 hover:border-primary cursor-pointer"
      onClick={() => onSelect && onSelect(driver)}
    >
      <div className="flex">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={driver.image} 
            alt={`${driver.name} profile photo`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between">
            <h4 className="font-semibold">{driver.name}</h4>
            <div className="flex items-center">
              <i className="fas fa-star text-accent text-sm"></i>
              <span className="ml-1 text-sm font-medium">{driver.rating}</span>
              <span className="text-gray-400 text-xs ml-1">({driver.reviewCount})</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <p>{driver.location}</p>
            <p>{driver.languages.join(', ')}</p>
          </div>
          <div className="flex mt-2 flex-wrap gap-1">
            <Badge variant="outline" className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">
              {driver.years}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary bg-opacity-10 px-2 py-1 rounded-full text-primary font-medium">
              {driver.specialization}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
