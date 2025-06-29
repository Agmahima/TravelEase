import { features } from '@/lib/mockData';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose TravelEase?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">One platform for all your travel needs with AI-powered personalization.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-4">
                <i className={`fas fa-${feature.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
