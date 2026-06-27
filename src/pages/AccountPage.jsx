import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { signIn, signUp, user, configured } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/orders';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  // Already signed in → leave the auth page.
  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, redirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!configured) {
      toast.error('Accounts are not available yet.');
      return;
    }
    if (!email || !password) {
      toast.error('Enter your email and password');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setBusy(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success('Welcome back!');
      navigate(redirect, { replace: true });
    } else {
      const { data, error } = await signUp(email, password, { full_name: name });
      setBusy(false);
      if (error) return toast.error(error.message);
      // If email confirmation is on, there's no session yet.
      if (!data.session) {
        setCheckEmail(true);
        return;
      }
      toast.success('Account created!');
      navigate(redirect, { replace: true });
    }
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
          <Mail className="w-14 h-14 text-amber-600 mx-auto mb-4" />
          <h2 className="text-stone-800 text-2xl font-bold mb-3">Check your email</h2>
          <p className="text-stone-500 mb-6">
            We sent a confirmation link to <span className="font-semibold">{email}</span>. Click it,
            then come back and sign in.
          </p>
          <button
            onClick={() => { setCheckEmail(false); setMode('signin'); }}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2.5 px-6 rounded-full transition-all"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-stone-800 text-3xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              {mode === 'signin'
                ? 'Sign in to order and track your orders'
                : 'Order faster and keep your order history'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className={inputCls}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className={inputCls}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 rounded-full transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-sm mt-6">
            {mode === 'signin' ? "New to Aroma Cafe?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-amber-700 font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/menu" className="text-stone-500 text-sm hover:text-amber-700 transition-colors">
            ← Continue browsing
          </Link>
        </p>
      </div>
    </div>
  );
}
