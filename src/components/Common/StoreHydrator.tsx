"use client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setCartItems } from "@/redux/features/cart-slice";
import { setWishlistItems } from "@/redux/features/wishlist-slice";
import { getStoredItem, setStoredItem } from "@/utils/indexedDB";
import { createClient } from "@/utils/supabase/client";
import {
  syncCartWithDatabase,
  syncWishlistWithDatabase,
  persistCartItemToDatabase,
  removeCartItemFromDatabase,
} from "@/utils/cartSync";

export default function StoreHydrator() {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isCartHydrated = useRef(false);
  const isWishlistHydrated = useRef(false);
  const previousCartIds = useRef<Set<string>>(new Set());

  // 1. Initial load from local IndexedDB on page load/refresh
  useEffect(() => {
    getStoredItem<any[]>("cart").then((savedCart) => {
      if (savedCart && Array.isArray(savedCart) && savedCart.length > 0) {
        dispatch(setCartItems(savedCart));
        previousCartIds.current = new Set(savedCart.map((i) => String(i.id)));
      }
      isCartHydrated.current = true;
    });

    getStoredItem<any[]>("wishlist").then((savedWishlist) => {
      if (savedWishlist && Array.isArray(savedWishlist) && savedWishlist.length > 0) {
        dispatch(setWishlistItems(savedWishlist));
      }
      isWishlistHydrated.current = true;
    });
  }, [dispatch]);

  // 2. Supabase Auth State listener & cross-device Cloud Sync
  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setCurrentUserId(data.user.id);
          performCloudSync(data.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setCurrentUserId(session.user.id);
            // Run cloud sync when user signs in or session is restored
            performCloudSync(session.user.id);
          } else {
            setCurrentUserId(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (e) {
      // Supabase unconfigured or error
    }
  }, []);

  const performCloudSync = async (userId: string) => {
    try {
      const currentCart = await getStoredItem<any[]>("cart") || [];
      const currentWishlist = await getStoredItem<any[]>("wishlist") || [];

      // Two-way merge with Supabase database
      const mergedCart = await syncCartWithDatabase(userId, currentCart);
      const mergedWishlist = await syncWishlistWithDatabase(userId, currentWishlist);

      // Update Redux state and local IndexedDB with merged items
      dispatch(setCartItems(mergedCart));
      dispatch(setWishlistItems(mergedWishlist));
      await setStoredItem("cart", mergedCart);
      await setStoredItem("wishlist", mergedWishlist);

      previousCartIds.current = new Set(mergedCart.map((i) => String(i.id)));
    } catch (err) {
      console.warn("Cloud sync warning:", err);
    }
  };

  // 3. Persist local cart changes to IndexedDB and Supabase
  useEffect(() => {
    if (!isCartHydrated.current) return;

    // Persist to local IndexedDB
    setStoredItem("cart", cartItems);

    // If authenticated, persist to Supabase
    if (currentUserId) {
      const currentIds = new Set(cartItems.map((i) => String(i.id)));

      // Detect removed items
      previousCartIds.current.forEach((oldId) => {
        if (!currentIds.has(oldId)) {
          removeCartItemFromDatabase(currentUserId, oldId);
        }
      });

      // Update or insert current items
      cartItems.forEach((item) => {
        persistCartItemToDatabase(currentUserId, item);
      });

      previousCartIds.current = currentIds;
    }
  }, [cartItems, currentUserId]);

  // 4. Persist local wishlist changes to IndexedDB
  useEffect(() => {
    if (!isWishlistHydrated.current) return;
    setStoredItem("wishlist", wishlistItems);
  }, [wishlistItems]);

  return null;
}
