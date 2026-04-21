import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, X, MapPin, Calendar, Tag, Shield, 
  Info, IndianRupee, Users, PlusCircle, 
  ChevronDown, ChevronUp, AlertCircle, Star,
  Lock, Layout, Monitor, Globe, Trash2
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';

const SessionIdDisplay = () => {
  const sessionId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);
  return (
    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1">
      Session ID: {sessionId}
    </p>
  );
};

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
    category: '',
    price: 0,
    capacity: 0,
    status: 'published',
    images: [],
    isFeatured: false,
    featuredTitle: '',
    featuredSubtitle: '',
    featuredLabel: '',
    accentColor: 'indigo-500',
    requiredFields: {
      name: true,
      email: true,
      phone: true
    },
    customForms: []
  });

  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
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
        customForms: initialData.customForms || [],
        category: initialData.category || '',
        isFeatured: initialData.isFeatured || false,
        featuredTitle: initialData.featuredTitle || '',
        featuredSubtitle: initialData.featuredSubtitle || '',
        featuredLabel: initialData.featuredLabel || '',
        accentColor: initialData.accentColor || 'indigo-500',
        price: initialData.price ?? initialData.regularPrice ?? 0,
        capacity: initialData.capacity ?? 0,
        // Ensure requiredFields exists even if database record doesn't have it
        requiredFields: {
          name:  initialData.requiredFields?.name  ?? true,
          email: initialData.requiredFields?.email ?? true,
          phone: initialData.requiredFields?.phone ?? true,
        }
      });
      if (initialData.location?.coordinates?.lat || initialData.location?.coordinates?.lng) {
        setShowAdvancedLocation(true);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const secureUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, secureUrl]
      }));
    } catch (err) {
        console.error('Upload Error:', err);
        setError(`MEDIA TRANSMISSION FAILURE: ${err.message}`);
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
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-rose-950/10">
           <AlertCircle size={20} /> 
           <span>{error}</span>
           <span className="ml-auto opacity-50">Image bypass available</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Pane */}
        <div className="lg:col-span-8 space-y-12">
          {/* Identity Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <Layout className="text-sky-500" size={20} /> CORE IDENTITY
              </h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Section 01</span>
            </div>
            
            <div className="space-y-8">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Asset Title</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleChange}
                  placeholder="Theatrical Performance, Tech Symposium, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all shadow-inner placeholder:text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Experience Narrative</label>
                <textarea 
                  name="description" rows="6" value={formData.description} onChange={handleChange}
                  placeholder="Define the vision and specific details of this encounter..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all shadow-inner resize-none font-medium placeholder:text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Category</label>
                <select
                  name="category" value={formData.category} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all font-medium appearance-none"
                >
                  <option value="">Select a category...</option>
                  {['Music', 'Arts', 'Tech', 'Sports', 'Comedy', 'Culture', 'Summits', 'Food', 'Fashion', 'Film', 'Education', 'Gaming', 'Wellness', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Venue Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <MapPin className="text-sky-500" size={20} /> DEPOT LOCATION
              </h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Section 02</span>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Venue Primary Identity</label>
                <input 
                  type="text" name="locationName" required value={formData.locationName} onChange={handleChange}
                  placeholder="Global Convention Centre"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Physical Coordinates</label>
                <input 
                  type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange}
                  placeholder="Block 4, Industrial Area, Noida, UP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all font-medium"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                  className="flex items-center gap-3 text-[10px] font-black text-slate-600 hover:text-sky-500 uppercase tracking-[0.2em] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-sky-500/50">
                    {showAdvancedLocation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  Geospatial Telemetry
                </button>
              </div>

              {showAdvancedLocation && (
                <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-sky-500/60 uppercase tracking-[0.2em] ml-1">Latitude</label>
                    <input 
                      type="number" step="any" name="lat" value={formData.lat} onChange={handleChange}
                      placeholder="0.00000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs font-mono focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-sky-500/60 uppercase tracking-[0.2em] ml-1">Longitude</label>
                    <input 
                      type="number" step="any" name="lng" value={formData.lng} onChange={handleChange}
                      placeholder="0.00000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs font-mono focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Handpicked Experiences Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <Star className="text-violet-400" size={20} /> HANDPICKED EXPERIENCES
              </h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Section 03 — Featured</span>
            </div>

            {/* Featured Toggle */}
            <label className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-3xl cursor-pointer hover:border-violet-500/40 transition-all group relative z-10">
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Feature on Homepage</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Showcase in the Handpicked Experiences carousel</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox" name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 rounded-full peer-checked:bg-violet-500 transition-all relative">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 group-[.peer-checked]:translate-x-6" style={{transform: formData.isFeatured ? 'translateX(24px)' : 'translateX(0)'}} />
                </div>
              </div>
            </label>

            {formData.isFeatured && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Featured Card Title</label>
                    <input
                      type="text" name="featuredTitle" value={formData.featuredTitle} onChange={handleChange}
                      placeholder="e.g. Afsana 2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Badge Label</label>
                    <input
                      type="text" name="featuredLabel" value={formData.featuredLabel} onChange={handleChange}
                      placeholder="e.g. FEATURED · MUSIC"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Featured Subtitle / Tagline</label>
                  <input
                    type="text" name="featuredSubtitle" value={formData.featuredSubtitle} onChange={handleChange}
                    placeholder="e.g. The farewell you'll never forget · GGSIPU · May 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {['indigo-500', 'violet-500', 'rose-500', 'amber-500', 'emerald-500', 'sky-500', 'pink-500', 'orange-500'].map(color => {
                      const colorMap = {
                        'indigo-500': '#6366f1', 'violet-500': '#8b5cf6', 'rose-500': '#f43f5e',
                        'amber-500': '#f59e0b', 'emerald-500': '#10b981', 'sky-500': '#0ea5e9',
                        'pink-500': '#ec4899', 'orange-500': '#f97316'
                      };
                      return (
                        <button key={color} type="button" onClick={() => setFormData(prev => ({ ...prev, accentColor: color }))}
                          className={`w-10 h-10 rounded-2xl transition-all border-2 ${formData.accentColor === color ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: colorMap[color] }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Protocols Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <Lock className="text-sky-500" size={20} /> ENTRY PROTOCOLS
              </h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Section 04</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['name', 'email', 'phone'].map(field => (
                <label key={field} className="flex flex-col gap-4 p-6 bg-slate-950 border border-slate-800 rounded-3xl cursor-pointer hover:border-sky-500/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Users size={64} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-[0.2em] mt-0.5">Collect {field}</span>
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
                      <div className="w-6 h-6 border-2 border-slate-800 rounded-lg peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center">
                        <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Custom Dynamic Fields Builder */}
            <div className="pt-8 border-t border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <PlusCircle className="text-sky-500" size={16} /> Dynamic Data Collection
                  </h4>
                  <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-1">Add custom text inputs for checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    customForms: [...prev.customForms, { id: Date.now().toString(), label: '', required: false }]
                  }))}
                  className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-sky-500/20"
                >
                  <PlusCircle size={14} /> Add Field
                </button>
              </div>

              {formData.customForms && formData.customForms.length > 0 ? (
                <div className="space-y-4">
                  {formData.customForms.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl group animate-in slide-in-from-left-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. University Name, T-Shirt Size"
                          value={field.label}
                          onChange={(e) => {
                            const newForms = [...formData.customForms];
                            newForms[index].label = e.target.value;
                            setFormData(prev => ({ ...prev, customForms: newForms }));
                          }}
                          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-700 font-medium"
                        />
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer border-l border-slate-800 pl-4 py-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-500 transition-colors">Required</span>
                        <div className="relative">
                          <input 
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const newForms = [...formData.customForms];
                              newForms[index].required = e.target.checked;
                              setFormData(prev => ({ ...prev, customForms: newForms }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border-2 border-slate-700 rounded-md peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            customForms: prev.customForms.filter(f => f.id !== field.id)
                          }));
                        }}
                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No custom fields deployed</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-12">
          {/* Status */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Globe className="text-emerald-500" size={20} /> ECOSYSTEM STATE
            </h3>
            <div className="space-y-3">
              {[
                { id: 'published', label: 'DEPLOY LIVE', description: 'Immediate public visibility', icon: Star },
                { id: 'draft', label: 'INCUBATING', description: 'Internal restricted access', icon: Monitor },
                { id: 'cancelled', label: 'DEACTIVATED', description: 'Protocol suspended', icon: X }
              ].map(item => (
                <button
                  key={item.id} type="button" onClick={() => setFormData(prev => ({ ...prev, status: item.id }))}
                  className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${
                    formData.status === item.id 
                    ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-900/20' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${formData.status === item.id ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest">{item.label}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 mt-0.5`}>{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
             <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <IndianRupee className="text-sky-500" size={20} /> ECONOMIC PARAMS
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Ticket Multiplier</label>
                <div className="relative group">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input 
                    type="number" name="price" value={formData.price} onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-2xl font-black text-white focus:outline-none focus:border-sky-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Density Threshold</label>
                <div className="relative group">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input 
                    type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-2xl font-black text-white focus:outline-none focus:border-sky-500/50 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Calendar className="text-sky-500" size={20} /> TEMPORAL VECTOR
            </h3>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Activation Date</label>
                <input 
                  type="date" name="date" required value={formData.date} onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all font-mono uppercase tracking-widest"
                />
            </div>
          </section>
        </div>

        {/* Media Block Full Width */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-10 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between">
               <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <Upload className="text-sky-500" size={24} /> MEDIA REPOSITORY
              </h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-4 py-2 rounded-full border border-slate-800">Support: JPG, PNG, WEBP (v4.0)</p>
            </div>
            
            <div className="flex flex-wrap gap-8">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group w-48 h-48 rounded-[2rem] overflow-hidden border border-slate-800 shadow-xl transition-all hover:scale-105 duration-500">
                  <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all" />
                  <button 
                    type="button" onClick={() => handleRemoveImage(idx)}
                    className="absolute top-4 right-4 bg-rose-600 text-white p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-animate translate-y-2 group-hover:translate-y-0 shadow-2xl"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <label className={`w-48 h-48 flex flex-col items-center justify-center border-4 border-dashed border-slate-800 rounded-[2rem] cursor-pointer hover:border-sky-500/50 transition-all group ${uploading ? 'animate-pulse' : ''}`}>
                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 transition-all group-hover:bg-sky-500/10 group-hover:border-sky-500/50 group-hover:scale-110">
                   {uploading ? <RefreshCw size={24} className="text-sky-500 animate-spin" /> : <PlusCircle size={24} className="text-slate-600 group-hover:text-sky-500" />}
                </div>
                <span className="text-[9px] font-black text-slate-600 group-hover:text-sky-500 uppercase tracking-[0.3em]">{uploading ? 'Transmitting...' : 'Link Asset'}</span>
              </label>
            </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="pt-12 flex items-center justify-between border-t border-slate-800/50 pb-20">
        <button type="button" onClick={() => window.history.back()} className="px-10 py-5 rounded-[2rem] text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800">
          Abound Experience
        </button>
        <div className="flex items-center gap-6">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Authorized Synchronization</p>
              <SessionIdDisplay />
           </div>
           <button 
            type="submit" disabled={loading || uploading}
            className="bg-sky-600 hover:bg-sky-500 text-white px-16 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-sky-900/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? <Lock className="animate-pulse" size={18} /> : (initialData ? 'Synchronize Updates' : (formData.status === 'published' ? 'Execute Deployment' : 'Preserve Protocol'))}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EventForm;
