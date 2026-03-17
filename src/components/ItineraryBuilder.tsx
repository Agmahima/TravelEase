import { useState } from 'react';
import Link from 'next/link';
import ItineraryDay from './ItineraryDay';
import { sampleItinerary } from '@/lib/mockData';

interface ItineraryBuilderProps {
  itinerary?: typeof sampleItinerary;
}

const steps = [
  {
    title: "Enter Your Travel Details",
    desc: "Tell us where you want to go, your travel dates, and what you enjoy.",
    icon: "🗺️",
  },
  {
    title: "Review AI Suggestions",
    desc: "Get personalized itineraries with activities, accommodations, and transport.",
    icon: "🤖",
  },
  {
    title: "Customize Your Trip",
    desc: "Fine-tune your itinerary by adding, removing, or rearranging activities.",
    icon: "✏️",
  },
  {
    title: "Book Everything in One Go",
    desc: "Secure all your reservations with our one-click booking system.",
    icon: "🎯",
  },
];

const ItineraryBuilder = ({ itinerary = sampleItinerary }: ItineraryBuilderProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #fdf4ff 0%, #fff0f6 100%)' }}
    >
      {/* Decorative blob */}
      <div
        className="absolute right-0 top-0 w-1/3 h-full -skew-x-12 transform opacity-40"
        style={{ background: 'linear-gradient(180deg, #fce7f3, #ede9fe)' }}
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full mb-3">
            AI Itinerary Planner
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #be185d, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Build Your Dream Trip
          </h2>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            Our AI-powered itinerary planner creates personalized travel experiences based on your interests and preferences.
          </p>
        </div>

        {/* Two columns */}
        <div className="flex flex-col md:flex-row gap-8 md:items-stretch">

          {/* Left — Steps Card */}
          <div className="md:w-1/2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col flex-1">
              {/* Top gradient bar */}
              <div
                className="h-1 w-full flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
              />

              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-pink-900 mb-2">How It Works</h3>
                <p className="text-sm text-pink-800/50 mb-8">
                  Four simple steps to your perfect Rajasthan adventure.
                </p>

                <div className="space-y-0 flex-1">
                  {steps.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div
                          className="absolute left-[22px] top-[42px] w-0.5 h-[calc(100%-16px)]"
                          style={{
                            background: 'linear-gradient(180deg, #f9a8d4, #e9d5ff)',
                          }}
                        />
                      )}

                      <div className="flex items-start gap-4 pb-7">
                        {/* Step number circle */}
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md z-10"
                          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                        >
                          {index + 1}
                        </div>

                        {/* Content card */}
                        <div
                          className="flex-1 rounded-xl p-4 border border-pink-100"
                          style={{ background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{step.icon}</span>
                            <h4 className="font-bold text-pink-900 text-sm">{step.title}</h4>
                          </div>
                          <p className="text-xs text-pink-800/60 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Try It Now button at bottom */}
                <Link href="/trip-planner" className="mt-2">
                  <button
                    className="w-full text-white py-3.5 px-8 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #be185d, #ec4899, #a855f7)' }}
                  >
                    Try It Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Itinerary Preview */}
          <div className="md:w-1/2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col flex-1">
              {/* Top gradient bar */}
              <div
                className="h-1 w-full flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7)' }}
              />

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-pink-900 mb-5">
                  Your {itinerary.days.length}-Day Trip to{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #be185d, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {itinerary.destination}
                  </span>
                </h3>

                {/* Day Tabs */}
                <div className="overflow-x-auto scrollbar-hide mb-5">
                  <div className="flex space-x-3 pb-1">
                    {itinerary.days.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDayIndex(day.day)}
                        className="flex-shrink-0 w-20 text-center px-2 py-3 rounded-xl transition-all duration-200 text-sm font-semibold"
                        style={
                          selectedDayIndex === day.day
                            ? {
                                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                                color: '#fff',
                              }
                            : {
                                background: '#fdf2f8',
                                color: '#be185d',
                              }
                        }
                      >
                        <div className="font-bold">Day {day.day}</div>
                        <div className="text-xs opacity-80">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itinerary Day Content */}
                <div className="flex-1 overflow-y-auto">
                  <ItineraryDay
                    day={
                      itinerary.days.find((day) => day.day === selectedDayIndex) ||
                      itinerary.days[0]
                    }
                  />
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-between gap-3 flex-shrink-0">
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors">
                    Modify Itinerary
                  </button>
                  <button
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                  >
                    Plan This Trip
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ItineraryBuilder;