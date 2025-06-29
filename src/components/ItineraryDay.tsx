import { useState } from 'react';
import { Activity, ItineraryDay as IItineraryDay } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin } from 'lucide-react';

interface ItineraryDayProps {
  day: IItineraryDay;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activity: Activity) => void;
}

const ItineraryDay = ({ day, onEditActivity, onDeleteActivity }: ItineraryDayProps) => {
  const getBorderColor = (category: string) => {
    switch (category) {
      case 'morning':
        return 'border-blue-400';
      case 'lunch':
        return 'border-yellow-400';
      case 'afternoon':
        return 'border-blue-400';
      case 'evening':
        return 'border-yellow-400';
      default:
        return 'border-gray-300';
    }
  };

  const getTimeColor = (category: string) => {
    switch (category) {
      case 'morning':
      case 'afternoon':
        return 'text-blue-500';
      case 'lunch':
        return 'text-yellow-500';
      case 'evening':
        return 'text-yellow-500';
      default:
        return 'text-black-500';
    }
  };
  
  return (
    <div className="space-y-4 mt-4 max-h-96 overflow-y-auto scrollbar-hide">
      {day.activities.map((activity, index) => (
        <div key={index} className={`border-l-4 ${getBorderColor(activity.category)} pl-4 py-2`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-semibold ${getTimeColor(activity.category)}`}>{activity.time}</span>
              <h4 className="font-semibold text-lg">{activity.title}</h4>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
            {(onEditActivity || onDeleteActivity) && (
              <div className="flex space-x-2">
                {onEditActivity && (
                  <button 
                    className="text-gray-400 hover:text-primary"
                    onClick={() => onEditActivity(activity)}
                  >
                    <Edit size={16} />
                  </button>
                )}
                {onDeleteActivity && (
                  <button 
                    className="text-gray-400 hover:text-danger"
                    onClick={() => onDeleteActivity(activity)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center text-sm">
            <MapPin className="text-gray-400 mr-1" size={14} />
            <span className="text-gray-600">{activity.location}</span>
          </div>
          <div className="mt-2 text-xs">
            {activity.booked ? (
              <Badge variant="outline" className="bg-white bg-opacity-10 text-black">Booked</Badge>
            ) : (
              <Badge variant="outline" className="bg-white bg-opacity-10 text-black">Not booked</Badge>
            )}
            <Badge variant="outline" className="bg-gray-100 text-gray-600 ml-2">{activity.cost}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryDay;
