import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, Calendar, Tag, ShieldCheck, Info, IndianRupee, Users } from 'lucide-react';
import { eventService } from '../services/api';

const EventForm = ({ initialData = null, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    locationName: '',
    locationAddress: '',
    lat: '',
    lng: '',
    category: [],
    price: 0,
    capacity: 0,
    status: 'draft',
    images: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? initialData.date.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        locationName: initialData.location?.name || '',
        locationAddress: initialData.location?.address || '',
        lat: initialData.location?.coordinates?.lat || '',
        lng: initialData.location?.coordinates?.lng || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (newCategory && !formData.category.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, newCategory]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(c => c !== cat)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const { data } = await eventService.uploadImage(uploadData);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-2">
          <Info size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Info className="text-premier-400" /> General Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Event Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Afsana: The Grand Farewell 2026"
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-premier-400 transition placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell the story of your event..."
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-premier-400 transition placeholder:text-gray-700 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <MapPin className="text-vibrantBlue" /> Venue & Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Venue Name</label>
                <input 
                  type="text" 
                  name="locationName"
                  required
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder="e.g. Grand Ballroom, JW Marriott"
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-vibrantBlue transition placeholder:text-gray-700"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Address</label>
                <input 
                  type="text" 
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="Complete postal address..."
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-vibrantBlue transition placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-vibrantBlue transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-vibrantBlue transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Options */}
        <div className="space-y-8">
          <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" /> Status & Category
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Publishing Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {['draft', 'published', 'cancelled'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                        formData.status === status 
                        ? 'bg-premier-500/10 border-premier-400 text-premier-400' 
                        : 'bg-darkBackground-900 border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Categories</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.category.map(cat => (
                    <span key={cat} className="bg-vibrantBlue/10 text-vibrantBlue border border-vibrantBlue/20 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 animate-in zoom-in-75">
                      {cat} <X size={12} className="cursor-pointer hover:text-white" onClick={() => handleRemoveCategory(cat)} />
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category..."
                    className="flex-1 bg-darkBackground-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-vibrantBlue transition"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  />
                  <button 
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <IndianRupee className="text-premier-400" /> Pricing & Capacity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Entry Price (₹)</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-premier-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total Capacity</label>
                <input 
                  type="number" 
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-premier-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Row: Media & Dates */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="text-premier-400" /> Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                <input 
                  type="date" 
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-premier-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-premier-400 transition"
                />
              </div>
            </div>
          </div>

          <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Upload className="text-vibrantBlue" /> Event Media
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group w-32 h-32">
                  <img src={img} className="w-full h-full object-cover rounded-2xl border border-white/10" alt="" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className={`w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl cursor-pointer hover:border-premier-400/50 hover:bg-white/5 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <Upload size={24} className={uploading ? 'text-premier-400' : 'text-gray-500'} />
                <span className="text-[10px] font-black text-gray-500 mt-2 uppercase tracking-widest">
                  {uploading ? 'Uploading...' : 'Add Image'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 flex border-t border-white/5 justify-end gap-4">
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="px-8 py-4 rounded-2xl text-gray-400 font-bold hover:text-white transition"
        >
          DISCARD
        </button>
        <button 
          type="submit"
          disabled={loading || uploading}
          className="bg-gradient-to-r from-premier-500 to-vibrantBlue text-white font-black px-12 py-4 rounded-2xl shadow-2xl shadow-premier-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'SYNCING...' : initialData ? 'UPDATE EVENT' : 'PUBLISH EVENT'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
