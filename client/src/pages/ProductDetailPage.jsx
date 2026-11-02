import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1);

    api.getProduct(slug)
      .then(res => {
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.mainImage);
          if (Array.isArray(res.related)) setRelatedProducts(res.related);
          if (Array.isArray(res.reviews)) setReviews(res.reviews);
        }
      })
      .catch(err => {
        console.error('Error fetching product details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#181818] text-white">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#D6A52A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#181818] text-white">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Nahi Mila</h2>
          <Link to="/shop" className="text-[#D6A52A] font-bold underline">
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
    <div className="min-h-screen flex flex-col bg-[#181818] text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-6 flex-wrap font-medium">
          <Link to="/" className="text-[#D1D5DB] hover:text-[#D6A52A] transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          <Link to="/shop" className="text-[#D1D5DB] hover:text-[#D6A52A] transition-colors">{t('shop')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug || product.categoryId}`} className="text-[#D1D5DB] hover:text-[#D6A52A] transition-colors">
                {getProductText(product.category, 'name') || product.category.name_en}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
            </>
          )}
          <span className="text-white font-bold truncate max-w-[200px] md:max-w-none">
            {title}
          </span>
        </div>

        {/* Product Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12 bg-[#242424] p-4 sm:p-6 md:p-8 rounded-3xl border border-[#383838] shadow-md">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1E1E1E] border border-[#383838] flex items-center justify-center p-4">
              <img
                src={selectedImage || product.mainImage}
                alt={title}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#E53935] text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
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
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-[#D6A52A] shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
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
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#383838]">
                <span className="text-[#D6A52A] font-extrabold uppercase tracking-wider text-[11px]">
                  {product.brand || 'Mahadev Electro Hub'}
                </span>

                {/* Inline Product Language Switcher */}
                <div className="flex items-center gap-1.5 text-xs bg-[#181818] px-2.5 py-1 rounded-full border border-[#444444]">
                  <Globe className="w-3.5 h-3.5 text-[#D6A52A]" />
                  <span className="text-[10px] text-[#9CA3AF] font-medium">{t('websiteLanguage')}:</span>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                      language === 'en' ? 'bg-[#D6A52A] text-black shadow-2xs' : 'text-[#D1D5DB] hover:text-[#D6A52A]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hinglish')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                      language === 'hinglish' ? 'bg-[#D6A52A] text-black shadow-2xs' : 'text-[#D1D5DB] hover:text-[#D6A52A]'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded font-devanagari transition-colors ${
                      language === 'hi' ? 'bg-[#D6A52A] text-black shadow-2xs' : 'text-[#D1D5DB] hover:text-[#D6A52A]'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white mb-3 leading-snug">
                {title}
              </h1>

              {/* SKU */}
              <div className="text-xs text-[#9CA3AF] font-mono mb-4">
                SKU: {product.sku}
              </div>

              {/* Price & MRP */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl md:text-4xl font-extrabold text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm md:text-base text-[#9CA3AF] line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {t('save')}: ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/50 text-red-400 border border-red-500/30">
                    ✕ {t('outOfStock')}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('inStock')}</span>
                    </span>
                    {isLowStock && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {t('onlyLeft').replace('{count}', product.stockQuantity)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.short_description_en && (
                <p className="text-xs md:text-sm text-[#E5E7EB] mb-6 leading-relaxed font-normal">
                  {getProductText(product, 'short_description')}
                </p>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold uppercase text-[#E5E7EB]">
                    {t('quantity')}:
                  </span>
                  <div className="flex items-center border border-[#444444] rounded-xl overflow-hidden bg-[#181818]">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 text-[#D1D5DB] hover:bg-white/10 hover:text-white font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-extrabold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.min(product.stockQuantity || 99, prev + 1))}
                      className="px-3.5 py-1.5 text-[#D1D5DB] hover:bg-white/10 hover:text-white font-bold transition-colors"
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
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed border border-[#383838]'
                      : 'border-2 border-[#D6A52A] bg-[#181818] hover:bg-[#D6A52A]/15 text-white active:scale-98'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-[#D6A52A]" />
                  <span>{t('addToCart')}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isOutOfStock
                      ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed border border-[#383838]'
                      : 'bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold active:scale-98 shadow-md shadow-[#D6A52A]/25'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('buyNow')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-red-950/40 text-red-400 border-red-500/40'
                      : 'bg-[#242424] text-[#D1D5DB] border-[#444444] hover:text-red-400 hover:border-red-500/40'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-[#383838] grid grid-cols-3 gap-2 text-center text-[11px] text-[#D1D5DB]">
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#1E1E1E] rounded-xl border border-[#383838]">
                <Truck className="w-4 h-4 text-[#D6A52A]" />
                <span className="font-medium">{product.shippingInfo || 'Fast Pali Dispatch'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#1E1E1E] rounded-xl border border-[#383838]">
                <ShieldCheck className="w-4 h-4 text-[#D6A52A]" />
                <span className="font-medium">{product.warranty || 'Mahadev Warranty'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 bg-[#1E1E1E] rounded-xl border border-[#383838]">
                <RotateCcw className="w-4 h-4 text-[#D6A52A]" />
                <span className="font-medium">{product.returnEligibility || '7 Days Replacement'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Details Area */}
        <div className="bg-[#242424] rounded-3xl border border-[#383838] overflow-hidden shadow-md mb-12">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#383838] bg-[#1E1E1E] overflow-x-auto scrollbar-none text-xs md:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'description'
                  ? 'border-[#D6A52A] text-white bg-[#D6A52A]/15 font-extrabold shadow-sm'
                  : 'border-transparent text-white hover:text-[#D6A52A] hover:bg-white/5 font-bold'
              }`}
            >
              {t('overviewDetails')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'features'
                  ? 'border-[#D6A52A] text-white bg-[#D6A52A]/15 font-extrabold shadow-sm'
                  : 'border-transparent text-white hover:text-[#D6A52A] hover:bg-white/5 font-bold'
              }`}
            >
              {t('keyFeatures')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'specs'
                  ? 'border-[#D6A52A] text-white bg-[#D6A52A]/15 font-extrabold shadow-sm'
                  : 'border-transparent text-white hover:text-[#D6A52A] hover:bg-white/5 font-bold'
              }`}
            >
              {t('specifications')}
            </button>
            {usageInstructions && (
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'instructions'
                    ? 'border-[#D6A52A] text-white bg-[#D6A52A]/15 font-extrabold shadow-sm'
                    : 'border-transparent text-white hover:text-[#D6A52A] hover:bg-white/5 font-bold'
                }`}
              >
                {t('usageInstructions')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#D6A52A] text-white bg-[#D6A52A]/15 font-extrabold shadow-sm'
                  : 'border-transparent text-white hover:text-[#D6A52A] hover:bg-white/5 font-bold'
              }`}
            >
              {t('customerReviewsCount').replace('{count}', reviews.length)}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="text-sm text-[#E5E7EB] leading-relaxed space-y-4 font-normal">
                <p>{description}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-3">
                {features.length > 0 ? (
                  <ul className="space-y-2.5">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-[#E5E7EB]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">Standard product features apply.</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-xs md:text-sm text-left border border-[#383838] rounded-xl overflow-hidden">
                    <tbody className="divide-y divide-[#383838]">
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-[#1E1E1E]' : 'bg-[#181818]'}>
                          <td className="py-3 px-4 font-bold text-white w-1/3 border-r border-[#383838]">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-[#E5E7EB]">
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-[#9CA3AF]">Contact store helpline for full technical specifications.</p>
                )}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="bg-amber-950/40 p-6 rounded-2xl border border-amber-500/30 text-sm text-amber-200 leading-relaxed space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{t('importantSafetyInstructions')}</span>
                </h4>
                <p>{usageInstructions}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit Review */}
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#383838] max-w-xl">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#D6A52A]" />
                    <span>{t('writeReview')}</span>
                  </h4>

                  {reviewSuccess && (
                    <div className="p-3 mb-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-bold">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                        Aapka Naam *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#444444] rounded-lg bg-[#242424] text-white focus:outline-none focus:border-[#D6A52A]"
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#E5E7EB] mb-1">
                        Aapka Feedback *
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#444444] rounded-lg bg-[#242424] text-white focus:outline-none focus:border-[#D6A52A]"
                        placeholder="Is product ke sath aapka anubhav kaisa raha..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 bg-[#D6A52A] hover:bg-[#E5B93B] text-black font-extrabold text-xs rounded-xl transition-all shadow"
                    >
                      {reviewSubmitting ? 'Submitting...' : t('submitReview')}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] italic">
                      Abhi tak koi review nahi hai. Pehle review submit karne wale banein!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-[#383838] space-y-2 bg-[#1E1E1E]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">
                            {rev.customerName}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#E5E7EB] leading-relaxed">{rev.comment}</p>
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
            <h3 className="text-xl font-heading font-extrabold text-white mb-6 pb-2 border-b border-[#383838]">
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
