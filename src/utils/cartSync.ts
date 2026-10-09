import { createClient } from "@/utils/supabase/client";

export interface SyncCartItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  [key: string]: any;
}

export interface SyncWishlistItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  [key: string]: any;
}

/**
 * Synchronize local IndexedDB cart with Supabase PostgreSQL public.cart_items.
 * Merges local items with remote database items, saving any non-synced items.
 */
export async function syncCartWithDatabase(
  userId: string,
  localItems: SyncCartItem[]
): Promise<SyncCartItem[]> {
  try {
    const supabase = createClient();

    // 1. Fetch existing cart items from Supabase
    const { data: remoteCart, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("Could not fetch remote cart items:", error.message);
      return localItems;
    }

    const mergedMap = new Map<string, SyncCartItem>();

    // Put remote items in map
    (remoteCart || []).forEach((row) => {
      mergedMap.set(row.product_id, {
        id: Number(row.product_id),
        title: row.title,
        price: Number(row.price),
        discountedPrice: Number(row.price),
        quantity: row.quantity,
        imgs: row.image
          ? { thumbnails: [row.image], previews: [row.image] }
          : undefined,
      });
    });

    // Merge local items: if exists, keep higher quantity; if new, add to map and upload
    const upsertQueue: any[] = [];
    localItems.forEach((local) => {
      const pId = String(local.id);
      const remote = mergedMap.get(pId);

      if (remote) {
        // Merge with larger quantity
        const finalQty = Math.max(local.quantity, remote.quantity);
        remote.quantity = finalQty;
        if (finalQty !== remote.quantity) {
          upsertQueue.push({
            user_id: userId,
            product_id: pId,
            title: local.title,
            price: local.price,
            quantity: finalQty,
            image: local.img || local.image || null,
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        // Local item not yet in remote
        mergedMap.set(pId, local);
        upsertQueue.push({
          user_id: userId,
          product_id: pId,
          title: local.title,
          price: local.price,
          quantity: local.quantity,
          image: local.img || local.image || null,
          updated_at: new Date().toISOString(),
        });
      }
    });

    // Save newly merged items to Supabase
    if (upsertQueue.length > 0) {
      await supabase.from("cart_items").upsert(upsertQueue, {
        onConflict: "user_id,product_id",
      });
    }

    return Array.from(mergedMap.values());
  } catch (err) {
    console.error("Cart sync error:", err);
    return localItems;
  }
}

/**
 * Synchronize local IndexedDB wishlist with Supabase PostgreSQL public.wishlist_items.
 */
export async function syncWishlistWithDatabase(
  userId: string,
  localItems: SyncWishlistItem[]
): Promise<SyncWishlistItem[]> {
  try {
    const supabase = createClient();

    // 1. Fetch existing wishlist items from Supabase
    const { data: remoteWishlist, error } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("Could not fetch remote wishlist items:", error.message);
      return localItems;
    }

    const mergedMap = new Map<string, SyncWishlistItem>();

    // Add remote items
    (remoteWishlist || []).forEach((row) => {
      mergedMap.set(row.product_id, {
        id: Number(row.product_id),
        title: row.title,
        price: Number(row.price),
        discountedPrice: Number(row.price),
        quantity: 1,
        imgs: row.image
          ? { thumbnails: [row.image], previews: [row.image] }
          : undefined,
      });
    });

    // Merge local items
    const insertQueue: any[] = [];
    localItems.forEach((local) => {
      const pId = String(local.id);
      if (!mergedMap.has(pId)) {
        mergedMap.set(pId, local);
        insertQueue.push({
          user_id: userId,
          product_id: pId,
          title: local.title,
          price: local.price,
          image: local.img || local.image || null,
        });
      }
    });

    if (insertQueue.length > 0) {
      await supabase.from("wishlist_items").upsert(insertQueue, {
        onConflict: "user_id,product_id",
      });
    }

    return Array.from(mergedMap.values());
  } catch (err) {
    console.error("Wishlist sync error:", err);
    return localItems;
  }
}

/**
 * Save an individual cart item change directly to Supabase
 */
export async function persistCartItemToDatabase(
  userId: string,
  item: SyncCartItem
) {
  try {
    const supabase = createClient();
    await supabase.from("cart_items").upsert({
      user_id: userId,
      product_id: String(item.id),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.img || item.image || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,product_id",
    });
  } catch (err) {
    console.error("Failed to persist cart item to database:", err);
  }
}

/**
 * Delete a cart item from Supabase
 */
export async function removeCartItemFromDatabase(
  userId: string,
  productId: string | number
) {
  try {
    const supabase = createClient();
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", String(productId));
  } catch (err) {
    console.error("Failed to remove cart item from database:", err);
  }
}

/**
 * Save an individual wishlist item directly to Supabase
 */
export async function persistWishlistItemToDatabase(
  userId: string,
  item: SyncWishlistItem
) {
  try {
    const supabase = createClient();
    await supabase.from("wishlist_items").upsert({
      user_id: userId,
      product_id: String(item.id),
      title: item.title,
      price: item.price,
      image: item.img || item.image || null,
    }, {
      onConflict: "user_id,product_id",
    });
  } catch (err) {
    console.error("Failed to persist wishlist item to database:", err);
  }
}

/**
 * Delete a wishlist item from Supabase
 */
export async function removeWishlistItemFromDatabase(
  userId: string,
  productId: string | number
) {
  try {
    const supabase = createClient();
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", String(productId));
  } catch (err) {
    console.error("Failed to remove wishlist item from database:", err);
  }
}

