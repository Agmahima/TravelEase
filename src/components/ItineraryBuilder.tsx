import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import ItineraryDay from './ItineraryDay';
import { sampleItinerary } from '@/lib/mockData';

interface ItineraryBuilderProps {
  itinerary?: typeof sampleItinerary;
}

const ItineraryBuilder = ({ itinerary = sampleItinerary }: ItineraryBuilderProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 transform"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-6">Build Your Dream Trip</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our AI-powered itinerary planner creates personalized travel experiences based on your interests and preferences.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl mb-2">Enter Your Travel Details</h3>
                  <p className="text-gray-600">Tell us where you want to go, your travel dates, and what you enjoy.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl mb-2">Review AI Suggestions</h3>
                  <p className="text-gray-600">Get personalized itineraries with activities, accommodations, and transport.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl mb-2">Customize Your Trip</h3>
                  <p className="text-gray-600">Fine-tune your itinerary by adding, removing, or rearranging activities.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">4</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl mb-2">Book Everything in One Go</h3>
                  <p className="text-gray-600">Secure all your reservations with our one-click booking system.</p>
                </div>
              </div>
            </div>
            
            <Link href="/trip-planner">
              <Button className="mt-8 bg-primary text-white py-6 px-6 rounded-lg hover:bg-opacity-90 transition font-medium flex items-center">
                Try It Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </Link>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-secondary">Your {itinerary.days.length}-Day Trip to {itinerary.destination}</h3>
              
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-4">
                  {itinerary.days.map((day, index) => (
                    <div key={index} className="flex-shrink-0 w-20 text-center cursor-pointer" onClick={() => setSelectedDayIndex(day.day)}>
                      <div className={`${selectedDayIndex === day.day ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-primary hover:text-white'} px-2 py-3 rounded-lg transition`}>
                        <div className="font-bold">Day {day.day}</div>
                        <div className="text-xs">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <ItineraryDay 
                day={itinerary.days.find(day => day.day === selectedDayIndex) || itinerary.days[0]} 
              />
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Modify Itinerary
                </Button>
                <Button className="bg-primary text-white hover:bg-opacity-90">
                  Book Activities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryBuilder;
