import React, { useState, useEffect } from 'react';

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('about-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const items = [
    {
      id: 1,
      title: 'Roasted Beans',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80',
      text: [
        'At Aroma Café, we believe in more than just serving coffee. Our mission is to create a warm, inviting space where the rich aroma of freshly roasted beans, aesthetic ambiance, and delicious pastries blend seamlessly to offer a daily and beautiful experience. We are passionate about providing quality coffee, exceptional service, and a welcoming atmosphere for those seeking comfort, creativity, and connection.',
        'Every cup of coffee is crafted with passion — using carefully selected beans roasted to perfection — while our pastries are baked fresh daily to complement every sip.'
      ]
    },
    {
      id: 2,
      title: 'Aesthetic Ambiance',
      image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=500&q=80',
      text: [
        'Our space isn\'t just about coffee; it\'s about experience. With warm lighting, inviting interiors, and a calm atmosphere our café has become a sanctuary for fitness fanatics, and remote workers alike.'
      ]
    },
    {
      id: 3,
      title: 'Delicious Pastries',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
      text: [
        'Whether you come for your morning brew, an afternoon treat, or simply to unwind you\'ll always find a welcoming feel and the comforting aroma of coffee waiting for you.'
      ]
    }
  ];

  return (
    <section id="about-section" className="bg-background py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-shadow {
          0%, 100% {
            box-shadow: 0 0 100px rgba(0, 0, 0, 0.28);
          }
          50% {
            box-shadow: 0 0 140px rgba(251, 146, 60, 0.4);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-pulse-shadow {
          animation: pulse-shadow 3s ease-in-out infinite;
        }

        .hover-glow:hover .image-container {
          box-shadow: 0 0 140px rgba(251, 146, 60, 0.5);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`font-ooohbaby italic text-[28px] sm:text-[44px] md:text-[60px] tracking-[0.08em] text-[#3b2f2f] opacity-90 mb-8 sm:mb-10 text-center lg:text-left transition-all duration-1000 ${
          isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          Our Story
        </h2>

        {/* First Row - Text + Roasted Beans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16 lg:mb-24">
          <div className={`lg:col-span-7 order-2 lg:order-1 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className={isVisible ? 'animate-fade-in-left' : 'opacity-0'} style={{ animationDelay: '200ms' }}>
              <p className="font-pop italic text-sm sm:text-base md:text-[17px] text-gray-700 leading-relaxed mb-4 sm:mb-5 font-light hover:text-gray-900 transition-colors duration-300">
                {items[0].text[0]}
              </p>
              <p className="font-pop italic text-sm sm:text-base md:text-[17px] text-gray-700 leading-relaxed font-light hover:text-gray-900 transition-colors duration-300">
                {items[0].text[1]}
              </p>
            </div>
          </div>
          <div className={`lg:col-span-5 flex justify-center order-1 lg:order-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '400ms' }}>
            <div 
              className={`text-center hover-glow ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}
              style={{ animationDelay: '400ms' }}
              onMouseEnter={() => setHoveredItem(1)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`image-container w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px] rounded-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.28)] mx-auto flex items-center justify-center transition-all duration-500 ${
                hoveredItem === 1 ? 'scale-110 animate-pulse-shadow' : 'scale-100'
              } ${isVisible ? 'animate-float' : ''}`}>
                <img
                  src={items[0].image}
                  alt="Roasted coffee beans"
                  className={`w-[88%] h-[88%] rounded-full object-cover transition-all duration-500 ${
                    hoveredItem === 1 ? 'scale-105 rotate-6' : 'scale-100 rotate-0'
                  }`}
                />
              </div>
              <p className={`text-sm font-pop sm:text-sm text-gray-700 mt-4 sm:mt-5 italic font-semibold transition-all duration-300 ${
                hoveredItem === 1 ? 'text-amber-700 scale-105' : ''
              }`}>
                {items[0].title}
              </p>
            </div>
          </div>
        </div>

        {/* Second Row - Aesthetic Ambiance + Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16 lg:mb-24">
          <div className={`lg:col-span-5 flex justify-center order-1 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '600ms' }}>
            <div 
              className={`text-center hover-glow ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}
              style={{ animationDelay: '600ms' }}
              onMouseEnter={() => setHoveredItem(2)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`image-container w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px] rounded-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.28)] mx-auto flex items-center justify-center transition-all duration-500 ${
                hoveredItem === 2 ? 'scale-110 animate-pulse-shadow' : 'scale-100'
              } ${isVisible ? 'animate-float' : ''}`} style={{ animationDelay: '1s' }}>
                <img
                  src={items[1].image}
                  alt="Aesthetic Ambiance"
                  className={`w-[88%] h-[88%] rounded-full object-cover transition-all duration-500 ${
                    hoveredItem === 2 ? 'scale-105 rotate-6' : 'scale-100 rotate-0'
                  }`}
                />
              </div>
              <p className={`text-sm font-pop sm:text-sm text-gray-700 mt-4 sm:mt-5 italic font-semibold transition-all duration-300 ${
                hoveredItem === 2 ? 'text-amber-700 scale-105' : ''
              }`}>
                {items[1].title}
              </p>
            </div>
          </div>
          <div className={`lg:col-span-7 order-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '800ms' }}>
            <div className={isVisible ? 'animate-fade-in-right' : 'opacity-0'} style={{ animationDelay: '800ms' }}>
              <p className="font-pop italic text-sm sm:text-base md:text-[17px] text-gray-700 leading-relaxed font-light hover:text-gray-900 transition-colors duration-300">
                {items[1].text[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Third Row - Text + Delicious Pastries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className={`lg:col-span-7 order-2 lg:order-1 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '1000ms' }}>
            <div className={isVisible ? 'animate-fade-in-left' : 'opacity-0'} style={{ animationDelay: '1000ms' }}>
              <p className="font-pop italic text-sm sm:text-base md:text-[17px] text-gray-700 leading-relaxed font-light hover:text-gray-900 transition-colors duration-300">
                {items[2].text[0]}
              </p>
            </div>
          </div>
          <div className={`lg:col-span-5 flex justify-center order-1 lg:order-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '1200ms' }}>
            <div 
              className={`text-center hover-glow ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}
              style={{ animationDelay: '1200ms' }}
              onMouseEnter={() => setHoveredItem(3)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`image-container w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px] rounded-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.28)] mx-auto flex items-center justify-center transition-all duration-500 ${
                hoveredItem === 3 ? 'scale-110 animate-pulse-shadow' : 'scale-100'
              } ${isVisible ? 'animate-float' : ''}`} style={{ animationDelay: '2s' }}>
                <img
                  src={items[2].image}
                  alt="Delicious Pastries"
                  className={`w-[88%] h-[88%] rounded-full object-cover transition-all duration-500 ${
                    hoveredItem === 3 ? 'scale-105 rotate-6' : 'scale-100 rotate-0'
                  }`}
                />
              </div>
              <p className={`text-sm font-pop sm:text-sm text-gray-700 mt-4 sm:mt-5 italic font-semibold transition-all duration-300 ${
                hoveredItem === 3 ? 'text-amber-700 scale-105' : ''
              }`}>
                {items[2].title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;