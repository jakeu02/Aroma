import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, Clock, Send } from 'lucide-react';
import Icon from '../assets/logo_coffee.png';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem('aroma-newsletter') || '[]');
      if (existing.includes(email)) {
        toast('You\'re already subscribed!', {
          icon: '\u2615',
          style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
        });
      } else {
        existing.push(email);
        localStorage.setItem('aroma-newsletter', JSON.stringify(existing));
        toast.success('Thanks for subscribing! Stay tuned for updates.', {
          icon: '\u2709\uFE0F',
          style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
        });
      }
    } catch {
      localStorage.setItem('aroma-newsletter', JSON.stringify([email]));
      toast.success('Thanks for subscribing!', {
        style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
      });
    }
    setEmail('');
  };

  return (
    <footer className="bg-[#EDD6C0] border-t border-amber-300/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          {/* Left Section - Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-5xl leading-none">
              <img src={Icon} alt='icon' className='w-16 mb-10' />
            </div>
            <div className="leading-tight">
              <h3 className="text-lg font-bold text-stone-800 mb-1 tracking-wide group-hover:text-amber-700 transition-colors">
                AROMA CAFE
              </h3>
              <p className="text-stone-500 text-xs">
                Visit us
              </p>
              <p className="text-stone-400 text-xs">
                Quezon city, Philippines
              </p>
            </div>
          </Link>

          {/* Center Section - Social Media */}
          <div className="flex flex-col items-start md:items-center">
            <h4 className="text-stone-700 font-medium mb-3 text-xs">
              Follow us on
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-white" fill="white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 flex items-center justify-center transition-opacity shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-colors shadow-md"
                aria-label="X"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="flex flex-col items-start md:items-center">
            <h4 className="text-stone-700 font-medium mb-3 text-xs">
              Stay Updated
            </h4>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="px-3 py-2 bg-white/60 border border-amber-300/50 rounded-lg text-stone-800 text-xs placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all w-40"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>

          {/* Right Section - Contact */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-stone-700 font-medium mb-3 text-xs">
              Contact us
            </h4>
            <div className="space-y-1.5">
              <a
                href="tel:111-222-333-444"
                className="flex items-center gap-2 text-stone-500 hover:text-amber-700 text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>111-222-333-444</span>
              </a>
              <a
                href="mailto:aromacaffe@gmail.com"
                className="flex items-center gap-2 text-stone-500 hover:text-amber-700 text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>aromacaffe@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Row - Quick Links & Hours */}
        <div className="mt-8 pt-6 border-t border-amber-300/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <Link to="/menu" className="text-stone-500 hover:text-amber-700 text-xs transition-colors">Menu</Link>
            <Link to="/track" className="text-stone-500 hover:text-amber-700 text-xs transition-colors">Track Order</Link>
            <Link to="/contact" className="text-stone-500 hover:text-amber-700 text-xs transition-colors">Contact</Link>
            <Link to="/cart" className="text-stone-500 hover:text-amber-700 text-xs transition-colors">Cart</Link>
          </div>
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>Mon-Fri 7AM-9PM &bull; Sat-Sun 8AM-10PM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
