"use client";
import React, { useEffect } from "react";
import Image from "next/image";

export interface OrderItem {
  id: string;
  product_id?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status:
    | "Processing"
    | "Artisan Crafting"
    | "Quality Inspection"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | string;
  total_amount: number;
  subtotal?: number;
  customer_name?: string;
  customer_email?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  atelier_notes?: string;
  order_items?: OrderItem[];
}

export const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  Processing: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  "Artisan Crafting": { bg: "#FEF5EC", text: "#C4896A", border: "#E3C9A8" },
  "Quality Inspection": { bg: "#FDF4FF", text: "#86198F", border: "#F5D0FE" },
  Dispatched: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Delivered: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  Cancelled: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
};

export const stages = [
  { key: "Processing", title: "Order Confirmed", desc: "Order authenticated by atelier concierge" },
  { key: "Artisan Crafting", title: "Artisan Crafting", desc: "Handcrafted with precision in Florence" },
  { key: "Quality Inspection", title: "Quality Inspection", desc: "Leather validation and hallmark verification" },
  { key: "Dispatched", title: "White-Glove Dispatch", desc: "Express insured courier transit" },
  { key: "Delivered", title: "Delivered", desc: "Received at private destination" },
];

export const getStageIndex = (status: string) => {
  const idx = stages.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderTrackingModal({ order, onClose }: OrderTrackingModalProps) {
  // Close modal on Escape key & lock body scroll while modal is active
  useEffect(() => {
    if (!order) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [order, onClose]);

  if (!order) return null;

  const currentBadge = statusColorMap[order.status] || statusColorMap.Processing;
  const currentStageIdx = getStageIndex(order.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-4xl bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#E3C9A8] shadow-[0_20px_50px_rgba(61,43,31,0.2)] flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Fixed at Top with accessible close button */}
        <div className="flex-shrink-0 px-5 py-4 sm:px-7 sm:py-5 border-b border-[#E3C9A8]/40 bg-[#FFFFFF] flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4896A]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bespoke Atelier Order Tracking
              </span>
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border"
                style={{
                  background: currentBadge.bg,
                  color: currentBadge.text,
                  borderColor: currentBadge.border,
                }}
              >
                {order.status}
              </span>
            </div>
            <h2
              id="tracking-modal-title"
              className="text-lg sm:text-2xl font-semibold text-[#3D2B1F] tracking-wide"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Order #{order.order_number}
            </h2>
            {order.estimated_delivery && (
              <p className="text-xs text-[#7A6B5D] mt-0.5">
                Estimated Delivery:{" "}
                <strong className="text-[#3D2B1F] font-semibold">
                  {new Date(order.estimated_delivery).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </p>
            )}
          </div>

          {/* Close Button: Always Visible & Pinned to Top Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking popup"
            className="w-9 h-9 rounded-full border border-[#E3C9A8] flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] hover:border-[#C4896A] transition-colors flex-shrink-0 shadow-xs"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Scrollable Body: Responsive 2 Columns on Desktop, Clean Stack on Mobile */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-7">
          {/* Left Column: Atelier Creation Progress (6 cols on md) */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/60 flex-1">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E3C9A8]/30">
                <h4
                  className="text-xs font-semibold tracking-wider uppercase text-[#3D2B1F]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Atelier Creation Progress
                </h4>
                <span className="text-[10px] text-[#C4896A] font-medium tracking-wider uppercase">
                  Stage {currentStageIdx + 1} of 5
                </span>
              </div>

              <div className="relative pl-1">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stage.key} className="flex items-start gap-3.5 mb-5 last:mb-0 relative">
                      {idx !== stages.length - 1 && (
                        <div
                          className={`absolute left-3 top-6 w-0.5 h-8 transition-colors ${
                            isCompleted ? "bg-[#C4896A]" : "bg-[#E3C9A8]/40"
                          }`}
                        />
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 z-10 transition-all ${
                          isCompleted
                            ? "bg-[#C4896A] text-white shadow-xs"
                            : isCurrent
                            ? "bg-[#3D2B1F] text-white ring-3 ring-[#E3C9A8]"
                            : "bg-white border border-[#E3C9A8] text-[#A09082]"
                        }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isCurrent
                              ? "text-[#C4896A]"
                              : isCompleted
                              ? "text-[#3D2B1F]"
                              : "text-[#7A6B5D]"
                          }`}
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {stage.title}
                        </h5>
                        <p className="text-[11px] text-[#7A6B5D] leading-relaxed mt-0.5">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Commissioned Creations & Summary (6 cols on md) */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            {/* Ordered Creations List */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4
                  className="text-xs font-semibold tracking-wider uppercase text-[#3D2B1F]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Commissioned Creations
                </h4>
                {order.order_items && order.order_items.length > 0 && (
                  <span className="text-[10px] text-[#7A6B5D]">
                    {order.order_items.length}{" "}
                    {order.order_items.length === 1 ? "Piece" : "Pieces"}
                  </span>
                )}
              </div>

              {order.order_items && order.order_items.length > 0 ? (
                <div className="divide-y divide-[#E3C9A8]/30 border border-[#E3C9A8]/40 rounded-xl overflow-hidden bg-white max-h-56 sm:max-h-64 overflow-y-auto">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between text-xs sm:text-sm hover:bg-[#FFFAF5]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {item.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E3C9A8] relative flex-shrink-0 bg-[#FFFAF5]">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#3D2B1F] truncate">{item.title}</p>
                          <span className="text-[11px] text-[#7A6B5D]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <p className="font-semibold text-[#3D2B1F] flex-shrink-0">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FFFAF5] border border-[#E3C9A8]/40 text-xs text-[#7A6B5D] text-center">
                  Custom Masterpiece Order
                </div>
              )}
            </div>

            {/* Dispatch & Transit Note */}
            <div className="p-4 rounded-xl bg-[#FEF5EC]/70 border border-[#E3C9A8]/50 text-xs text-[#7A6B5D] flex items-center gap-3">
              <span className="text-base text-[#C4896A]">✦</span>
              <div className="min-w-0">
                <p className="font-medium text-[#3D2B1F]">Insured Artisan Transit</p>
                <p className="text-[11px] text-[#7A6B5D] mt-0.5">
                  Handcrafted in Florence, dispatched with temperature-controlled courier packaging.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Fixed at Bottom with Totals & Concierge Help */}
        <div className="flex-shrink-0 px-5 py-3.5 sm:px-7 sm:py-4 border-t border-[#E3C9A8]/40 bg-[#FFFAF5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#7A6B5D] text-center sm:text-left">
            <span>Concierge Inquiries: </span>
            <a
              href="mailto:concierge@thehandmadevendor.com"
              className="text-[#C4896A] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>concierge@thehandmadevendor.com</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#7A6B5D]">Total Acquisition:</span>
            <span
              className="text-base sm:text-lg font-bold text-[#3D2B1F]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
