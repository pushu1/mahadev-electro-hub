import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function FaqPage() {
  const { language, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = {
    en: {
      eyebrow: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Frequently Asked Questions (FAQs)',
      subtitle: 'Everything you need to know about Mahadev Electro Hub products, solar zatka machines, street lights, warranty, and fast delivery.',
      needMoreHelp: 'Still have questions? Our Pali store team is here to help.',
      callUs: 'Call Helpline',
      whatsappUs: 'WhatsApp Support',
      items: [
        {
          q: 'What does the 2 KM vs 5 KM fencing distance mean for Zatka Machines?',
          a: 'The 2 KM and 5 KM ratings represent the maximum effective distance tested under ideal manufacturer conditions. In actual field conditions, coverage depends on quality wire insulation, a 3-foot deep earthing rod placed in moist soil, and keeping the fence line clear of excessive tall grass or dry vegetation.',
        },
        {
          q: 'Is the Zatka Machine safe for animals and humans?',
          a: 'Yes, it is 100% safe and non-lethal. Our energizers deliver intermittent microsecond shock pulses (with 1.0 to 1.2 second pause intervals). This deters nilgai, wild boars, and stray cattle without causing biological harm or lasting injury. Always place high-visibility warning boards every 50 meters along your farm boundary wire.',
        },
        {
          q: 'How does the All-in-One Solar Street Light work during winter and rainy seasons?',
          a: 'The solar street light turns ON automatically at dusk and turns OFF at dawn. It features a heavy-duty LiFePO4 battery and an intelligent radar motion sensor that dims the light when idle to conserve energy, maintaining reliable all-night illumination even across 2 to 3 consecutive cloudy or rainy days.',
        },
        {
          q: 'What is the delivery timeline across Rajasthan and other states?',
          a: 'Every order is dispatched from our Pali warehouse within 24 hours with multi-layer shockproof transit packaging. Delivery within Rajasthan typically arrives within 1 to 3 business days, while delivery to other states takes 3 to 5 business days via trusted express couriers.',
        },
        {
          q: 'How do I claim a warranty or repair service for my product?',
          a: 'Keep your order number or invoice receipt handy. For any technical issue or warranty claim, contact our Pali store helpline on +91 70142 48415 via call or WhatsApp. Our team will promptly guide you through diagnosis, genuine spare parts replacement, or doorstep service support.',
        },
      ],
    },
    hinglish: {
      eyebrow: 'AKSAR POOCHE JANE WALE SAWAL',
      title: 'Aksar Pooche Jane Wale Sawal (FAQs)',
      subtitle: 'Mahadev Electro Hub ke products, zatka machines, solar street lights aur fast delivery se judi sabhi zaroori jaankariyan.',
      needMoreHelp: 'Koi aur sawal hai? Hamari Pali store team hamesha aapki madad ke liye tayyar hai.',
      callUs: 'Helpline Call Karein',
      whatsappUs: 'WhatsApp Par Poochein',
      items: [
        {
          q: 'Zatka Machine ki 2 KM vs 5 KM fencing distance ka kya matlab hai?',
          a: '2 KM aur 5 KM ki rating ideal conditions mein manufacturer dwara test ki gayi maximum distance hai. Khet mein iska actual coverage achhi wire insulation, geeli mitti mein 3-foot deep earthing rod, aur taar par ghaas-phoos na chhoone par nirbhar karta hai.',
        },
        {
          q: 'Kya Zatka Machine janwaron aur insano ke liye surakshit hai?',
          a: 'Haan, yeh 100% surakshit aur non-lethal hai. Hamari zatka machines microsecond pulse mein ruk-ruk kar (1.0 se 1.2 second pause) jhatka deti hain. Isse nilgai, suar aur pashu darr kar khet se door chale jaate hain bina kisi biological harm ya nuksaan ke. Khet ke boundary taar par har 50 meter par warning board zaroor lagayein.',
        },
        {
          q: 'All-in-One Solar Street Light sardiyon aur barish mein kaise kaam karti hai?',
          a: 'Solar street light sham hote hi automatically ON ho jati hai aur subah roshni aane par OFF ho jati hai. Isme high-grade LiFePO4 battery aur radar motion sensor hota hai jo 2-3 lagatar cloudy days mein bhi poora backup maintain rakhta hai.',
        },
        {
          q: 'Rajasthan aur doosre states mein delivery kitne dino mein hoti hai?',
          a: 'Pali warehouse se har order 24 ghante ke andar shockproof packing ke sath dispatch hota hai. Rajasthan mein delivery aamtaur par 1 se 3 business days mein ho jaati hai, jabki baaki states mein 3 se 5 din lagte hain.',
        },
        {
          q: 'Product ki warranty claim karne ka kya tareeka hai?',
          a: 'Apna order number ya invoice sambhal kar rakhein. Kisi bhi problem ke case mein hamari Pali store helpline +91 70142 48415 par call ya WhatsApp karein. Hamari team turant inspection aur genuine warranty repair ya replacement facilitate karti hai.',
        },
      ],
    },
    hi: {
      eyebrow: 'अक्सर पूछे जाने वाले सवाल',
      title: 'अक्सर पूछे जाने वाले सवाल (FAQs)',
      subtitle: 'महादेव इलेक्ट्रो हब के उत्पादों, सोलर झटका मशीनों, स्ट्रीट लाइट्स, वारंटी और डिलीवरी से जुड़ी पूरी जानकारी।',
      needMoreHelp: 'क्या आपका कोई और सवाल है? हमारी पाली स्टोर टीम सहायता के लिए उपलब्ध है।',
      callUs: 'हेल्पलाइन पर कॉल करें',
      whatsappUs: 'व्हाट्सएप सहायता',
      items: [
        {
          q: 'झटका मशीन की 2 किमी बनाम 5 किमी फेंसिंग दूरी का क्या मतलब है?',
          a: '2 किमी और 5 किमी की रेटिंग आदर्श परिस्थितियों में निर्माता द्वारा परीक्षित अधिकतम दूरी है। खेत में इसका वास्तविक कवरेज अच्छी वायर इंसुलेशन, गीली मिट्टी में 3-फीट गहरी अर्थिंग रॉड और तार पर अधिक घास-फूस न छूने पर निर्भर करता है।',
        },
        {
          q: 'क्या झटका मशीन जानवरों और इंसानों के लिए सुरक्षित है?',
          a: 'हाँ, यह 100% सुरक्षित और गैर-घातक है। हमारी झटका मशीनें माइक्रोसेकंड पल्स में रुक-रुक कर (1.0 से 1.2 सेकंड का अंतराल) करंट देती हैं। इससे नीलगाय, जंगली सूअर और मवेशी बिना किसी शारीरिक नुकसान के खेत से दूर चले जाते हैं। खेत के बाउंड्री तार पर हर 50 मीटर पर चेतावनी बोर्ड अवश्य लगाएं।',
        },
        {
          q: 'ऑल-इन-वन सोलर स्ट्रीट लाइट सर्दियों और बारिश में कैसे काम करती है?',
          a: 'सोलर स्ट्रीट लाइट शाम होते ही अपने आप ऑन हो जाती है और सुबह रोशनी आने पर ऑफ हो जाती है। इसमें उच्च श्रेणी की LiFePO4 बैटरी और रडार मोशन सेंसर होता है, जो लगातार 2-3 बादलों वाले दिनों में भी पूरी रात का बैकअप बनाए रखता है।',
        },
        {
          q: 'राजस्थान और अन्य राज्यों में डिलीवरी कितने दिनों में होती है?',
          a: 'पाली वेयरहाउस से प्रत्येक ऑर्डर 24 घंटे के भीतर मल्टी-लेयर शॉकप्रूफ पैकिंग के साथ भेजा जाता है। राजस्थान में डिलीवरी आमतौर पर 1 से 3 कार्य दिवसों में होती है, जबकि अन्य राज्यों में 3 से 5 दिन लगते हैं।',
        },
        {
          q: 'उत्पाद की वारंटी क्लेम करने की क्या प्रक्रिया है?',
          a: 'अपना ऑर्डर नंबर या इनवॉइस रसीद संभाल कर रखें। किसी भी समस्या या वारंटी क्लेम के लिए हमारे पाली स्टोर हेल्पलाइन +91 70142 48415 पर कॉल या व्हाट्सएप करें। हमारी टीम तुरंत जांच और प्रामाणिक वारंटी सेवा या रिप्लेसमेंट प्रदान करती है।',
        },
      ],
    },
  };

  const currentFaq = faqData[language] || faqData.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#24532F] block mb-2">
            {currentFaq.eyebrow}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-[#171C17] tracking-tight">
            {currentFaq.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#252A25] mt-3 leading-relaxed">
            {currentFaq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {currentFaq.items.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FFFFFF] border-[#24532F] shadow-sm'
                    : 'bg-[#FFFFFF] border-[#D5DDD2] hover:border-[#356B3D]'
                }`}
              >
                {/* Question Button */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-[#171C17] hover:text-[#24532F] transition-colors cursor-pointer select-none"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#24532F] shrink-0" />
                    <span className="leading-snug">{faq.q}</span>
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#DCE8D5]/70 text-[#183D22] rotate-180'
                        : 'bg-[#F3F0E6] text-[#596358]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-[#24532F]" />
                  </div>
                </button>

                {/* Answer Container */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-xs sm:text-sm text-[#252A25] leading-relaxed border-t border-[#D5DDD2] bg-[#FAF9F6] animate-fadeIn">
                    <p className="whitespace-normal break-words">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Helpful Contact Box */}
        <div className="mt-12 p-6 rounded-2xl bg-[#FFFFFF] border border-[#D5DDD2] text-center max-w-xl mx-auto shadow-sm">
          <p className="text-xs sm:text-sm text-[#252A25] mb-4">
            {currentFaq.needMoreHelp}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+917014248415"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F0E6] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] hover:text-[#24532F] font-bold text-xs transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#24532F]" />
              <span>{currentFaq.callUs}</span>
            </a>
            <a
              href="https://wa.me/917014248415?text=Namaste%20Mahadev%20Electro%20Hub%2C%20mujhe%20kuchh%20sawal%20poochne%20hain."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>{currentFaq.whatsappUs}</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
