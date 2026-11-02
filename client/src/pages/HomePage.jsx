import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import ZatkaMachinesSection from '../components/home/ZatkaMachinesSection.jsx';
import TorchesHeadlampsSection from '../components/home/TorchesHeadlampsSection.jsx';
import MostLovedSection from '../components/home/MostLovedSection.jsx';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import NewArrivalsSection from '../components/home/NewArrivalsSection.jsx';
import CollectionPromoSlider from '../components/home/CollectionPromoSlider.jsx';
import PromotionalBanner from '../components/home/PromotionalBanner.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import ReelsShowcase from '../components/home/ReelsShowcase.jsx';
import ShopByUse from '../components/home/ShopByUse.jsx';
import CustomerReviewsSection from '../components/home/CustomerReviewsSection.jsx';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories.js';
import {
  DEFAULT_FEATURED_PRODUCTS,
  DEFAULT_NEW_ARRIVALS,
  DEFAULT_ZATKA_PRODUCTS,
  DEFAULT_TORCHES_HEADLAMPS_PRODUCTS,
} from '../data/defaultProducts.js';

export default function HomePage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(DEFAULT_FEATURED_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState(DEFAULT_NEW_ARRIVALS);
  const [zatkaProducts, setZatkaProducts] = useState(DEFAULT_ZATKA_PRODUCTS);
  const [torchesHeadlampsProducts, setTorchesHeadlampsProducts] = useState(DEFAULT_TORCHES_HEADLAMPS_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    Promise.allSettled([
      api.getCategories(),
      api.getProducts({ featured: 'true' }),
      api.getProducts({ sort: 'newest', limit: 10 }),
      api.getProducts({ category: 'zatka-machines' }),
      api.getProducts({ category: 'torches,headlamps' }),
    ])
      .then(([catsRes, featRes, newRes, zatkaRes, thRes]) => {
        if (catsRes.status === 'fulfilled' && catsRes.value?.success && Array.isArray(catsRes.value.categories) && catsRes.value.categories.length > 0) {
          setCategories(catsRes.value.categories);
        }
        if (featRes.status === 'fulfilled' && featRes.value?.success && Array.isArray(featRes.value.products) && featRes.value.products.length > 0) {
          setFeaturedProducts(featRes.value.products);
        }
        if (newRes.status === 'fulfilled' && newRes.value?.success && Array.isArray(newRes.value.products) && newRes.value.products.length > 0) {
          setNewArrivals(newRes.value.products);
        }
        if (zatkaRes.status === 'fulfilled' && zatkaRes.value?.success && Array.isArray(zatkaRes.value.products) && zatkaRes.value.products.length > 0) {
          setZatkaProducts(zatkaRes.value.products);
        }
        if (thRes.status === 'fulfilled' && thRes.value?.success && Array.isArray(thRes.value.products) && thRes.value.products.length > 0) {
          setTorchesHeadlampsProducts(thRes.value.products);
        }
      })
      .catch((err) => {
        console.warn('API sync notice (using resilient authentic fallback):', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25] relative overflow-x-clip">
      <Header />

      {/* Persistent Animated Croma RGB Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Left Dark Burgundy & Red Glow */}
        <div className="croma-rgb-orb-left top-[5%] -left-[18%] w-[600px] h-[600px] md:w-[850px] md:h-[850px]" />

        {/* Right Warm Amber & Golden Orange Glow */}
        <div className="croma-rgb-orb-right top-[20%] -right-[18%] w-[550px] h-[550px] md:w-[800px] md:h-[800px]" />

        {/* Mid-Left Deep Purple Glow */}
        <div className="croma-rgb-orb-bottom top-[52%] -left-[14%] w-[550px] h-[550px] md:w-[750px] md:h-[750px]" />

        {/* Bottom-Right Amber/Gold Glow */}
        <div className="croma-rgb-orb-amber top-[76%] -right-[14%] w-[580px] h-[580px] md:w-[800px] md:h-[800px]" />
      </div>

      <main className="flex-1 relative z-10">
        {/* Section 1: Main Hero Banner Slider */}
        <HeroSlider />

        {/* Section 2: Most Loved By People (Scroll-Animated Best Sellers) */}
        <MostLovedSection />

        {/* Section 3: Shop by Category */}
        <CategoryGrid categories={categories} />

        {/* Section 4: Featured Products Slider */}
        <FeaturedProducts products={featuredProducts} />

        {/* Section 5: New Arrivals Slider */}
        <NewArrivalsSection initialProducts={newArrivals} />

        {/* Section 6: Existing Promotional Collection Sections (5 Slides) */}
        <CollectionPromoSlider />

        {/* Section 7: Zatka Machines — Product Slider (Restored to original higher position) */}
        <ZatkaMachinesSection initialProducts={zatkaProducts} />

        {/* Section 8: Solar Zatka Machines & Boundary Fencing — Promotional Banner */}
        <PromotionalBanner />

        {/* Section 9: Torches & Headlamps Combined Product Slider */}
        <TorchesHeadlampsSection initialProducts={torchesHeadlampsProducts} />

        {/* Section 10: Shop by Use */}
        <ShopByUse />

        {/* Section 11: Why Choose Us */}
        <WhyChooseUs />

        {/* Section 12: Reels Showcase */}
        <ReelsShowcase />

        {/* Section 13: Customer Reviews */}
        <CustomerReviewsSection />
      </main>

      <Footer />
    </div>
  );
}
