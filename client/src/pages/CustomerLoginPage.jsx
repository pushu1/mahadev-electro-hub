import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CustomerLoginPage() {
  const { loginCustomer } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/my-account';

  const texts = {
    en: {
      title: 'Sign in to Mahadev Electro Hub',
      desc: 'Log in to track orders, manage saved addresses, and enjoy faster checkout.',
      identifierLabel: 'Mobile Number or Email Address',
      identifierPlaceholder: 'e.g. 9876543210 or name@example.com',
      passwordLabel: 'Password',
      submitBtn: 'Sign In',
      submitting: 'Signing in...',
      noAccount: "Don't have an account?",
      registerLink: 'Create Account',
      errorFail: 'Login failed. Please check your credentials.'
    },
    hi: {
      title: 'महादेव इलेक्ट्रो हब में लॉगिन करें',
      desc: 'अपने ऑर्डर ट्रैक करने, पते प्रबंधित करने और तेज़ चेकआउट के लिए लॉगिन करें।',
      identifierLabel: 'मोबाइल नंबर या ईमेल पता',
      identifierPlaceholder: 'उदा. 9876543210 या name@example.com',
      passwordLabel: 'पासवर्ड',
      submitBtn: 'लॉगिन करें',
      submitting: 'लॉगिन हो रहा है...',
      noAccount: 'क्या आपका खाता नहीं है?',
      registerLink: 'नया खाता बनाएं',
      errorFail: 'लॉगिन विफल। कृपया अपना विवरण जांचें।'
    },
    hinglish: {
      title: 'Mahadev Electro Hub Mein Login Karein',
      desc: 'Apne orders track karne, saved address aur fast checkout ke liye login karein.',
      identifierLabel: 'Mobile Number ya Email Address',
      identifierPlaceholder: 'e.g. 9876543210 ya name@example.com',
      passwordLabel: 'Password',
      submitBtn: 'Login Karein',
      submitting: 'Login Ho Raha Hai...',
      noAccount: 'Naya account banana chahte hain?',
      registerLink: 'Register Karein',
      errorFail: 'Login fail ho gaya. Kripya credentials check karein.'
    }
  };

  const c = texts[language] || texts.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginCustomer(identifier.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || c.errorFail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-white selection:bg-[#D6A52A] selection:text-black">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D6A52A] bg-[#1E1E1E] mx-auto mb-3 p-1">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              {c.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#D1D5DB] mt-1.5 leading-relaxed">
              {c.desc}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#E0E0E0] mb-1.5">
                {c.identifierLabel} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={c.identifierPlaceholder}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                />
                <Phone className="w-4 h-4 text-[#D6A52A] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E0E0E0] mb-1.5">
                {c.passwordLabel} *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#1F1F1F] text-white placeholder-[#777777] border border-[#383838] rounded-lg focus:outline-none focus:border-[#D6A52A] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#D6A52A] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>{c.submitting}</span>
              ) : (
                <>
                  <span>{c.submitBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#262626] text-center text-xs text-[#D1D5DB]">
            {c.noAccount}{' '}
            <Link to="/register" className="text-[#D6A52A] hover:text-[#E5B93B] font-bold hover:underline">
              {c.registerLink}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
