import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AnnouncementBar() {
  const { language } = useLanguage();
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    api.getAnnouncement()
      .then(res => {
        if (res.success && res.announcement && res.announcement.isActive) {
          setAnnouncement(res.announcement);
        }
      })
      .catch(() => {});
  }, []);

  if (announcement && announcement.isActive === false) return null;

  // Multilingual text from Admin CMS or fallback
  let customText = '';
  if (language === 'hi' && announcement?.text_hi) {
    customText = announcement.text_hi;
  } else if (language === 'hinglish' && (announcement?.text_hinglish || announcement?.text_hi)) {
    customText = announcement.text_hinglish || announcement.text_hi;
  } else if (announcement?.text_en) {
    customText = announcement.text_en;
  }

  const destinationLink = announcement?.link || '/shop';

  // Language-specific marquee message segments with forest green highlights
  const marqueeItems = language === 'hi' ? [
    { text: '⚡ प्रीमियम इलेक्ट्रिकल और सोलर उत्पाद', highlight: true },
    { text: '100% असली क्वालिटी टेस्टेड', highlight: false },
    { text: 'पूरे राजस्थान में तेज़ डिलीवरी', highlight: true },
    { text: 'महादेव इलेक्ट्रो हब, पाली', highlight: false },
    { text: 'सुरक्षित कैश ऑन डिलीवरी', highlight: true },
  ] : language === 'hinglish' ? [
    { text: '⚡ Premium Electrical Aur Solar Products', highlight: true },
    { text: '100% Asli Quality Tested', highlight: false },
    { text: 'Poore Rajasthan Mein Tez Delivery', highlight: true },
    { text: 'Mahadev Electro Hub, Pali', highlight: false },
    { text: 'Surakshit Cash on Delivery', highlight: true },
  ] : [
    { text: '⚡ Premium Electrical & Solar Products', highlight: true },
    { text: 'Genuine Quality Tested', highlight: false },
    { text: 'Fast Delivery Across Rajasthan', highlight: true },
    { text: 'Mahadev Electro Hub, Pali', highlight: false },
    { text: '100% Genuine Certified', highlight: true },
  ];

  const renderSegmentGroup = (keyPrefix) => (
    <div key={keyPrefix} className="inline-flex items-center gap-8 px-6 shrink-0">
      {marqueeItems.map((item, idx) => (
        <span key={`${keyPrefix}-${idx}`} className="inline-flex items-center gap-3">
          <span className={item.highlight ? 'text-[#355E3B] font-bold' : 'text-[#26352A] font-medium'}>
            {item.text}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8BA889]" aria-hidden="true" />
        </span>
      ))}
      {customText && (
        <span className="inline-flex items-center gap-3">
          <span className="text-[#26352A] font-medium hover:text-[#355E3B] transition-colors">{customText}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8BA889]" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  return (
    <aside
      role="region"
      aria-label="Store Announcement"
      className="w-full h-[30px] sm:h-[32px] md:h-[34px] bg-[#F3F0E6] border-b border-[#E2E6DC] text-[11px] sm:text-xs font-normal tracking-wide flex items-center overflow-hidden select-none relative z-50 text-[#26352A]"
    >
      <Link
        to={destinationLink}
        className="marquee-container w-full flex items-center h-full"
        title="View Announcement Details"
      >
        <div className="marquee-content flex items-center py-0.5">
          {renderSegmentGroup('grp1')}
          {renderSegmentGroup('grp2')}
        </div>
      </Link>
    </aside>
  );
}
