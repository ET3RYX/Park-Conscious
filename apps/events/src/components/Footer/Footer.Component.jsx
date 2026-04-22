import React, { useState } from "react";
import { Link } from "react-router-dom";
import LegalModal from "../Modal/LegalModal";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('terms');

  const openLegal = (tab) => {
    setInitialTab(tab);
    setModalOpen(true);
  };

  return (
    <footer className="bg-darkBackground-900 border-t border-darkBackground-700 py-16 px-6 relative z-10 w-full mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">BACK<span className="text-indigo-500">STAGE</span></h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 pr-4">
            The biggest concerts and festivals in Delhi NCR are here. Pre-book your parking spot and walk straight to the front row.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <a href="https://www.instagram.com/parkconscious.in/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-darkBackground-800 flex items-center justify-center text-white hover:bg-vibrantBlue hover:-translate-y-1 transition-all shadow-lg"><FaInstagram size={20} /></a>
            <a href="https://www.linkedin.com/company/park-conscious/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-darkBackground-800 flex items-center justify-center text-white hover:bg-vibrantBlue hover:-translate-y-1 transition-all shadow-lg"><FaLinkedin size={20} /></a>
            <a href="https://x.com/PConscious77050" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-darkBackground-800 flex items-center justify-center text-white hover:bg-vibrantBlue hover:-translate-y-1 transition-all shadow-lg"><FaTwitter size={20} /></a>
            <a href="mailto:parkconscious3@gmail.com" className="w-10 h-10 rounded-full bg-darkBackground-800 flex items-center justify-center text-white hover:bg-vibrantBlue hover:-translate-y-1 transition-all shadow-lg"><AiOutlineMail size={20} /></a>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Contact Us</h4>
          <p className="text-gray-400 text-sm mb-3">Email: <a href="mailto:parkconscious3@gmail.com" className="hover:text-vibrantBlue transition-colors font-medium text-gray-300">parkconscious3@gmail.com</a></p>
          <p className="text-gray-400 text-sm">Phone: <a href="tel:9634867544" className="hover:text-vibrantBlue transition-colors font-medium text-gray-300">+91 9634867544</a></p>
        </div>

        <div className="w-full md:w-1/3">
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Legal</h4>
          <div className="flex flex-col space-y-4">
            <button onClick={() => openLegal('privacy')} className="text-left text-gray-400 text-sm hover:text-vibrantBlue transition-colors">Privacy Policy</button>
            <button onClick={() => openLegal('terms')} className="text-left text-gray-400 text-sm hover:text-vibrantBlue transition-colors">Terms of Service</button>
            <button onClick={() => openLegal('refunds')} className="text-left text-gray-400 text-sm hover:text-vibrantBlue transition-colors">Refund & Returns</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-darkBackground-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-xs tracking-wider uppercase">&copy; 2026 BACKSTAGE. All rights reserved.</p>
        <div className="flex gap-6 text-gray-500 text-xs text-center w-full justify-center md:w-auto">
          <button onClick={() => openLegal('privacy')} className="hover:text-vibrantBlue transition-colors">Privacy Policy</button>
          <button onClick={() => openLegal('terms')} className="hover:text-vibrantBlue transition-colors">Terms of Service</button>
          <span>Contact</span>
        </div>
      </div>
      <LegalModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialTab={initialTab} 
      />
    </footer>
  );
};

export default Footer;
