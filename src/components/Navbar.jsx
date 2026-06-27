import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_coffee.png';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative hover:text-amber-700 transition-colors duration-300 group ${
      isActive ? 'text-amber-700 font-semibold' : ''
    }`;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-background shadow-lg py-3' : 'bg-background/95 shadow-md py-4 lg:py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-14 h-10 sm:w-12 sm:h-9 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-base sm:text-lg"><img src={logo} alt="Aroma Cafe Logo" className="w-14 h-12 sm:w-14 sm:h-12" /></span>
              </div>
              <span className="font-bold mt-3 sm:text-xl tracking-wide text-gray-900 group-hover:text-amber-700 transition-colors duration-300">AROMA CAFE</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-10 text-sm text-gray-700">
              <NavLink to="/menu" className={navLinkClass}>
                <span>Menu</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </NavLink>
              <NavLink to="/" end className={navLinkClass}>
                <span>About Us</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </NavLink>
              {user && (
                <NavLink to="/orders" className={navLinkClass}>
                  <span>My Orders</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
                </NavLink>
              )}
              <NavLink to="/contact" className={navLinkClass}>
                <span>Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-700 group-hover:w-full transition-all duration-300"></span>
              </NavLink>

              {/* Cart Icon */}
              <Link to="/cart" className="relative hover:text-amber-700 transition-colors duration-300 p-1">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-gray-700 hover:text-amber-700 transition-colors duration-300"
                  title={`Sign out (${user.email})`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:inline text-xs">Sign out</span>
                </button>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-full transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold">Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile: Cart + Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <Link to="/cart" className="relative text-gray-700 hover:text-amber-700 transition-colors p-1" onClick={closeMobile}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                className="text-gray-700 p-2 hover:bg-amber-100 rounded-lg transition-all duration-300 active:scale-95"
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
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <NavLink to="/menu" onClick={closeMobile} className={({ isActive }) => `block hover:text-amber-700 hover:pl-2 transition-all duration-200 ${isActive ? 'text-amber-700 font-semibold pl-2' : 'text-gray-700'}`}>Menu</NavLink>
              <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => `block hover:text-amber-700 hover:pl-2 transition-all duration-200 ${isActive ? 'text-amber-700 font-semibold pl-2' : 'text-gray-700'}`}>About Us</NavLink>
              {user && (
                <NavLink to="/orders" onClick={closeMobile} className={({ isActive }) => `block hover:text-amber-700 hover:pl-2 transition-all duration-200 ${isActive ? 'text-amber-700 font-semibold pl-2' : 'text-gray-700'}`}>My Orders</NavLink>
              )}
              <NavLink to="/contact" onClick={closeMobile} className={({ isActive }) => `block hover:text-amber-700 hover:pl-2 transition-all duration-200 ${isActive ? 'text-amber-700 font-semibold pl-2' : 'text-gray-700'}`}>Contact</NavLink>
              {user ? (
                <button
                  onClick={() => { closeMobile(); signOut(); }}
                  className="flex items-center gap-2 text-gray-700 hover:text-amber-700 hover:pl-2 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              ) : (
                <NavLink to="/account" onClick={closeMobile} className="flex items-center gap-2 text-amber-700 font-semibold hover:pl-2 transition-all duration-200">
                  <User className="w-4 h-4" /> Sign In
                </NavLink>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20 sm:h-24"></div>
    </>
  );
}
