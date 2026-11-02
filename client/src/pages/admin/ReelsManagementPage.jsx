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
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Zatka Machines',
    description: '',
    sourceType: 'url', // 'upload' | 'url' | 'youtube' | 'instagram'
    videoUrl: '',
    thumbnailUrl: '',
    sortOrder: 1,
    isActive: true,
  });

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

  // Handle Video File Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      showAlert('error', 'Video file size exceeds the 100MB limit.');
      return;
    }

    try {
      setUploadingVideo(true);
      const body = new FormData();
      body.append('video', file);

      const res = await api.uploadVideo(body);
      if (res && res.success && res.fileUrl) {
        setFormData(prev => ({
          ...prev,
          videoUrl: res.fileUrl,
          sourceType: 'upload',
        }));
        showAlert('success', 'Video file uploaded successfully!');
      } else {
        throw new Error(res.message || 'Upload failed.');
      }
    } catch (err) {
      showAlert('error', `Failed to upload video: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle Thumbnail File Upload
  const handleThumbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert('error', 'Thumbnail file size exceeds 10MB.');
      return;
    }

    try {
      setUploadingThumb(true);
      const body = new FormData();
      body.append('image', file);

      const res = await api.uploadImage(body);
      if (res && res.success && res.fileUrl) {
        setFormData(prev => ({
          ...prev,
          thumbnailUrl: res.fileUrl,
        }));
        showAlert('success', 'Thumbnail image uploaded successfully!');
      } else {
        throw new Error(res.message || 'Thumbnail upload failed.');
      }
    } catch (err) {
      showAlert('error', `Failed to upload thumbnail: ${err.message}`);
    } finally {
      setUploadingThumb(false);
    }
  };

  // Save Reel (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showAlert('error', 'Reel Title is required.');
      return;
    }

    if (!formData.videoUrl.trim()) {
      showAlert('error', 'Please upload a video or provide a valid video URL.');
      return;
    }

    try {
      setSaving(true);
      if (editingReelId) {
        // Update
        const res = await api.updateReel(editingReelId, formData);
        if (res && res.success) {
          showAlert('success', 'Reel updated successfully!');
          setIsModalOpen(false);
          fetchReels();
        }
      } else {
        // Create
        const res = await api.createReel(formData);
        if (res && res.success) {
          showAlert('success', 'New Reel added successfully!');
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#383838]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D6A52A] mb-1">
              <Film className="w-4 h-4 text-[#D6A52A]" />
              <span>MEDIA & VIDEO MANAGEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Reels Showcase Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage short video reels and live product demonstrations displayed in the homepage Reels Showcase.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#D6A52A] hover:bg-[#F2C75C] text-black font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#D6A52A]/20 transition-all duration-200 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reel</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {alert && (
          <div
            className={`p-4 rounded-sm flex items-center justify-between text-sm ${
              alert.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/70 border border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{alert.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="p-1 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#202020] p-4 rounded-sm border border-white/10">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Total Reels</span>
            <span className="text-2xl font-extrabold text-white">{reels.length}</span>
          </div>
          <div className="bg-[#202020] p-4 rounded-sm border border-white/10">
            <span className="text-xs text-emerald-400 uppercase tracking-wider block mb-1">Active on Storefront</span>
            <span className="text-2xl font-extrabold text-emerald-400">{activeReelsCount}</span>
          </div>
          <div className="bg-[#202020] p-4 rounded-sm border border-white/10">
            <span className="text-xs text-yellow-400 uppercase tracking-wider block mb-1">Inactive / Drafts</span>
            <span className="text-2xl font-extrabold text-yellow-400">{reels.length - activeReelsCount}</span>
          </div>
          <div className="bg-[#202020] p-4 rounded-sm border border-white/10">
            <span className="text-xs text-[#D6A52A] uppercase tracking-wider block mb-1">Storefront Aspect</span>
            <span className="text-2xl font-extrabold text-[#D6A52A]">4:5 Portrait</span>
          </div>
        </div>

        {/* Reels Table / Grid List */}
        <div className="bg-[#202020] rounded-sm border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>All Configured Reels</span>
              <span className="text-xs text-[#D6A52A] bg-black/60 px-2 py-0.5 rounded-sm border border-[#D6A52A]/30">
                {reels.length} Items
              </span>
            </h2>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Drag or use arrows to change display order on the storefront
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-2 border-[#D6A52A] border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading reels...</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white mb-1">No video reels configured yet</p>
              <p className="text-xs text-gray-400 mb-4">Add your first demonstration reel to showcase products on the homepage.</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#D6A52A] text-black text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Reel</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {reels.map((reel, idx) => (
                <div
                  key={reel.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Left: 4:5 Media Thumbnail + Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* 4:5 Aspect Thumbnail */}
                    <div className="w-16 h-20 bg-black rounded-none border border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center">
                      {reel.thumbnailUrl ? (
                        <img
                          src={reel.thumbnailUrl}
                          alt={reel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#161616] flex items-center justify-center">
                          <Film className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current opacity-80" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A52A] bg-black/60 px-2 py-0.5 border border-[#D6A52A]/30">
                          {reel.category || 'General'}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 uppercase">
                          {reel.sourceType || 'url'}
                        </span>
                        {reel.isActive ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30">
                            Active (Live)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-950/60 px-2 py-0.5 border border-yellow-500/30">
                            Inactive (Draft)
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-white text-sm sm:text-base leading-snug">
                        {reel.title}
                      </h3>

                      {reel.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xl">
                          {reel.description}
                        </p>
                      )}

                      <p className="text-[11px] text-gray-500 font-mono truncate max-w-md">
                        {reel.videoUrl}
                      </p>
                    </div>
                  </div>

                  {/* Right: Order controls & Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-0.5 rounded-sm mr-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        title="Move Up"
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono text-gray-400 px-1">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={idx === reels.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        title="Move Down"
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(reel.id)}
                      title={reel.isActive ? 'Deactivate' : 'Activate'}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-sm border transition-all ${
                        reel.isActive
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                          : 'bg-yellow-950/50 border-yellow-500/40 text-yellow-400 hover:bg-yellow-900/50'
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
                      className="p-2 text-gray-300 hover:text-[#D6A52A] bg-black/50 border border-white/10 rounded-sm hover:border-[#D6A52A]/40 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReel(reel.id, reel.title)}
                      title="Delete Reel"
                      className="p-2 text-gray-300 hover:text-red-400 bg-black/50 border border-white/10 rounded-sm hover:border-red-500/40 transition-colors"
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#1c1c1c] border border-white/15 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#D6A52A]" />
                  <h2 className="text-xl font-heading font-extrabold text-white">
                    {editingReelId ? 'Edit Reel Video' : 'Add New Video Reel'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Reel Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Solar Zatka Machine 5KM Live Field Test"
                    className="w-full bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2.5 text-white text-sm focus:border-[#D6A52A] outline-none"
                  />
                </div>

                {/* 2. Category & Source Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Product Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2.5 text-white text-sm focus:border-[#D6A52A] outline-none"
                    >
                      {categoryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Source Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Video Source Type *
                    </label>
                    <select
                      value={formData.sourceType}
                      onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                      className="w-full bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2.5 text-white text-sm focus:border-[#D6A52A] outline-none"
                    >
                      <option value="upload">Direct Video Upload (MP4 / WebM)</option>
                      <option value="url">Public Video File URL (.mp4 / .webm)</option>
                      <option value="youtube">YouTube Video / Shorts</option>
                      <option value="instagram">Instagram Reel URL</option>
                    </select>
                  </div>
                </div>

                {/* 3. Video File Upload (Native File Picker) */}
                {formData.sourceType === 'upload' && (
                  <div className="bg-[#141414] p-4 rounded-sm border border-white/10 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A52A]">
                      Upload Video File (MP4, WebM, MOV - Max 100MB)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/mov"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#D6A52A] file:text-black hover:file:bg-[#F2C75C] cursor-pointer"
                    />
                    {uploadingVideo && (
                      <p className="text-xs text-[#D6A52A] animate-pulse">Uploading video to server, please wait...</p>
                    )}
                    {formData.videoUrl && (
                      <p className="text-xs text-emerald-400 truncate">
                        ✓ Video uploaded: {formData.videoUrl}
                      </p>
                    )}
                  </div>
                )}

                {/* 4. Video URL Input */}
                {formData.sourceType !== 'upload' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Video URL *
                    </label>
                    <input
                      type="text"
                      required={formData.sourceType !== 'upload'}
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder={
                        formData.sourceType === 'youtube'
                          ? 'e.g. https://www.youtube.com/watch?v=... or https://youtube.com/shorts/...'
                          : formData.sourceType === 'instagram'
                            ? 'e.g. https://www.instagram.com/reel/...'
                            : 'e.g. https://example.com/videos/zatka-demo.mp4'
                      }
                      className="w-full bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2.5 text-white text-sm focus:border-[#D6A52A] outline-none"
                    />
                  </div>
                )}

                {/* 5. Thumbnail Image Upload or URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Poster / Thumbnail Image (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="e.g. /images/categories/zatka-machines.png or image URL"
                      className="flex-1 bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2 text-white text-xs focus:border-[#D6A52A] outline-none"
                    />
                    <label className="px-3 py-2 bg-black/60 border border-white/20 hover:border-[#D6A52A] text-white text-xs font-semibold rounded-sm cursor-pointer shrink-0 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Description / Highlights (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of the demonstration or customer experience."
                    className="w-full bg-[#121212] border border-white/15 rounded-sm px-3.5 py-2 text-white text-xs focus:border-[#D6A52A] outline-none"
                  />
                </div>

                {/* 7. Sort Order & Active Switch */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Sort Order:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 1 })}
                      className="w-16 bg-[#121212] border border-white/15 rounded-sm px-2 py-1 text-white text-xs font-mono text-center outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 accent-[#D6A52A] rounded-none cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Publish to Storefront (Active)
                    </span>
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingVideo || uploadingThumb}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm bg-[#D6A52A] hover:bg-[#F2C75C] text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50"
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
