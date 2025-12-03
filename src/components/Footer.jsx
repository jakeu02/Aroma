import React from 'react';
import { Facebook, Instagram, Phone, Mail } from 'lucide-react';
import Icon from '../assets/logo_coffee.png';

export default function Footer() {
  return (
    <footer className="bg-categorybg border-amber-900/20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Left Section - Brand */}
          <div className="flex items-center gap-3">
            {/* Coffee Cup Icon */}
            <div className="text-5xl leading-none">
              <img src={Icon} alt='icon' className='w-16 mb-10' />
            </div>
            
            {/* Brand Info */}
            <div className="leading-tight">
              <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
                AROMA CAFÉ
              </h3>
              <p className="text-amber-200/70 text-xs">
                Visit us
              </p>
              <p className="text-amber-300/60 text-xs">
                Quezon city, Philippines
              </p>
            </div>
          </div>

          {/* Center Section - Social Media */}
          <div className="flex flex-col items-start md:items-center">
            <h4 className="text-white font-medium mb-3 text-xs">
              Follow us on
            </h4>
            <div className="flex gap-3">
              {/* Facebook */}
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-white" fill="white" />
              </a>
              
              {/* Instagram */}
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 flex items-center justify-center transition-opacity shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              
              {/* X (Twitter) */}
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors shadow-md border border-gray-700"
                aria-label="X"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Section - Contact */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-white font-medium mb-3 text-xs">
              Contact us
            </h4>
            <div className="space-y-1.5">
              <a 
                href="tel:111-222-333-444" 
                className="flex items-center gap-2 text-amber-200/70 hover:text-amber-200 text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>111-222-333-444</span>
              </a>
              <a 
                href="mailto:aromacaffe@gmail.com" 
                className="flex items-center gap-2 text-amber-200/70 hover:text-amber-200 text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>aromacaffe@gmail.com</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}