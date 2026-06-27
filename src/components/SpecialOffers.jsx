import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Coffee, Sparkles } from 'lucide-react';

const offers = [
  {
    id: 1,
    icon: Gift,
    title: 'Buy 2, Get 1 Free',
    description: 'Order any 2 pastries and get the 3rd one on us! Valid all week.',
    gradient: 'from-amber-700 via-amber-600 to-yellow-700',
    badge: 'Popular',
  },
  {
    id: 2,
    icon: Coffee,
    title: '20% Off First Order',
    description: 'New here? Enjoy 20% off your very first order. Welcome to the family!',
    gradient: 'from-stone-800 via-stone-700 to-stone-800',
    badge: 'New Customer',
  },
  {
    id: 3,
    icon: Sparkles,
    title: 'Free Upsize Weekends',
    description: 'Every Saturday & Sunday, upgrade your coffee size for free. Cheers!',
    gradient: 'from-orange-800 via-orange-700 to-amber-800',
    badge: 'Weekend',
  },
];

export default function SpecialOffers() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-[#EDD6C0] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          <p className="text-amber-700 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Limited Time Only</p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-wide">
            Special Offers
          </h2>
          <div className="w-16 h-1 bg-amber-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, idx) => {
            const IconComponent = offer.icon;
            return (
              <div
                key={offer.id}
                className={`relative bg-gradient-to-br ${offer.gradient} rounded-2xl p-8 overflow-hidden transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <span className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {offer.badge}
                </span>

                <div className="bg-white/15 rounded-full w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-white text-xl font-bold mb-3">{offer.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-8">{offer.description}</p>

                <Link
                  to="/menu"
                  className="inline-block bg-white text-stone-800 font-semibold py-2.5 px-7 rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Order Now
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
