import { useState } from 'react';
import SearchWidget from './SearchWidget';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  
  const handleSearch = (searchParams: any) => {
    // Navigate to explore page with search parameters
    // navigate(`/explore?destination=${encodeURIComponent(searchParams.destination)}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`);
    router.push(`/explore?destination=${encodeURIComponent(searchParams.destination)}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`);
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center bg-secondary bg-opacity-80">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Beautiful travel destination" 
          className="w-full h-full object-cover opacity-100"
        />
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Your Personalized Travel Journey Begins Here</h1>
          <p className="text-lg md:text-xl text-white mb-8">Plan, book, and experience your dream vacation with AI-powered itineraries and all-in-one booking.</p>
          
          <SearchWidget onSearch={handleSearch} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
