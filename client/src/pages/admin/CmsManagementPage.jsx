import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Palette,
  Bell,
  Image,
  Tag,
  MessageSquare,
  Settings,
  Check,
  Save,
  Globe,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ExternalLink,
  Package,
  Eye,
  EyeOff,
  Layers,
  Upload,
  Star,
  MapPin,
  CheckCircle2,
  Edit,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Filter
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { translations as defaultTranslations } from '../../translations.js';

export default function CmsManagementPage() {
  const { reloadTranslations } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'newArrivals';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['newArrivals', 'announcement', 'banners', 'coupons', 'reviews', 'settings', 'translations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // New Arrivals Management State
  const [allProducts, setAllProducts] = useState([]);
  const [newArrivalsConfig, setNewArrivalsConfig] = useState({
    title_en: 'New Arrivals',
    title_hi: 'नए उत्पाद',
    subtitle_en: 'Discover Our Latest Products',
    subtitle_hi: 'हमारे नवीनतम उत्पाद देखें',
    displayLimit: 8,
    items: [],
  });
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [savingNewArrivals, setSavingNewArrivals] = useState(false);

  // Collection Promo Slider State (5 Slides)
  const [collectionSlides, setCollectionSlides] = useState([]);
  const [savingCollectionSlides, setSavingCollectionSlides] = useState(false);
  const [uploadingSlideImgId, setUploadingSlideImgId] = useState(null);

  // Announcement State
  const [announcement, setAnnouncement] = useState({
    text_en: '',
    text_hi: '',
    link: '',
    bgColor: '#F3F0E6',
    textColor: '#355E3B',
    isActive: true,
  });

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Mahadev Electro Hub',
    phone: '+91 98765 43210',
    email: 'contact@mahadevelectrohub.com',
    address: 'Main Market, Pali, Rajasthan, India - 306401',
    freeShippingThreshold: 1000,
    standardShippingFee: 99,
  });

  // Banners, Coupons, Reviews
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Customer Reviews Management State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewFilterStatus, setReviewFilterStatus] = useState('ALL');
  const [reviewImageUploading, setReviewImageUploading] = useState(false);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    id: '',
    customerName: '',
    customerPhoto: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
    productId: '',
    productName: '',
    isVerified: true,
    isActive: true,
    status: 'APPROVED',
    sortOrder: 1,
  });

  // Multilingual Translations State
  const [translationsData, setTranslationsData] = useState({
    en: { ...defaultTranslations.en },
    hinglish: { ...defaultTranslations.hinglish },
    hi: { ...defaultTranslations.hi },
  });
  const [selectedTransLang, setSelectedTransLang] = useState('en');

  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.getAnnouncement(),
      api.getSettings(),
      api.getBanners(true),
      api.getCoupons(),
      api.getAllReviews(),
      api.getTranslations?.(),
      api.getProducts({ limit: 100 }),
      api.getNewArrivals?.(),
      api.getCollectionSlides?.(true),
    ]).then(([annRes, setRes, banRes, coupRes, revRes, transRes, prodRes, newArrRes, slideRes]) => {
      if (annRes?.success && annRes.announcement) setAnnouncement(annRes.announcement);
      if (setRes?.success && setRes.settings) setSettings(setRes.settings);
      if (banRes?.success && Array.isArray(banRes.banners)) setBanners(banRes.banners);
      if (coupRes?.success && Array.isArray(coupRes.coupons)) setCoupons(coupRes.coupons);
      if (revRes?.success && Array.isArray(revRes.reviews)) setReviews(revRes.reviews);
      if (prodRes?.success && Array.isArray(prodRes.products)) setAllProducts(prodRes.products);
      if (newArrRes?.success && newArrRes.config) {
        setNewArrivalsConfig(newArrRes.config);
      }
      if (slideRes?.success && Array.isArray(slideRes.slides)) {
        setCollectionSlides(slideRes.slides);
      }
      if (transRes?.success && transRes.translations) {
        setTranslationsData({
          en: { ...defaultTranslations.en, ...(transRes.translations.en || {}) },
          hinglish: { ...defaultTranslations.hinglish, ...(transRes.translations.hinglish || {}) },
          hi: { ...defaultTranslations.hi, ...(transRes.translations.hi || {}) },
        });
      }
    }).catch(console.error);
  }, []);

  const handleSaveTranslations = async (e) => {
    e.preventDefault();
    try {
      await api.updateTranslations(translationsData);
      if (reloadTranslations) await reloadTranslations();
      setSavedMsg('Translations successfully save ho gayi aur website par live ho gayi!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Translations update karne mein samasya aayi');
    }
  };

  const updateTranslationKey = (lang, key, value) => {
    setTranslationsData(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value,
      }
    }));
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.updateAnnouncement(announcement);
      setSavedMsg('Changes Successfully Save Ho Gaye');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Announcement update karne mein error aayi');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSavedMsg('Changes Successfully Save Ho Gaye');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Settings update karne mein error aayi');
    }
  };

  const handleReviewStatus = async (id, status) => {
    try {
      await api.updateReviewStatus(id, status);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      setSavedMsg('Review status updated.');
      setTimeout(() => setSavedMsg(''), 2500);
      window.dispatchEvent(new Event('meh_reviews_updated'));
    } catch (err) {
      alert(err.message || 'Error updating review');
    }
  };

  const handleOpenAddReview = () => {
    setEditingReview(null);
    setReviewFormData({
      id: '',
      customerName: '',
      customerPhoto: '',
      location: 'Pali, Rajasthan',
      rating: 5,
      title: '',
      comment: '',
      productId: allProducts[0]?.id || '',
      productName: allProducts[0]?.title_en || '',
      isVerified: true,
      isActive: true,
      status: 'APPROVED',
      sortOrder: (reviews?.length || 0) + 1,
    });
    setReviewModalOpen(true);
  };

  const handleOpenEditReview = (rev) => {
    setEditingReview(rev);
    setReviewFormData({
      id: rev.id,
      customerName: rev.customerName || '',
      customerPhoto: rev.customerPhoto || '',
      location: rev.location || '',
      rating: Number(rev.rating) || 5,
      title: rev.title || '',
      comment: rev.comment || '',
      productId: rev.productId || '',
      productName: rev.productName || '',
      isVerified: rev.isVerified !== false,
      isActive: rev.isActive !== false,
      status: rev.status || 'APPROVED',
      sortOrder: Number(rev.sortOrder) || 1,
    });
    setReviewModalOpen(true);
  };

  const handleReviewPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB.');
      return;
    }

    setReviewImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadImage(formData);
      if (res.success && res.fileUrl) {
        setReviewFormData(prev => ({ ...prev, customerPhoto: res.fileUrl }));
      } else {
        alert(res.message || 'Image upload failed');
      }
    } catch (err) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setReviewImageUploading(false);
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewFormData.customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }
    if (!reviewFormData.comment.trim()) {
      alert('Please enter review comment.');
      return;
    }

    // Match product name if productId chosen
    let pName = reviewFormData.productName;
    if (reviewFormData.productId) {
      const matchedProd = allProducts.find(p => p.id === reviewFormData.productId);
      if (matchedProd) pName = matchedProd.title_en;
    }

    const payload = {
      ...reviewFormData,
      productName: pName,
    };

    try {
      if (editingReview) {
        const res = await api.updateReview(editingReview.id, payload);
        if (res.success) {
          setReviews(prev => prev.map(r => r.id === editingReview.id ? res.review : r));
          setSavedMsg('Customer review updated successfully.');
        }
      } else {
        const res = await api.createReview(payload);
        if (res.success) {
          setReviews(prev => [res.review, ...prev]);
          setSavedMsg('New customer review added successfully.');
        }
      }
      setTimeout(() => setSavedMsg(''), 3000);
      setReviewModalOpen(false);
      window.dispatchEvent(new Event('meh_reviews_updated'));
    } catch (err) {
      alert(err.message || 'Failed to save review');
    }
  };

  const handleToggleReviewActive = async (id) => {
    try {
      const res = await api.toggleReviewActive(id);
      if (res.success) {
        setReviews(prev => prev.map(r => r.id === id ? res.review : r));
        setSavedMsg(res.message || 'Review status updated.');
        setTimeout(() => setSavedMsg(''), 2500);
        window.dispatchEvent(new Event('meh_reviews_updated'));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle review status');
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteConfirmReview) return;
    try {
      const res = await api.deleteReview(deleteConfirmReview.id);
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== deleteConfirmReview.id));
        setSavedMsg('Review deleted successfully.');
        setTimeout(() => setSavedMsg(''), 2500);
        window.dispatchEvent(new Event('meh_reviews_updated'));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setDeleteConfirmReview(null);
    }
  };

  const handleMoveReviewOrder = async (index, direction) => {
    const list = [...reviews];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else {
      return;
    }
    const orderedIds = list.map(r => r.id);
    setReviews(list);
    try {
      await api.reorderReviews(orderedIds);
      window.dispatchEvent(new Event('meh_reviews_updated'));
    } catch (err) {
      console.warn('Reorder sync error:', err.message);
    }
  };

  const handleMoveNewArrival = (index, direction) => {
    const items = [...(newArrivalsConfig.items || [])];
    if (direction === 'up' && index > 0) {
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
    } else if (direction === 'down' && index < items.length - 1) {
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
    }
    const reordered = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNewArrivalsConfig(prev => ({ ...prev, items: reordered }));
  };

  const handleToggleNewArrivalEnabled = (productId) => {
    setNewArrivalsConfig(prev => ({
      ...prev,
      items: (prev.items || []).map(item =>
        item.productId === productId ? { ...item, enabled: item.enabled === false ? true : false } : item
      ),
    }));
  };

  const handleRemoveNewArrival = (productId) => {
    setNewArrivalsConfig(prev => {
      const filtered = (prev.items || []).filter(item => item.productId !== productId);
      return {
        ...prev,
        items: filtered.map((item, idx) => ({ ...item, order: idx + 1 })),
      };
    });
  };

  const handleAddProductToNewArrivals = () => {
    if (!selectedProductToAdd) return;
    const exists = (newArrivalsConfig.items || []).some(item => item.productId === selectedProductToAdd);
    if (exists) {
      alert('This product is already present in the New Arrivals list.');
      return;
    }
    const newItem = {
      productId: selectedProductToAdd,
      order: (newArrivalsConfig.items || []).length + 1,
      enabled: true,
    };
    setNewArrivalsConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
    setSelectedProductToAdd('');
  };

  const handleSaveNewArrivals = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingNewArrivals(true);
    try {
      await api.updateNewArrivals(newArrivalsConfig);
      localStorage.setItem('meh_new_arrivals_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_new_arrivals_updated'));
      setSavedMsg('New Arrivals configuration saved! Storefront updated immediately.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update New Arrivals settings');
    } finally {
      setSavingNewArrivals(false);
    }
  };

  const handleMoveCollectionSlide = (index, direction) => {
    const list = [...collectionSlides];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCollectionSlides(reordered);
  };

  const handleToggleCollectionSlideActive = (id) => {
    setCollectionSlides(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleUpdateCollectionSlideField = (id, field, value) => {
    setCollectionSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSlideImageUpload = async (slideId, file) => {
    if (!file) return;
    setUploadingSlideImgId(slideId);
    const body = new FormData();
    body.append('image', file);
    try {
      const res = await api.uploadImage(body);
      if (res.success && res.fileUrl) {
        handleUpdateCollectionSlideField(slideId, 'image', res.fileUrl);
        setSavedMsg('Slide image uploaded successfully!');
        setTimeout(() => setSavedMsg(''), 2500);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingSlideImgId(null);
    }
  };

  const handleSaveCollectionSlides = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingCollectionSlides(true);
    try {
      await api.updateCollectionSlides(collectionSlides);
      localStorage.setItem('meh_collection_slides_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_collection_slides_updated'));
      setSavedMsg('Promotional Collection Slider updated and live on storefront!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save collection slides');
    } finally {
      setSavingCollectionSlides(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#26352A]">
            CMS, Banners & Store Content
          </h1>
          <p className="text-xs text-[#7A8277] mt-0.5">
            Top announcement bar, homepage promotions, discount coupons aur customer reviews moderate karein.
          </p>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E6DC] bg-white rounded-t-xl overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('newArrivals')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'newArrivals' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Package className="w-4 h-4 text-[#355E3B]" />
            <span>New Arrivals Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collectionPromo')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'collectionPromo' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#355E3B]" />
            <span>Collection Promo Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'announcement' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Bell className="w-4 h-4 text-[#355E3B]" />
            <span>Announcement Bar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'banners' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Image className="w-4 h-4 text-[#355E3B]" />
            <span>Hero Banners</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'coupons' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Tag className="w-4 h-4 text-[#355E3B]" />
            <span>Discount Coupons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'reviews' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#355E3B]" />
            <span>Customer Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'settings' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#355E3B]" />
            <span>Store Configuration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('translations')}
            className={`py-3.5 px-6 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'translations' ? 'border-[#355E3B] text-[#294A30] bg-[#DCE8D5]/20 font-bold' : 'border-transparent text-[#7A8277] hover:text-[#26352A]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#355E3B]" />
            <span>Languages & Translations</span>
          </button>
        </div>

        {/* Tab 0: New Arrivals Management */}
        {activeTab === 'newArrivals' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E6DC] gap-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#26352A] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#355E3B]" />
                  Homepage New Arrivals Management
                </h3>
                <p className="text-xs text-[#7A8277] mt-1">
                  Manage products showcased in the storefront &quot;New Arrivals&quot; section. Reorder items, toggle visibility, adjust display limit, or add products from your catalog.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveNewArrivals}
                disabled={savingNewArrivals}
                className="px-5 py-2.5 bg-[#355E3B] text-white font-extrabold text-xs rounded-xl hover:brightness-105 transition-all shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingNewArrivals ? 'Saving Changes...' : 'Save Section Settings'}</span>
              </button>
            </div>

            {/* General Section Settings */}
            <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#E2E6DC] space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#26352A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                Section Configuration & Display Limit
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#7A8277]">Homepage Display Limit</label>
                  <select
                    value={newArrivalsConfig.displayLimit || 8}
                    onChange={(e) => setNewArrivalsConfig(prev => ({ ...prev, displayLimit: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium focus:ring-1 focus:ring-[#8BA889] focus:outline-hidden"
                  >
                    <option value={4}>4 Products (1 Full Row)</option>
                    <option value={8}>8 Products (2 Full Rows - Recommended)</option>
                    <option value={12}>12 Products (3 Full Rows)</option>
                    <option value={16}>16 Products (4 Full Rows)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Maximum number of active products shown on homepage.</p>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#7A8277]">Section Heading (English)</label>
                  <input
                    type="text"
                    value={newArrivalsConfig.title_en || ''}
                    onChange={(e) => setNewArrivalsConfig(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    placeholder="New Arrivals"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#7A8277]">Section Heading (Hindi)</label>
                  <input
                    type="text"
                    value={newArrivalsConfig.title_hi || ''}
                    onChange={(e) => setNewArrivalsConfig(prev => ({ ...prev, title_hi: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    placeholder="नए उत्पाद"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#7A8277]">Subtitle (English)</label>
                  <input
                    type="text"
                    value={newArrivalsConfig.subtitle_en || ''}
                    onChange={(e) => setNewArrivalsConfig(prev => ({ ...prev, subtitle_en: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    placeholder="Discover Our Latest Products"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#7A8277]">Subtitle (Hindi)</label>
                  <input
                    type="text"
                    value={newArrivalsConfig.subtitle_hi || ''}
                    onChange={(e) => setNewArrivalsConfig(prev => ({ ...prev, subtitle_hi: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    placeholder="हमारे नवीनतम उत्पाद देखें"
                  />
                </div>
              </div>
            </div>

            {/* Add Product from Catalog */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70">
              <label className="block font-bold text-xs uppercase tracking-wider text-[#26352A] mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#355E3B]" />
                Select Existing Product to Add to New Arrivals
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border rounded-lg bg-white focus:ring-1 focus:ring-[#8BA889] focus:outline-hidden"
                >
                  <option value="">-- Choose a product from catalog --</option>
                  {allProducts.map((p) => {
                    const isAlreadyAdded = (newArrivalsConfig.items || []).some(item => item.productId === p.id);
                    return (
                      <option key={p.id} value={p.id} disabled={isAlreadyAdded}>
                        {p.title_en} ({p.sku || p.id}) - ₹{p.price} {isAlreadyAdded ? '✓ Already in list' : ''}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={handleAddProductToNewArrivals}
                  disabled={!selectedProductToAdd}
                  className="px-4 py-2 bg-brand-black text-white hover:bg-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4 text-[#355E3B]" />
                  <span>Add to Section</span>
                </button>
              </div>
              <p className="text-[11px] text-[#7A8277] mt-2">
                Selecting existing products avoids duplicate records and links live images, prices, and stock directly.
              </p>
            </div>

            {/* Product Ordering & Status Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#26352A]">
                  Curated New Arrivals Queue ({(newArrivalsConfig.items || []).length} products)
                </h4>
                <span className="text-[11px] text-gray-400">
                  Use Up / Down controls to change storefront priority order
                </span>
              </div>

              {(!newArrivalsConfig.items || newArrivalsConfig.items.length === 0) ? (
                <div className="p-8 text-center text-xs text-[#7A8277] bg-[#FAF9F6] rounded-xl border border-dashed border-gray-300">
                  No products added to New Arrivals yet. Select a product above to add it.
                </div>
              ) : (
                <div className="border border-[#E2E6DC] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs divide-y divide-gray-200">
                    <thead className="bg-[#FAF9F6] text-[#7A8277] font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-16">Image</th>
                        <th className="py-3 px-4">Product Title & SKU</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Reorder</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newArrivalsConfig.items.map((item, index) => {
                        const product = allProducts.find(p => p.id === item.productId);
                        const isEnabled = item.enabled !== false;
                        const isFirst = index === 0;
                        const isLast = index === newArrivalsConfig.items.length - 1;

                        return (
                          <tr key={item.productId || index} className={`hover:bg-[#FAF9F6]/80 transition-colors ${!isEnabled ? 'bg-[#FAF9F6]/50 opacity-60' : ''}`}>
                            <td className="py-3 px-4 text-center font-extrabold text-white">
                              <span className="inline-block w-6 h-6 rounded-full bg-gray-100 text-[11px] leading-6 text-center">
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-[#E2E6DC] overflow-hidden flex items-center justify-center shrink-0">
                                <img
                                  src={product?.mainImage || product?.images?.[0] || '/images/placeholder.png'}
                                  alt={product?.title_en || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">
                                {product?.title_en || item.productId}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                                <span>SKU: {product?.sku || 'N/A'}</span>
                                <span>•</span>
                                <span className="capitalize">{product?.categoryId?.replace('cat-', '') || ''}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                              ₹{product?.price ?? '—'}
                              {product?.compareAtPrice ? (
                                <span className="text-[10px] text-gray-400 line-through ml-1.5 font-normal">
                                  ₹{product.compareAtPrice}
                                </span>
                              ) : null}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleNewArrivalEnabled(item.productId)}
                                title={isEnabled ? 'Click to disable from homepage' : 'Click to enable on homepage'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                                  isEnabled
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-gray-200 text-[#7A8277] hover:bg-gray-300'
                                }`}
                              >
                                {isEnabled ? (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-700" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-[#7A8277]" />
                                    <span>Disabled</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveNewArrival(index, 'up')}
                                  disabled={isFirst}
                                  title="Move Up in order"
                                  className="p-1 rounded bg-gray-100 hover:bg-[#355E3B]/20 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-100 transition-colors"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveNewArrival(index, 'down')}
                                  disabled={isLast}
                                  title="Move Down in order"
                                  className="p-1 rounded bg-gray-100 hover:bg-[#355E3B]/20 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-100 transition-colors"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  to="/admin/products"
                                  title="Edit full product details or images in Products Management"
                                  className="p-1.5 rounded-lg text-[#7A8277] hover:text-white hover:bg-gray-100 transition-colors flex items-center gap-1 text-[11px]"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNewArrival(item.productId)}
                                  title="Remove from New Arrivals list"
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E2E6DC]">
              <span className="text-[11px] text-gray-400">
                All changes must be saved to update the live storefront.
              </span>
              <button
                type="button"
                onClick={handleSaveNewArrivals}
                disabled={savingNewArrivals}
                className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingNewArrivals ? 'Saving Changes...' : 'Save New Arrivals Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Collection Promo Slider Management (5 Slides) */}
        {activeTab === 'collectionPromo' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E6DC] gap-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#26352A] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#355E3B]" />
                  Homepage Collection Promo Slider Management ({collectionSlides.length} Slides)
                </h3>
                <p className="text-xs text-[#7A8277] mt-1">
                  Manage the full-width promotional collection slider placed immediately after New Arrivals. Edit titles, descriptions, Shop Now links, reorder slides, upload or choose authentic banner images, and toggle visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCollectionSlides}
                disabled={savingCollectionSlides}
                className="px-5 py-2.5 bg-[#355E3B] text-white font-extrabold text-xs rounded-xl hover:brightness-105 transition-all shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingCollectionSlides ? 'Saving Changes...' : 'Save Slider Settings'}</span>
              </button>
            </div>

            {/* List of 5 Collection Slides */}
            <div className="space-y-6">
              {collectionSlides.map((slide, index) => {
                const isFirst = index === 0;
                const isLast = index === collectionSlides.length - 1;
                const isEnabled = slide.isActive !== false;

                return (
                  <div
                    key={slide.id || index}
                    className={`rounded-2xl border transition-all p-5 sm:p-6 ${
                      isEnabled ? 'border-[#E2E6DC] bg-white shadow-xs' : 'border-[#E2E6DC] bg-[#FAF9F6] opacity-60'
                    }`}
                  >
                    {/* Header bar of each slide card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E2E6DC]">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-white text-[#355E3B] font-extrabold text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <div>
                          <strong className="text-sm text-white block">
                            {slide.title_en || `Slide ${index + 1}`}
                          </strong>
                          <span className="text-[11px] text-gray-400">
                            Category: {slide.categoryName || slide.collectionKey || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleCollectionSlideActive(slide.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            isEnabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-[#7A8277] hover:bg-gray-300'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-[#7A8277]" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>

                        {/* Reorder Buttons */}
                        <div className="inline-flex items-center gap-1 border border-[#E2E6DC] rounded-lg p-0.5 bg-[#FAF9F6]">
                          <button
                            type="button"
                            onClick={() => handleMoveCollectionSlide(index, 'up')}
                            disabled={isFirst}
                            title="Move Slide Up"
                            className="p-1 rounded hover:bg-white text-[#7A8277] disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCollectionSlide(index, 'down')}
                            disabled={isLast}
                            title="Move Slide Down"
                            className="p-1 rounded hover:bg-white text-[#7A8277] disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Body grid: Left = image preview & picker, Right = fields */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
                      {/* Left: Image Card & Controls */}
                      <div className="md:col-span-4 space-y-3">
                        <label className="block font-bold text-[#7A8277] uppercase text-[10px] tracking-wider">
                          Slide Banner Image
                        </label>
                        <div className="relative aspect-[3/4] max-w-[200px] mx-auto md:mx-0 rounded-xl overflow-hidden bg-black/90 border border-[#E2E6DC] shadow-inner flex items-center justify-center">
                          <img
                            src={encodeURI(slide.image)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                          />
                        </div>

                        {/* Quick Presets Dropdown */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#7A8277] mb-1">
                            Choose Existing Banner
                          </label>
                          <select
                            value={slide.image}
                            onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'image', e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-medium"
                          >
                            <option value="/images/banners/Mahadev Electro Hub Flashlight Showcase (1).png">
                              Torches Showcase Banner
                            </option>
                            <option value="/images/banners/Mahadev Electric Fence Energizers Ad.png">
                              Zatka Machines Energizer Banner
                            </option>
                            <option value="/images/banners/Mahadev Solar Street Light Showcase (1).png">
                              Solar Street Light Banner
                            </option>
                            <option value="/images/banners/Mahadev Head Lamp_ Adventure Illuminated.png">
                              Headlamps Banner
                            </option>
                            <option value="/images/banners/Mahadev Pocket Torch Adventure Banner.png">
                              Pocket Torch Banner
                            </option>
                          </select>
                        </div>

                        {/* Upload Image Button */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#7A8277] mb-1">
                            Or Upload Custom Image
                          </label>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors border border-gray-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingSlideImgId === slide.id ? 'Uploading...' : 'Upload Image File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSlideImageUpload(slide.id, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Right: Content Fields */}
                      <div className="md:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Title (English)</label>
                            <input
                              type="text"
                              value={slide.title_en || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'title_en', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Title (Hindi)</label>
                            <input
                              type="text"
                              value={slide.title_hi || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'title_hi', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium font-devanagari"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Collection Tag (English)</label>
                            <input
                              type="text"
                              value={slide.tag_en || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'tag_en', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                              placeholder="FEATURED COLLECTION"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Collection Tag (Hindi)</label>
                            <input
                              type="text"
                              value={slide.tag_hi || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'tag_hi', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium font-devanagari"
                              placeholder="विशेष कलेक्शन"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Description (English)</label>
                            <textarea
                              rows={3}
                              value={slide.description_en || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'description_en', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium resize-none"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[#7A8277]">Description (Hindi)</label>
                            <textarea
                              rows={3}
                              value={slide.description_hi || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'description_hi', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium font-devanagari resize-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-[#7A8277]">
                            &quot;Shop Now&quot; Destination Route
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.link || ''}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'link', e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-lg bg-white font-medium"
                              placeholder="/category/torches"
                            />
                            <select
                              value={slide.link}
                              onChange={(e) => handleUpdateCollectionSlideField(slide.id, 'link', e.target.value)}
                              className="px-3 py-2 border rounded-lg bg-[#FAF9F6] text-xs font-semibold"
                            >
                              <option value="">Quick Presets...</option>
                              <option value="/category/torches">/category/torches</option>
                              <option value="/category/zatka-machines">/category/zatka-machines</option>
                              <option value="/category/solar-street-lights">/category/solar-street-lights</option>
                              <option value="/category/headlamps">/category/headlamps</option>
                              <option value="/category/small-pocket-torches">/category/small-pocket-torches</option>
                              <option value="/category/rechargeable-fans">/category/rechargeable-fans</option>
                              <option value="/category/bike-lights">/category/bike-lights</option>
                              <option value="/category/solar-dc-products">/category/solar-dc-products</option>
                              <option value="/shop">/shop (All Products)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E2E6DC]">
              <span className="text-[11px] text-gray-400">
                All changes must be saved to update the live storefront slider.
              </span>
              <button
                type="button"
                onClick={handleSaveCollectionSlides}
                disabled={savingCollectionSlides}
                className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingCollectionSlides ? 'Saving Changes...' : 'Save Collection Slider Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Announcement Bar Editor */}
        {activeTab === 'announcement' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs max-w-2xl">
            <h3 className="font-heading font-bold text-base text-[#26352A] mb-4">
              Top Announcement Bar Settings
            </h3>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">English Announcement Text</label>
                <input
                  type="text"
                  required
                  value={announcement.text_en}
                  onChange={(e) => setAnnouncement({ ...announcement, text_en: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Hindi Announcement Text (हिंदी)</label>
                <input
                  type="text"
                  required
                  value={announcement.text_hi}
                  onChange={(e) => setAnnouncement({ ...announcement, text_hi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-devanagari"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Optional Click Link</label>
                <input
                  type="text"
                  value={announcement.link}
                  onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                  placeholder="/shop"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={announcement.bgColor || '#080808'}
                      onChange={(e) => setAnnouncement({ ...announcement, bgColor: e.target.value })}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <span className="font-mono">{announcement.bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={announcement.textColor || '#355E3B'}
                      onChange={(e) => setAnnouncement({ ...announcement, textColor: e.target.value })}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <span className="font-mono">{announcement.textColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcement.isActive}
                    onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })}
                    className="rounded text-[#355E3B] h-4 w-4"
                  />
                  <span className="font-semibold text-white">Storefront Par Announcement Bar Enable Karein</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-[#000000] font-bold rounded-lg transition-all shadow"
              >
                Announcement Save Karein
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Hero Banners */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#26352A]">
              Homepage Hero Banner Sliders ({banners.length})
            </h3>
            <div className="space-y-4">
              {banners.map((ban, idx) => (
                <div key={ban.id} className="p-4 rounded-xl border border-[#E2E6DC] flex flex-col sm:flex-row items-center gap-4 bg-[#FAF9F6]">
                  <img src={ban.image} alt="" className="w-32 h-20 rounded-lg object-cover bg-black shrink-0" />
                  <div className="flex-1 text-xs">
                    <strong className="block text-sm text-white">{ban.title_en}</strong>
                    <span className="text-[#7A8277] font-devanagari block">{ban.title_hi}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">Link: {ban.link} • Status: {ban.isActive ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Coupons */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs space-y-4 max-w-2xl">
            <h3 className="font-heading font-bold text-base text-[#26352A]">
              Discount Coupons
            </h3>
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-[#E2E6DC] flex items-center justify-between text-xs bg-[#FAF9F6]">
                  <div>
                    <span className="font-extrabold text-sm text-white font-mono block">
                      🎟️ {c.code}
                    </span>
                    <span className="text-[#7A8277]">
                      {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Off`} • Min Order: ₹{c.minOrderValue}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews Management */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 space-y-6 text-white">
            
            {/* Top Bar: Title & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E6DC] gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#355E3B]" />
                  <span>Customer Reviews & Testimonials</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage photo-first customer testimonials, ratings, and locations displayed on the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddReview}
                className="px-4 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Add Customer Review</span>
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Reviews</span>
                <span className="block text-xl sm:text-2xl font-black text-white mt-1">{reviews.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                <span className="block text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">Published on Site</span>
                <span className="block text-xl sm:text-2xl font-black text-[#22C55E] mt-1">
                  {reviews.filter(r => r.status === 'APPROVED' && r.isActive !== false).length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                <span className="block text-[11px] font-bold text-[#355E3B] uppercase tracking-wider">Verified Buyers</span>
                <span className="block text-xl sm:text-2xl font-black text-[#355E3B] mt-1">
                  {reviews.filter(r => r.isVerified !== false).length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                <span className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">Average Rating</span>
                <span className="block text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                  ★ {(reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / Math.max(1, reviews.length)).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Search customer, location, product, or review text..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E6DC] focus:border-[#355E3B] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                {reviewSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReviewSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setReviewFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    reviewFilterStatus === 'ALL'
                      ? 'bg-[#355E3B] text-black shadow-sm'
                      : 'bg-[#FAF9F6] text-gray-300 hover:text-white border border-[#E2E6DC]'
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilterStatus('PUBLISHED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    reviewFilterStatus === 'PUBLISHED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[#FAF9F6] text-gray-300 hover:text-white border border-[#E2E6DC]'
                  }`}
                >
                  Published ({reviews.filter(r => r.status === 'APPROVED' && r.isActive !== false).length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilterStatus('UNPUBLISHED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    reviewFilterStatus === 'UNPUBLISHED'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-[#FAF9F6] text-gray-300 hover:text-white border border-[#E2E6DC]'
                  }`}
                >
                  Drafts ({reviews.filter(r => r.status !== 'APPROVED' || r.isActive === false).length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilterStatus('PHOTO_ONLY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    reviewFilterStatus === 'PHOTO_ONLY'
                      ? 'bg-[#355E3B] text-black shadow-sm'
                      : 'bg-[#FAF9F6] text-gray-300 hover:text-white border border-[#E2E6DC]'
                  }`}
                >
                  With Photo ({reviews.filter(r => !!r.customerPhoto).length})
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {(() => {
              const term = reviewSearchQuery.trim().toLowerCase();
              const filtered = reviews.filter(r => {
                const matchesSearch = !term ||
                  (r.customerName && r.customerName.toLowerCase().includes(term)) ||
                  (r.location && r.location.toLowerCase().includes(term)) ||
                  (r.comment && r.comment.toLowerCase().includes(term)) ||
                  (r.title && r.title.toLowerCase().includes(term)) ||
                  (r.productName && r.productName.toLowerCase().includes(term));

                if (!matchesSearch) return false;

                if (reviewFilterStatus === 'PUBLISHED') {
                  return r.status === 'APPROVED' && r.isActive !== false;
                }
                if (reviewFilterStatus === 'UNPUBLISHED') {
                  return r.status !== 'APPROVED' || r.isActive === false;
                }
                if (reviewFilterStatus === 'PHOTO_ONLY') {
                  return !!r.customerPhoto;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center rounded-2xl bg-[#FAF9F6] border border-[#E2E6DC]">
                    <MessageSquare className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h4 className="font-bold text-white text-sm">No reviews found matching criteria</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {reviewSearchQuery ? 'Try clearing your search term.' : 'Click "Add Customer Review" to publish your first review.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((rev, idx) => {
                    const isPublished = rev.status === 'APPROVED' && rev.isActive !== false;
                    return (
                      <div
                        key={rev.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isPublished
                            ? 'bg-[#FAF9F6] border-[#E2E6DC] hover:border-[#355E3B]/60'
                            : 'bg-white border-dashed border-[#E2E6DC] opacity-80'
                        }`}
                      >
                        {/* Left: Reorder arrows & Customer Photo + Info */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          {/* Order control */}
                          <div className="flex flex-col items-center gap-1 shrink-0 text-gray-400">
                            <button
                              type="button"
                              onClick={() => handleMoveReviewOrder(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1 hover:text-[#355E3B] disabled:opacity-20"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleMoveReviewOrder(idx, 'down')}
                              disabled={idx === filtered.length - 1}
                              title="Move Down"
                              className="p-1 hover:text-[#355E3B] disabled:opacity-20"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Customer Photo or Initials */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-[#E2E6DC] shrink-0 relative">
                            {rev.customerPhoto ? (
                              <img
                                src={rev.customerPhoto}
                                alt={rev.customerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#262626] to-[#161616] text-[#F2C75C] font-black text-sm">
                                {rev.customerName ? rev.customerName.substring(0, 2).toUpperCase() : 'CU'}
                              </div>
                            )}
                            {rev.isVerified !== false && (
                              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] text-black flex items-center justify-center text-[10px] shadow" title="Verified Customer">
                                ✓
                              </div>
                            )}
                          </div>

                          {/* Customer Details & Snippet */}
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-heading font-extrabold text-sm text-white">
                                {rev.customerName}
                              </span>
                              {rev.location && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#7A8277]">
                                  <MapPin className="w-3 h-3 text-[#355E3B]" />
                                  <span>{rev.location}</span>
                                </span>
                              )}
                              <span className="text-amber-400 font-bold ml-1">
                                {'★'.repeat(Number(rev.rating) || 5)}
                              </span>
                            </div>

                            {/* Product Badge */}
                            {(rev.productName || rev.productId) && (
                              <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#294A30] bg-[#DCE8D5] border border-[#A8BFA3]/30 px-2 py-0.5 rounded-md mb-1.5 max-w-full truncate">
                                <ShoppingBag className="w-2.5 h-2.5 text-[#355E3B]" />
                                <span className="truncate">{rev.productName || rev.productId}</span>
                              </div>
                            )}

                            {/* Title & Comment */}
                            {rev.title && (
                              <strong className="block text-xs text-[#26352A] font-bold mb-0.5">
                                "{rev.title}"
                              </strong>
                            )}
                            <p className="text-[#50574F] text-xs italic line-clamp-2">
                              "{rev.comment}"
                            </p>
                          </div>
                        </div>

                        {/* Right: Badges & Action Buttons */}
                        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E6DC]">
                          {/* Publish/Unpublish toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleReviewActive(rev.id)}
                            title={isPublished ? 'Unpublish review' : 'Publish review'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isPublished
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60 hover:bg-emerald-900'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditReview(rev)}
                            title="Edit Review"
                            className="p-2 bg-white hover:bg-[#355E3B] text-gray-200 hover:text-black rounded-lg border border-[#E2E6DC] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmReview(rev)}
                            title="Delete Review"
                            className="p-2 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg border border-red-800/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ========================================================
                ADD / EDIT CUSTOMER REVIEW MODAL
                ======================================================== */}
            {reviewModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white border border-[#E2E6DC] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2E6DC] mb-5">
                    <div>
                      <h4 className="font-heading font-extrabold text-lg text-white">
                        {editingReview ? 'Edit Customer Review' : 'Add New Customer Review'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Uploaded photos appear prominently on the homepage review cards.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
                    
                    {/* Customer Photo Upload Section */}
                    <div>
                      <label className="block font-bold text-gray-300 mb-2">
                        Customer Photo (Square Recommended)
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                        {/* Preview */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border-2 border-dashed border-[#A8BFA3] shrink-0 flex items-center justify-center relative">
                          {reviewFormData.customerPhoto ? (
                            <img
                              src={reviewFormData.customerPhoto}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-[#7A8277] font-bold text-center px-1">
                              No Photo Selected
                            </span>
                          )}
                          {reviewImageUploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[11px] font-bold text-[#355E3B]">
                              Uploading...
                            </div>
                          )}
                        </div>

                        {/* Upload buttons & instructions */}
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <label className="px-3 py-1.5 rounded-xl bg-[#355E3B] hover:bg-[#294A30] text-white font-extrabold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{reviewFormData.customerPhoto ? 'Change Photo' : 'Upload Device Image'}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={handleReviewPhotoUpload}
                                className="hidden"
                              />
                            </label>

                            {reviewFormData.customerPhoto && (
                              <button
                                type="button"
                                onClick={() => setReviewFormData(prev => ({ ...prev, customerPhoto: '' }))}
                                className="px-2.5 py-1.5 rounded-xl bg-[#B94343]/10 hover:bg-[#B94343]/20 text-[#B94343] font-bold border border-[#B94343]/30"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="text-[11px] text-[#7A8277]">
                            Supports JPG, JPEG, PNG, WebP up to 10MB.
                          </div>

                          {/* Fallback Image URL input */}
                          <input
                            type="text"
                            value={reviewFormData.customerPhoto}
                            onChange={(e) => setReviewFormData(prev => ({ ...prev, customerPhoto: e.target.value }))}
                            placeholder="Or paste direct image URL (https://...)"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E2E6DC] text-[11px] text-[#26352A] placeholder-[#7A8277] focus:outline-none focus:border-[#355E3B]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Customer Name & City/Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#26352A] mb-1">
                          Customer Name <span className="text-[#B94343]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewFormData.customerName}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, customerName: e.target.value }))}
                          placeholder="e.g. Ramesh Patel"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E6DC] focus:border-[#355E3B] text-[#26352A] placeholder-[#7A8277] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#26352A] mb-1">
                          City / District / Area
                        </label>
                        <input
                          type="text"
                          value={reviewFormData.location}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Sumerpur, Pali"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E6DC] focus:border-[#355E3B] text-[#26352A] placeholder-[#7A8277] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Star Rating & Display Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#26352A] mb-1">
                          Star Rating (1 to 5)
                        </label>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E6DC]">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setReviewFormData(prev => ({ ...prev, rating: starVal }))}
                              className="p-1 focus:outline-none hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  starVal <= reviewFormData.rating
                                    ? 'text-[#B7791F] fill-[#B7791F]'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="font-bold text-[#B7791F] ml-auto pr-2">
                            {reviewFormData.rating}.0 / 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1">
                          Display Sort Order
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewFormData.sortOrder}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC] focus:border-[#355E3B] text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Associated Product */}
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Purchased Product (Optional)
                      </label>
                      <select
                        value={reviewFormData.productId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const found = allProducts.find(p => p.id === pId);
                          setReviewFormData(prev => ({
                            ...prev,
                            productId: pId,
                            productName: found ? found.title_en : prev.productName
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC] focus:border-[#355E3B] text-white focus:outline-none"
                      >
                        <option value="">-- No specific product / General Store Review --</option>
                        {allProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Review Headline / Title
                      </label>
                      <input
                        type="text"
                        value={reviewFormData.title}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. 1.5 KM Beam Covers Entire Field"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC] focus:border-[#355E3B] text-white focus:outline-none"
                      />
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">
                        Review Description / Full Text <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={reviewFormData.comment}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Customer's honest experience with the product and service..."
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC] focus:border-[#355E3B] text-white focus:outline-none"
                      />
                    </div>

                    {/* Toggles: Verified & Published */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#E2E6DC]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reviewFormData.isVerified}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                          className="w-4 h-4 accent-[#355E3B] rounded"
                        />
                        <span className="font-bold text-white">✓ Verified Customer</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reviewFormData.isActive}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 accent-[#355E3B] rounded"
                        />
                        <span className="font-bold text-white">👁️ Publish on Website</span>
                      </label>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-3 border-t border-[#E2E6DC] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-[#333333] text-gray-300 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#355E3B] hover:bg-[#294A30] text-black font-extrabold shadow-lg flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingReview ? 'Save Changes' : 'Create Review'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* ========================================================
                DELETE CONFIRMATION MODAL
                ======================================================== */}
            {deleteConfirmReview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white border border-red-800/60 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-red-950/60 text-red-400 border border-red-700/60 flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-white">
                    Delete Customer Review?
                  </h4>
                  <p className="text-xs text-gray-300 mt-2 mb-5">
                    Are you sure you want to delete the testimonial from <strong className="text-white">"{deleteConfirmReview.customerName}"</strong>? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmReview(null)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-[#333333] text-gray-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs max-w-2xl">
            <h3 className="font-heading font-bold text-base text-[#26352A] mb-4">
              Pali Store Contact & Logistics
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Helpline / WhatsApp Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Physical Store Address (Pali, Rajasthan)</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Free Shipping Min Order (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Standard Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.standardShippingFee}
                    onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-[#000000] font-bold rounded-lg transition-all shadow"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Multilingual Translations Manager */}
        {activeTab === 'translations' && (
          <div className="bg-white rounded-b-xl border border-t-0 border-[#E2E6DC] p-6 md:p-8 shadow-xs max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#E2E6DC] gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-[#26352A]">
                  Multilingual Website Translations
                </h3>
                <p className="text-xs text-[#7A8277] mt-0.5">
                  English (Default), Hinglish (Roman Hindi), aur Devanagari Hindi ke buttons, labels aur messages customize karein.
                </p>
              </div>

              {/* Sub-Language Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedTransLang('en')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedTransLang === 'en'
                      ? 'bg-white text-white shadow-xs'
                      : 'text-[#7A8277] hover:text-black'
                  }`}
                >
                  English (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTransLang('hinglish')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedTransLang === 'hinglish'
                      ? 'bg-white text-white shadow-xs'
                      : 'text-[#7A8277] hover:text-black'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTransLang('hi')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold font-devanagari transition-all ${
                    selectedTransLang === 'hi'
                      ? 'bg-white text-white shadow-xs'
                      : 'text-[#7A8277] hover:text-black'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveTranslations} className="space-y-6 text-xs">
              {/* Group 1: Header, Navigation & Search */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E2E6DC]">
                <h4 className="font-bold text-xs uppercase text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                  Header, Navigation & Search
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1">Search Placeholder ({selectedTransLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.searchPlaceholder || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'searchPlaceholder', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">All Products Label ({selectedTransLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.allProducts || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'allProducts', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Categories Label ({selectedTransLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.categories || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'categories', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">My Account Label ({selectedTransLang.toUpperCase()})</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.myAccount || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'myAccount', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Product Card & Action Buttons */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E2E6DC]">
                <h4 className="font-bold text-xs uppercase text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                  Product Card & Shopping Buttons
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1">Add to Cart Button</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.addToCart || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'addToCart', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Buy Now Button</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.buyNow || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'buyNow', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">In Stock Badge</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.inStock || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'inStock', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Out of Stock Badge</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.outOfStock || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'outOfStock', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Cart & Checkout */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E2E6DC]">
                <h4 className="font-bold text-xs uppercase text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                  Cart, Checkout & Orders
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1">Shopping Cart Title</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.shoppingCart || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'shoppingCart', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Proceed to Checkout</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.proceedToCheckout || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'proceedToCheckout', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Confirm Order Button</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.placeOrder || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'placeOrder', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Free Delivery Badge</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.freeShipping || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'freeShipping', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Value Propositions & Badges */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E2E6DC]">
                <h4 className="font-bold text-xs uppercase text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                  Value Propositions & Trust Badges
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1">Quality Guarantee Headline</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.qualityGuaranteed || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'qualityGuaranteed', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Quality Guarantee Subtitle</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.qualityGuaranteedSub || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'qualityGuaranteedSub', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Solar Efficiency Headline</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.solarEfficiency || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'solarEfficiency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Solar Efficiency Subtitle</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.solarEfficiencySub || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'solarEfficiencySub', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Rajasthan Trust Headline</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.rajasthanTrust || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'rajasthanTrust', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Rajasthan Trust Subtitle</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.rajasthanTrustSub || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'rajasthanTrustSub', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Fast Dispatch Headline</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.fastDispatch || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'fastDispatch', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Fast Dispatch Subtitle</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.fastDispatchSub || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'fastDispatchSub', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group 5: Store Location & Footer */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E2E6DC]">
                <h4 className="font-bold text-xs uppercase text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                  Store Location & Copyright
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1">Store Location String</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.storeLocation || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'storeLocation', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Rights Reserved String</label>
                    <input
                      type="text"
                      value={translationsData[selectedTransLang]?.rightsReserved || ''}
                      onChange={(e) => updateTranslationKey(selectedTransLang, 'rightsReserved', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#294A30] text-[#000000] font-bold rounded-lg transition-all shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Translations to Database</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
