import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Star,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalTab, setModalTab] = useState('en'); // 'en' | 'hi' | 'pricing' | 'images' | 'specs'

  // Form Fields
  const [formData, setFormData] = useState({
    title_en: '',
    title_hinglish: '',
    title_hi: '',
    slug: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '',
    categoryId: '',
    subcategoryId: '',
    short_description_en: '',
    short_description_hinglish: '',
    short_description_hi: '',
    description_en: '',
    description_hinglish: '',
    description_hi: '',
    features_en: '',
    features_hinglish: '',
    features_hi: '',
    specifications_en: '',
    specifications_hi: '',
    usage_instructions_en: '',
    usage_instructions_hi: '',
    warranty_en: '',
    warranty_hi: '',
    mainImage: '',
    shippingInfo: '',
    featured: false,
    newArrival: false,
    bestSeller: false,
    status: 'ACTIVE',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const fetchAll = () => {
    setLoading(true);
    setFetchError(null);
    Promise.all([
      api.getProducts({ limit: 100 }),
      api.getCategories(true)
    ])
      .then(([pRes, cRes]) => {
        if (pRes && pRes.success && Array.isArray(pRes.products)) {
          setProducts(pRes.products);
        } else if (pRes && Array.isArray(pRes.products)) {
          setProducts(pRes.products);
        } else if (Array.isArray(pRes)) {
          setProducts(pRes);
        } else {
          setProducts([]);
        }

        if (cRes && cRes.success && Array.isArray(cRes.categories)) {
          setCategories(cRes.categories);
        } else if (cRes && Array.isArray(cRes.categories)) {
          setCategories(cRes.categories);
        } else if (Array.isArray(cRes)) {
          setCategories(cRes);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load products/categories:', err);
        setFetchError(err.message || 'Products load nahi ho paye. Kripya backend connection check karein.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
    window.addEventListener('meh_data_synced', fetchAll);
    window.addEventListener('focus', fetchAll);
    return () => {
      window.removeEventListener('meh_data_synced', fetchAll);
      window.removeEventListener('focus', fetchAll);
    };
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setImageUrlInput('');
    setFormData({
      title_en: '',
      title_hinglish: '',
      title_hi: '',
      slug: '',
      sku: `MEH-${Math.floor(1000 + Math.random() * 9000)}`,
      price: '',
      compareAtPrice: '',
      stockQuantity: '20',
      categoryId: categories[0]?.id || '',
      subcategoryId: '',
      short_description_en: '',
      short_description_hinglish: '',
      short_description_hi: '',
      description_en: '',
      description_hinglish: '',
      description_hi: '',
      features_en: '',
      features_hinglish: '',
      features_hi: '',
      specifications_en: '',
      specifications_hi: '',
      usage_instructions_en: '',
      usage_instructions_hi: '',
      warranty_en: '1 Year Mahadev Warranty',
      warranty_hi: '1 वर्ष महादेव इलेक्ट्रो हब वारंटी',
      mainImage: '',
      images: [],
      shippingInfo: 'Pali warehouse se tez dispatch.',
      featured: false,
      newArrival: true,
      bestSeller: false,
      status: 'ACTIVE',
    });
    setModalTab('en');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setImageUrlInput('');
    const rawImages = Array.isArray(p.images) && p.images.length > 0 
      ? [...p.images] 
      : (p.mainImage ? [p.mainImage] : []);
    const initialMain = p.mainImage || rawImages[0] || '';
    if (initialMain && !rawImages.includes(initialMain)) {
      rawImages.unshift(initialMain);
    }

    setFormData({
      title_en: p.title_en || '',
      title_hinglish: p.title_hinglish || '',
      title_hi: p.title_hi || '',
      slug: p.slug || '',
      sku: p.sku || '',
      price: p.price || '',
      compareAtPrice: p.compareAtPrice || '',
      stockQuantity: p.stockQuantity ?? 0,
      categoryId: p.categoryId || '',
      subcategoryId: p.subcategoryId || '',
      short_description_en: p.short_description_en || '',
      short_description_hinglish: p.short_description_hinglish || '',
      short_description_hi: p.short_description_hi || '',
      description_en: p.description_en || '',
      description_hinglish: p.description_hinglish || '',
      description_hi: p.description_hi || '',
      features_en: Array.isArray(p.features_en) ? p.features_en.join('\n') : (p.features_en || ''),
      features_hinglish: Array.isArray(p.features_hinglish) ? p.features_hinglish.join('\n') : (p.features_hinglish || ''),
      features_hi: Array.isArray(p.features_hi) ? p.features_hi.join('\n') : (p.features_hi || ''),
      specifications_en: typeof p.specifications === 'string' ? p.specifications : (p.specifications_en || (p.specifications ? JSON.stringify(p.specifications, null, 2) : '')),
      specifications_hi: p.specifications_hi || '',
      usage_instructions_en: p.usage_instructions_en || '',
      usage_instructions_hi: p.usage_instructions_hi || '',
      warranty_en: p.warranty_en || p.warranty || '',
      warranty_hi: p.warranty_hi || '',
      mainImage: initialMain,
      images: rawImages,
      shippingInfo: p.shippingInfo || '',
      featured: Boolean(p.featured),
      newArrival: Boolean(p.newArrival),
      bestSeller: Boolean(p.bestSeller),
      status: p.status || 'ACTIVE',
    });
    setModalTab('en');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => {
      const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(f.name);
      return isImg && f.size <= 25 * 1024 * 1024;
    });

    if (validFiles.length === 0) {
      alert('Kripya valid image file chunein (JPG, JPEG, PNG, WebP - max 25MB).');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(10);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const res = await api.uploadImage(file, (pct) => {
          setUploadProgress(Math.round(((i + pct / 100) / validFiles.length) * 100));
        });
        if (res && (res.fileUrl || res.url)) {
          uploadedUrls.push(res.fileUrl || res.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
          uploadedUrls.forEach(u => {
            if (!currentImages.includes(u)) currentImages.push(u);
          });
          const newMain = prev.mainImage || currentImages[0] || '';
          return {
            ...prev,
            images: currentImages,
            mainImage: newMain
          };
        });
        setSuccessToast(`${uploadedUrls.length} image(s) successfully upload ho gayi permanent storage mein!`);
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch (err) {
      alert('Image upload fail ho gayi: ' + err.message);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setFormData(prev => {
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
      if (!currentImages.includes(url)) currentImages.push(url);
      return {
        ...prev,
        images: currentImages,
        mainImage: prev.mainImage || url
      };
    });
    setImageUrlInput('');
  };

  const handleSetMainImage = (url) => {
    setFormData(prev => ({ ...prev, mainImage: url }));
  };

  const handleRemoveImage = (urlToRemove) => {
    setFormData(prev => {
      const currentImages = (prev.images || []).filter(u => u !== urlToRemove);
      let nextMain = prev.mainImage;
      if (nextMain === urlToRemove) {
        nextMain = currentImages[0] || '';
      }
      return {
        ...prev,
        images: currentImages,
        mainImage: nextMain
      };
    });
  };

  const handleReorderImage = (index, direction) => {
    setFormData(prev => {
      const list = [...(prev.images || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return {
        ...prev,
        images: list
      };
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title_en || !formData.title_hi || !formData.price || !formData.categoryId) {
      setErrorMsg('English Title, Hindi Title, Price aur Category zaroori hain.');
      return;
    }

    setSaveLoading(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      stockQuantity: Number(formData.stockQuantity) || 0,
      features_en: formData.features_en ? formData.features_en.split('\n').map(s => s.trim()).filter(Boolean) : [],
      features_hinglish: formData.features_hinglish ? formData.features_hinglish.split('\n').map(s => s.trim()).filter(Boolean) : [],
      features_hi: formData.features_hi ? formData.features_hi.split('\n').map(s => s.trim()).filter(Boolean) : [],
      warranty: formData.warranty_en || '1 Year Mahadev Warranty',
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      setSuccessToast('Changes Successfully Save Ho Gaye');
      setTimeout(() => setSuccessToast(''), 4000);
      fetchAll();
      window.dispatchEvent(new CustomEvent('meh_products_updated'));
      try { localStorage.setItem('meh_last_product_update', Date.now().toString()); } catch (_) {}
    } catch (err) {
      setErrorMsg(err.message || 'Product save karne mein dikkat aayi.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Kya aap sach mein product "${title}" ko delete karna chahte hain?`)) return;

    try {
      await api.deleteProduct(id);
      setSuccessToast('Product delete ho gaya.');
      setTimeout(() => setSuccessToast(''), 3000);
      fetchAll();
      window.dispatchEvent(new CustomEvent('meh_products_updated'));
      try { localStorage.setItem('meh_last_product_update', Date.now().toString()); } catch (_) {}
    } catch (err) {
      alert(err.message || 'Product delete karne mein error aayi.');
    }
  };

  // Filter products locally for search
  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.title_en?.toLowerCase().includes(q) ||
      p.title_hi?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    const matchCat = !selectedCat || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  const selectedCategoryObj = categories.find(c => c.id === formData.categoryId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
            <span className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </span>
            <button type="button" onClick={() => setSuccessToast('')} className="text-[#596358] hover:text-[#171C17]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* API Fetch Error Banner with Retry */}
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong className="font-bold block text-sm">Products Load Karne Mein Error Aayi</strong>
                <span className="text-[#B3B3B3]">{fetchError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchAll}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Karein</span>
            </button>
          </div>
        )}

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-[#171C17]">
              Product Management
            </h1>
            <p className="text-xs text-[#252A25] mt-0.5">
              Bilingual catalog, pricing, computer se image upload aur stock control.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Product Add Karein</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-[#D5DDD2] shadow-sm text-[#252A25] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title ya SKU se product search karein..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5DDD2] bg-white text-[#171C17] placeholder-[#596358] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
            />
            <Search className="w-4 h-4 text-[#596358] absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-[#D5DDD2] rounded-xl bg-white text-[#171C17] focus:outline-none focus:border-[#24532F]"
            >
              <option value="">Sabhi Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name_en} ({c.name_hi})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-[#D5DDD2] shadow-sm overflow-hidden text-[#252A25]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E6] border-b border-[#D5DDD2] text-[#596358] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Hindi Title (हिंदी)</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDD2]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs text-[#596358]">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="w-7 h-7 border-2 border-[#24532F] border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-semibold text-[#596358]">Products load ho rahe hain...</span>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto text-[#B94343]">
                        <AlertCircle className="w-8 h-8 text-[#B94343]" />
                        <p className="font-semibold">{fetchError}</p>
                        <button
                          type="button"
                          onClick={fetchAll}
                          className="px-4 py-2 bg-[#B94343]/10 hover:bg-[#B94343]/20 text-[#B94343] rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Dobara Koshish Karein (Retry)</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs text-[#596358]">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <Package className="w-10 h-10 text-[#596358]/50" />
                        <span className="font-medium text-[#596358] text-sm">
                          {search || selectedCat ? 'Aapke search filter ke according koi product nahi mila.' : 'Abhi koi product uplabdh nahi hai.'}
                        </span>
                        {!search && !selectedCat && (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-2 px-4 py-2 bg-[#24532F] hover:bg-[#183D22] text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Pehla Product Add Karein
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.mainImage || '/images/logo.png'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-[#FAF9F6] border border-[#D5DDD2] shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#171C17] block line-clamp-1 max-w-[220px]">
                              {p.title_en || 'Untitled Product'}
                            </span>
                            <span className="text-[10px] text-[#596358] block">
                              SKU: {p.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#252A25] font-devanagari max-w-[180px] truncate">
                        {p.title_hi || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#171C17] block">₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-[#596358] line-through">₹{Number(p.compareAtPrice).toLocaleString('en-IN')}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          (Number(p.stockQuantity) || 0) <= 0
                            ? 'bg-[#B94343]/15 text-[#B94343]'
                            : (Number(p.stockQuantity) || 0) <= 5
                            ? 'bg-[#FAF9F6] text-[#B7791F] border border-[#B7791F]/30'
                            : 'bg-[#DCE8D5] text-[#183D22]'
                        }`}>
                          {p.stockQuantity ?? 0} Stock Mein
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3F0E6] text-[#252A25] uppercase">
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.slug || p.id}`}
                            target="_blank"
                            title="Live Storefront Par Dekhein"
                            className="p-1.5 text-[#596358] hover:text-[#24532F] transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            title="Product Edit Karein"
                            className="p-1.5 text-[#24532F] hover:bg-[#DCE8D5]/60 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.title_en)}
                            title="Product Delete Karein"
                            className="p-1.5 text-[#B94343] hover:bg-[#B94343]/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#D5DDD2]">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#D5DDD2] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#171C17]">
                    {editingProduct ? 'Product Update Karein' : 'Product Add Karein'}
                  </h3>
                  <span className="text-xs text-[#596358]">
                    English aur Hindi bilingual data. Website par turant live update hota hai.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#596358] hover:text-[#171C17]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-[#D5DDD2] bg-[#FAF9F6] text-xs font-bold px-4 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalTab('en')}
                  className={`py-3 px-4 border-b-2 whitespace-nowrap ${modalTab === 'en' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  English Content
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('hinglish')}
                  className={`py-3 px-4 border-b-2 whitespace-nowrap ${modalTab === 'hinglish' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  Hinglish (Roman Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('hi')}
                  className={`py-3 px-4 border-b-2 font-devanagari whitespace-nowrap ${modalTab === 'hi' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  हिंदी विवरण (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('pricing')}
                  className={`py-3 px-4 border-b-2 whitespace-nowrap ${modalTab === 'pricing' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  Pricing & Stock
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('specs')}
                  className={`py-3 px-4 border-b-2 whitespace-nowrap ${modalTab === 'specs' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  Specs & Instructions
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('images')}
                  className={`py-3 px-4 border-b-2 whitespace-nowrap ${modalTab === 'images' ? 'border-[#24532F] text-[#183D22] bg-white' : 'border-transparent text-[#596358] hover:text-[#171C17]'}`}
                >
                  Image Upload Karein
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* TAB 1: English Content */}
                {modalTab === 'en' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        English Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        placeholder="e.g. Mahadev 100W Long Range Kisan Laser Torch"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Short Description (English)
                      </label>
                      <input
                        type="text"
                        value={formData.short_description_en}
                        onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                        placeholder="Brief 1-sentence product summary"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Full Product Description (English)
                      </label>
                      <textarea
                        rows="4"
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        placeholder="Detailed specifications, usage, applications..."
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Key Features (One feature per line)
                      </label>
                      <textarea
                        rows="3"
                        value={formData.features_en}
                        onChange={(e) => setFormData({ ...formData, features_en: e.target.value })}
                        placeholder="1.5 km focused beam&#10;Massive 10000 mAh battery&#10;Solar charging support"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs font-mono placeholder-[#596358]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB: Hinglish Content */}
                {modalTab === 'hinglish' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Hinglish Product Title (Roman Hindi)
                      </label>
                      <input
                        type="text"
                        value={formData.title_hinglish}
                        onChange={(e) => setFormData({ ...formData, title_hinglish: e.target.value })}
                        placeholder="e.g. Mahadev 100W Long Range Kisan Laser Farming Torch"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Short Description (Hinglish)
                      </label>
                      <input
                        type="text"
                        value={formData.short_description_hinglish}
                        onChange={(e) => setFormData({ ...formData, short_description_hinglish: e.target.value })}
                        placeholder="Kisan fields ke liye heavy duty rechargeable torch..."
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Full Product Description (Hinglish)
                      </label>
                      <textarea
                        rows="4"
                        value={formData.description_hinglish}
                        onChange={(e) => setFormData({ ...formData, description_hinglish: e.target.value })}
                        placeholder="Rajasthan ke kisano ke liye specially designed torch..."
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        Key Features (One per line in Hinglish)
                      </label>
                      <textarea
                        rows="3"
                        value={formData.features_hinglish}
                        onChange={(e) => setFormData({ ...formData, features_hinglish: e.target.value })}
                        placeholder="1.5 km focused laser beam throw&#10;10,000 mAh heavy battery&#10;Solar charging port"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs font-mono placeholder-[#596358]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: Hindi Content */}
                {modalTab === 'hi' && (
                  <div className="space-y-4 text-xs font-devanagari">
                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        हिंदी प्रोडक्ट शीर्षक (Hindi Title) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title_hi}
                        onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                        placeholder="उदा. महादेव 100W लॉन्ग रेंज किसान लेजर फार्मिंग टॉर्च"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        संक्षिप्त विवरण (Short Description in Hindi)
                      </label>
                      <input
                        type="text"
                        value={formData.short_description_hi}
                        onChange={(e) => setFormData({ ...formData, short_description_hi: e.target.value })}
                        placeholder="संक्षिप्त विवरण..."
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        सम्पूर्ण प्रोडक्ट विवरण (Full Description in Hindi)
                      </label>
                      <textarea
                        rows="4"
                        value={formData.description_hi}
                        onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                        placeholder="विस्तारपूर्वक विवरण..."
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#171C17] mb-1">
                        मुख्य विशेषताएं (प्रत्येक लाइन में एक विशेषता)
                      </label>
                      <textarea
                        rows="3"
                        value={formData.features_hi}
                        onChange={(e) => setFormData({ ...formData, features_hi: e.target.value })}
                        placeholder="1.5 किमी लेजर बीम&#10;10000 mAh बैटरी&#10;सोलर चार्जिंग सपोर्ट"
                        className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: Pricing & Category */}
                {modalTab === 'pricing' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="e.g. 1850"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Original Price / M.R.P (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.compareAtPrice}
                          onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                          placeholder="e.g. 2400"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                          placeholder="e.g. 30"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          SKU Code
                        </label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl uppercase focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Category *
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                          className="w-full px-3 py-2 border border-[#D5DDD2] rounded-xl bg-white text-[#171C17] focus:outline-none focus:border-[#24532F]"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name_en} ({c.name_hi})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Subcategory (Optional)
                        </label>
                        <select
                          value={formData.subcategoryId}
                          onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D5DDD2] rounded-xl bg-white text-[#171C17] focus:outline-none focus:border-[#24532F]"
                        >
                          <option value="">None / All Category</option>
                          {selectedCategoryObj?.subcategories?.map(s => (
                            <option key={s.id} value={s.id}>{s.name_en} ({s.name_hi})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="pt-2 flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded text-[#24532F] focus:ring-[#24532F]"
                        />
                        <span className="text-[#171C17] font-medium">Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.newArrival}
                          onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                          className="rounded text-[#24532F] focus:ring-[#24532F]"
                        />
                        <span className="text-[#171C17] font-medium">New Arrival</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.bestSeller}
                          onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                          className="rounded text-[#24532F] focus:ring-[#24532F]"
                        />
                        <span className="text-[#171C17] font-medium">Best Seller</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 4: Specs & Instructions */}
                {modalTab === 'specs' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Technical Specifications (English)
                        </label>
                        <textarea
                          rows="3"
                          value={formData.specifications_en}
                          onChange={(e) => setFormData({ ...formData, specifications_en: e.target.value })}
                          placeholder="e.g. Battery: 10000mAh, Range: 1.5KM, LED: 100W"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                      <div className="font-devanagari">
                        <label className="block font-semibold text-[#171C17] mb-1">
                          तकनीकी विवरण (Hindi Specifications)
                        </label>
                        <textarea
                          rows="3"
                          value={formData.specifications_hi}
                          onChange={(e) => setFormData({ ...formData, specifications_hi: e.target.value })}
                          placeholder="उदा. बैटरी: 10000mAh, रेंज: 1.5 किमी, क्षमता: 100W"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Usage & Safety Instructions (English)
                        </label>
                        <textarea
                          rows="3"
                          value={formData.usage_instructions_en}
                          onChange={(e) => setFormData({ ...formData, usage_instructions_en: e.target.value })}
                          placeholder="Charging guide, installation advice, earthing directions..."
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                      <div className="font-devanagari">
                        <label className="block font-semibold text-[#171C17] mb-1">
                          उपयोग एवं सुरक्षा निर्देश (Hindi Instructions)
                        </label>
                        <textarea
                          rows="3"
                          value={formData.usage_instructions_hi}
                          onChange={(e) => setFormData({ ...formData, usage_instructions_hi: e.target.value })}
                          placeholder="चार्जिंग विधि, इंस्टॉलेशन व अर्थिंग निर्देश..."
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#171C17] mb-1">
                          Warranty Details (English)
                        </label>
                        <input
                          type="text"
                          value={formData.warranty_en}
                          onChange={(e) => setFormData({ ...formData, warranty_en: e.target.value })}
                          placeholder="e.g. 1 Year Mahadev Warranty on battery & solar panel"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                      <div className="font-devanagari">
                        <label className="block font-semibold text-[#171C17] mb-1">
                          वारंटी विवरण (Hindi Warranty)
                        </label>
                        <input
                          type="text"
                          value={formData.warranty_hi}
                          onChange={(e) => setFormData({ ...formData, warranty_hi: e.target.value })}
                          placeholder="उदा. बैटरी और सोलर पैनल पर 1 वर्ष की वारंटी"
                          className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] text-xs placeholder-[#596358]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Gallery & Permanent Image Storage */}
                {modalTab === 'images' && (
                  <div className="space-y-5 text-xs">
                    {/* Upload Box */}
                    <div>
                      <label className="block font-bold text-[#171C17] mb-1.5 uppercase tracking-wider text-[11px]">
                        Computer Se Images Upload Karein (Single ya Multiple)
                      </label>
                      <div className="border-2 border-dashed border-[#D5DDD2] hover:border-[#24532F] bg-[#FAF9F6] rounded-2xl p-6 text-center transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="prod-file-upload"
                        />
                        <label htmlFor="prod-file-upload" className="cursor-pointer block">
                          <Upload className="w-9 h-9 text-[#24532F] mx-auto mb-2" />
                          <span className="font-extrabold text-[#171C17] text-sm block">
                            {uploadingImage ? 'Permanent Storage Mein Upload Ho Rahi Hai...' : 'Computer Se Photo File Chunein (Multiple Allowed)'}
                          </span>
                          <span className="text-[11px] text-[#596358] block mt-1">
                            PNG, JPG, JPEG, WebP files supported (Direct Vercel Blob CDN upload)
                          </span>
                        </label>

                        {uploadingImage && (
                          <div className="mt-4 max-w-xs mx-auto">
                            <div className="flex justify-between text-[11px] text-[#24532F] font-bold mb-1">
                              <span>Uploading to Vercel Blob CDN...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#DCE8D5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#24532F] transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add by URL */}
                    <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#D5DDD2]">
                      <label className="block font-bold text-[#171C17] mb-1.5 uppercase tracking-wider text-[11px]">
                        Ya Direct Image URL Add Karein
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/... ya direct image link"
                          className="flex-1 px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] text-xs placeholder-[#596358]"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-4 py-2 bg-[#24532F] hover:bg-[#183D22] text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                        >
                          Add to Gallery
                        </button>
                      </div>
                    </div>

                    {/* Gallery List & Reorder Controls */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#171C17] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#24532F]" />
                          Product Image Gallery ({(formData.images || []).length} Photos)
                        </span>
                        <span className="text-[11px] text-[#596358]">
                          ★ icon wali image catalog ki Main Photo rahegi
                        </span>
                      </div>

                      {(formData.images || []).length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-[#D5DDD2] rounded-xl text-[#596358] text-xs">
                          Abhi koi image add nahi ki gayi hai. Kripya upar se file upload karein ya URL dalein.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {(formData.images || []).map((imgUrl, idx) => {
                            const isMain = formData.mainImage === imgUrl;
                            return (
                              <div
                                key={idx}
                                className={`relative rounded-xl border overflow-hidden bg-white shadow-xs group transition-all ${
                                  isMain ? 'border-[#24532F] ring-2 ring-[#24532F]/30' : 'border-[#D5DDD2] hover:border-[#596358]'
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <div className="aspect-square w-full bg-[#FAF9F6] relative overflow-hidden">
                                  <img
                                    src={imgUrl}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />

                                  {/* Main Badge */}
                                  {isMain && (
                                    <span className="absolute top-1.5 left-1.5 z-10 bg-[#24532F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                      <Star className="w-3 h-3 fill-current" />
                                      Main Photo
                                    </span>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(imgUrl)}
                                    title="Remove this photo"
                                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-md bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-sm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Reorder & Main Controls */}
                                <div className="p-2 bg-white border-t border-[#D5DDD2] flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleReorderImage(idx, -1)}
                                      title="Move Left"
                                      className="p-1 rounded bg-[#FAF9F6] border border-[#D5DDD2] hover:bg-[#DCE8D5] disabled:opacity-30 disabled:cursor-not-allowed text-[#171C17]"
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (formData.images || []).length - 1}
                                      onClick={() => handleReorderImage(idx, 1)}
                                      title="Move Right"
                                      className="p-1 rounded bg-[#FAF9F6] border border-[#D5DDD2] hover:bg-[#DCE8D5] disabled:opacity-30 disabled:cursor-not-allowed text-[#171C17]"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {!isMain && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetMainImage(imgUrl)}
                                      className="text-[10px] font-bold text-[#24532F] hover:text-[#183D22] hover:underline px-1 py-0.5"
                                    >
                                      Set Main
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="pt-4 border-t border-[#D5DDD2] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#D5DDD2] bg-white text-[#252A25] hover:bg-[#FAF9F6] rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel Karein
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-2 bg-[#24532F] hover:bg-[#183D22] text-white font-bold rounded-xl shadow-sm text-xs transition-colors"
                  >
                    {saveLoading ? 'Save Ho Raha Hai...' : editingProduct ? 'Product Update Karein' : 'Product Save Karein'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
