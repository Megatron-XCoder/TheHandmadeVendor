"use client";
import { useState, useEffect } from "react";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";

import { ModalProvider } from "./context/QuickViewModalContext";
import { CartModalProvider } from "./context/CartSidebarModalContext";
import { WishlistModalProvider } from "./context/WishlistSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import WishlistSidebarModal from "@/components/Common/WishlistSidebarModal";
import { PreviewSliderProvider } from "./context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReduxProvider>
              <CartModalProvider>
                <WishlistModalProvider>
                  <ModalProvider>
                    <PreviewSliderProvider>
                      {children}

                      <QuickViewModal />
                      <CartSidebarModal />
                      <WishlistSidebarModal />
                      <PreviewSliderModal />

                      <Toaster
                        position="top-right"
                        containerStyle={{
                          top: 80,
                          right: 16,
                          zIndex: 9999999,
                        }}
                        toastOptions={{
                          duration: 3000,
                        }}
                      />
                    </PreviewSliderProvider>
                  </ModalProvider>
                </WishlistModalProvider>
              </CartModalProvider>
            </ReduxProvider>
            <ScrollToTop />
          </>
        )}
      </body>
    </html>
  );
}
