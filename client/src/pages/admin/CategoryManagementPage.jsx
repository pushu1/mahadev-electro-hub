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
            <button type="button" onClick={() => setSuccessToast('')} className="text-gray-400 hover:text-[#B3B3B3]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-white">
              Category & Subcategory Management
            </h1>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              Website navigation menus, bilingual naam, banners aur display ordering manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddCategory}
            className="px-4 py-2.5 bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold text-xs rounded-xl shadow-md shadow-[#D6A52A]/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Category Add Karein</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Categories load ho rahi hain...</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#242424] rounded-2xl border border-[#383838] shadow-md p-5 text-white space-y-4"
              >
                {/* Category Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#383838]">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || '/images/logo.png'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-[#1E1E1E] border border-[#383838] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-base text-white">
                          {cat.name_en}
                        </span>
                        <span className="text-sm font-devanagari text-[#D6A52A] font-bold">
                          ({cat.name_hi})
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Slug: /{cat.slug} • Order: {cat.order} • {cat.showInNav ? '✓ In Navigation' : 'Hidden from Nav'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAddSubcategory(cat.id)}
                      className="px-3 py-1.5 bg-[#F5F7F7] text-white font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      + Subcategory Add Karein
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      title="Category Edit Karein"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name_en)}
                      title="Category Delete Karein"
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Subcategories ({cat.subcategories?.length || 0})
                  </span>

                  {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-[#1E1E1E] border border-[#383838] rounded-lg px-3 py-1.5 text-xs flex items-center gap-2"
                        >
                          <span className="font-semibold text-white">{sub.name_en}</span>
                          <span className="text-gray-400 font-devanagari">({sub.name_hi})</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                            className="text-gray-400 hover:text-red-600 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Abhi koi subcategory nahi hai.</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Category Modal */}
        {catModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#242424] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#383838] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#383838]">
                <h3 className="font-heading font-bold text-base">
                  {editingCat ? 'Category Update Karein' : 'Nayi Category Add Karein'}
                </h3>
                <button type="button" onClick={() => setCatModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{errorMsg}</div>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">English Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name_en}
                    onChange={(e) => setCatFormData({ ...catFormData, name_en: e.target.value })}
                    placeholder="e.g. Solar Street Lights"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hinglish Category Name (Roman Hindi)</label>
                  <input
                    type="text"
                    value={catFormData.name_hinglish}
                    onChange={(e) => setCatFormData({ ...catFormData, name_hinglish: e.target.value })}
                    placeholder="e.g. Solar Street Lights"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hindi Category Name (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name_hi}
                    onChange={(e) => setCatFormData({ ...catFormData, name_hi: e.target.value })}
                    placeholder="उदा. सोलर स्ट्रीट लाइट"
                    className="w-full px-3 py-2 border rounded-lg font-devanagari"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={catFormData.slug}
                    onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Category Image URL</label>
                  <input
                    type="url"
                    value={catFormData.image}
                    onChange={(e) => setCatFormData({ ...catFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFormData.showInNav}
                      onChange={(e) => setCatFormData({ ...catFormData, showInNav: e.target.checked })}
                      className="rounded text-[#D6A52A]"
                    />
                    <span>Mega Menu Mein Dikhayein</span>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCatModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-[#B3B3B3]"
                  >
                    Cancel Karein
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold rounded-lg shadow"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#242424] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#383838] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#383838]">
                <h3 className="font-heading font-bold text-base">Nayi Subcategory Add Karein</h3>
                <button type="button" onClick={() => setSubModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSubcategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">English Subcategory Name *</label>
                  <input
                    type="text"
                    required
                    value={subFormData.name_en}
                    onChange={(e) => setSubFormData({ ...subFormData, name_en: e.target.value })}
                    placeholder="e.g. 2 KM Fencing Power"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hindi Subcategory Name (हिंदी) *</label>
                  <input
                    type="text"
                    required
                    value={subFormData.name_hi}
                    onChange={(e) => setSubFormData({ ...subFormData, name_hi: e.target.value })}
                    placeholder="उदा. 2 किलोमीटर फेंसिंग झटका मशीन"
                    className="w-full px-3 py-2 border rounded-lg font-devanagari"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSubModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-[#B3B3B3]"
                  >
                    Cancel Karein
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D6A52A] hover:bg-[#E5B93B] text-[#000000] font-bold rounded-lg shadow"
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
