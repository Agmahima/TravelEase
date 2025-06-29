import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const CTASection = () => {
  return (
    <section className="py-16 bg-secondary text-white relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Travel background" 
          className="w-full h-full object-cover opacity-100"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-10 opacity-90">Sign up today and get a personalized travel plan within minutes. Your next adventure is just a few clicks away.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="bg-white text-black font-medium px-8 py-6 rounded-lg hover:bg-opacity-90 transition">
                Create an Account
              </Button>
            </Link>
            <Link href="/trip-planner">
              <Button variant="outline" className="bg-transparent border-2 border-white text-white font-medium px-8 py-6 rounded-lg hover:bg-white hover:bg-opacity-10 transition">
                See How It Works
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white bg-opacity-10 rounded-full mb-4">
                <i className="fas fa-users text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">50,000+</h3>
              <p className="opacity-80">Happy Travelers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white bg-opacity-10 rounded-full mb-4">
                <i className="fas fa-map-marked-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">100+</h3>
              <p className="opacity-80">Destinations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white bg-opacity-10 rounded-full mb-4">
                <i className="fas fa-star text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">4.8/5</h3>
              <p className="opacity-80">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
