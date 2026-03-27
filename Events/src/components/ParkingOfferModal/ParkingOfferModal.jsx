import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const ParkingOfferModal = ({ isOpen, closeModal, onConfirm, ticketPrice }) => {
  const [step, setStep] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");

  const parkingPrice = 149; // Fixed pre-booking price
  const availableSlots = 12; // Mapped dynamically in a real app

  const handleNoParking = () => {
    onConfirm({ wantsParking: false, vehicleNumber: "", addedCost: 0 });
  };

  const handleContinueToDetails = () => {
    setStep(2);
  };

  const handleConfirmWithParking = () => {
    if (!vehicleNumber.trim()) {
      setError("Please enter your vehicle number (e.g., DL 01 AB 1234)");
      return;
    }
    setError("");
    onConfirm({ wantsParking: true, vehicleNumber: vehicleNumber.toUpperCase(), addedCost: parkingPrice });
  };

  const resetAndClose = () => {
    setStep(1);
    setVehicleNumber("");
    setError("");
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={resetAndClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-8"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-8"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-[#0D0D12] border border-white/10 p-8 text-left align-middle shadow-2xl shadow-vibrantBlue/10 transition-all relative">
                
                {/* Close Button */}
                <button 
                  onClick={resetAndClose}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                {step === 1 ? (
                  /* STEP 1: The Offer */
                  <div className="space-y-6 mt-2">
                    <div className="w-16 h-16 bg-vibrantBlue/10 rounded-full flex items-center justify-center border border-vibrantBlue/20 mb-6">
                      <svg className="w-8 h-8 text-vibrantBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg> {/* Car icon abstraction */}
                      <svg className="w-8 h-8 text-vibrantBlue absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    
                    <Dialog.Title as="h3" className="text-2xl font-bold leading-tight text-white">
                      Arriving with a vehicle?
                    </Dialog.Title>
                    
                    <p className="text-sm text-gray-400">
                      Event parking fills up fast. Pre-book your guaranteed parking spot now and skip the hassle on the event day.
                    </p>

                    <div className="bg-[#16161C] border border-premier-500/30 rounded-2xl p-4 flex items-center justify-between mt-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-premier-500/10 rounded-full blur-2xl flex-shrink-0"></div>
                      <div className="relative z-10">
                        <span className="text-premier-400 text-xs font-bold uppercase tracking-wider mb-1 block flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-premier-400 animate-pulse"></span>
                          Limited Space
                        </span>
                        <h4 className="text-white font-bold">VIP Premium Spot</h4>
                        <p className="text-gray-500 text-xs mt-1">Only {availableSlots} spots remaining</p>
                      </div>
                      <div className="text-right relative z-10">
                        <span className="block text-xl font-black text-white">+₹{parkingPrice}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Flat Rate</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl border border-transparent bg-vibrantBlue px-4 py-4 text-sm font-bold text-white shadow-lg shadow-vibrantBlue/30 hover:bg-blue-600 transition-all uppercase tracking-wider"
                        onClick={handleContinueToDetails}
                      >
                        Yes, Add Parking (₹{parkingPrice})
                      </button>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl border border-white/10 bg-transparent px-4 py-4 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                        onClick={handleNoParking}
                      >
                        No, Continue with Tickets Only
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: Vehicle Details */
                  <div className="space-y-6 mt-2">
                    <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors mb-4 border border-white/10 rounded-full px-4 py-1.5 w-max hover:bg-white/5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                      Back
                    </button>

                    <Dialog.Title as="h3" className="text-2xl font-bold leading-tight text-white flex items-center gap-3">
                      Vehicle Details
                      <span className="text-[10px] bg-vibrantBlue/20 text-vibrantBlue border border-vibrantBlue/30 px-2 py-0.5 rounded-md uppercase tracking-wider">Step 2/2</span>
                    </Dialog.Title>
                    
                    <p className="text-sm text-gray-400">
                      Enter your registration number for the digital parking pass.
                    </p>

                    <div className="mt-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">License Plate Number</label>
                      <input 
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. DL 01 AB 1234"
                        className="w-full bg-[#16161C] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-vibrantBlue/50 focus:bg-[#1A1A24] transition-all uppercase font-medium tracking-widest"
                      />
                      {error && <p className="text-red-400 text-xs mt-2 font-medium bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}
                    </div>

                    <div className="bg-[#16161C] rounded-2xl p-4 border border-white/5 mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tickets</span>
                        <span className="text-white font-medium">₹{ticketPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">VIP Parking Add-on</span>
                        <span className="text-white font-medium">₹{parkingPrice}</span>
                      </div>
                      <div className="w-full h-px bg-white/10 my-2"></div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-300 font-bold">Total Amount</span>
                        <span className="text-vibrantBlue font-black text-2xl">₹{ticketPrice + parkingPrice}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl border border-transparent bg-gradient-to-r from-vibrantBlue to-indigo-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-vibrantBlue/20 hover:shadow-vibrantBlue/40 hover:-translate-y-0.5 transition-all uppercase tracking-wider"
                        onClick={handleConfirmWithParking}
                      >
                        Confirm & Pay Total (₹{ticketPrice + parkingPrice})
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ParkingOfferModal;
