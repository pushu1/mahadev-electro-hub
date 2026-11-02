import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLoginPage() {
  const { loginAdmin, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@mahadevelectrohub.com');
  const [password, setPassword] = useState('Admin@Mahadev2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAdminAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center p-4 admin-portal" data-admin="true">
      <div className="w-full max-w-md bg-[#242424] border border-[#383838] rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D6A52A]" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D6A52A] bg-black mx-auto mb-3 shadow-lg p-0.5">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-xl font-heading font-extrabold text-white">
            MAHADEV ELECTRO HUB
          </h1>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B3B3B3] block mt-0.5">
            Admin CMS Portal • Pali, Rajasthan
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mahadevelectrohub.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-white text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#D6A52A]"
              />
              <Mail className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-white text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#D6A52A]"
              />
              <Lock className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D6A52A] hover:bg-[#008F8B] text-white font-bold text-xs rounded-lg active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
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

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-[#B3B3B3]">
          <span>Protected Area. Pali, Rajasthan Store Management.</span>
        </div>
      </div>
    </div>
  );
}
