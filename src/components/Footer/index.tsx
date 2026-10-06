import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-white">
      {/* Decorative Top Border */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #E3C9A8 0%, #C4896A 50%, #E3C9A8 100%)" }}></div>

      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8 pt-12 md:pt-20 pb-12 md:pb-16">
          
          {/* Column 1: Brand Story */}
          <div className="flex flex-col items-start lg:pr-8 col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-8">
              <div className="flex flex-col" style={{ lineHeight: 1.15 }}>
                <span className="font-semibold text-xl tracking-[0.05em]" style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}>
                  The Handmade
                </span>
                <span className="font-semibold text-xl tracking-[0.05em]" style={{ fontFamily: "'Cinzel', serif", color: "#C4896A" }}>
                  Vendor
                </span>
              </div>
            </Link>
            <p className="text-sm leading-loose mb-8" style={{ color: "#7A6B5D" }}>
              Crafting timeless leather goods for the modern connoisseur. Every piece tells a story of heritage, precision, and unyielding dedication to artisan mastery.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-[#C4896A] hover:border-[#C4896A] hover:text-white" style={{ color: "#3D2B1F" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-[#C4896A] hover:border-[#C4896A] hover:text-white" style={{ color: "#3D2B1F" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Pinterest" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-[#C4896A] hover:border-[#C4896A] hover:text-white" style={{ color: "#3D2B1F" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-8" style={{ color: "#3D2B1F" }}>Collections</h3>
            <ul className="flex flex-col gap-4 text-sm" style={{ color: "#7A6B5D" }}>
              <li><Link href="/shop-with-sidebar" className="transition-colors hover:text-[#C4896A]">Signature Totes</Link></li>
              <li><Link href="/shop-with-sidebar" className="transition-colors hover:text-[#C4896A]">Evening Clutches</Link></li>
              <li><Link href="/shop-with-sidebar" className="transition-colors hover:text-[#C4896A]">Classic Wallets</Link></li>
              <li><Link href="/shop-with-sidebar" className="transition-colors hover:text-[#C4896A]">Travel Essentials</Link></li>
              <li><Link href="/shop-with-sidebar" className="transition-colors hover:text-[#C4896A]">Leather Accessories</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-8" style={{ color: "#3D2B1F" }}>Customer Care</h3>
            <ul className="flex flex-col gap-4 text-sm" style={{ color: "#7A6B5D" }}>
              <li><Link href="/contact" className="transition-colors hover:text-[#C4896A]">Contact Us</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#C4896A]">Shipping & Returns</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#C4896A]">Leather Care Guide</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#C4896A]">Warranty Information</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#C4896A]">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-8" style={{ color: "#3D2B1F" }}>Visit Us</h3>
            <ul className="flex flex-col gap-6 text-sm" style={{ color: "#7A6B5D" }}>
              <li className="flex items-start gap-3">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <address className="not-italic leading-relaxed">
                  The Handmade Vendor Studio<br />
                  123 Artisan Way, Suite 45<br />
                  Florence, Italy 50122
                </address>
              </li>
              <li className="flex items-center gap-3">
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <a href="mailto:hello@thehandmadevendor.com" className="transition-colors hover:text-[#C4896A]">hello@thehandmadevendor.com</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <a href="tel:+390551234567" className="transition-colors hover:text-[#C4896A]">+39 055 123 4567</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#C4896A] py-6">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium" style={{ color: "#A89F95" }}>
          <p>&copy; {year} The Handmade Vendor. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-[#3D2B1F]">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-[#3D2B1F]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
