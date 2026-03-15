"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Globe, Facebook, Twitter, Instagram, PinOff, X } from 'lucide-react';

// Modal content definitions
const modalContent: Record<string, { title: string; content: React.ReactNode }> = {
  about: {
    title: "About Us",
    content: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>
          TravelEase is your all-in-one AI-powered travel planning and booking platform. We help travelers plan, organize, and book their dream trips with ease.
        </p>
        <p>
          Our mission is to make travel planning effortless by combining the power of artificial intelligence with real-time booking capabilities — from flights and hotels to local transportation and curated itineraries.
        </p>
        <p>
          Founded with a passion for exploration, TravelEase brings together technology and travel expertise to create personalized experiences for every type of traveler.
        </p>
        <p>
          Whether you're planning a weekend getaway or a month-long adventure, TravelEase is here to make every journey memorable.
        </p>
      </div>
    ),
  },
  howItWorks: {
    title: "How It Works",
    content: (
      <div className="space-y-6 text-sm">
        {[
          { step: "1", title: "Plan Your Trip", desc: "Enter your destination, travel dates, and preferences. Our AI generates a personalized itinerary tailored to your interests and budget." },
          { step: "2", title: "Review Your Itinerary", desc: "Browse your AI-generated day-by-day itinerary. Customize activities, swap suggestions, and fine-tune your travel plans." },
          { step: "3", title: "Book Everything", desc: "Book flights, hotels, and local transport all in one place. No need to switch between multiple platforms." },
          { step: "4", title: "Travel & Enjoy", desc: "Head off on your trip with everything organized. Access your booking details anytime from your dashboard." },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {step}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: March 2026</p>
        <p>TravelEase is committed to protecting your personal information and your right to privacy.</p>
        <h4 className="font-semibold text-gray-900">Information We Collect</h4>
        <p>We collect information you provide directly to us, such as your name, email address, and travel preferences when you create an account or make a booking.</p>
        <h4 className="font-semibold text-gray-900">How We Use Your Information</h4>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you updates, and personalize your experience.</p>
        <h4 className="font-semibold text-gray-900">Data Security</h4>
        <p>We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
        <h4 className="font-semibold text-gray-900">Contact Us</h4>
        <p>If you have questions about this Privacy Policy, please contact us at privacy@travelease.com.</p>
        <p className="text-xs text-gray-400 italic">This is a placeholder policy. A full legal privacy policy will be added in a future update.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    content: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: March 2026</p>
        <p>By using TravelEase, you agree to these Terms of Service. Please read them carefully.</p>
        <h4 className="font-semibold text-gray-900">Use of Service</h4>
        <p>TravelEase provides an AI-powered travel planning and booking platform. You agree to use our services only for lawful purposes and in accordance with these terms.</p>
        <h4 className="font-semibold text-gray-900">User Accounts</h4>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <h4 className="font-semibold text-gray-900">Bookings & Payments</h4>
        <p>All bookings made through TravelEase are subject to the terms and conditions of the respective service providers. Prices and availability are subject to change.</p>
        <h4 className="font-semibold text-gray-900">Limitation of Liability</h4>
        <p>TravelEase shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
        <p className="text-xs text-gray-400 italic">This is a placeholder policy. Full legal terms will be added in a future update.</p>
      </div>
    ),
  },
  cookie: {
    title: "Cookie Policy",
    content: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p className="text-xs text-gray-400">Last updated: March 2026</p>
        <p>TravelEase uses cookies and similar tracking technologies to enhance your experience on our platform.</p>
        <h4 className="font-semibold text-gray-900">What Are Cookies</h4>
        <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve our services.</p>
        <h4 className="font-semibold text-gray-900">Types of Cookies We Use</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Essential cookies:</strong> Required for the platform to function correctly.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how users interact with our platform.</li>
          <li><strong>Preference cookies:</strong> Remember your settings and preferences.</li>
        </ul>
        <h4 className="font-semibold text-gray-900">Managing Cookies</h4>
        <p>You can control and manage cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our platform.</p>
        <p className="text-xs text-gray-400 italic">This is a placeholder policy. A full cookie policy will be added in a future update.</p>
      </div>
    ),
  },
};

type ModalKey = keyof typeof modalContent;

const Footer = () => {
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

  const openModal = (key: ModalKey) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="bg-white pt-16 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Globe className="text-primary text-2xl" />
                <span className="text-2xl font-bold text-black">TravelEase</span>
              </div>
              <p className="text-gray-600 mb-6">Your all-in-one travel planning and booking platform powered by AI.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary"><Facebook size={18} /></a>
                <a href="#" className="text-gray-400 hover:text-primary"><Twitter size={18} /></a>
                <a href="#" className="text-gray-400 hover:text-primary"><Instagram size={18} /></a>
                <a href="#" className="text-gray-400 hover:text-primary"><PinOff size={18} /></a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/"><span className="text-gray-600 hover:text-primary cursor-pointer">Home</span></Link></li>
                <li><Link href="/explore"><span className="text-gray-600 hover:text-primary cursor-pointer">Destinations</span></Link></li>
                <li>
                  <button onClick={() => openModal('howItWorks')} className="text-gray-600 hover:text-primary text-left">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('about')} className="text-gray-600 hover:text-primary text-left">
                    About Us
                  </button>
                </li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-primary">Travel Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Destination Guides</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Travel Tips</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">FAQs</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Support Center</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
              <p className="text-gray-600 mb-4">Subscribe to get travel tips and exclusive offers.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow border rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-opacity-90">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} TravelEase. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button onClick={() => openModal('privacy')} className="text-gray-500 text-sm hover:text-primary">
                  Privacy Policy
                </button>
                <button onClick={() => openModal('terms')} className="text-gray-500 text-sm hover:text-primary">
                  Terms of Service
                </button>
                <button onClick={() => openModal('cookie')} className="text-gray-500 text-sm hover:text-primary">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {modalContent[activeModal].title}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 overflow-y-auto">
              {modalContent[activeModal].content}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t">
              <button
                onClick={closeModal}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;