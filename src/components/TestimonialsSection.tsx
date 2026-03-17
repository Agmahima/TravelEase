import { testimonials } from '@/lib/mockData';

const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fas fa-${
              i < fullStars
                ? 'star'
                : i === fullStars && hasHalfStar
                ? 'star-half-alt'
                : 'star'
            }`}
            style={{
              color: i < fullStars || (i === fullStars && hasHalfStar)
                ? '#f59e0b'
                : '#e5e7eb',
              fontSize: '13px',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <section
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #fdf4ff 0%, #fff0f6 100%)' }}
    >
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #be185d, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Our Travelers Say
          </h2>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            Real experiences from people who've used our platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-pink-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    index % 3 === 0
                      ? 'linear-gradient(90deg, #ec4899, #f472b6)'
                      : index % 3 === 1
                      ? 'linear-gradient(90deg, #a855f7, #c084fc)'
                      : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                }}
              />

              {/* Quote icon */}
              <div
                className="text-4xl font-serif leading-none mb-3 mt-2"
                style={{ color: '#f9a8d4' }}
              >
                "
              </div>

              {/* Stars */}
              <div className="mb-3">{renderStars(testimonial.rating)}</div>

              {/* Text */}
              <p className="text-pink-900/70 mb-6 leading-relaxed text-sm">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-pink-200">
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.name} profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-pink-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-pink-400">{testimonial.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;