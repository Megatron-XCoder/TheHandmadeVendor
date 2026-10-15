"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import AtelierDropdown, { DropdownItem } from "../Common/AtelierDropdown";
import { SavedAddress, AddressTag } from "@/utils/addressSync";
import { showToast } from "@/utils/toast";

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  initialData?: SavedAddress | null;
  onSave?: (data: SavedAddress) => void;
  isFirstAddress?: boolean;
  usedTags?: AddressTag[];
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  initialData,
  onSave,
  isFirstAddress = false,
  usedTags = [],
}) => {
  const [formData, setFormData] = useState<SavedAddress>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    countryCode: "",
    stateCode: "",
    tag: isFirstAddress ? "Default" : "Home",
    isDefault: isFirstAddress,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load all countries from country-state-city
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Country dropdown items (codes removed as requested)
  const countryDropdownItems: DropdownItem[] = useMemo(() => {
    return allCountries.map((c) => ({
      id: c.isoCode,
      label: `${c.flag ? c.flag + " " : ""}${c.name}`,
    }));
  }, [allCountries]);

  // States available for the currently selected country
  const statesForCountry = useMemo(() => {
    if (!formData.countryCode) return [];
    return State.getStatesOfCountry(formData.countryCode);
  }, [formData.countryCode]);

  // State dropdown items (codes removed as requested)
  const stateDropdownItems: DropdownItem[] = useMemo(() => {
    return statesForCountry.map((s) => ({
      id: s.isoCode,
      label: s.name,
    }));
  }, [statesForCountry]);

  // Cities available for the currently selected country & state
  const citiesForState = useMemo(() => {
    if (!formData.countryCode || !formData.stateCode) return [];
    return City.getCitiesOfState(formData.countryCode, formData.stateCode);
  }, [formData.countryCode, formData.stateCode]);

  const cityDropdownItems: DropdownItem[] = useMemo(() => {
    return citiesForState.map((c) => ({
      id: c.name,
      label: c.name,
    }));
  }, [citiesForState]);

  // Populate data on open
  useEffect(() => {
    if (initialData) {
      // Find matching country code if not present
      let cCode = initialData.countryCode;
      if (!cCode && initialData.country) {
        const foundC = allCountries.find(
          (c) => c.name.toLowerCase() === initialData.country.toLowerCase() || c.isoCode === initialData.country
        );
        if (foundC) cCode = foundC.isoCode;
      }

      // Find matching state code if not present
      let sCode = initialData.stateCode;
      if (cCode && !sCode && initialData.state) {
        const foundS = State.getStatesOfCountry(cCode).find(
          (s) => s.name.toLowerCase() === initialData.state.toLowerCase() || s.isoCode === initialData.state
        );
        if (foundS) sCode = foundS.isoCode;
      }

      setFormData({
        ...initialData,
        countryCode: cCode || "",
        stateCode: sCode || "",
      });
    } else {
      // New address: pick the first available unused tag
      const allTags: AddressTag[] = ["Default", "Home", "Others"];
      const defaultTagCandidate: AddressTag = isFirstAddress ? "Default" : "Home";
      const availableTag =
        !usedTags.includes(defaultTagCandidate)
          ? defaultTagCandidate
          : allTags.find((t) => !usedTags.includes(t)) || "Others";

      setFormData({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        countryCode: "",
        stateCode: "",
        tag: availableTag,
        isDefault: availableTag === "Default",
      });
    }
  }, [initialData, isOpen, isFirstAddress, allCountries, usedTags]);

  // Handle Country selection
  const handleCountrySelect = (isoCode: string) => {
    const selectedCountry = allCountries.find((c) => c.isoCode === isoCode);
    setFormData((prev) => ({
      ...prev,
      country: selectedCountry ? selectedCountry.name : isoCode,
      countryCode: isoCode,
      state: "",
      stateCode: "",
      city: "",
    }));
  };

  // Handle State selection
  const handleStateSelect = (stateIsoOrName: string) => {
    const selectedState = statesForCountry.find((s) => s.isoCode === stateIsoOrName);
    setFormData((prev) => ({
      ...prev,
      state: selectedState ? selectedState.name : stateIsoOrName,
      stateCode: selectedState ? selectedState.isoCode : "",
      city: "",
    }));
  };

  // Handle City selection
  const handleCitySelect = (cityName: string) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTagSelect = (tag: AddressTag) => {
    // If tag is already used by another address, prevent selection
    if (usedTags.includes(tag)) {
      showToast.warning(`The "${tag}" tag is already in use by another address.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tag,
      isDefault: tag === "Default",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showToast.error("Please enter first name.");
      return;
    }
    if (!formData.lastName.trim()) {
      showToast.error("Please enter last name.");
      return;
    }
    if (!formData.email.trim()) {
      showToast.error("Please enter notification email.");
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      showToast.error("Please enter contact phone.");
      return;
    }
    if (!formData.street.trim()) {
      showToast.error("Please enter street address.");
      return;
    }
    if (!formData.country.trim()) {
      showToast.error("Please select a country.");
      return;
    }
    if (!formData.state.trim()) {
      showToast.error("Please select or enter a state/province.");
      return;
    }
    if (!formData.city.trim()) {
      showToast.error("Please select or enter a city.");
      return;
    }
    if (!formData.postalCode.trim()) {
      showToast.error("Please enter postal/zip code.");
      return;
    }

    if (onSave) {
      onSave(formData);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeModal();
    }, 600);
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialData && initialData.id);

  // Tag icon components (professional SVG icons)
  const TagIcon = ({ tag }: { tag: AddressTag }) => {
    if (tag === "Default") {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    if (tag === "Home") {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    }
    // Others
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto px-3 sm:px-4 py-6 sm:py-8 bg-[#2A1E17]/65 backdrop-blur-sm transition-opacity duration-300">
      <div className="modal-content relative w-full max-w-[720px] bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/70 shadow-[0_24px_60px_rgba(42,30,23,0.28)] p-5 sm:p-8 md:p-10 text-[#3D2B1F] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={closeModal}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] border border-transparent hover:border-[#E3C9A8]/50 transition-all duration-200 z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8 pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-widest uppercase bg-[#FFFAF5] border border-[#E3C9A8]/60 text-[#C4896A] mb-2">
            <span>✦</span>
            <span>{isEditing ? "Modify Destination" : "New Atelier Destination"}</span>
          </div>
          <h3
            className="text-xl sm:text-2xl md:text-3xl font-normal text-[#2A1E17] tracking-wider"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {isEditing ? "Edit Saved Address" : "Add Delivery Address"}
          </h3>
          <p className="text-xs text-[#7A6B5D] mt-1.5">
            Precision delivery coordinates ensure insured transit and express checkout across all orders.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tag Selector (Default, Home, Others) */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
              Address Tag *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(["Default", "Home", "Others"] as AddressTag[]).map((tag) => {
                const isSelected = formData.tag === tag;
                const isUsed = usedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={isUsed}
                    onClick={() => !isUsed && handleTagSelect(tag)}
                    title={isUsed ? `The "${tag}" tag is already assigned to another address.` : undefined}
                    className={`py-2.5 px-2 sm:px-3 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                      isUsed
                        ? "bg-[#F5EFE8] text-[#A8988B] border-[#E3C9A8]/40 cursor-not-allowed opacity-50"
                        : isSelected
                        ? "bg-[#3D2B1F] text-[#E3C9A8] border-[#3D2B1F] shadow-sm"
                        : "bg-[#FFFAF5] text-[#7A6B5D] border-[#E3C9A8]/60 hover:border-[#C4896A] hover:text-[#3D2B1F]"
                    }`}
                  >
                    <TagIcon tag={tag} />
                    <span>{tag}</span>
                    {isUsed && (
                      <span className="text-[9px] font-normal lowercase tracking-normal text-[#A8988B]">
                        (in use)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#A8988B] mt-1.5">
              {formData.tag === "Default"
                ? "This address will be automatically selected for express checkout."
                : `Tagged as ${formData.tag} for quick selection during checkout.`}
            </p>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                Notification Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="patron@domain.com"
                className={inputClasses}
              />
              <p className="text-[10px] text-[#A8988B] mt-1">
                Order updates & shipping notifications will be sent here.
              </p>
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
                className={inputClasses}
              />
            </div>
          </div>

          {/* Street Address */}
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
              placeholder="Villa name, Suite, Street and House Number"
              className={inputClasses}
            />
          </div>

          {/* Country Dropdown (country-state-city library) */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
              Country / Destination *
            </label>
            <AtelierDropdown
              items={countryDropdownItems}
              selectedId={formData.countryCode}
              onSelect={handleCountrySelect}
              placeholder="Search or Select Country"
              searchable={true}
              className="w-full"
              buttonClassName="py-3 px-4 rounded-xl bg-[#FFFAF5]/70 border-[#E3C9A8]/60"
            />
          </div>

          {/* State & City Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                State / Province / Region *
              </label>
              {statesForCountry.length > 0 ? (
                <AtelierDropdown
                  items={stateDropdownItems}
                  selectedId={formData.stateCode}
                  onSelect={handleStateSelect}
                  placeholder={
                    formData.countryCode ? "Select State / Region" : "Select Country First"
                  }
                  searchable={true}
                  disabled={!formData.countryCode}
                  className="w-full"
                  buttonClassName="py-3 px-4 rounded-xl bg-[#FFFAF5]/70 border-[#E3C9A8]/60"
                />
              ) : (
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State / Province / Canton"
                  className={inputClasses}
                />
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
                City / Municipality *
              </label>
              {citiesForState.length > 0 ? (
                <AtelierDropdown
                  items={cityDropdownItems}
                  selectedId={formData.city}
                  onSelect={handleCitySelect}
                  placeholder={
                    formData.state ? "Select City" : "Select State First"
                  }
                  searchable={true}
                  disabled={!formData.stateCode}
                  className="w-full"
                  buttonClassName="py-3 px-4 rounded-xl bg-[#FFFAF5]/70 border-[#E3C9A8]/60"
                />
              ) : (
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City or Town"
                  className={inputClasses}
                />
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div className="max-w-xs">
            <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-1.5 font-medium">
              Postal / Zip Code *
            </label>
            <input
              type="text"
              name="postalCode"
              required
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal / Zip Code"
              className={inputClasses}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#E3C9A8]/30">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-[#FFFAF5] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved Destination</span>
                </>
              ) : (
                <span>{isEditing ? "Update Address" : "Save Address"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
