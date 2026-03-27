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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#111116] border border-white/5 p-8 text-left align-middle shadow-2xl transition-all relative">
                
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
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-tight text-white pb-2">
                      Arriving with a vehicle?
                    </Dialog.Title>
                    
                    <p className="text-sm text-gray-400">
                      Event parking fills up fast. Pre-book your guaranteed parking spot now and skip the hassle on the event day.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mt-4">
                      <div>
                        <span className="text-fuchsia-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                          Limited Space
                        </span>
                        <h4 className="text-white font-medium">VIP Premium Spot</h4>
                        <p className="text-gray-500 text-xs mt-0.5">Only {availableSlots} spots remaining</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-white">+₹{parkingPrice}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Flat rate</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-3.5 text-sm font-medium text-white transition-all"
                        onClick={handleContinueToDetails}
                      >
                        Yes, add parking (+₹{parkingPrice})
                      </button>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl px-4 py-3.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={handleNoParking}
                      >
                        No thanks, continue with tickets
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

                    <Dialog.Title as="h3" className="text-xl font-semibold leading-tight text-white flex items-center gap-3">
                      Vehicle details
                      <span className="text-xs text-gray-500 font-normal">2 of 2</span>
                    </Dialog.Title>
                    
                    <p className="text-sm text-gray-400">
                      Enter your registration number for the digital parking pass.
                    </p>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">License plate number</label>
                      <input 
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. DL 01 AB 1234"
                        className="w-full bg-[#1A1A22] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all font-medium uppercase"
                      />
                      {error && <p className="text-red-400 text-xs mt-2 font-medium bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}
                    </div>

                    <div className="mt-5 p-4 border border-blue-500/10 bg-blue-500/5 rounded-2xl">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Assigned Parking Spot</span>
                      <h4 className="text-white font-medium text-sm">VIP Premium Zone (Level 1)</h4>
                      <p className="text-gray-500 text-xs mt-1">Guaranteed entry directly to the venue gates.</p>
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
                      <div className="flex justify-between items-center text-lg mt-3 pt-3 border-t border-white/10">
                        <span className="text-gray-300 font-medium">Total</span>
                        <span className="text-white font-bold text-xl">₹{ticketPrice + parkingPrice}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-3.5 text-sm font-medium text-white transition-all"
                        onClick={handleConfirmWithParking}
                      >
                        Confirm and pay ₹{ticketPrice + parkingPrice}
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
