import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X, ChevronRight, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catFormData, setCatFormData] = useState({
    name_en: '',
    name_hinglish: '',
    name_hi: '',
    slug: '',
    description_en: '',
    description_hinglish: '',
    description_hi: '',
    image: '',
    bannerImage: '',
    showInNav: true,
    order: 0,
  });

  // Subcategory Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [targetCatId, setTargetCatId] = useState(null);
  const [subFormData, setSubFormData] = useState({
    name_en: '',
    name_hinglish: '',
    name_hi: '',
    slug: '',
    description_en: '',
    description_hi: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    api.getCategories(true)
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddCategory = () => {
    setEditingCat(null);
    setCatFormData({
      name_en: '',
      name_hinglish: '',
      name_hi: '',
      slug: '',
      description_en: '',
      description_hinglish: '',
      description_hi: '',
      image: '',
      bannerImage: '',
      showInNav: true,
      order: categories.length + 1,
    });
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatFormData({
      name_en: cat.name_en || '',
      name_hinglish: cat.name_hinglish || '',
      name_hi: cat.name_hi || '',
      slug: cat.slug || '',
      description_en: cat.description_en || '',
      description_hinglish: cat.description_hinglish || '',
      description_hi: cat.description_hi || '',
      image: cat.image || '',
      bannerImage: cat.bannerImage || '',
      showInNav: cat.showInNav !== false,
      order: cat.order || 0,
    });
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name_en || !catFormData.name_hi) {
      setErrorMsg('English aur Hindi dono category naam zaroori hain.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingCat) {
        await api.updateCategory(editingCat.id, catFormData);
      } else {
        await api.createCategory(catFormData);
      }
      localStorage.setItem('meh_categories_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_categories_updated'));
      setCatModalOpen(false);
      setSuccessToast('Changes Successfully Save Ho Gaye');
      setTimeout(() => setSuccessToast(''), 4000);
      fetchCategories();
    } catch (err) {
      setErrorMsg(err.message || 'Category save karne mein error aayi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Kya aap sach mein category "${name}" delete karna chahte hain?`)) return;

    try {
      await api.deleteCategory(id);
      localStorage.setItem('meh_categories_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_categories_updated'));
      setSuccessToast('Category delete ho gayi.');
      setTimeout(() => setSuccessToast(''), 3000);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Category delete karne mein error aayi.');
    }
  };

  const openAddSubcategory = (catId) => {
    setTargetCatId(catId);
    setSubFormData({
      name_en: '',
      name_hi: '',
      slug: '',
      description_en: '',
      description_hi: '',
    });
    setSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subFormData.name_en || !subFormData.name_hi) {
      alert('English aur Hindi dono subcategory naam zaroori hain.');
      return;
    }

    try {
      await api.addSubcategory(targetCatId, subFormData);
      localStorage.setItem('meh_categories_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_categories_updated'));
      setSubModalOpen(false);
      setSuccessToast('Subcategory successfully add ho gayi.');
      setTimeout(() => setSuccessToast(''), 3000);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Subcategory add karne mein dikkat aayi.');
    }
  };

  const handleDeleteSubcategory = async (catId, subId) => {
    if (!window.confirm('Kya aap is subcategory ko delete karna chahte hain?')) return;
    try {
      await api.deleteSubcategory(catId, subId);
      localStorage.setItem('meh_categories_updated', Date.now().toString());
      window.dispatchEvent(new Event('meh_categories_updated'));
      setSuccessToast('Subcategory delete ho gayi.');
      setTimeout(() => setSuccessToast(''), 3000);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Subcategory delete karne mein dikkat aayi.');
    }
  };

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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-[#171C17]">
              Category & Subcategory Management
            </h1>
            <p className="text-xs text-[#252A25] mt-0.5">
              Website navigation menus, bilingual naam, banners aur display ordering manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddCategory}
            className="px-4 py-2.5 bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Category Add Karein</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#596358]">Categories load ho rahi hain...</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#D5DDD2] shadow-sm p-5 text-[#252A25] space-y-4"
              >
                {/* Category Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D5DDD2]">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || '/images/logo.png'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-[#FAF9F6] border border-[#D5DDD2] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-base text-[#171C17]">
                          {cat.name_en}
                        </span>
                        <span className="text-sm font-devanagari text-[#24532F] font-bold">
                          ({cat.name_hi})
                        </span>
                      </div>
                      <span className="text-[11px] text-[#596358]">
                        Slug: /{cat.slug} • Order: {cat.order} • {cat.showInNav ? '✓ In Navigation' : 'Hidden from Nav'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAddSubcategory(cat.id)}
                      className="px-3 py-1.5 bg-[#FAF9F6] text-[#171C17] border border-[#D5DDD2] font-semibold text-xs rounded-xl hover:bg-[#F3F0E6] transition-colors"
                    >
                      + Subcategory Add Karein
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      title="Category Edit Karein"
                      className="p-1.5 text-[#24532F] hover:bg-[#DCE8D5]/60 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name_en)}
                      title="Category Delete Karein"
                      className="p-1.5 text-[#B94343] hover:bg-[#B94343]/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#596358] block mb-2">
                    Subcategories ({cat.subcategories?.length || 0})
                  </span>

                  {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-[#FAF9F6] border border-[#D5DDD2] rounded-xl px-3 py-1.5 text-xs flex items-center gap-2 text-[#171C17]"
                        >
                          <span className="font-semibold text-[#171C17]">{sub.name_en}</span>
                          <span className="text-[#596358] font-devanagari">({sub.name_hi})</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                            className="text-[#596358] hover:text-[#B94343] ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#596358] italic">Abhi koi subcategory nahi hai.</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Category Modal */}
        {catModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#D5DDD2] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#D5DDD2]">
                <h3 className="font-heading font-bold text-base text-[#171C17]">
                  {editingCat ? 'Category Update Karein' : 'Nayi Category Add Karein'}
                </h3>
                <button type="button" onClick={() => setCatModalOpen(false)}>
                  <X className="w-5 h-5 text-[#596358] hover:text-[#171C17]" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{errorMsg}</div>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">English Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name_en}
                    onChange={(e) => setCatFormData({ ...catFormData, name_en: e.target.value })}
                    placeholder="e.g. Solar Street Lights"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">Hinglish Category Name (Roman Hindi)</label>
                  <input
                    type="text"
                    value={catFormData.name_hinglish}
                    onChange={(e) => setCatFormData({ ...catFormData, name_hinglish: e.target.value })}
                    placeholder="e.g. Solar Street Lights"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">Hindi Category Name (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name_hi}
                    onChange={(e) => setCatFormData({ ...catFormData, name_hi: e.target.value })}
                    placeholder="उदा. सोलर स्ट्रीट लाइट"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl font-devanagari focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={catFormData.slug}
                    onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">Category Image URL</label>
                  <input
                    type="url"
                    value={catFormData.image}
                    onChange={(e) => setCatFormData({ ...catFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFormData.showInNav}
                      onChange={(e) => setCatFormData({ ...catFormData, showInNav: e.target.checked })}
                      className="rounded text-[#24532F] focus:ring-[#24532F]"
                    />
                    <span className="text-[#171C17] font-medium">Mega Menu Mein Dikhayein</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#D5DDD2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCatModalOpen(false)}
                    className="px-4 py-2 border border-[#D5DDD2] bg-white text-[#252A25] hover:bg-[#FAF9F6] rounded-xl transition-colors font-medium"
                  >
                    Cancel Karein
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#24532F] hover:bg-[#183D22] text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    {saving ? 'Save Ho Raha Hai...' : 'Category Save Karein'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {subModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#D5DDD2] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#D5DDD2]">
                <h3 className="font-heading font-bold text-base text-[#171C17]">Nayi Subcategory Add Karein</h3>
                <button type="button" onClick={() => setSubModalOpen(false)}>
                  <X className="w-5 h-5 text-[#596358] hover:text-[#171C17]" />
                </button>
              </div>

              <form onSubmit={handleSaveSubcategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">English Subcategory Name *</label>
                  <input
                    type="text"
                    required
                    value={subFormData.name_en}
                    onChange={(e) => setSubFormData({ ...subFormData, name_en: e.target.value })}
                    placeholder="e.g. 2 KM Fencing Power"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171C17] mb-1">Hindi Subcategory Name (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    value={subFormData.name_hi}
                    onChange={(e) => setSubFormData({ ...subFormData, name_hi: e.target.value })}
                    placeholder="उदा. 2 किलोमीटर फेंसिंग झटका मशीन"
                    className="w-full px-3 py-2 border border-[#D5DDD2] bg-white text-[#171C17] rounded-xl font-devanagari focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] placeholder-[#596358]"
                  />
                </div>

                <div className="pt-4 border-t border-[#D5DDD2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSubModalOpen(false)}
                    className="px-4 py-2 border border-[#D5DDD2] bg-white text-[#252A25] hover:bg-[#FAF9F6] rounded-xl transition-colors font-medium"
                  >
                    Cancel Karein
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#24532F] hover:bg-[#183D22] text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Subcategory Add Karein
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
