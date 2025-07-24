// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to /dashboard when the root route is accessed
//     router.push("/dashboard");
//   }, [router]);

//   return null; // Nothing will be rendered because of the redirect
// }
"use client";

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PopularDestinations from '@/components/PopularDestinations';
import ItineraryBuilder from '@/components/ItineraryBuilder';
import TransportationSection from '@/components/TransportationSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import 'leaflet/dist/leaflet.css';


export default function Home() {
  useEffect(() => {
    document.title = 'TravelEase - Your All-in-One Travel Companion';

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
    script.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <PopularDestinations />
        <ItineraryBuilder />
        <TransportationSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
