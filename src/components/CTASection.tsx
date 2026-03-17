import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  { icon: 'fa-users', stat: '50,000+', label: 'Happy Travelers' },
  { icon: 'fa-map-marked-alt', stat: '100+', label: 'Destinations' },
  { icon: 'fa-star', stat: '4.8/5', label: 'Average Rating' },
];

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Original image kept */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Travel background"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(190,24,93,0.88) 0%, rgba(236,72,153,0.75) 50%, rgba(168,85,247,0.80) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-yellow-300 bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-5">
            🏰 Start Your Royal Journey
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your Journey?
          </h2>

          <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sign up today and get a personalized travel plan within minutes. Your next adventure is just a few clicks away.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="bg-yellow-300 text-pink-900 font-bold px-8 py-6 rounded-xl hover:bg-yellow-200 shadow-lg text-base">
                Create an Account
              </Button>
            </Link>
            <Link href="/trip-planner">
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white/60 text-white font-semibold px-8 py-6 rounded-xl hover:bg-white/10 text-base"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid sm:grid-cols-3 gap-8">
            {stats.map(({ icon, stat, label }) => (
              <div key={label} className="text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white/10 border border-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                  <i className={`fas ${icon} text-2xl text-yellow-300`}></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat}</h3>
                <p className="text-pink-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;