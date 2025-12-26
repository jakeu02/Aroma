import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';


import Video from '../assets/banner_video.mp4'
import Cawfee from '../assets/coffee.png'

import Cappuccino from '../assets/categories/hot_cappuccino.png'
import affogato from '../assets/categories/affogato.png'
import dbespresso from '../assets/categories/dbespresso.png'
import machiatto from '../assets/categories/machiatto.png'
import frappemocha from '../assets/categories/frappe_mocha.png'

import Biscotti from '../assets/categories/biscotti.png'
import Caramel from '../assets/categories/caramel_pudding.png'
import Croissant from '../assets/categories/croissant.png'
import Tiramisu from '../assets/categories/tiramisu.png'
import Cheesecake from '../assets/categories/cheesecake.png'

const Category = () => {
  const [favorites, setFavorites] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coffeeProducts = [
    { id: 1, rank: 1, name: 'HOT CAPPUCCINO', price: '₱ 180.00', image: Cappuccino },
    { id: 2, rank: 2, name: 'AFFOGATO', price: '₱ 200.00', image: affogato },
    { id: 3, rank: 3, name: 'DOUBLE ESPRESSO', price: '₱ 185.00', image: dbespresso },
    { id: 4, rank: 4, name: 'FRAPPE CARAMEL MACCHIATO', price: '₱ 195.00', image: machiatto },
    { id: 5, rank: 5, name: 'FRAPPE MOCHA LATTE', price: '₱ 190.00', image: frappemocha },
  ];

  const pastryProducts = [
    { id: 1, rank: 1, name: 'BISCOTTI', price: '₱ 120.00', image: Biscotti, color: 'from-yellow-600 to-orange-600' },
    { id: 2, rank: 2, name: 'CARAMEL PUDDING', price: '₱ 165.00', image: Caramel, color: 'from-amber-500 to-yellow-600' },
    { id: 3, rank: 3, name: 'TIRAMISU CAKE', price: '₱ 190.00', image: Tiramisu, color: 'from-orange-500 to-amber-600' },
    { id: 4, rank: 4, name: 'CHOCOLATE CROISSANT', price: '₱ 145.00', image: Croissant, color: 'from-yellow-500 to-orange-500' },
    { id: 5, rank: 5, name: 'CHEESECAKE', price: '₱ 175.00', image: Cheesecake, color: 'from-pink-400 to-orange-500' },
  ];

  const toggleFavorite = (type, id) => {
    const key = `${type}-${id}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      return newFavorites;
    });
  };

  const ProductCard = ({ product, type }) => {
    const isFavorite = favorites.has(`${type}-${product.id}`);
    
    return (
      <div className="h-full px-2">
        <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 h-full flex flex-col items-center border border-amber-700/50 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 group relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-orange-600/0 to-amber-600/0 group-hover:from-amber-600/10 group-hover:via-orange-600/10 group-hover:to-amber-600/10 transition-all duration-500 rounded-3xl"></div>
          
          <div className={`relative bg-gradient-to-r ${product.color} text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg z-10`}>
            ⭐ Rank {product.rank}
          </div>
          
          <div className="relative text-8xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
           <img src={product.image} />
      
          </div>
          
          <h3 className="relative text-white text-base font-bold tracking-wider mb-4 text-center px-2 z-10 group-hover:text-amber-300 transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="relative flex items-center justify-between w-full mt-auto pt-4 border-t border-amber-700/40 z-10">
            <span className="text-amber-400 font-bold text-xl group-hover:text-amber-300 transition-colors duration-300">
              {product.price}
            </span>
            <button 
              onClick={() => toggleFavorite(type, product.id)}
              className={`transition-all duration-300 p-2 rounded-full ${
                isFavorite 
                  ? 'text-red-500 bg-red-500/20 scale-110' 
                  : 'text-white hover:text-red-500 hover:bg-red-500/20 hover:scale-110'
              }`}
            >
              <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950 to-gray-900">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Custom Swiper Navigation Buttons */
        .swiper-button-next,
        .swiper-button-prev {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: white !important;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
          transition: all 0.3s ease;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: linear-gradient(135deg, #d97706, #b45309);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
        }

        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Custom Pagination */
        .swiper-pagination-bullet {
          background: #f59e0b;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background: #f59e0b;
          opacity: 1;
          width: 30px;
          border-radius: 5px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 40px;
            height: 40px;
          }
          
          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 16px;
          }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="relative w-full mb-12 overflow-hidden">
        <div className="relative h-[400px] bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1MSwgMTkxLCAzNiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          {/* Floating coffee beans */}
          <div className="absolute left-10 top-20 text-6xl animate-float opacity-20">☕</div>
          <div className="absolute right-20 top-40 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🥐</div>
          <div className="absolute left-1/4 bottom-20 text-7xl animate-float opacity-20" style={{ animationDelay: '2s' }}>☕</div>
          
         <div className="relative h-full w-full flex items-center justify-center overflow-hidden">

  {/* Background Video */}
  <video 
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src='https://drive.google.com/file/d/1SdDixosGDGZQ8bcEKTzBspKLKWpfMdmk/view?usp=sharing' type="video/mp4" />
  </video>

  {/* Dark overlay (optional for better text visibility) */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* Your Content */}
  <div className={`relative h-full flex flex-col items-center justify-center text-center px-8 z-10 transition-all duration-1000 ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  }`}>
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 text-6xl md:text-7xl font-bold tracking-widest mb-3 drop-shadow-2xl">
        GRAB YOUR ORDER NOW
      </h1>

      <p className="text-amber-300 text-xl md:text-2xl font-light tracking-wide">
        Premium Coffee & Pastries ✨
      </p>
  </div>

</div>

        </div>
      </div>

      {/* Coffee Section */}
      <div className="max-w-7xl mx-auto mb-16 px-4">
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 text-5xl md:text-6xl font-bold tracking-wide mb-3">
            Here's Our Best Seller
          </p>
          <h2 className="text-white text-3xl font-bold tracking-widest flex items-center justify-center gap-3">
            <span className="text-4xl"><img src={Cawfee} alt='image' className='w-16' /></span>
            COFFEE
            <span className="text-4xl"><img src={Cawfee} alt='image' className='w-16' /></span>
          </h2>
        </div>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: false,
          }}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
          }}
          className="py-12"
        >
          {coffeeProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} type="coffee" />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-10">
          <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-16 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-amber-500/50">
            View More ☕
          </button>
        </div>
      </div>

      {/* Pastries Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-white text-3xl font-bold tracking-widest flex items-center justify-center gap-3">
            <span className="text-4xl">🥐</span>
            PASTRIES
            <span className="text-4xl">🧁</span>
          </h2>
        </div>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: false,
          }}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
          }}
          className="py-12"
        >
          {pastryProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} type="pastry" />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-10">
          <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-16 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-amber-500/50">
            View More 🥐
          </button>
        </div>
      </div>
    </div>
  );
};

export default Category;
