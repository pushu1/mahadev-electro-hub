import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  CheckCircle2,
  ChevronRight,
  Star,
  MessageSquare,
  Globe
} from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, getProductText, getProductArray, language, setLanguage } = useLanguage();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = useCallback(() => {
    api.getProduct(slug)
      .then(res => {
        if (res && res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(prev => prev || res.product.mainImage);
          if (Array.isArray(res.related)) setRelatedProducts(res.related);
          if (Array.isArray(res.reviews)) setReviews(res.reviews);
        } else {
          setProduct(null);
        }
      })
      .catch(err => {
        console.error('Error fetching product details:', err);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1);
    fetchProduct();

    window.addEventListener('meh_data_synced', fetchProduct);
    window.addEventListener('meh_products_updated', fetchProduct);
    window.addEventListener('focus', fetchProduct);

    return () => {
      window.removeEventListener('meh_data_synced', fetchProduct);
      window.removeEventListener('meh_products_updated', fetchProduct);
      window.removeEventListener('focus', fetchProduct);
    };
  }, [slug, fetchProduct]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#24532F] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#171C17]">Product Nahi Mila</h2>
          <Link to="/shop" className="text-[#24532F] font-bold underline hover:text-[#183D22]">
            Sabhi Products Browse Karein →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = getProductText(product, 'title');
  const description = getProductText(product, 'description');
  const features = getProductArray(product, 'features');
  const usageInstructions = getProductText(product, 'usage_instructions');
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;
  const isWishlisted = wishlist.includes(product.id);

  // Discount percentage
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.mainImage];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    setReviewSubmitting(true);
    setReviewSuccess('');
    try {
      const res = await api.addReview({
        productId: product.id,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success && res.review) {
        setReviews(prev => [res.review, ...prev]);
        setReviewSuccess('Shukriya! Aapka review successfully submit ho gaya.');
        setReviewName('');
        setReviewComment('');
      }
    } catch (err) {
      alert(err.message || 'Review submit karne mein samasya aayi');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252A25]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#596358] mb-6 flex-wrap font-medium">
          <Link to="/" className="text-[#252A25] hover:text-[#24532F] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#356B3D]" />
          <Link to="/shop" className="text-[#252A25] hover:text-[#24532F] transition-colors">{t('shop')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#356B3D]" />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug || product.categoryId}`} className="text-[#252A25] hover:text-[#24532F] transition-colors">
                {getProductText(product.category, 'name') || product.category.name_en}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#356B3D]" />
            </>
          )}
          <span className="text-[#171C17] font-bold truncate max-w-[200px] md:max-w-none">
            {title}
          </span>
        </div>

        {/* Product Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12 bg-[#FFFFFF] p-4 sm:p-6 md:p-8 rounded-3xl border border-[#D5DDD2] shadow-sm">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#D5DDD2] flex items-center justify-center p-4">
              <img
                src={selectedImage || product.mainImage}
                alt={title}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#B94343] text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#24532F] shadow-sm'
                        : 'border-[#D5DDD2] hover:border-[#356B3D]'
                    }`}
                  >
                    <img src={img} alt={`${title} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Product Language Selector Badge */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D5DDD2]">
                <span className="text-[#24532F] font-extrabold uppercase tracking-wider text-[11px]">
                  {product.brand || 'Mahadev Electro Hub'}
                </span>

                {/* Inline Product Language Switcher */}
                <div className="flex items-center gap-1.5 text-xs bg-[#F3F0E6] px-2.5 py-1 rounded-full border border-[#D5DDD2]">
                  <Globe className="w-3.5 h-3.5 text-[#24532F]" />
                  <span className="text-[10px] text-[#596358] font-medium">{t('websiteLanguage')}:</span>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      language === 'en' ? 'bg-[#24532F] text-white shadow-2xs' : 'text-[#252A25] hover:text-[#24532F]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hinglish')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      language === 'hinglish' ? 'bg-[#24532F] text-white shadow-2xs' : 'text-[#252A25] hover:text-[#24532F]'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded font-devanagari transition-colors cursor-pointer ${
                      language === 'hi' ? 'bg-[#24532F] text-white shadow-2xs' : 'text-[#252A25] hover:text-[#24532F]'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-[#171C17] mb-3 leading-snug">
                {title}
              </h1>

              {/* SKU */}
              <div className="text-xs text-[#596358] font-mono mb-4">
                SKU: {product.sku}
              </div>

              {/* Price & MRP */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl md:text-4xl font-extrabold text-[#171C17]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm md:text-base text-[#596358] line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#2E7D46] bg-[#DCE8D5]/70 px-2 py-0.5 rounded-md border border-[#356B3D]/50">
                      {t('save')}: ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#B94343] border border-[#B94343]/30">
                    ✕ {t('outOfStock')}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCE8D5]/70 text-[#2E7D46] border border-[#356B3D]/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D46]" />
                      <span>{t('inStock')}</span>
                    </span>
                    {isLowStock && (
                      <span className="text-xs font-bold text-[#B7791F] bg-[#F3F0E6] border border-[#B7791F]/30 px-2 py-0.5 rounded-md">
                        {t('onlyLeft').replace('{count}', product.stockQuantity)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.short_description_en && (
                <p className="text-xs md:text-sm text-[#252A25] mb-6 leading-relaxed font-normal">
                  {getProductText(product, 'short_description')}
                </p>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold uppercase text-[#171C17]">
                    {t('quantity')}:
                  </span>
                  <div className="flex items-center border border-[#D5DDD2] rounded-xl overflow-hidden bg-[#FAF9F6]">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 text-[#252A25] hover:bg-[#D5DDD2] hover:text-[#171C17] font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-extrabold text-[#171C17]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.min(product.stockQuantity || 99, prev + 1))}
                      className="px-3.5 py-1.5 text-[#252A25] hover:bg-[#D5DDD2] hover:text-[#171C17] font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Working CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isOutOfStock
                      ? 'bg-[#F3F0E6] text-[#596358] cursor-not-allowed border border-[#D5DDD2]'
                      : 'border-2 border-[#24532F] bg-[#FFFFFF] hover:bg-[#F3F0E6] text-[#24532F] active:scale-98'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-[#24532F]" />
                  <span>{t('addToCart')}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isOutOfStock
                      ? 'bg-[#F3F0E6] text-[#596358] cursor-not-allowed border border-[#D5DDD2]'
                      : 'bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold active:scale-98 shadow-[#24532F]/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('buyNow')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    isWishlisted
                      ? 'bg-red-50 text-[#B94343] border-[#B94343]/40'
                      : 'bg-[#FFFFFF] text-[#252A25] border-[#D5DDD2] hover:text-[#B94343] hover:border-[#B94343]/40'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-[#D5DDD2] grid grid-cols-3 gap-2 text-center text-[11px] text-[#171C17]">
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2]">
                <Truck className="w-4 h-4 text-[#24532F]" />
                <span className="font-medium">{product.shippingInfo || 'Fast Pali Dispatch'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2]">
                <ShieldCheck className="w-4 h-4 text-[#24532F]" />
                <span className="font-medium">{product.warranty || 'Mahadev Warranty'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2]">
                <RotateCcw className="w-4 h-4 text-[#24532F]" />
                <span className="font-medium">{product.returnEligibility || '7 Days Replacement'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Details Area */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D5DDD2] overflow-hidden shadow-sm mb-12">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#D5DDD2] bg-[#F3F0E6] overflow-x-auto scrollbar-none text-xs md:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'description'
                  ? 'border-[#24532F] text-[#171C17] bg-[#FFFFFF] font-extrabold shadow-xs'
                  : 'border-transparent text-[#252A25] hover:text-[#171C17] hover:bg-[#FAF9F6] font-bold'
              }`}
            >
              {t('overviewDetails')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'features'
                  ? 'border-[#24532F] text-[#171C17] bg-[#FFFFFF] font-extrabold shadow-xs'
                  : 'border-transparent text-[#252A25] hover:text-[#171C17] hover:bg-[#FAF9F6] font-bold'
              }`}
            >
              {t('keyFeatures')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-[#24532F] text-[#171C17] bg-[#FFFFFF] font-extrabold shadow-xs'
                  : 'border-transparent text-[#252A25] hover:text-[#171C17] hover:bg-[#FAF9F6] font-bold'
              }`}
            >
              {t('specifications')}
            </button>
            {usageInstructions && (
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === 'instructions'
                    ? 'border-[#24532F] text-[#171C17] bg-[#FFFFFF] font-extrabold shadow-xs'
                    : 'border-transparent text-[#252A25] hover:text-[#171C17] hover:bg-[#FAF9F6] font-bold'
                }`}
              >
                {t('usageInstructions')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#24532F] text-[#171C17] bg-[#FFFFFF] font-extrabold shadow-xs'
                  : 'border-transparent text-[#252A25] hover:text-[#171C17] hover:bg-[#FAF9F6] font-bold'
              }`}
            >
              {t('customerReviewsCount').replace('{count}', reviews.length)}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="text-sm text-[#252A25] leading-relaxed space-y-4 font-normal">
                <p>{description}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-3">
                {features.length > 0 ? (
                  <ul className="space-y-2.5">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-[#252A25]">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D46] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#596358]">Standard product features apply.</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-xs md:text-sm text-left border border-[#D5DDD2] rounded-xl overflow-hidden">
                    <tbody className="divide-y divide-[#D5DDD2]">
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-[#FFFFFF]'}>
                          <td className="py-3 px-4 font-bold text-[#171C17] w-1/3 border-r border-[#D5DDD2]">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-[#252A25]">
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-[#596358]">Contact store helpline for full technical specifications.</p>
                )}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="bg-[#F3F0E6] p-6 rounded-2xl border border-[#B7791F]/30 text-sm text-[#252A25] leading-relaxed space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-[#B7791F]">
                  <ShieldCheck className="w-4 h-4 text-[#B7791F]" />
                  <span>{t('importantSafetyInstructions')}</span>
                </h4>
                <p>{usageInstructions}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit Review */}
                <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#D5DDD2] max-w-xl">
                  <h4 className="text-sm font-bold text-[#171C17] mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#24532F]" />
                    <span>{t('writeReview')}</span>
                  </h4>

                  {reviewSuccess && (
                    <div className="p-3 mb-3 bg-[#DCE8D5]/70 border border-[#356B3D]/50 text-[#2E7D46] text-xs rounded-xl font-bold">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#171C17] mb-1">
                        Aapka Naam *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#D5DDD2] rounded-lg bg-[#FFFFFF] text-[#171C17] focus:outline-none focus:border-[#24532F]"
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171C17] mb-1">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'text-[#B7791F] fill-[#B7791F]'
                                  : 'text-[#D5DDD2]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171C17] mb-1">
                        Aapka Feedback *
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#D5DDD2] rounded-lg bg-[#FFFFFF] text-[#171C17] focus:outline-none focus:border-[#24532F]"
                        placeholder="Is product ke sath aapka anubhav kaisa raha..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      {reviewSubmitting ? 'Submitting...' : t('submitReview')}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-[#596358] italic">
                      Abhi tak koi review nahi hai. Pehle review submit karne wale banein!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-[#D5DDD2] space-y-2 bg-[#FAF9F6]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#171C17]">
                            {rev.customerName}
                          </span>
                          <span className="text-[10px] text-[#596358]">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-[#B7791F] fill-[#B7791F]' : 'text-[#D5DDD2]'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#252A25] leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-heading font-extrabold text-[#171C17] mb-6 pb-2 border-b border-[#D5DDD2]">
              {t('relatedProducts')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
