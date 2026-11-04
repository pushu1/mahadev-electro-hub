import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLoginPage() {
  const { loginAdmin, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Explicitly guarantee fields start blank on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  if (isAdminAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Kripya admin email aur password dono enter karein.');
      return;
    }

    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Galat admin email ya password. Kripya check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#252A25] flex items-center justify-center p-4 admin-portal" data-admin="true">
      <div className="w-full max-w-md bg-white border border-[#D5DDD2] rounded-2xl p-8 shadow-xl text-[#252A25] relative overflow-hidden">
        {/* Top Forest Green Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#24532F]" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#24532F] bg-[#F3F0E6] mx-auto mb-3 shadow-md p-0.5">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-xl font-heading font-extrabold text-[#171C17]">
            MAHADEV ELECTRO HUB
          </h1>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#596358] block mt-0.5">
            Admin CMS Portal • Pali, Rajasthan
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#B94343]/10 border border-[#B94343]/30 rounded-xl text-[#B94343] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#B94343] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171C17] mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="admin_email"
                id="admin_email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-[#171C17] text-xs border border-[#D5DDD2] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
              />
              <Mail className="w-4 h-4 text-[#596358] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171C17] mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="admin_password"
                id="admin_password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-[#171C17] text-xs border border-[#D5DDD2] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
              />
              <Lock className="w-4 h-4 text-[#596358] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-xs rounded-xl active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span>Login Ho Raha Hai...</span>
            ) : (
              <>
                <span>Admin Panel Mein Login Karein</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#D5DDD2] text-center text-[11px] text-[#596358]">
          <span>Protected Area. Pali, Rajasthan Store Management.</span>
        </div>
      </div>
    </div>
  );
}
