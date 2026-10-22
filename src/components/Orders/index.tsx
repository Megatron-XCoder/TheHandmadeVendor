"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AtelierTable from "../Common/AtelierTable";
import AtelierDropdown, { DropdownItem } from "../Common/AtelierDropdown";
import { ColumnDef } from "@tanstack/react-table";
import OrderTrackingModal, { Order, statusColorMap } from "./OrderTrackingModal";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mobile-only sort state
  const [mobileSortBy, setMobileSortBy] = useState<string>("date-desc");

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

  // Mobile sort options
  const mobileSortOptions: DropdownItem[] = [
    { id: "date-desc", label: "Date: Newest First" },
    { id: "date-asc", label: "Date: Oldest First" },
    { id: "ref-asc", label: "Order Ref: Low to High" },
    { id: "ref-desc", label: "Order Ref: High to Low" },
    { id: "total-desc", label: "Total: High to Low" },
    { id: "total-asc", label: "Total: Low to High" },
    { id: "status", label: "Atelier Status" },
  ];

  // Sorted orders strictly for mobile view
  const sortedMobileOrders = useMemo(() => {
    const list = [...orders];
    switch (mobileSortBy) {
      case "date-desc":
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "date-asc":
        return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "ref-asc":
        return list.sort((a, b) => a.order_number.localeCompare(b.order_number, undefined, { numeric: true }));
      case "ref-desc":
        return list.sort((a, b) => b.order_number.localeCompare(a.order_number, undefined, { numeric: true }));
      case "total-desc":
        return list.sort((a, b) => Number(b.total_amount) - Number(a.total_amount));
      case "total-asc":
        return list.sort((a, b) => Number(a.total_amount) - Number(b.total_amount));
      case "status":
        return list.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return list;
    }
  }, [orders, mobileSortBy]);

  // Desktop Table Columns (Clean alignment, no line wrapping, luxury styling)
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_number",
      header: "Order Ref",
      meta: { className: "w-[150px] whitespace-nowrap", align: "left" },
      cell: ({ row }) => (
        <span
          className="font-semibold text-xs tracking-wider text-[#C4896A] whitespace-nowrap"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          #{row.original.order_number}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      meta: { className: "w-[140px] whitespace-nowrap", align: "left" },
      cell: ({ row }) => (
        <span className="text-xs text-[#7A6B5D] font-medium whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Atelier Status",
      meta: { className: "w-[170px] whitespace-nowrap", align: "center" },
      cell: ({ row }) => {
        const badgeStyle = statusColorMap[row.original.status] || statusColorMap.Processing;
        return (
          <div className="flex justify-center">
            <span
              className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border shadow-2xs whitespace-nowrap"
              style={{
                background: badgeStyle.bg,
                color: badgeStyle.text,
                borderColor: badgeStyle.border,
              }}
            >
              {row.original.status}
            </span>
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      meta: { className: "min-w-[220px]", align: "left" },
      cell: ({ row }) => {
        const items = row.original.order_items || [];
        const firstItem = items[0];
        const extraCount = items.length - 1;
        return (
          <div className="flex items-center gap-3">
            {firstItem?.image ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E3C9A8]/70 relative flex-shrink-0 bg-[#FFFAF5] shadow-2xs">
                <Image src={firstItem.image} alt={firstItem.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#FEF5EC] border border-[#E3C9A8]/70 flex items-center justify-center text-[#C4896A] text-xs flex-shrink-0 font-serif">
                ✦
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#2A1E17] truncate max-w-[230px]">
                {firstItem ? firstItem.title : "Custom Masterpiece"}
              </p>
              {extraCount > 0 ? (
                <span className="text-[10px] text-[#C4896A] font-semibold tracking-wide">
                  +{extraCount} more {extraCount === 1 ? "piece" : "pieces"}
                </span>
              ) : (
                <span className="text-[10px] text-[#7A6B5D]">1 piece</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      meta: { className: "w-[130px] whitespace-nowrap", align: "right" },
      cell: ({ row }) => (
        <span
          className="font-bold text-sm text-[#2A1E17] whitespace-nowrap"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          ${Number(row.original.total_amount).toFixed(2)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Delivery Details",
      meta: { className: "w-[160px] whitespace-nowrap", align: "right" },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedOrder(row.original)}
            className="py-1.5 px-4 rounded-full text-[11px] font-semibold tracking-wider uppercase border border-[#C4896A] text-[#C4896A] hover:bg-[#3D2B1F] hover:text-[#E3C9A8] hover:border-[#3D2B1F] transition-all duration-300 whitespace-nowrap shadow-xs"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Track Atelier
          </button>
        </div>
      ),
    },
  ];

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
            href="/shop"
            className="inline-flex py-3 px-8 rounded-full text-xs font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl"
            style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* MOBILE VIEW ONLY: Zero Horizontal Scroll & Front-Facing Cards */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="block md:hidden space-y-4">
            {/* Mobile Heading Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/60 shadow-[0_2px_12px_rgba(61,43,31,0.03)]">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-[#3D2B1F]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {orders.length} {orders.length === 1 ? "Acquisition" : "Acquisitions"}
                </span>
              </div>

              <div className="w-full sm:w-56">
                <AtelierDropdown
                  items={mobileSortOptions}
                  selectedId={mobileSortBy}
                  onSelect={(id) => setMobileSortBy(id)}
                  placeholder="Sort By"
                  className="w-full"
                  buttonClassName="py-2 px-3 text-xs bg-white rounded-xl border-[#E3C9A8]"
                />
              </div>
            </div>

            {/* Mobile Order Cards (All details front-facing) */}
            <div className="space-y-3.5">
              {sortedMobileOrders.map((order) => {
                const badgeStyle = statusColorMap[order.status] || statusColorMap.Processing;
                const items = order.order_items || [];
                const firstItem = items[0];
                const totalPieces = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

                return (
                  <div
                    key={order.id || order.order_number}
                    className="bg-white rounded-2xl border border-[#E3C9A8]/70 p-4.5 shadow-[0_4px_16px_rgba(61,43,31,0.04)] space-y-3.5 hover:border-[#C4896A] transition-all duration-200"
                  >
                    {/* Header Row: Order Reference & Status Pill */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E3C9A8]/30">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] text-[#C4896A]">✦</span>
                        <span
                          className="text-sm font-bold tracking-wider text-[#3D2B1F] truncate"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          #{order.order_number}
                        </span>
                      </div>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border shadow-2xs flex-shrink-0"
                        style={{
                          background: badgeStyle.bg,
                          color: badgeStyle.text,
                          borderColor: badgeStyle.border,
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Meta Row: Date & Total Amount */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#7A6B5D]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#A09082]">Acquisition:</span>
                        <span
                          className="text-sm font-bold text-[#2A1E17]"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Creations Preview Box */}
                    <div className="p-3 rounded-xl bg-[#FFFAF5] border border-[#E3C9A8]/50 flex items-center gap-3">
                      {firstItem?.image ? (
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#E3C9A8] relative flex-shrink-0 bg-white shadow-2xs">
                          <Image src={firstItem.image} alt={firstItem.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-[#FEF5EC] border border-[#E3C9A8] flex items-center justify-center text-[#C4896A] text-sm flex-shrink-0 font-serif">
                          ✦
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#2A1E17] truncate">
                          {firstItem ? firstItem.title : "Custom Masterpiece Creation"}
                        </p>
                        <p className="text-[11px] text-[#7A6B5D] mt-0.5">
                          {items.length > 1
                            ? `${items.length} items (${totalPieces} pieces)`
                            : items.length === 1
                            ? `1 creation (${firstItem.quantity || 1} piece)`
                            : "Bespoke acquisition"}
                        </p>
                      </div>
                    </div>

                    {/* Estimated Delivery (if provided) */}
                    {order.estimated_delivery && (
                      <div className="text-[11px] text-[#7A6B5D] px-1 flex items-center gap-1.5">
                        <span className="text-[#C4896A]">✦</span>
                        <span>
                          Est. Delivery:{" "}
                          <strong className="text-[#3D2B1F] font-semibold">
                            {new Date(order.estimated_delivery).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* Action Button: Directly opens OrderTrackingModal */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-2.5 px-4 rounded-full text-xs font-semibold tracking-widest uppercase border border-[#C4896A] text-[#C4896A] hover:bg-[#3D2B1F] hover:text-[#E3C9A8] hover:border-[#3D2B1F] bg-[#FFFFFF] transition-all duration-300 shadow-xs flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      <span>Track Atelier</span>
                      <span className="text-[10px]">✦</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* DESKTOP VIEW ONLY: Enhanced, Luxury, Aligned Atelier Table    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="hidden md:block">
            <AtelierTable data={orders} columns={columns} pageSize={6} />
          </div>
        </div>
      )}

      {/* ── BESPOKE DELIVERY TIMELINE MODAL ─────────────────────────────────── */}
      <OrderTrackingModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
