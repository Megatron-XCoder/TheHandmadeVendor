"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { removeStoredItem } from "@/utils/indexedDB";
import { showToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const subtotal = useAppSelector(selectTotalPrice);
  const shippingFee = subtotal > 200 || subtotal === 0 ? 0 : 25;
  const totalAmount = subtotal + shippingFee;

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast.error("Your cart is empty. Please add items to checkout.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Esteemed Client",
          items: cartItems.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.discountedPrice || item.price,
            quantity: item.quantity,
            image: item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || null,
          })),
          subtotal,
          totalAmount,
          atelierNotes: notes,
          shippingAddress: {
            method: "Artisan Courier Express",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      // Clear local cart
      dispatch(removeAllItemsFromCart());
      await removeStoredItem("cart");

      showToast.success(`Bespoke Order #${data.order.order_number} confirmed!`);

      // Redirect to account orders tab
      router.push("/my-account");
    } catch (err: any) {
      showToast.error(err.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-[#FFFAF5]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handlePlaceOrder}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white border border-[#E3C9A8]/40 shadow-sm rounded-2xl p-4 sm:p-8 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-2">
                      Bespoke Atelier Instructions (optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions for our master artisans (e.g., custom monogram initials, gift presentation, delivery instructions)..."
                      className="rounded-xl border border-[#E3C9A8] bg-[#FFFAF5] placeholder:text-[#A09082] text-[#3D2B1F] w-full p-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#C4896A]/20 transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white border border-[#E3C9A8] shadow-md rounded-2xl overflow-hidden">
                  <div className="border-b border-[#E3C9A8]/40 py-5 px-6 bg-[#FFFAF5]">
                    <h3
                      className="font-semibold text-lg uppercase tracking-wider text-[#3D2B1F]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Your Bespoke Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8 px-6">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-4 border-b border-[#E3C9A8]/30 text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]">
                      <div>Product</div>
                      <div className="text-right">Subtotal</div>
                    </div>

                    {/* <!-- product items --> */}
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-4 border-b border-[#E3C9A8]/20 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3 pr-2">
                            {item.imgs?.thumbnails?.[0] && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#E3C9A8] flex-shrink-0">
                                <Image
                                  src={item.imgs.thumbnails[0]}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#3D2B1F] leading-snug">{item.title}</p>
                              <span className="text-[11px] text-[#A09082]">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-[#3D2B1F] text-right whitespace-nowrap">
                              ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[#7A6B5D]">
                        No creations in your cart yet.
                      </div>
                    )}

                    {/* Shipping Fee */}
                    <div className="flex items-center justify-between py-3 border-b border-[#E3C9A8]/20 text-xs sm:text-sm">
                      <div className="text-[#7A6B5D]">
                        Artisan White-Glove Shipping
                      </div>
                      <div className="text-right font-medium text-[#3D2B1F]">
                        {shippingFee === 0 ? "Complimentary" : `$${shippingFee.toFixed(2)}`}
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-semibold text-base text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
                          Total Acquisition
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-[#C4896A] text-right">
                          ${totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-7.5 disabled:opacity-50"
                  style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#C4896A";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming Bespoke Order...</span>
                    </>
                  ) : (
                    <span>Confirm & Place Order</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
