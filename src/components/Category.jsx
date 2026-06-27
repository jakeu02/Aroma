import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import Cawfee from '../assets/coffee.png';
import { useProducts } from '../context/ProductsContext';
import ProductCard from './ProductCard';

const Category = () => {
  const { coffeeProducts, pastryProducts } = useProducts();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const swiperConfig = {
    modules: [Navigation, Pagination, Autoplay, EffectCoverflow],
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 15,
      stretch: 0,
      depth: 150,
      modifier: 1.5,
      slideShadows: false,
    },
    navigation: true,
    pagination: { clickable: true, dynamicBullets: true },
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 30 },
      1024: { slidesPerView: 3, spaceBetween: 40 },
    },
    className: 'py-12',
  };

  return (
    <div id="menu">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .swiper-button-next, .swiper-button-prev {
          background: #44382c;
          width: 44px; height: 44px; border-radius: 50%;
          color: white !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 18px; font-weight: bold; }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #2d2418;
          transform: scale(1.1);
        }
        .swiper-button-disabled { opacity: 0.3; cursor: not-allowed; }
        .swiper-pagination-bullet {
          background: #92400e; opacity: 0.4; width: 10px; height: 10px; transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #92400e; opacity: 1; width: 30px; border-radius: 5px;
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { width: 36px; height: 36px; }
          .swiper-button-next:after, .swiper-button-prev:after { font-size: 14px; }
        }
      `}</style>

      {/* Video Hero Banner - Dark */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-[400px] bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1MSwgMTkxLCAzNiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="absolute left-10 top-20 text-6xl animate-float opacity-20">☕</div>
          <div className="absolute right-20 top-40 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🥐</div>
          <div className="absolute left-1/4 bottom-20 text-7xl animate-float opacity-20" style={{ animationDelay: '2s' }}>☕</div>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
              <source src="https://res.cloudinary.com/dpku1bxut/video/upload/v1766711567/banner_video_video-converter.com_ywyeud.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className={`relative h-full flex flex-col items-center justify-center text-center px-8 z-10 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 text-5xl md:text-7xl font-bold tracking-widest mb-3 drop-shadow-2xl">
                GRAB YOUR ORDER NOW
              </h1>
              <p className="text-amber-300 text-xl md:text-2xl font-light tracking-wide">
                Premium Coffee & Pastries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Showcase - Light Beige */}
      <div className="bg-background py-16">
        {/* Coffee Section */}
        <div className="max-w-7xl mx-auto mb-16 px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-amber-800 text-4xl md:text-5xl font-bold tracking-tight mb-3 font-display">
              Here&apos;s Our Best Seller
            </p>
            <h2 className="text-stone-700 text-2xl font-bold tracking-widest flex items-center justify-center gap-3">
              <span><img src={Cawfee} alt="coffee icon" className="w-14" /></span>
              COFFEE
              <span><img src={Cawfee} alt="coffee icon" className="w-14" /></span>
            </h2>
          </div>

          <Swiper {...swiperConfig} autoplay={{ delay: 3000, disableOnInteraction: false }}>
            {coffeeProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} light />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-16 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              View More
            </Link>
          </div>
        </div>

        {/* Pastries Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="text-stone-700 text-2xl font-bold tracking-widest flex items-center justify-center gap-3">
              <span className="text-3xl">🥐</span>
              PASTRIES
              <span className="text-3xl">🧁</span>
            </h2>
          </div>

          <Swiper {...swiperConfig} autoplay={{ delay: 3500, disableOnInteraction: false }}>
            {pastryProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} light />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-16 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              View More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
