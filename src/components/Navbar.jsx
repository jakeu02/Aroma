import React, { useState, useEffect } from 'react';
import logo from '../assets/logo_coffee.png';
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-stone-50 shadow-lg py-3' : 'bg-stone-50/95 shadow-md py-4 lg:py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-14 h-10 sm:w-12 sm:h-9 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
               <span className="text-white text-base sm:text-lg"><img src={logo} alt="Aroma Café Logo" className="w-14 h-12 sm:w-14 sm:h-12" /></span>
              </div>
              <span className="font-bold mt-3 sm:text-xl tracking-wide text-gray-900 group-hover:text-amber-700 transition-colors duration-300">AROMA CAFÉ</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 lg:space-x-10 text-sm text-gray-700">
              <a href="#menu" className="relative hover:text-amber-700 transition-colors duration-300 group">
                <span>Menu</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="relative hover:text-amber-700 transition-colors duration-300 group">
                <span>About Us</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#order" className="relative hover:text-amber-700 transition-colors duration-300 group">
                <span>Order Online</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="relative hover:text-amber-700 transition-colors duration-300 group">
                <span>Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 p-2 hover:bg-amber-100 rounded-lg transition-all duration-300 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <a href="#menu" className="block text-gray-700 hover:text-amber-700 hover:pl-2 transition-all duration-200">Menu</a>
              <a href="#about" className="block text-gray-700 hover:text-amber-700 hover:pl-2 transition-all duration-200">About Us</a>
              <a href="#order" className="block text-gray-700 hover:text-amber-700 hover:pl-2 transition-all duration-200">Order Online</a>
              <a href="#contact" className="block text-gray-700 hover:text-amber-700 hover:pl-2 transition-all duration-200">Contact</a>
            </div>
          )}
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20 sm:h-24"></div>
    </>
  );
}