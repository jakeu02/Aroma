import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Loader2 } from 'lucide-react';
import { submitContactMessage } from '../lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    const { error } = await submitContactMessage(formData);
    setSending(false);
    if (error) {
      toast.error(error, { duration: 5000 });
      return;
    }
    toast.success('Message sent! We\'ll get back to you soon.', {
      icon: '✉️',
      duration: 4000,
      style: {
        background: '#422006',
        color: '#fde68a',
        border: '1px solid #92400e',
      },
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Hero */}
      <div className="relative h-64 mb-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&h=600&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-white text-5xl md:text-6xl font-bold tracking-tight mb-3">
              Contact Us
            </h1>
            <p className="text-amber-200/80 text-lg">We&apos;d love to hear from you</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Info + Map */}
          <div className="space-y-8">
            {/* Store Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={<MapPin className="w-6 h-6" />}
                title="Visit Us"
                lines={['Quezon City,', 'Philippines']}
              />
              <InfoCard
                icon={<Clock className="w-6 h-6" />}
                title="Hours"
                lines={['Mon-Fri: 7AM - 9PM', 'Sat-Sun: 8AM - 10PM']}
              />
              <InfoCard
                icon={<Phone className="w-6 h-6" />}
                title="Call Us"
                lines={['111-222-333-444']}
              />
              <InfoCard
                icon={<Mail className="w-6 h-6" />}
                title="Email"
                lines={['aromacaffe@gmail.com']}
              />
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              <iframe
                title="Aroma Cafe Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123533.34093579088!2d120.97389954031056!3d14.676041436908528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b70f05e08351%3A0x32e6fe69fe87b4c1!2sQuezon%20City%2C%20Metro%20Manila%2C%20Philippines!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-stone-600 text-sm font-semibold">Follow us:</span>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" fill="white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 flex items-center justify-center transition-opacity shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-colors shadow-md"
                aria-label="X"
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
              <h2 className="text-stone-800 text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-stone-700 text-sm font-semibold block mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-stone-700 text-sm font-semibold block mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-stone-700 text-sm font-semibold block mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="text-stone-700 text-sm font-semibold block mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-full text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending && <Loader2 className="w-5 h-5 animate-spin" />}
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, lines }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 transition-all duration-300 shadow-sm">
      <div className="text-amber-600 mb-3">{icon}</div>
      <h3 className="text-stone-800 font-bold text-sm mb-1">{title}</h3>
      {lines.map((line, i) => (
        <p key={i} className="text-stone-500 text-sm">
          {line}
        </p>
      ))}
    </div>
  );
}
