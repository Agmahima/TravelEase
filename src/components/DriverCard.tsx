// import { Driver } from '@/types';
// import { Badge } from '@/components/ui/badge';

// interface DriverCardProps {
//   driver: Driver;
//   onSelect?: (driver: Driver) => void;
//   isSelected?: boolean; 
// }

// const DriverCard = ({ driver, onSelect }: DriverCardProps) => {
//   return (
//     <div 
//       className="border rounded-lg p-4 hover:border-primary cursor-pointer"
//       onClick={() => onSelect && onSelect(driver)}
//     >
//       <div className="flex">
//         <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
//           <img 
//             src={driver.image} 
//             alt={`${driver.name} profile photo`} 
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="ml-4 flex-grow">
//           <div className="flex justify-between">
//             <h4 className="font-semibold">{driver.name}</h4>
//             <div className="flex items-center">
//               <i className="fas fa-star text-accent text-sm"></i>
//               <span className="ml-1 text-sm font-medium">{driver.rating}</span>
//               <span className="text-gray-400 text-xs ml-1">({driver.reviewCount})</span>
//             </div>
//           </div>
//           <div className="text-sm text-gray-600 mt-1">
//             <p>{driver.location}</p>
//             <p>{driver.languages.join(', ')}</p>
//           </div>
//           <div className="flex mt-2 flex-wrap gap-1">
//             <Badge variant="outline" className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">
//               {driver.years}
//             </Badge>
//             <Badge variant="outline" className="text-xs bg-primary bg-opacity-10 px-2 py-1 rounded-full text-primary font-medium">
//               {driver.specialization}
//             </Badge>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverCard;

import { Driver } from '@/types';
import { Star } from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
  onSelect?: (driver: Driver) => void;
  isSelected?: boolean;
}

const gradientStyle = { background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' };

const DriverCard = ({ driver, onSelect, isSelected }: DriverCardProps) => {
  return (
    <div
      onClick={() => onSelect && onSelect(driver)}
      className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
      style={isSelected
        ? { borderColor: '#ec4899', background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }
        : { borderColor: '#fce7f3', background: '#fff' }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={driver.image}
          alt={driver.name}
          className="w-12 h-12 rounded-full object-cover border-2"
          style={{ borderColor: isSelected ? '#ec4899' : '#fce7f3' }}
        />
        {isSelected && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={gradientStyle}
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-bold text-pink-900 text-sm truncate">{driver.name}</h4>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-pink-700">{driver.rating}</span>
            <span className="text-xs text-pink-300">({driver.reviewCount})</span>
          </div>
        </div>
        <p className="text-xs text-pink-400 truncate mb-1">{driver.location}</p>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-lg">
            {driver.years}
          </span>
          <span
            className="text-xs text-white px-2 py-0.5 rounded-lg"
            style={gradientStyle}
          >
            {driver.specialization}
          </span>
          {driver.languages.slice(0, 2).map((lang) => (
            <span key={lang} className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-lg">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverCard;