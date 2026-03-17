import { useState } from 'react';
import SearchWidget from './SearchWidget';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();

  const handleSearch = (searchParams: any) => {
    router.push(`/explore?destination=${encodeURIComponent(searchParams.destination)}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`);
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Beautiful travel destination"
          className="w-full h-full object-cover"
        />
        {/* Pink/purple gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(190,24,93,0.82) 0%, rgba(236,72,153,0.65) 45%, rgba(168,85,247,0.55) 100%)',
          }}
        />
      </div>

      {/* Wave divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 leading-none overflow-hidden">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60 C360 0, 1080 0, 1440 60 L1440 60 L0 60 Z" fill="#fff0f6" />
        </svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Your Personalized Travel Journey Begins Here
          </h1>
          <p className="text-lg md:text-xl text-pink-100 mb-8 leading-relaxed max-w-2xl drop-shadow">
            Plan, book, and experience your dream vacation with AI-powered itineraries and all-in-one booking.
          </p>
          <SearchWidget onSearch={handleSearch} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;