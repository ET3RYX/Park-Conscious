import React, { useState, useEffect } from 'react';

const legalContent = {
  terms: {
    title: "Terms & Conditions",
    content: (
      <div className="space-y-6">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Effective Date: April 2026 | Backstage</p>
        <p>These Terms and Conditions ("Terms") govern your use of the Backstage platform ("Platform"), operated at events.parkconscious.in. By accessing or using Backstage, you agree to be bound by these Terms.</p>
        
        <h4 className="text-lg font-bold text-slate-800 mt-6">1. About Backstage</h4>
        <p className="text-slate-600">Backstage is a technology platform that enables event organisers to list events and allows users to discover, book tickets for, and access events across Delhi NCR. We are a marketplace platform — we are not itself an event organiser.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">2. User Accounts</h4>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>You must be at least 18 years old to create an account.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You must provide accurate and complete information when registering.</li>
        </ul>

        <h4 className="text-lg font-bold text-slate-800 mt-6">3. Event Listings</h4>
        <p className="text-slate-600">Event organisers are solely responsible for the conduct, safety, and quality of their events. Backstage is not liable for any loss or injury arising from events listed on the Platform.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">4. Ticket Purchases</h4>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Payments are processed securely through Razorpay or other gateways.</li>
          <li>Backstage charges a platform fee on paid tickets as disclosed at checkout.</li>
          <li>Your purchase is a direct transaction between you and the event organiser.</li>
        </ul>

        <h4 className="text-lg font-bold text-slate-800 mt-6">5. Prohibited Conduct</h4>
        <p className="text-slate-600">You agree not to use the platform for unlawful purposes, resell tickets in violation of organiser rules, or attempt to circumvent security.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-6">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Effective Date: April 2026 | Backstage</p>
        <p>This Privacy Policy explains how Backstage ("we", "our", "us", or "the Platform") collects, uses, stores, and protects your personal information when you use our platform at backstage.events, including our mobile applications and related services. By using Backstage, you agree to the practices described in this policy.</p>
        <p>Your trust matters to us. We do not exploit, sell, or misuse your personal data ever. Data we collect is used solely to operate and improve the Backstage platform.</p>
        
        <h4 className="text-lg font-bold text-slate-800 mt-6">1. Information We Collect</h4>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Identity information: name, date of birth, profile photo</li>
          <li>Contact information: email address, phone number</li>
          <li>Account credentials: username and encrypted password</li>
          <li>Payment information: processed securely via Razorpay or any other payment gateway</li>
          <li>Device and usage data: IP address, browser type, etc.</li>
          <li>Location data: approximate location (only with your permission)</li>
          <li>Event interaction data: events browsed, tickets purchased</li>
        </ul>

        <h4 className="text-lg font-bold text-slate-800 mt-6">2. How We Use Your Information</h4>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>To create and manage your account</li>
          <li>To process event bookings and ticket purchases</li>
          <li>To send booking confirmations and QR passes</li>
          <li>To display events relevant to your location</li>
          <li>To resolve disputes and respond to support requests</li>
        </ul>

        <h4 className="text-lg font-bold text-slate-800 mt-6">3. Sharing of Data</h4>
        <p>We do NOT sell your personal data to third parties. We may share data with event organisers (solely to facilitate your attendance), payment processors (Razorpay), and technology service providers under strict confidentiality.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">4. Data Retention</h4>
        <p>We retain your personal data for as long as your account is active or as required by law. You may request deletion of your account by contacting us at help@parkconscious.in.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">5. Security</h4>
        <p>We implement industry-standard technical measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">6. Your Rights</h4>
        <p>You have the right to access, correct, or request deletion of your data. Contact us at help@parkconscious.in to exercise these rights.</p>
      </div>
    )
  },
  refunds: {
    title: "Refunds & Cancellation",
    content: (
      <div className="space-y-6">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Effective Date: April 2026 | Backstage</p>
        <p className="p-4 bg-amber-50 rounded-xl text-xs text-amber-800 leading-relaxed border border-amber-100">
          <strong>Important:</strong> Backstage is a marketplace platform. Refund eligibility is determined entirely by the event organiser — not by Backstage.
        </p>
        
        <h4 className="text-lg font-bold text-slate-800 mt-6">1. Backstage's Role</h4>
        <p className="text-slate-600">Backstage is a technology platform. We facilitate refunds only if and when the event organiser explicitly authorises them. Our platform fee is non-refundable.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">2. Event Cancellation</h4>
        <p className="text-slate-600">If an organiser cancels an event, they are responsible for initiating refunds. Approved refunds typically take 5–7 business days to process.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">3. User Cancellation</h4>
        <p className="text-slate-600">If you wish to cancel, contact the organiser. Whether a refund is granted depends entirely on the organiser's policy for that specific event.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">4. Parking Bookings</h4>
        <p className="text-slate-600">Parking refunds are managed separately by Park Conscious and are subject to their specific cancellation policy.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">5. How to Request</h4>
        <p className="text-slate-600">Contact the organiser through the event page. If they approve, they will instruct us to process the refund.</p>
      </div>
    )
  },
  shipping: {
    title: "Delivery & Pass Policy",
    content: (
      <div className="space-y-6">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Effective Date: April 2026 | Backstage</p>
        <p className="text-slate-600 italic">Backstage is a digital platform. We do not ship physical goods. All passes are delivered digitally.</p>
        
        <h4 className="text-lg font-bold text-slate-800 mt-6">1. Digital Delivery</h4>
        <p className="text-slate-600">A QR-coded digital pass is generated and sent to your email immediately after payment. You can also find it in 'My Bookings'.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">2. Pass Validity</h4>
        <p className="text-slate-600">Each pass is valid for a single entry. Passes are non-transferable unless permitted by the organiser.</p>

        <h4 className="text-lg font-bold text-slate-800 mt-6">3. Lost Passes</h4>
        <p className="text-slate-600">If you don't receive your email, log into your account to download the pass directly from your dashboard.</p>
      </div>
    )
  }
};

const LegalModal = ({ isOpen, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab(initialTab);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <img src="/favicon.png" className="h-8 w-8 rounded-lg shadow-sm" alt="Logo" onError={(e) => e.target.src = './favicon.png'} />
            <span className="font-bold text-slate-900 tracking-tight">Legal Center</span>
          </div>
          <nav className="space-y-2 flex-1">
            {Object.keys(legalContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === tab
                    ? 'font-bold bg-white text-teal-600 shadow-sm ring-1 ring-slate-100'
                    : 'font-semibold text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                {legalContent[tab].title}
              </button>
            ))}
          </nav>
          <button
            onClick={onClose}
            className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all text-center"
          >
            Close
          </button>
        </div>
        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase">{legalContent[activeTab].title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-8 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed scroll-smooth">
            {legalContent[activeTab].content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
