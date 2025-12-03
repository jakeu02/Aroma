import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

export default function Ratings() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredReview, setHoveredReview] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [zoomedImage]);

  const reviews = [
    {
      id: 1,
      username: '@time_if',
      date: '11/12/2025',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      review: '"I really love being here! There\'s a lot of delicious pastry\'s and super aroma coffee."',
      capturedBy: 'Christine Devi Cruz',
      rating: 5
    },
    {
      id: 2,
      username: '@sherlxvur',
      date: '11/12/2025',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
      review: '"Can\'t get over the cozy lights, warm pastries, and that heavenly coffee aroma."',
      capturedBy: 'Yuri Valdez',
      rating: 5
    },
    {
      id: 3,
      username: '@kxsie_u',
      date: '11/12/2025',
      image: 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=400&h=300&fit=crop',
      review: '"If comfort and creativity had a smell, it would be this coffee shop."',
      capturedBy: 'Mark Cruz',
      rating: 5
    },
    {
      id: 4,
      username: '@Jasminnwel',
      date: '11/12/2025',
      image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop',
      review: '"This place feels like a hug in cafe form — soft music, pretty interiors, and the best latte ever."',
      capturedBy: 'Jasmin Yu',
      rating: 5
    },
    {
      id: 5,
      username: '@KristenGuel',
      date: '11/12/2025',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
      review: '"Soft music, gentle lighting, and a cup that feels like peace — my kind of therapy. ☕✨"',
      capturedBy: 'Kirsten Wendhandt',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-categorybg py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .image-clickable {
          cursor: zoom-in;
        }

        .image-clickable:hover::after {
          content: '🔍';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .image-clickable:hover::after {
          opacity: 1;
        }
      `}</style>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors z-10 bg-black/50 rounded-full p-2 hover:bg-black/70"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] mx-4 animate-zoom-in">
            <img
              src={zoomedImage.image}
              alt="Zoomed view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <p className="text-white text-lg font-semibold mb-1">{zoomedImage.username}</p>
              <p className="text-amber-200 text-sm italic">{zoomedImage.review}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest flex items-center justify-center gap-3 animate-float">
            CUSTOMER SATISFACTION
            <Star className="w-7 h-7 fill-yellow-400 text-yellow-400 animate-pulse" />
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {[reviews[0], reviews[1], reviews[2]].map((review, idx) => (
              <div
                key={review.id}
                className={`bg-cardbg backdrop-blur-sm rounded-lg overflow-hidden border border-amber-800/30 hover-lift ${
                  isVisible ? 'animate-slide-in-left opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${idx * 150}ms` }}
                onMouseEnter={() => setHoveredReview(review.id)}
                onMouseLeave={() => setHoveredReview(null)}
              >
                <div className="flex gap-4 p-4 relative overflow-hidden">
                  {hoveredReview === review.id && (
                    <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
                  )}
                  
                  {/* Image */}
                  <div 
                    className="w-28 h-28 flex-shrink-0 rounded overflow-hidden group relative image-clickable"
                    onClick={() => setZoomedImage(review)}
                  >
                    <img
                      src={review.image}
                      alt="Coffee shop"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        hoveredReview === review.id ? 'scale-110 rotate-2' : 'scale-100'
                      }`}
                    />
                    <div className={`absolute inset-0 bg-amber-600/20 transition-opacity duration-300 ${
                      hoveredReview === review.id ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                    {/* Zoom Icon on Hover */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredReview === review.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-white text-sm font-normal flex items-center gap-1 transition-all duration-300 ${
                        hoveredReview === review.id ? 'text-amber-200' : ''
                      }`}>
                        <span className="text-white/80">📷</span>
                        {review.username}
                      </span>
                      <span className="text-amber-400/80 text-xs whitespace-nowrap ml-2">
                        {review.date}
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className={`text-amber-100/90 text-sm leading-relaxed mb-3 italic transition-all duration-300 ${
                      hoveredReview === review.id ? 'text-amber-50' : ''
                    }`}>
                      {review.review}
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300/70 text-xs">
                        Captured by: <span className="text-amber-200/90">{review.capturedBy}</span>
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 fill-yellow-400 text-yellow-400 transition-all duration-300 ${
                              hoveredReview === review.id ? 'scale-125 rotate-12' : 'scale-100'
                            }`}
                            style={{ transitionDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {[reviews[3], reviews[4]].map((review, idx) => (
              <div
                key={review.id}
                className={`bg-cardbg backdrop-blur-sm rounded-lg overflow-hidden border border-amber-800/30 hover-lift ${
                  isVisible ? 'animate-slide-in-right opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${idx * 150 + 300}ms` }}
                onMouseEnter={() => setHoveredReview(review.id)}
                onMouseLeave={() => setHoveredReview(null)}
              >
                <div className="flex gap-4 p-4 relative overflow-hidden">
                  {hoveredReview === review.id && (
                    <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
                  )}
                  
                  {/* Image */}
                  <div 
                    className="w-28 h-28 flex-shrink-0 rounded overflow-hidden group relative image-clickable"
                    onClick={() => setZoomedImage(review)}
                  >
                    <img
                      src={review.image}
                      alt="Coffee shop"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        hoveredReview === review.id ? 'scale-110 rotate-2' : 'scale-100'
                      }`}
                    />
                    <div className={`absolute inset-0 bg-amber-600/20 transition-opacity duration-300 ${
                      hoveredReview === review.id ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                    {/* Zoom Icon on Hover */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredReview === review.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-white text-sm font-normal flex items-center gap-1 transition-all duration-300 ${
                        hoveredReview === review.id ? 'text-amber-200' : ''
                      }`}>
                        <span className="text-white/80">📷</span>
                        {review.username}
                      </span>
                      <span className="text-amber-400/80 text-xs whitespace-nowrap ml-2">
                        {review.date}
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className={`text-amber-100/90 text-sm leading-relaxed mb-3 italic transition-all duration-300 ${
                      hoveredReview === review.id ? 'text-amber-50' : ''
                    }`}>
                      {review.review}
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300/70 text-xs">
                        Captured by: <span className="text-amber-200/90">{review.capturedBy}</span>
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 fill-yellow-400 text-yellow-400 transition-all duration-300 ${
                              hoveredReview === review.id ? 'scale-125 rotate-12' : 'scale-100'
                            }`}
                            style={{ transitionDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* View More Reviews - Bottom Right */}
            <div className={`flex justify-end pt-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`} style={{ transitionDelay: '800ms' }}>
              <button className="text-white hover:text-amber-200 font-medium text-base italic transition-all duration-300 hover:tracking-wider relative group">
                <span className="relative z-10">View more reviews</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}