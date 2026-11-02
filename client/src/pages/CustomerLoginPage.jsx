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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#50574F] selection:bg-[#DCE8D5] selection:text-[#26352A]">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E2E6DC] shadow-sm space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#355E3B] bg-[#FAF9F6] mx-auto mb-3 p-1">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#26352A]">
              {c.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#50574F] mt-1.5 leading-relaxed">
              {c.desc}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#B94343] text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B94343]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                {c.identifierLabel} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={c.identifierPlaceholder}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                />
                <Phone className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                {c.passwordLabel} *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
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

          <div className="pt-4 border-t border-[#E2E6DC] text-center text-xs text-[#50574F]">
            {c.noAccount}{' '}
            <Link to="/register" className="text-[#355E3B] hover:text-[#294A30] font-bold hover:underline">
              {c.registerLink}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
