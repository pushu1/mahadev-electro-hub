import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CustomerRegisterPage() {
  const { registerCustomer } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const texts = {
    en: {
      title: 'Create Customer Account',
      desc: 'Join Mahadev Electro Hub for instant order tracking, saved addresses, and direct Pali store support.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'e.g. Ramesh Patel',
      phoneLabel: '10-Digit Mobile Number *',
      phonePlaceholder: '10-digit mobile number',
      emailLabel: 'Email Address (Optional)',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Create Password *',
      confirmPasswordLabel: 'Confirm Password *',
      submitBtn: 'Create Account',
      submitting: 'Creating your account...',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign In',
      errMismatch: 'Passwords do not match.',
      errLength: 'Password must be at least 6 characters.',
      errFail: 'Registration failed. Please check your information.'
    },
    hi: {
      title: 'नया ग्राहक खाता बनाएं',
      desc: 'महादेव इलेक्ट्रो हब से जुड़ें और तुरंत ऑर्डर ट्रैकिंग, सुरक्षित पते और सीधा पाली सपोर्ट पाएं।',
      nameLabel: 'पूरा नाम *',
      namePlaceholder: 'उदा. रमेश पटेल',
      phoneLabel: '10-अंकीय मोबाइल नंबर *',
      phonePlaceholder: '10-अंकीय मोबाइल नंबर',
      emailLabel: 'ईमेल पता (वैकल्पिक)',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'पासवर्ड बनाएं *',
      confirmPasswordLabel: 'पासवर्ड की पुष्टि करें *',
      submitBtn: 'खाता बनाएं',
      submitting: 'खाता बनाया जा रहा है...',
      hasAccount: 'क्या आपके पास पहले से खाता है?',
      loginLink: 'लॉगिन करें',
      errMismatch: 'पासवर्ड मेल नहीं खा रहा है।',
      errLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
      errFail: 'पंजीकरण विफल। कृपया अपनी जानकारी जांचें।'
    },
    hinglish: {
      title: 'Naya Customer Account Banayein',
      desc: 'Mahadev Electro Hub ke sath judkar instant order tracking aur direct Pali store support payein.',
      nameLabel: 'Pura Naam *',
      namePlaceholder: 'e.g. Ramesh Patel',
      phoneLabel: '10-Digit Mobile Number *',
      phonePlaceholder: '10-digit mobile number',
      emailLabel: 'Email Address (Optional)',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password Banayein *',
      confirmPasswordLabel: 'Password Confirm Karein *',
      submitBtn: 'Account Banayein',
      submitting: 'Account Ban Raha Hai...',
      hasAccount: 'Pehle se account hai?',
      loginLink: 'Login Karein',
      errMismatch: 'Password match nahi ho raha.',
      errLength: 'Password kam se kam 6 characters ka hona chahiye.',
      errFail: 'Registration fail ho gaya. Kripya details check karein.'
    }
  };

  const c = texts[language] || texts.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(c.errMismatch);
      return;
    }

    if (password.length < 6) {
      setError(c.errLength);
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
      });
      navigate('/my-account');
    } catch (err) {
      setError(err.message || c.errFail);
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
                {c.nameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePlaceholder}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                />
                <User className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                {c.phoneLabel}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={c.phonePlaceholder}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                />
                <Phone className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                {c.emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                  {c.passwordLabel}
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

              <div>
                <label className="block text-xs font-semibold text-[#26352A] mb-1.5">
                  {c.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] text-[#26352A] placeholder-[#7A8277] border border-[#E2E6DC] rounded-lg focus:outline-none focus:border-[#355E3B] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-[#355E3B] absolute left-3 top-3" />
                </div>
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
            {c.hasAccount}{' '}
            <Link to="/login" className="text-[#355E3B] hover:text-[#294A30] font-bold hover:underline">
              {c.loginLink}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
