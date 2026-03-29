import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, Calendar, Tag, ShieldCheck, Info, IndianRupee, Users, PlusCircle } from 'lucide-react';
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
    // Critical fix: Ensure price and capacity are integers before sending
    const submissionData = {
        ...formData,
        price: parseInt(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 0,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
          <Info size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Info className="text-sky-500" size={18} /> Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Event Prototype Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Afsana 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Project Description</label>
                <textarea 
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the event experience..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className="text-sky-500" size={18} /> Venue & Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Venue Name</label>
                <input 
                  type="text" 
                  name="locationName"
                  required
                  value={formData.locationName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                <input 
                  type="text" 
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">LAT</label>
                <input 
                  type="number" step="any" name="lat" value={formData.lat} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">LNG</label>
                <input 
                  type="number" step="any" name="lng" value={formData.lng} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={18} /> Status Code
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {['draft', 'published', 'cancelled'].map(status => (
                <button
                  key={status} type="button" onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={`px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                    formData.status === status 
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <IndianRupee className="text-sky-500" size={18} /> Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ticket Price</label>
                <input 
                  type="number" name="price" value={formData.price} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Capacity Limit</label>
                <input 
                  type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:outline-none focus:border-sky-500/50 transition"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar className="text-sky-500" size={18} /> Schedule
            </h3>
            <div className="space-y-4">
                <input 
                  type="date" name="date" required value={formData.date} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
                <input 
                  type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
            </div>
          </section>
        </div>

        {/* Media Row */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Upload className="text-sky-500" size={18} /> Event Media Assets
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group w-24 h-24">
                  <img src={img} className="w-full h-full object-cover rounded-xl border border-slate-800" alt="" />
                  <button 
                    type="button" onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              <label className={`w-24 h-24 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-sky-500/50 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <PlusCircle size={20} className={uploading ? 'text-sky-500' : 'text-slate-700'} />
              </label>
            </div>
        </div>
      </div>

      <div className="pt-8 flex justify-end gap-3">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 rounded-lg text-slate-500 text-xs font-bold uppercase transition hover:text-white">Discard</button>
        <button 
          type="submit" disabled={loading || uploading}
          className="bg-sky-600 text-white px-8 py-2.5 rounded-lg text-xs font-bold uppercase shadow-lg shadow-sky-900/20 hover:bg-sky-500 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : initialData ? 'Update Record' : 'Deploy Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
