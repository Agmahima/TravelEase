import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles, faTicket, faCar } from '@fortawesome/free-solid-svg-icons';

const features = [
  {
    title: "AI Itinerary Planning",
    description: "Personalized travel plans created based on your preferences and travel style.",
    icon: faMagicWandSparkles,
    bg: 'bg-pink-100',
    color: 'text-pink-600',
  },
  {
    title: "All-in-One Booking",
    description: "Book flights, hotels, cabs, and activities—all from a single platform.",
    icon: faTicket,
    bg: 'bg-purple-100',
    color: 'text-purple-600',
  },
  {
    title: "Pre-booked Transportation",
    description: "Secure reliable drivers in advance for your entire trip duration.",
    icon: faCar,
    bg: 'bg-rose-100',
    color: 'text-rose-600',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #fdf4ff 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #be185d, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose TravelEase?
          </h2>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            One platform for all your Jaipur travel needs — with AI-powered personalization and seamless bookings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-white border border-pink-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: index === 0
                    ? 'linear-gradient(90deg, #ec4899, #f472b6)'
                    : index === 1
                    ? 'linear-gradient(90deg, #a855f7, #c084fc)'
                    : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                }}
              />
              <div className={`w-16 h-16 mx-auto flex items-center justify-center ${feature.bg} rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <FontAwesomeIcon icon={feature.icon} className={`text-2xl ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pink-900">{feature.title}</h3>
              <p className="text-pink-800/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;