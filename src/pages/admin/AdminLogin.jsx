import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin({ title = 'Aroma Admin' }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter your email and password');
      return;
    }
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-amber-200/70 hover:text-amber-200 transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back to site
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-stone-800 text-2xl font-bold">{title}</h1>
            <p className="text-stone-400 text-sm mt-1">Staff sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 rounded-full transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="flex items-center justify-center gap-1.5 text-center text-stone-400 text-xs mt-6">
            <Lock size={12} />
            Access is restricted to authorized staff.
          </p>
        </div>
      </div>
    </div>
  );
}
