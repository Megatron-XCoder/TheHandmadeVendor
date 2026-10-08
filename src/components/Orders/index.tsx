"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: "Processing" | "Artisan Crafting" | "Quality Inspection" | "Dispatched" | "Delivered" | "Cancelled";
  total_amount: number;
  subtotal: number;
  customer_name: string;
  customer_email: string;
  tracking_number?: string;
  estimated_delivery?: string;
  atelier_notes?: string;
  order_items?: OrderItem[];
}

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  Processing: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  "Artisan Crafting": { bg: "#FEF5EC", text: "#C4896A", border: "#E3C9A8" },
  "Quality Inspection": { bg: "#FDF4FF", text: "#86198F", border: "#F5D0FE" },
  Dispatched: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Delivered: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  Cancelled: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
};

const stages = [
  { key: "Processing", title: "Order Confirmed", desc: "Order authenticated by atelier concierge" },
  { key: "Artisan Crafting", title: "Artisan Crafting", desc: "Handcrafted with precision in Florence" },
  { key: "Quality Inspection", title: "Quality Inspection", desc: "Leather validation and hallmark verification" },
  { key: "Dispatched", title: "White-Glove Dispatch", desc: "Express insured courier transit" },
  { key: "Delivered", title: "Delivered", desc: "Received at private destination" },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#C4896A]/30 border-t-[#C4896A] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase text-[#7A6B5D]" style={{ fontFamily: "'Cinzel', serif" }}>
          Accessing Private Atelier Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {orders.length === 0 ? (
        <div className="py-16 px-6 text-center bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/40">
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border mb-4 text-[#C4896A]"
            style={{ background: "#FEF5EC", borderColor: "#E3C9A8" }}
          >
            <span className="text-xl">✦</span>
          </div>
          <h3
            className="text-lg font-semibold tracking-wider text-[#3D2B1F] uppercase mb-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            No Active Bespoke Orders
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-md mx-auto mb-6 leading-relaxed">
            Your private order archive is currently empty. Explore our signature leather collections and jewelry to place your first bespoke acquisition.
          </p>
          <Link
            href="/shop-with-sidebar"
            className="inline-flex py-3 px-8 rounded-full text-xs font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl"
            style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#E3C9A8]/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFAF5] border-b border-[#E3C9A8]/60 text-[11px] uppercase tracking-wider text-[#7A6B5D]">
                  <th className="py-4 px-6 font-semibold">Order Ref</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Atelier Status</th>
                  <th className="py-4 px-6 font-semibold">Items</th>
                  <th className="py-4 px-6 font-semibold">Total</th>
                  <th className="py-4 px-6 font-semibold text-right">Delivery Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3C9A8]/30 bg-white text-xs sm:text-sm text-[#3D2B1F]">
                {orders.map((order) => {
                  const badgeStyle = statusColorMap[order.status] || statusColorMap.Processing;
                  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-[#FFFAF5]/40 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#C4896A]">
                        #{order.order_number}
                      </td>
                      <td className="py-4 px-6 text-[#7A6B5D]">{formattedDate}</td>
                      <td className="py-4 px-6">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border"
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            borderColor: badgeStyle.border,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#7A6B5D]">
                        {order.order_items && order.order_items.length > 0
                          ? `${order.order_items[0].title} ${
                              order.order_items.length > 1
                                ? `(+${order.order_items.length - 1} more)`
                                : ""
                            }`
                          : "1 Creation"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#3D2B1F]">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="py-1.5 px-4 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#C4896A] text-[#C4896A] hover:bg-[#C4896A] hover:text-white transition-all duration-300"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          Track Atelier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BESPOKE DELIVERY TIMELINE MODAL ─────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl border border-[#E3C9A8] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{ background: "#FFFFFF" }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#E3C9A8] flex items-center justify-center text-[#7A6B5D] hover:text-[#C4896A] hover:border-[#C4896A] transition-colors"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6 border-b border-[#E3C9A8]/40 pb-5">
              <span
                className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4896A] block mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bespoke Atelier Order Tracking
              </span>
              <h2
                className="text-xl sm:text-2xl font-semibold text-[#3D2B1F]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Order #{selectedOrder.order_number}
              </h2>
              {selectedOrder.estimated_delivery && (
                <p className="text-xs text-[#7A6B5D] mt-1">
                  Estimated Delivery:{" "}
                  <strong className="text-[#3D2B1F]">
                    {new Date(selectedOrder.estimated_delivery).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </p>
              )}
            </div>

            {/* Atelier Crafting Timeline Progress */}
            <div className="mb-8 p-6 rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/60">
              <h4
                className="text-xs font-semibold tracking-wider uppercase text-[#3D2B1F] mb-6"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Atelier Creation Progress
              </h4>
              <div className="relative">
                {stages.map((stage, idx) => {
                  const currentIdx = getStageIndex(selectedOrder.status);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={stage.key} className="flex items-start gap-4 mb-6 last:mb-0 relative">
                      {idx !== stages.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-7 w-0.5 h-10 ${
                            isCompleted ? "bg-[#C4896A]" : "bg-[#E3C9A8]/40"
                          }`}
                        />
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-colors ${
                          isCompleted
                            ? "bg-[#C4896A] text-white"
                            : isCurrent
                            ? "bg-[#3D2B1F] text-white ring-4 ring-[#E3C9A8]"
                            : "bg-white border border-[#E3C9A8] text-[#A09082]"
                        }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <div>
                        <h5
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isCurrent ? "text-[#C4896A]" : "text-[#3D2B1F]"
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

            {/* Ordered Creations List */}
            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div className="mb-6">
                <h4
                  className="text-xs font-semibold tracking-wider uppercase text-[#3D2B1F] mb-3"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Commissioned Creations
                </h4>
                <div className="divide-y divide-[#E3C9A8]/30 border border-[#E3C9A8]/40 rounded-xl overflow-hidden">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E3C9A8] relative flex-shrink-0">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#3D2B1F]">{item.title}</p>
                          <span className="text-[11px] text-[#7A6B5D]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <p className="font-semibold text-[#3D2B1F]">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Concierge Help */}
            <div className="pt-4 border-t border-[#E3C9A8]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-[#7A6B5D]">
                Concierge Assistance:{" "}
                <a href="mailto:concierge@thehandmadevendor.com" className="text-[#C4896A] hover:underline font-medium">
                  concierge@thehandmadevendor.com
                </a>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#3D2B1F]">
                  Total: ${Number(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
