import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../config";

const RequestEventModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    contactName: '',
    contactEmail: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/event-request`, formData);
      if (response.data.success) {
        alert("Success! Your event proposal has been submitted.");
        
        // Reset and close immediately
        setFormData({ eventName: '', description: '', contactName: '', contactEmail: '' });
        onClose();
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || 'Submission failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#040b17', // Match the darkest background color
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '2rem',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', margin: 0 }}>List Your Event</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
             X CLOSE
          </button>
        </div>

        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Fill in the details below. Our team will review your proposal and get back to you within 24 hours.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Event Name</label>
            <input 
              required name="eventName" value={formData.eventName} onChange={handleChange} 
              style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.5rem', color: 'white', fontSize: '0.875rem' }} 
              placeholder="e.g. Neon Nights 2026" 
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                required name="contactName" value={formData.contactName} onChange={handleChange} 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.5rem', color: 'white', fontSize: '0.875rem', boxSizing: 'border-box' }} 
                placeholder="John Doe" 
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.5rem', color: 'white', fontSize: '0.875rem', boxSizing: 'border-box' }} 
                placeholder="john@company.com" 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Event Details</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} rows="4" 
              style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.5rem', color: 'white', fontSize: '0.875rem', resize: 'none' }} 
              placeholder="Tell us about the vibes and expected audience..."
            ></textarea>
          </div>

          <button 
            disabled={loading} type="submit" 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(90deg, #2563eb 0%, #c026d3 100%)', 
              color: 'white', 
              fontWeight: 900, 
              padding: '1.25rem', 
              borderRadius: '9999px', 
              fontSize: '1rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '1rem'
            }}
          >
            {loading ? 'Processing...' : 'Submit Event Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestEventModal;
;
