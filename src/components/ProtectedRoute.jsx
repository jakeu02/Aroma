import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from '../pages/admin/AdminLogin';

// Gates staff pages: loader while resolving session, login when signed out,
// and an access notice when the account's role isn't allowed.
export default function ProtectedRoute({ children, roles = ['admin'], title = 'Aroma Admin' }) {
  const { loading, user, role, signOut, configured } = useAuth();

  if (!configured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
          <h2 className="text-stone-800 text-2xl font-bold mb-3">Sign-in unavailable</h2>
          <p className="text-stone-500">
            Supabase isn&apos;t configured yet. Add your project URL and anon key to{' '}
            <code className="text-amber-700">.env</code> and reload.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AdminLogin title={title} />;

  if (!roles.includes(role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
          <h2 className="text-stone-800 text-2xl font-bold mb-3">No access</h2>
          <p className="text-stone-500 mb-6">
            This account ({user.email}) doesn&apos;t have access here. Ask an admin to grant the
            right role ({roles.join(' or ')}) for your profile in Supabase.
          </p>
          <button
            onClick={signOut}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2.5 px-6 rounded-full transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
