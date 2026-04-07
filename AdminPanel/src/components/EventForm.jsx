import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, Calendar, Tag, ShieldCheck, Info, IndianRupee, Users, PlusCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { eventService } from '../services/api';
import { uploadToCloudinary } from '../utils/cloudinary';

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
    status: 'published', // Changed default to published for immediate visibility
    images: [],
    requiredFields: {
      name: true,
      email: true,
      phone: true
    }
  });

  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
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
      // Auto-show advanced if coordinates exist
      if (initialData.location?.coordinates?.lat || initialData.location?.coordinates?.lng) {
        setShowAdvancedLocation(true);
      }
      if (initialData.requiredFields) {
        setFormData(prev => ({
          ...prev,
          requiredFields: {
            name:  initialData.requiredFields.name  ?? true,
            email: initialData.requiredFields.email ?? true,
            phone: initialData.requiredFields.phone ?? true,
          }
        }));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      // Bypassing Vercel backend constraints - Direct Cloudinary Uplink
      const secureUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, secureUrl]
      }));
      console.log('%c[MEDIA_SYNC] Image Link Active:', 'color: #10b981;', secureUrl);
    } catch (err) {
        console.error('Upload Error:', err);
        setError(`UPLOAD FAILED: ${err.message}`);
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
    const submissionData = {
        ...formData,
        price: parseInt(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 0,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0,
        requiredFields: formData.requiredFields
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-xl text-xs font-bold flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-3">
             <AlertCircle size={18} /> {error}
          </div>
          <p className="text-[10px] text-rose-400 mt-1 ml-7 opacity-80">(You can still click 'Deploy Live' at the bottom to create the event without this image)</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Info className="text-sky-500" size={18} /> Event Identity
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleChange}
                  placeholder="e.g. TEDx GGSIPU 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Project Description</label>
                <textarea 
                  name="description" rows="5" value={formData.description} onChange={handleChange}
                  placeholder="Describe the experience..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition resize-none font-medium"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className="text-sky-500" size={18} /> Venue Profile
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Venue Name</label>
                <input 
                  type="text" name="locationName" required value={formData.locationName} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Address</label>
                <input 
                  type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange}
                  placeholder="Street, City, Area"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition font-medium"
                />
              </div>

              {/* Advanced Toggle */}
              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-sky-500 uppercase tracking-widest transition"
                >
                  {showAdvancedLocation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showAdvancedLocation ? 'Hide Precise Coordinates' : 'Show Precise Coordinates (LAT/LNG)'}
                </button>
              </div>

              {showAdvancedLocation && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-sky-500/60 font-black">LAT (Optional)</label>
                    <input 
                      type="number" step="any" name="lat" value={formData.lat} onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-sky-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-sky-500/60 font-black">LNG (Optional)</label>
                    <input 
                      type="number" step="any" name="lng" value={formData.lng} onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-sky-500/50 transition"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Users className="text-sky-500" size={18} /> Attendee Data Collection
            </h3>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed">Toggle which information attendees must provide during booking. Deselected fields will be hidden from the booking form.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['name', 'email', 'phone'].map(field => (
                <label key={field} className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-sky-500/30 transition-all group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={formData.requiredFields[field]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        requiredFields: { ...prev.requiredFields, [field]: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-700 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest leading-none mt-0.5">Collect {field}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={18} /> Deployment State
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'published', label: 'Published (Visible)', icon: ShieldCheck },
                { id: 'draft', label: 'Draft (Internal Only)', icon: Info },
                { id: 'cancelled', label: 'Cancelled', icon: X }
              ].map(item => (
                <button
                  key={item.id} type="button" onClick={() => setFormData(prev => ({ ...prev, status: item.id }))}
                  className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-3 ${
                    formData.status === item.id 
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  <item.icon size={12} />
                  {item.label}
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
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="number" name="price" value={formData.price} onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm font-bold focus:outline-none focus:border-sky-500/50 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Capacity Limit</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm font-bold focus:outline-none focus:border-sky-500/50 transition"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar className="text-sky-500" size={18} /> Timeline
            </h3>
            <div className="space-y-4">
                <input 
                  type="date" name="date" required value={formData.date} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50 transition"
                />
            </div>
          </section>
        </div>

        {/* Media Row */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-10 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Upload className="text-sky-500" size={18} /> Visual Assets
            </h3>
            
            <div className="flex flex-wrap gap-5">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group w-32 h-32">
                  <img src={img} className="w-full h-full object-cover rounded-2xl border border-slate-800" alt="" />
                  <button 
                    type="button" onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-3 -right-3 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-xl"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className={`w-32 h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-sky-500/50 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <PlusCircle size={24} className={uploading ? 'text-sky-500' : 'text-slate-700'} />
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-2">{uploading ? 'Uploading...' : 'Add Image'}</span>
              </label>
            </div>
        </div>
      </div>

      <div className="pt-8 flex justify-end gap-3 pb-12">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 rounded-xl text-slate-500 text-xs font-bold uppercase transition hover:text-white">Cancel</button>
        <button 
          type="submit" disabled={loading || uploading}
          className="bg-sky-600 text-white px-10 py-3 rounded-xl text-xs font-bold uppercase shadow-xl shadow-sky-900/20 hover:bg-sky-500 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : initialData ? 'Update Record' : (formData.status === 'published' ? 'Deploy Live' : 'Save Draft')}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
