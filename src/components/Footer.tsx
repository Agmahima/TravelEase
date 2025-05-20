import { Link } from 'wouter';
import { Globe, Facebook, Twitter, Instagram, PinOff } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="text-primary text-2xl" />
              <span className="text-2xl font-bold text-secondary">TravelEase</span>
            </div>
            <p className="text-gray-600 mb-6">Your all-in-one travel planning and booking platform powered by AI.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <PinOff size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span className="text-gray-600 hover:text-primary cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/explore">
                  <span className="text-gray-600 hover:text-primary cursor-pointer">Destinations</span>
                </Link>
              </li>
              <li>
                <Link href="/trip-planner">
                  <span className="text-gray-600 hover:text-primary cursor-pointer">How It Works</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Contact</a>
              </li>
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
              <a href="#" className="text-gray-500 text-sm hover:text-primary">Privacy Policy</a>
              <a href="#" className="text-gray-500 text-sm hover:text-primary">Terms of Service</a>
              <a href="#" className="text-gray-500 text-sm hover:text-primary">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
