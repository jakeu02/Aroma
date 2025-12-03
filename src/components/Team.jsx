import React, { useState, useEffect } from 'react';

export default function ComfortSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const team = [
    {
      id: 1,
      role: 'Business Partner',
      name: 'Angelica Ravon',
      phone: '+63 9123456789',
      email: 'angelicarv@gmail.com',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      role: 'Business Owner',
      name: 'Micaella Sanchez',
      phone: '+63 9123456789',
      email: 'micaella56@gmail.com',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      role: 'Manager',
      name: 'Lawrence Divera',
      phone: '+63 9123456789',
      email: 'lawrencledeva@gmail.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="w-full mb-10">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center overflow-hidden group"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&h=600&fit=crop')"
        }}
      >
        {/* Dark overlay with animation */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500"></div>
        
        {/* Animated background zoom */}
        <div 
          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-[3000ms] ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&h=600&fit=crop')"
          }}
        ></div>
        
        {/* Text Content with fade-in animation */}
        <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24 z-10">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight max-w-4xl transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            Comfort in every corner, creativity<br />in every cup.
          </h1>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-stone-100 py-16 px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            {team.map((member, index) => (
              <React.Fragment key={member.id}>
                <div 
                  className={`flex items-center gap-6 transform transition-all duration-700 ${
                    isVisible 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-20 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  {/* Profile Image with hover effects */}
                  <div className="relative w-40 h-40 rounded-full overflow-hidden flex-shrink-0 shadow-lg group/image">
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`w-full h-full object-cover transform transition-all duration-500 ${
                        hoveredMember === member.id 
                          ? 'scale-110 rotate-3' 
                          : 'scale-100 rotate-0'
                      }`}
                    />
                    {/* Overlay on hover */}
                    <div className={`absolute inset-0 bg-amber-900/20 transition-opacity duration-300 ${
                      hoveredMember === member.id ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                  </div>

                  {/* Text Content with staggered animations */}
                  <div className="text-left">
                    {/* Role */}
                    <p className={`text-sm italic text-stone-700 mb-1 transform transition-all duration-300 ${
                      hoveredMember === member.id ? 'translate-x-2 text-amber-700' : 'translate-x-0'
                    }`}>
                      {member.role}
                    </p>

                    {/* Name */}
                    <h3 className={`text-xl font-semibold text-stone-900 mb-3 transform transition-all duration-300 ${
                      hoveredMember === member.id ? 'translate-x-2 text-amber-900' : 'translate-x-0'
                    }`}>
                      {member.name}
                    </h3>

                    {/* Contact Info */}
                    <p className={`text-sm text-stone-600 transition-all duration-300 ${
                      hoveredMember === member.id ? 'translate-x-2 text-stone-700' : 'translate-x-0'
                    }`}>
                      {member.phone}
                    </p>
                    <p className={`text-sm text-stone-600 transition-all duration-300 ${
                      hoveredMember === member.id ? 'translate-x-2 text-stone-700' : 'translate-x-0'
                    }`}>
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Vertical Divider with fade-in animation */}
                {index < team.length - 1 && (
                  <div className={`hidden md:block h-40 border-l-2 border-stone-400 transform transition-all duration-700 ${
                    isVisible ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}