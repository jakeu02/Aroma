import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquarePlus, Send } from 'lucide-react';
import { reviews as defaultReviews } from '../data/reviews';
import toast from 'react-hot-toast';

export default function Ratings() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredReview, setHoveredReview] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showUserReviews, setShowUserReviews] = useState(false);
  const [userReviews, setUserReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aroma-reviews')) || [];
    } catch { return []; }
  });
  const [reviewForm, setReviewForm] = useState({ username: '', review: '', rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);

  const reviews = defaultReviews;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.username || !reviewForm.review || reviewForm.rating === 0) {
      toast.error('Please fill in all fields and select a rating');
      return;
    }
    const newReview = {
      id: Date.now(),
      username: reviewForm.username.startsWith('@') ? reviewForm.username : `@${reviewForm.username}`,
      date: new Date().toLocaleDateString('en-US'),
      image: '',
      review: `"${reviewForm.review}"`,
      capturedBy: reviewForm.username.replace('@', ''),
      rating: reviewForm.rating,
    };
    const updated = [newReview, ...userReviews];
    setUserReviews(updated);
    localStorage.setItem('aroma-reviews', JSON.stringify(updated));
    setReviewForm({ username: '', review: '', rating: 0 });
    setShowReviewForm(false);
    setShowUserReviews(true);
    toast.success('Review submitted! Thank you for your feedback.', {
      icon: '\u2B50',
      style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
    });
  };

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


  return (
    <div className="bg-categorybg py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
                className={`bg-[#3D2B1F] backdrop-blur-sm rounded-lg overflow-hidden border border-amber-800/30 hover-lift ${
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
                className={`bg-[#3D2B1F] backdrop-blur-sm rounded-lg overflow-hidden border border-amber-800/30 hover-lift ${
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
              {userReviews.length > 0 && (
                <button
                  onClick={() => setShowUserReviews(!showUserReviews)}
                  className="text-white hover:text-amber-200 font-medium text-base italic transition-all duration-300 hover:tracking-wider relative group"
                >
                  <span className="relative z-10">
                    {showUserReviews ? 'Hide' : 'View more'} reviews ({userReviews.length})
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User-Submitted Reviews */}
        {showUserReviews && userReviews.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-amber-200 text-lg font-semibold tracking-wide">Community Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#3D2B1F] backdrop-blur-sm rounded-lg p-4 border border-amber-800/30 hover-lift animate-slide-in-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-200 text-sm font-medium">{review.username}</span>
                    <span className="text-amber-400/80 text-xs">{review.date}</span>
                  </div>
                  <p className="text-amber-100/90 text-sm leading-relaxed mb-3 italic">{review.review}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-amber-700'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write a Review Section */}
        <div className="mt-10 flex flex-col items-center">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-amber-500/30"
            >
              <MessageSquarePlus className="w-5 h-5" />
              Write a Review
            </button>
          ) : (
            <div className="w-full max-w-lg bg-[#3D2B1F] backdrop-blur-sm rounded-lg p-6 border border-amber-800/30 animate-slide-in-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-bold">Share Your Experience</h3>
                <button onClick={() => setShowReviewForm(false)} className="text-amber-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-amber-300 text-sm font-semibold block mb-2">Username</label>
                  <input
                    type="text"
                    value={reviewForm.username}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="@yourusername"
                    className="w-full px-4 py-3 bg-amber-950/40 border border-amber-700/50 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-amber-300 text-sm font-semibold block mb-2">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || reviewForm.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-amber-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-amber-300 text-sm font-semibold block mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                    placeholder="Tell us about your experience..."
                    rows={3}
                    className="w-full px-4 py-3 bg-amber-950/40 border border-amber-700/50 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-full transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}