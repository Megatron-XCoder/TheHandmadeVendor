"use client";
import React, { useEffect, useState } from "react";

export interface AddressData {
  name: string;
  email?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  addressType?: "shipping" | "billing";
  initialData?: AddressData;
  onSave?: (data: AddressData, type: "shipping" | "billing") => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  addressType = "shipping",
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<AddressData>({
    name: "James Septimus",
    email: "james@example.com",
    phone: "+1 (555) 234-5678",
    street: "7398 Smoke Ranch Road",
    city: "Las Vegas",
    state: "Nevada",
    postalCode: "89128",
    country: "United States",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData, addressType);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeModal();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto px-4 py-8 bg-[#2A1E17]/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="modal-content relative w-full max-w-[680px] bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8]/60 shadow-[0_20px_50px_rgba(42,30,23,0.25)] p-6 sm:p-10 text-[#3D2B1F] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] border border-transparent hover:border-[#E3C9A8]/40 transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-widest uppercase bg-[#FFFAF5] border border-[#E3C9A8]/60 text-[#C4896A] mb-2">
            <span>✦</span>
            <span>{addressType === "shipping" ? "Shipping Destination" : "Billing Address"}</span>
          </div>
          <h3
            className="text-2xl font-normal text-[#2A1E17] tracking-wider"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {addressType === "shipping" ? "Update Delivery Destination" : "Update Billing Coordinates"}
          </h3>
          <p className="text-xs text-[#7A6B5D] mt-1.5">
            Precision delivery details ensure your bespoke handcrafted items arrive in pristine atelier care.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                Recipient Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Lord / Lady Full Name"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
              Street Address & Residence *
            </label>
            <input
              type="text"
              name="street"
              required
              value={formData.street}
              onChange={handleChange}
              placeholder="Suite, Estate, Street name"
              className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Florence / New York"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                State / Region *
              </label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="State or Province"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal / Zip"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
              Country / Destination *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-[#FFFAF5]/60 border border-[#E3C9A8]/50 text-sm text-[#2A1E17] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Italy">Italy (Florence Atelier Hub)</option>
              <option value="France">France</option>
              <option value="Switzerland">Switzerland</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Australia">Australia</option>
              <option value="Canada">Canada</option>
              <option value="Japan">Japan</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#E3C9A8]/30">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-[#FFFAF5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved to Profile</span>
                </>
              ) : (
                <span>Save Coordinates</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
