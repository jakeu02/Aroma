import React from 'react'
import image from '../assets/header_image.png';
function Header() {
  return (
    <section className="relative h-[400px] sm:h-[400px] lg:h-[580px] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 sm:from-black/60 to-transparent z-10"></div>
        <img 
          src={image} 
          alt="Latte art being poured" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="font-mont text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-tight font-bold text-white mb-2 sm:mb-3">
              CRAFTED PERFECTION,<br />EVERY CUP
            </h1>
            <p className="font-pop text-md sm:text-base lg:text-xl text-white/95 mb-6 sm:mb-8 font-light italic">
              Feel the aroma. Experience the taste and soul of coffee
            </p>
            <button className="bg-[#FDB022] hover:bg-[#F5A623] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg">
              Get your coffee
            </button>
          </div>
        </div>
      </section>
  )
}

export default Header