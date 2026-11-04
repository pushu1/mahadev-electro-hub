import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  Video,
  Check,
  X,
  Play,
  Save,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function ReelsManagementPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Zatka Machines',
    description: '',
    sourceType: 'upload', // 'upload' | 'instagram' | 'url'
    videoUrl: '',
    thumbnailUrl: '',
    sortOrder: 1,
    isActive: true,
  });

  // Helpers to validate & normalize Instagram Reel URLs
  const normalizeInstagramUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.trim().match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
    if (!match) return '';
    return `https://www.instagram.com/reel/${match[1]}/`;
  };

  const extractInstagramShortcode = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.trim().match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  // Category choices
  const categoryOptions = [
    'Zatka Machines',
    'Solar Street Lights',
    'Farming Torches',
    'Headlamps',
    'Small Pocket Torches',
    'Solar DC Products',
    'Rechargeable Fans',
    'Customer Testimonials',
    'General',
  ];

  // Load all reels (including inactive for admin)
  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReels();
      if (res && res.success && Array.isArray(res.reels)) {
        setReels(res.reels);
      }
    } catch (err) {
      setAlert({ type: 'error', message: `Failed to load reels: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
    window.addEventListener('meh_data_synced', fetchReels);
    window.addEventListener('focus', fetchReels);
    return () => {
      window.removeEventListener('meh_data_synced', fetchReels);
      window.removeEventListener('focus', fetchReels);
    };
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingReelId(null);
    setFormData({
      title: '',
      category: 'Zatka Machines',
      description: '',
      sourceType: 'url',
      videoUrl: '',
      thumbnailUrl: '',
      sortOrder: reels.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (reel) => {
    setEditingReelId(reel.id);
    setFormData({
      title: reel.title || '',
      category: reel.category || 'General',
      description: reel.description || '',
      sourceType: reel.sourceType || 'url',
      videoUrl: reel.videoUrl || '',
      thumbnailUrl: reel.thumbnailUrl || '',
      sortOrder: typeof reel.sortOrder === 'number' ? reel.sortOrder : 1,
      isActive: reel.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Handle Video File Upload (Direct-to-storage to avoid Vercel 4.5MB limit)
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (MP4 with H.264 recommended, WebM, MOV)
    const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isVideo) {
      showAlert('error', 'Only video files (MP4, WebM, MOV) are allowed.');
      return;
    }

    // Validate size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      showAlert('error', 'Video file size exceeds the 100MB limit.');
      return;
    }

    try {
      setUploadingVideo(true);
      setVideoProgress(5);

      // Direct upload straight to Vercel Blob CDN with real-time percentage progress
      const res = await api.uploadVideo(file, (pct) => {
        setVideoProgress(pct);
      });

      if (res && (res.fileUrl || res.url)) {
        const finalUrl = res.fileUrl || res.url;
        setFormData(prev => ({
          ...prev,
          videoUrl: finalUrl,
          sourceType: 'upload',
        }));
        showAlert('success', 'Video file uploaded directly to permanent storage!');
      } else {
        throw new Error(res.message || 'Upload failed.');
      }
    } catch (err) {
      showAlert('error', `Failed to upload video: ${err.message}`);
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Thumbnail File Upload
  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('image/') && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      showAlert('error', 'Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showAlert('error', 'Thumbnail file size exceeds 15MB.');
      return;
    }

    try {
      setUploadingThumb(true);
      const res = await api.uploadImage(file);
      if (res && (res.fileUrl || res.url)) {
        setFormData(prev => ({
          ...prev,
          thumbnailUrl: res.fileUrl || res.url,
        }));
        showAlert('success', 'Thumbnail image uploaded successfully to permanent storage!');
      } else {
        throw new Error(res.message || 'Thumbnail upload failed.');
      }
    } catch (err) {
      showAlert('error', `Failed to upload thumbnail: ${err.message}`);
    } finally {
      setUploadingThumb(false);
      if (e.target) e.target.value = '';
    }
  };

  // Save Reel (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showAlert('error', 'Reel Title is required.');
      return;
    }

    let finalVideoUrl = formData.videoUrl.trim();
    if (!finalVideoUrl) {
      showAlert('error', 'Please upload a video or provide a valid video URL.');
      return;
    }

    // Strict validation & normalization for Instagram Reel URLs
    if (formData.sourceType === 'instagram') {
      const normalized = normalizeInstagramUrl(finalVideoUrl);
      if (!normalized) {
        showAlert('error', 'Please enter a valid Instagram Reel or post URL (e.g. https://www.instagram.com/reel/C8xYz123/).');
        return;
      }
      finalVideoUrl = normalized;
    }

    const payload = {
      ...formData,
      videoUrl: finalVideoUrl,
    };

    try {
      setSaving(true);
      if (editingReelId) {
        // Update
        const res = await api.updateReel(editingReelId, payload);
        if (res && res.success) {
          showAlert('success', 'Reel updated successfully in Neon PostgreSQL!');
          setIsModalOpen(false);
          fetchReels();
        }
      } else {
        // Create
        const res = await api.createReel(payload);
        if (res && res.success) {
          showAlert('success', 'New Reel added successfully to Neon PostgreSQL!');
          setIsModalOpen(false);
          fetchReels();
        }
      }
    } catch (err) {
      showAlert('error', `Failed to save reel: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.toggleReelStatus(id);
      if (res && res.success) {
        setReels(prev =>
          prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
        );
        showAlert('success', res.message || 'Status updated.');
      }
    } catch (err) {
      showAlert('error', `Failed to toggle status: ${err.message}`);
    }
  };

  // Move Reel Order (Up / Down)
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reels.length) return;

    const newReels = [...reels];
    const [moved] = newReels.splice(index, 1);
    newReels.splice(targetIndex, 0, moved);

    // Update local state immediately for snappy UX
    setReels(newReels);

    try {
      const orderedIds = newReels.map(r => r.id);
      await api.reorderReels(orderedIds);
      showAlert('success', 'Reels order updated successfully.');
    } catch (err) {
      showAlert('error', `Failed to update order: ${err.message}`);
      fetchReels(); // revert
    }
  };

  // Delete Reel
  const handleDeleteReel = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.deleteReel(id);
      if (res && res.success) {
        setReels(prev => prev.filter(r => r.id !== id));
        showAlert('success', 'Reel deleted successfully.');
      }
    } catch (err) {
      showAlert('error', `Failed to delete reel: ${err.message}`);
    }
  };

  const activeReelsCount = reels.filter(r => r.isActive !== false).length;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-[#252A25]">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D5DDD2]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#24532F] mb-1">
              <Film className="w-4 h-4 text-[#24532F]" />
              <span>MEDIA & VIDEO MANAGEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171C17] tracking-tight">
              Reels Showcase Management
            </h1>
            <p className="text-sm text-[#252A25] mt-1">
              Manage short video reels and live product demonstrations displayed in the homepage Reels Showcase.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-white font-bold text-sm shadow-sm transition-all duration-200 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reel</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {alert && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm ${
              alert.type === 'success'
                ? 'bg-[#DCE8D5] border border-[#356B3D]/40 text-[#183D22]'
                : 'bg-[#B94343]/10 border border-[#B94343]/30 text-[#B94343]'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{alert.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="p-1 hover:text-[#171C17]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#D5DDD2] shadow-sm">
            <span className="text-xs text-[#596358] uppercase tracking-wider block mb-1">Total Reels</span>
            <span className="text-2xl font-extrabold text-[#171C17]">{reels.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#D5DDD2] shadow-sm">
            <span className="text-xs text-[#2E7D46] uppercase tracking-wider block mb-1">Active on Storefront</span>
            <span className="text-2xl font-extrabold text-[#2E7D46]">{activeReelsCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#D5DDD2] shadow-sm">
            <span className="text-xs text-[#B7791F] uppercase tracking-wider block mb-1">Inactive / Drafts</span>
            <span className="text-2xl font-extrabold text-[#B7791F]">{reels.length - activeReelsCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#D5DDD2] shadow-sm">
            <span className="text-xs text-[#24532F] uppercase tracking-wider block mb-1">Storefront Aspect</span>
            <span className="text-2xl font-extrabold text-[#24532F]">4:5 Portrait</span>
          </div>
        </div>

        {/* Reels Table / Grid List */}
        <div className="bg-white rounded-2xl border border-[#D5DDD2] overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-[#D5DDD2] flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#171C17] flex items-center gap-2">
              <span>All Configured Reels</span>
              <span className="text-xs text-[#183D22] bg-[#DCE8D5] px-2.5 py-0.5 rounded-lg border border-[#356B3D]/30 font-bold">
                {reels.length} Items
              </span>
            </h2>
            <span className="text-xs text-[#596358] hidden sm:inline">
              Drag or use arrows to change display order on the storefront
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#596358]">
              <div className="inline-block w-8 h-8 border-2 border-[#24532F] border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading reels...</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="p-12 text-center text-[#596358]">
              <Film className="w-12 h-12 text-[#596358]/50 mx-auto mb-3" />
              <p className="text-base font-semibold text-[#171C17] mb-1">No video reels configured yet</p>
              <p className="text-xs text-[#596358] mb-4">Add your first demonstration reel to showcase products on the homepage.</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24532F] text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Reel</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#D5DDD2]">
              {reels.map((reel, idx) => (
                <div
                  key={reel.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors"
                >
                  {/* Left: 4:5 Media Thumbnail + Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* 4:5 Aspect Thumbnail */}
                    <div className="w-16 h-20 bg-[#FAF9F6] rounded-xl border border-[#D5DDD2] shrink-0 relative overflow-hidden flex items-center justify-center">
                      {reel.thumbnailUrl ? (
                        <img
                          src={reel.thumbnailUrl}
                          alt={reel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center">
                          <Film className="w-6 h-6 text-[#596358]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current opacity-90" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#183D22] bg-[#DCE8D5] px-2 py-0.5 rounded-lg border border-[#356B3D]/30">
                          {reel.category || 'General'}
                        </span>
                        <span className="text-[10px] font-medium text-[#596358] bg-[#FAF9F6] px-2 py-0.5 rounded-lg border border-[#D5DDD2] uppercase">
                          {reel.sourceType || 'url'}
                        </span>
                        {reel.isActive ? (
                          <span className="text-[10px] font-semibold text-[#2E7D46] bg-[#DCE8D5]/60 px-2 py-0.5 rounded-lg border border-[#356B3D]/30">
                            Active (Live)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#B7791F] bg-[#FAF9F6] px-2 py-0.5 rounded-lg border border-[#B7791F]/30">
                            Inactive (Draft)
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-[#171C17] text-sm sm:text-base leading-snug">
                        {reel.title}
                      </h3>

                      {reel.description && (
                        <p className="text-xs text-[#252A25] line-clamp-1 max-w-xl">
                          {reel.description}
                        </p>
                      )}

                      <p className="text-[11px] text-[#596358] font-mono truncate max-w-md">
                        {reel.videoUrl}
                      </p>
                    </div>
                  </div>

                  {/* Right: Order controls & Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D5DDD2]">
                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#D5DDD2] p-0.5 rounded-xl mr-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        title="Move Up"
                        className="p-1 text-[#596358] hover:text-[#171C17] disabled:opacity-30 disabled:hover:text-[#596358]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono text-[#596358] px-1 font-bold">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={idx === reels.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        title="Move Down"
                        className="p-1 text-[#596358] hover:text-[#171C17] disabled:opacity-30 disabled:hover:text-[#596358]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(reel.id)}
                      title={reel.isActive ? 'Deactivate' : 'Activate'}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        reel.isActive
                          ? 'bg-[#DCE8D5]/60 border-[#356B3D]/40 text-[#183D22] hover:bg-[#DCE8D5]'
                          : 'bg-[#FAF9F6] border-[#B7791F]/30 text-[#B7791F] hover:bg-[#F3F0E6]'
                      }`}
                    >
                      {reel.isActive ? <Eye className="w-3.5 h-3.5 inline mr-1" /> : <EyeOff className="w-3.5 h-3.5 inline mr-1" />}
                      <span>{reel.isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(reel)}
                      title="Edit Reel"
                      className="p-2 text-[#24532F] hover:bg-[#DCE8D5]/60 bg-white border border-[#D5DDD2] rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReel(reel.id, reel.title)}
                      title="Delete Reel"
                      className="p-2 text-[#B94343] hover:bg-[#B94343]/10 bg-white border border-[#D5DDD2] rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================================
            ADD / EDIT REEL MODAL FORM
            ==================================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-[#D5DDD2] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-[#252A25]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#D5DDD2]">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#24532F]" />
                  <h2 className="text-xl font-heading font-extrabold text-[#171C17]">
                    {editingReelId ? 'Edit Reel Video' : 'Add New Video Reel'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#596358] hover:text-[#171C17]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                    Reel Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Solar Zatka Machine 5KM Live Field Test"
                    className="w-full bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2.5 text-[#171C17] text-sm focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F] outline-none placeholder-[#596358]"
                  />
                </div>

                {/* 2. Category & Source Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                      Product Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2.5 text-[#171C17] text-sm focus:border-[#24532F] outline-none"
                    >
                      {categoryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Source Type Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                      Video Source Method *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sourceType: 'upload' }))}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          formData.sourceType === 'upload'
                            ? 'bg-[#24532F] text-white border-[#24532F] shadow-sm'
                            : 'bg-white text-[#252A25] border-[#D5DDD2] hover:border-[#24532F]'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload MP4</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sourceType: 'instagram' }))}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          formData.sourceType === 'instagram'
                            ? 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white border-transparent shadow-sm'
                            : 'bg-white text-[#252A25] border-[#D5DDD2] hover:border-[#FD1D1D]'
                        }`}
                      >
                        <span className="text-base leading-none">📸</span>
                        <span>Instagram Reel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sourceType: 'url' }))}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          formData.sourceType === 'url'
                            ? 'bg-[#24532F] text-white border-[#24532F] shadow-sm'
                            : 'bg-white text-[#252A25] border-[#D5DDD2] hover:border-[#24532F]'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>External Link</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* METHOD 1: Direct Video Upload */}
                {formData.sourceType === 'upload' && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#D5DDD2] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#24532F]">
                        Upload Video File (MP4, WebM, MOV - Max 100MB)
                      </label>
                      <span className="text-[11px] text-[#596358] font-medium">
                        Direct-to-Vercel Blob Storage
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-[#D5DDD2] hover:border-[#24532F] bg-white rounded-xl p-5 text-center transition-colors">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/mov"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="hidden"
                        id="reel-video-file-upload"
                      />
                      <label htmlFor="reel-video-file-upload" className="cursor-pointer block">
                        <Video className="w-8 h-8 text-[#24532F] mx-auto mb-2" />
                        <span className="font-bold text-[#171C17] text-xs block">
                          {uploadingVideo ? 'Video Direct Storage Mein Upload Ho Rahi Hai...' : 'Computer Se Video File Chunein (MP4 H.264 Recommended)'}
                        </span>
                        <span className="text-[11px] text-[#596358] block mt-1">
                          Direct CDN upload bypasses server limits — no 413 error
                        </span>
                      </label>

                      {uploadingVideo && (
                        <div className="mt-3 max-w-xs mx-auto">
                          <div className="flex justify-between text-[11px] text-[#24532F] font-bold mb-1">
                            <span>Uploading video...</span>
                            <span>{videoProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#DCE8D5] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#24532F] transition-all duration-300 rounded-full"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.videoUrl && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-[#2E7D46] font-bold truncate">
                          ✓ Uploaded Video URL: {formData.videoUrl}
                        </p>
                        <div className="max-w-[220px] mx-auto rounded-xl overflow-hidden bg-black border border-[#D5DDD2] shadow-sm">
                          <video
                            src={formData.videoUrl}
                            controls
                            playsInline
                            className="w-full aspect-[9/16] object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* METHOD 2: Instagram Reel URL */}
                {formData.sourceType === 'instagram' && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#FD1D1D]/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📸</span>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#833AB4]">
                          Instagram Reel or Post URL *
                        </label>
                        <span className="text-[11px] text-[#596358] block">
                          Public Instagram Reels will render with Instagram's official embed player
                        </span>
                      </div>
                    </div>

                    <input
                      type="url"
                      required={formData.sourceType === 'instagram'}
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.instagram.com/reel/C8xYz123/ ya https://instagram.com/p/..."
                      className="w-full bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2.5 text-[#171C17] text-xs focus:border-[#833AB4] focus:ring-1 focus:ring-[#833AB4] outline-none placeholder-[#596358]"
                    />

                    {extractInstagramShortcode(formData.videoUrl) ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#833AB4]">
                          ✓ Valid Instagram Reel detected (ID: {extractInstagramShortcode(formData.videoUrl)})
                        </p>
                        <div className="max-w-[280px] mx-auto rounded-xl overflow-hidden border border-[#D5DDD2] shadow-sm bg-white p-2">
                          <iframe
                            src={`https://www.instagram.com/reel/${extractInstagramShortcode(formData.videoUrl)}/embed/`}
                            className="w-full h-80 rounded-lg border-0"
                            title="Instagram Reel Preview"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ) : formData.videoUrl.trim() ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ Kripya valid public Instagram Reel link dalein (jaise https://www.instagram.com/reel/C7abc123/)
                      </p>
                    ) : null}
                  </div>
                )}

                {/* METHOD 3: External Video URL / YouTube */}
                {formData.sourceType === 'url' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                      External Video URL (.mp4 / .webm link) *
                    </label>
                    <input
                      type="url"
                      required={formData.sourceType === 'url'}
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://example.com/videos/demonstration.mp4"
                      className="w-full bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2.5 text-[#171C17] text-sm focus:border-[#24532F] outline-none placeholder-[#596358]"
                    />
                  </div>
                )}

                {/* 5. Thumbnail Image Upload or URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                    Poster / Thumbnail Image (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="e.g. /images/categories/zatka-machines.png or image URL"
                      className="flex-1 bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2 text-[#171C17] text-xs focus:border-[#24532F] outline-none placeholder-[#596358]"
                    />
                    <label className="px-3.5 py-2 bg-[#FAF9F6] border border-[#D5DDD2] hover:border-[#24532F] text-[#171C17] text-xs font-semibold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#24532F]" />
                      <span>{uploadingThumb ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleThumbUpload}
                        disabled={uploadingThumb}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 6. Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171C17] mb-1.5">
                    Description / Highlights (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of the demonstration or customer experience."
                    className="w-full bg-white border border-[#D5DDD2] rounded-xl px-3.5 py-2 text-[#171C17] text-xs focus:border-[#24532F] outline-none placeholder-[#596358]"
                  />
                </div>

                {/* 7. Sort Order & Active Switch */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#D5DDD2]">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#171C17]">
                      Sort Order:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 1 })}
                      className="w-16 bg-white border border-[#D5DDD2] rounded-xl px-2 py-1 text-[#171C17] text-xs font-mono text-center outline-none focus:border-[#24532F]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#24532F] focus:ring-[#24532F] rounded-md cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#171C17] uppercase tracking-wider">
                      Publish to Storefront (Active)
                    </span>
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D5DDD2]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[#252A25] hover:text-[#171C17] uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingVideo || uploadingThumb}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#24532F] hover:bg-[#183D22] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : (editingReelId ? 'Update Reel' : 'Save Reel')}</span>
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
