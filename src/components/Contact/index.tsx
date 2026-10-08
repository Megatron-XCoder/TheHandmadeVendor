"use client";
import React, { useState } from "react";
import Image from "next/image";
import { showToast } from "@/utils/toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "Bespoke Custom Commission",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showToast.error("Please enter your first name");
      return;
    }
    if (!formData.email.trim()) {
      showToast.error("Please enter your email address");
      return;
    }
    if (!formData.message.trim()) {
      showToast.error("Please enter your message");
      return;
    }

    setIsSubmitting(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const formattedText = `*Inquiry to The Handmade Vendor Atelier Concierge*
---------------------------------------
*Name:* ${fullName}
*Email:* ${formData.email}
*Phone:* ${formData.phone || "Not provided"}
*Subject:* ${formData.subject}

*Message:*
${formData.message}
---------------------------------------
_Sent via The Handmade Vendor Website_`;

    // WhatsApp target number
    const whatsappNumber = "390551234567";
    const encodedMessage = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    showToast.success("Opening WhatsApp with your inquiry...");

    setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section
      className="pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 min-h-screen"
      style={{ background: "#FFFAF5" }}
    >
      <div className="max-w-[1140px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        
        {/* ── Page Header / Subtitle ────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span
            className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase block mb-2.5"
            style={{ color: "#C4896A", fontFamily: "'Cinzel', serif" }}
          >
            Atelier Concierge & Private Client Services
          </span>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
          >
            We Invite Your Inquiry
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B5D] leading-relaxed">
            Whether inquiring about mastercrafted leather creations, commissioning a bespoke heirloom,
            or seeking artisan care, our concierge is dedicated to your service.
          </p>
        </div>

        {/* ── Main Two-Column Luxury Card ───────────────────────────────────── */}
        <div
          className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border flex flex-col lg:flex-row"
          style={{
            borderColor: "#E3C9A8",
            background: "#FFFFFF",
            boxShadow: "0 8px 30px rgba(61,43,31,0.06), 0 1px 3px rgba(61,43,31,0.03)",
          }}
        >
          {/* ── LEFT COLUMN: Dark Atelier Concierge Panel ───────────────────── */}
          <div
            className="lg:w-[44%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white"
            style={{
              background: "linear-gradient(155deg, #1F150E 0%, #35241A 45%, #4A3324 100%)",
            }}
          >
            {/* Subtle background ambient tone */}
            <div
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
              style={{ background: "radial-gradient(circle, #C4896A 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
              style={{ background: "radial-gradient(circle, #E3C9A8 0%, transparent 70%)" }}
            />

            {/* Top Brand & Introduction */}
            <div className="relative z-10 mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 border p-0.5 bg-white shadow-sm"
                  style={{ borderColor: "#E3C9A8" }}
                >
                  <Image
                    src="/images/logo/logo.png"
                    alt="The Handmade Vendor"
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
                  <span
                    className="text-sm sm:text-base font-semibold tracking-[0.12em] uppercase text-white whitespace-nowrap"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    The Handmade
                  </span>
                  <span
                    className="text-xs sm:text-base font-semibold tracking-[0.12em] uppercase whitespace-nowrap"
                    style={{ fontFamily: "'Cinzel', serif", color: "#C4896A" }}
                  >
                    Vendor
                  </span>
                </div>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-medium tracking-wide leading-tight mb-3 text-[#FFFAF5]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Direct Atelier Concierge
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-[#D2C5B8]">
                Connect with our artisan specialists for personalized guidance, custom commission details, or prompt order support.
              </p>
            </div>

            {/* Concierge Contact Details */}
            <div className="relative z-10 space-y-6 mb-8 sm:mb-10">
              {/* Studio Address */}
              <div className="flex items-start gap-4 group">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: "#C4896A",
                    background: "rgba(196,137,106,0.15)",
                    color: "#E3C9A8",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4
                    className="text-xs font-semibold tracking-wider uppercase text-[#E3C9A8] mb-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Atelier Showroom & Studio
                  </h4>
                  <p className="text-xs sm:text-sm text-[#E9DFD5] leading-relaxed">
                    123 Artisan Way, Suite 45<br />
                    Florence, Italy 50122
                  </p>
                  <span className="text-[11px] text-[#A8988B] tracking-wide block mt-0.5">
                    Private consultations by appointment
                  </span>
                </div>
              </div>

              {/* WhatsApp Priority Hotline */}
              <div className="flex items-start gap-4 group">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: "#C4896A",
                    background: "rgba(196,137,106,0.15)",
                    color: "#E3C9A8",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h4
                    className="text-xs font-semibold tracking-wider uppercase text-[#E3C9A8] mb-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Priority WhatsApp Line
                  </h4>
                  <a
                    href="https://wa.me/390551234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-[#FFFAF5] hover:text-[#C4896A] transition-colors"
                  >
                    +39 055 123 4567
                  </a>
                  <span className="text-[11px] text-[#A8988B] tracking-wide block mt-0.5">
                    Fastest channel for orders & bespoke inquiries
                  </span>
                </div>
              </div>

              {/* Email Desk */}
              <div className="flex items-start gap-4 group">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: "#C4896A",
                    background: "rgba(196,137,106,0.15)",
                    color: "#E3C9A8",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <h4
                    className="text-xs font-semibold tracking-wider uppercase text-[#E3C9A8] mb-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Electronic Mail
                  </h4>
                  <a
                    href="mailto:concierge@thehandmadevendor.com"
                    className="text-xs sm:text-sm text-[#FFFAF5] hover:text-[#C4896A] transition-colors"
                  >
                    concierge@thehandmadevendor.com
                  </a>
                  <span className="text-[11px] text-[#A8988B] tracking-wide block mt-0.5">
                    Inquiries acknowledged within 24 business hours
                  </span>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-4 group">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: "#C4896A",
                    background: "rgba(196,137,106,0.15)",
                    color: "#E3C9A8",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4
                    className="text-xs font-semibold tracking-wider uppercase text-[#E3C9A8] mb-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Operating Hours
                  </h4>
                  <p className="text-xs sm:text-sm text-[#E9DFD5] leading-relaxed">
                    Monday – Saturday: 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Atelier Heritage Tag */}
            <div className="relative z-10 pt-6 border-t border-[#E3C9A8]/20 flex items-center justify-between text-[11px] text-[#A8988B] tracking-wider uppercase">
              <span>Handcrafted with Pride</span>
              <span>Worldwide Heritage</span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Bespoke WhatsApp Inquiry Form ─────────────────── */}
          <div className="lg:w-[56%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            <div className="mb-8">
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase block mb-1.5"
                style={{ color: "#C4896A", fontFamily: "'Cinzel', serif" }}
              >
                Direct Messaging Service
              </span>
              <h2
                className="text-xl sm:text-2xl font-semibold tracking-[0.08em] uppercase mb-2"
                style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
              >
                Send an Artisan Inquiry
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6B5D] leading-relaxed">
                Provide your details below to instantly connect with our concierge team directly on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                  >
                    First Name <span className="text-[#C4896A]">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Alexander"
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                    style={{
                      background: "#FFFAF5",
                      borderColor: "#E3C9A8",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Sterling"
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                    style={{
                      background: "#FFFAF5",
                      borderColor: "#E3C9A8",
                    }}
                  />
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                  >
                    Email Address <span className="text-[#C4896A]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alexander@domain.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                    style={{
                      background: "#FFFAF5",
                      borderColor: "#E3C9A8",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                  >
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                    style={{
                      background: "#FFFAF5",
                      borderColor: "#E3C9A8",
                    }}
                  />
                </div>
              </div>

              {/* Inquiry Subject Dropdown */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                >
                  Nature of Inquiry
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300 appearance-none cursor-pointer"
                    style={{
                      background: "#FFFAF5",
                      borderColor: "#E3C9A8",
                    }}
                  >
                    <option value="Bespoke Custom Commission">Bespoke Custom Commission</option>
                    <option value="Product Availability & Vault Pieces">Product Availability & Vault Pieces</option>
                    <option value="Order Tracking & White-Glove Delivery">Order Tracking & White-Glove Delivery</option>
                    <option value="Artisan Leather Care & Restoration">Artisan Leather Care & Restoration</option>
                    <option value="Corporate & VIP Gifting">Corporate & VIP Gifting</option>
                    <option value="Other General Inquiry">Other General Inquiry</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6B5D]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                >
                  Your Message <span className="text-[#C4896A]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Kindly outline your bespoke specifications, product reference, or questions for our atelier..."
                  className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300 resize-none"
                  style={{
                    background: "#FFFAF5",
                    borderColor: "#E3C9A8",
                  }}
                />
              </div>

              {/* WhatsApp Send Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-3 group"
                  style={{
                    background: "#3D2B1F",
                    fontFamily: "'Cinzel', serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#C4896A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                  }}
                >
                  {/* Classy WhatsApp SVG Icon in Brand Tone */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#E3C9A8] group-hover:text-white transition-colors flex-shrink-0"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{isSubmitting ? "Opening WhatsApp..." : "Send Message on WhatsApp"}</span>
                </button>
              </div>

              {/* Privacy / Security Notice */}
              <p className="text-center text-[11px] text-[#A09082] tracking-wide pt-1">
                🔒 Your privacy is strictly guarded. We never share your personal information.
              </p>
            </form>
          </div>
        </div>

        {/* ── Concierge Pillars / Service Guarantees ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 sm:mt-16">
          <div
            className="p-6 rounded-2xl border bg-white flex items-start gap-4 transition-all duration-300 hover:shadow-md"
            style={{ borderColor: "#E3C9A8" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#C4896A]"
              style={{ background: "#FEF5EC" }}
            >
              <span className="text-lg">✦</span>
            </div>
            <div>
              <h3
                className="text-sm font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bespoke Commissions
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Personalized sizing, monogram embossing, and customized hardware finishes on made-to-order acquisitions.
              </p>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border bg-white flex items-start gap-4 transition-all duration-300 hover:shadow-md"
            style={{ borderColor: "#E3C9A8" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#C4896A]"
              style={{ background: "#FEF5EC" }}
            >
              <span className="text-lg">✦</span>
            </div>
            <div>
              <h3
                className="text-sm font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Private Consultations
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Connect virtually or arrange a private viewing at our Florence studio to examine curated collections.
              </p>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border bg-white flex items-start gap-4 transition-all duration-300 hover:shadow-md"
            style={{ borderColor: "#E3C9A8" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#C4896A]"
              style={{ background: "#FEF5EC" }}
            >
              <span className="text-lg">✦</span>
            </div>
            <div>
              <h3
                className="text-sm font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Heritage Restoration
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Complimentary conditioning advice and artisan refurbishment services for all lifetime leatherworks.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
