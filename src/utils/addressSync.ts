import { createClient } from "@/utils/supabase/client";

export type AddressTag = "Default" | "Home" | "Others";

export interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode?: string;
  stateCode?: string;
  tag: AddressTag;
  isDefault?: boolean;
}

export const MAX_SAVED_ADDRESSES = 3;

const LOCAL_STORAGE_KEY = "thv_patron_addresses";

/**
 * Sanitize address list:
 * - Guarantees at most 1 Default address (the first default found, or first address if none)
 * - Guarantees each address has a UNIQUE tag among ["Default", "Home", "Others"]
 * - Keeps isDefault strictly equal to (tag === "Default")
 */
export function sanitizeAddressTags(addresses: SavedAddress[]): {
  sanitized: SavedAddress[];
  changed: boolean;
} {
  if (!addresses || addresses.length === 0) {
    return { sanitized: [], changed: false };
  }

  let changed = false;
  const allTags: AddressTag[] = ["Default", "Home", "Others"];

  // 1. Identify which address should be the single Default
  let defaultIdx = addresses.findIndex((a) => a.tag === "Default");
  if (defaultIdx === -1) {
    defaultIdx = addresses.findIndex((a) => !!a.isDefault);
  }
  if (defaultIdx === -1) {
    defaultIdx = 0; // First address defaults to Default
  }

  const result: SavedAddress[] = [];
  const usedTags = new Set<AddressTag>();

  // Process the designated default address first
  const defaultItem = addresses[defaultIdx];
  const isActuallyDefault = defaultItem.tag === "Default" && defaultItem.isDefault === true;
  if (!isActuallyDefault) {
    changed = true;
  }
  const sanitizedDefault: SavedAddress = {
    ...defaultItem,
    tag: "Default",
    isDefault: true,
  };
  usedTags.add("Default");

  // Process all other addresses and assign unique non-default tags
  for (let i = 0; i < addresses.length; i++) {
    if (i === defaultIdx) {
      result.push(sanitizedDefault);
      continue;
    }

    const item = addresses[i];
    let tag = item.tag;

    // If tag is already used or is "Default" (only 1 default allowed)
    if (tag === "Default" || usedTags.has(tag) || !allTags.includes(tag)) {
      const availableTag = allTags.find((t) => t !== "Default" && !usedTags.has(t)) || "Others";
      tag = availableTag;
      changed = true;
    }

    usedTags.add(tag);
    if (item.isDefault !== false || item.tag !== tag) {
      changed = true;
    }

    result.push({
      ...item,
      tag,
      isDefault: false,
    });
  }

  return { sanitized: result, changed };
}

/**
 * Helper to batch-upsert all addresses to Supabase to prevent desynchronization
 */
async function syncAllToSupabase(addresses: SavedAddress[], userId: string) {
  try {
    const supabase = createClient();
    const rows = addresses.map((target) => ({
      id: target.id,
      user_id: userId,
      first_name: target.firstName,
      last_name: target.lastName,
      phone: target.phone,
      email: target.email,
      street: target.street,
      city: target.city,
      state: target.state,
      postal_code: target.postalCode,
      country: target.country,
      country_code: target.countryCode || null,
      state_code: target.stateCode || null,
      tag: target.tag,
      is_default: target.tag === "Default",
      updated_at: new Date().toISOString(),
    }));

    await supabase.from("user_addresses").upsert(rows, { onConflict: "id" });
  } catch (err: any) {
    console.warn("Supabase batch address upsert notice:", err?.message || err);
  }
}

/**
 * Get all addresses from Supabase PostgreSQL (with localStorage fallback).
 * Automatically heals duplicate tags or multiple defaults from previous errors.
 */
export async function getSavedAddresses(userId?: string): Promise<SavedAddress[]> {
  let remoteAddresses: SavedAddress[] | null = null;

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data)) {
        remoteAddresses = data.map((row: any) => ({
          id: row.id,
          firstName: row.first_name || "",
          lastName: row.last_name || "",
          phone: row.phone,
          email: row.email || "",
          street: row.street,
          city: row.city,
          state: row.state,
          postalCode: row.postal_code,
          country: row.country,
          countryCode: row.country_code || undefined,
          stateCode: row.state_code || undefined,
          tag: (row.tag as AddressTag) || (row.is_default ? "Default" : "Home"),
          isDefault: row.tag === "Default" || !!row.is_default,
        }));
      }
    } catch (err: any) {
      console.warn("Addresses Supabase fetch notice:", err?.message || err);
    }
  }

  let rawList: SavedAddress[] = [];

  if (remoteAddresses !== null) {
    rawList = remoteAddresses;
  } else {
    // Fallback to localStorage
    try {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            rawList = parsed;
          }
        }
      }
    } catch (e) {}
  }

  // Sanitize tags so that tags are strictly unique and only 1 Default exists
  const { sanitized, changed } = sanitizeAddressTags(rawList.slice(0, MAX_SAVED_ADDRESSES));

  // If there was any corruption/duplicate in database, persist sanitized back immediately
  if (changed) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      }
    } catch (e) {}

    if (userId && sanitized.length > 0) {
      syncAllToSupabase(sanitized, userId).catch(() => {});
    }
  }

  return sanitized;
}

/**
 * Set an existing address as Default, cleanly SWAPPING tags with the previous default.
 * Example: if target was "Others", target becomes "Default", and previous default becomes "Others".
 */
export async function setDefaultAddress(
  targetId: string,
  userId?: string
): Promise<SavedAddress[]> {
  const current = await getSavedAddresses(userId);
  const targetIndex = current.findIndex((a) => a.id === targetId);
  if (targetIndex === -1) return current;

  const target = current[targetIndex];
  if (target.tag === "Default") {
    return current;
  }

  const targetOldTag: AddressTag = target.tag;
  const oldDefaultIndex = current.findIndex((a) => a.tag === "Default" || a.isDefault);

  const updatedList = current.map((item, idx) => {
    if (idx === targetIndex) {
      return {
        ...item,
        tag: "Default" as AddressTag,
        isDefault: true,
      };
    }
    if (idx === oldDefaultIndex) {
      // Old default takes the target's previous tag!
      return {
        ...item,
        tag: targetOldTag,
        isDefault: false,
      };
    }
    return {
      ...item,
      isDefault: false,
    };
  });

  const { sanitized } = sanitizeAddressTags(updatedList);

  // Persist to localStorage
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch (e) {}

  // Persist ALL rows to Supabase in batch so both target and old default are updated
  if (userId && sanitized.length > 0) {
    await syncAllToSupabase(sanitized, userId);
  }

  return sanitized;
}

/**
 * Persist an address (create or update) to Supabase and localStorage.
 * Ensures tag swapping and single default uniqueness.
 */
export async function saveAddress(
  address: SavedAddress,
  userId?: string
): Promise<SavedAddress[]> {
  const current = await getSavedAddresses(userId);
  const existingIndex = current.findIndex((a) => a.id === address.id);
  const isDefault = address.tag === "Default" || !!address.isDefault;

  let updatedList: SavedAddress[];

  if (existingIndex >= 0) {
    const targetOldTag = current[existingIndex].tag;
    const oldDefaultIndex = current.findIndex(
      (a, idx) => idx !== existingIndex && (a.tag === "Default" || a.isDefault)
    );

    updatedList = current.map((item, idx) => {
      if (idx === existingIndex) {
        return {
          ...address,
          tag: isDefault ? ("Default" as AddressTag) : address.tag,
          isDefault,
        };
      }
      if (isDefault && idx === oldDefaultIndex) {
        // Old default gets target's previous tag so tags are swapped
        const replacementTag: AddressTag = targetOldTag !== "Default" ? targetOldTag : "Home";
        return {
          ...item,
          tag: replacementTag,
          isDefault: false,
        };
      }
      return item;
    });
  } else {
    if (current.length >= MAX_SAVED_ADDRESSES) {
      throw new Error(`Maximum limit of ${MAX_SAVED_ADDRESSES} saved addresses reached.`);
    }

    const newAddress: SavedAddress = {
      ...address,
      id: address.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`),
      tag: isDefault ? "Default" : address.tag,
      isDefault,
    };

    let baseList = current;
    if (isDefault) {
      const allTags: AddressTag[] = ["Home", "Others"];
      baseList = current.map((item) => {
        if (item.tag === "Default") {
          const unusedTag = allTags.find((t) => !current.some((c) => c.id !== item.id && c.tag === t)) || "Home";
          return { ...item, tag: unusedTag, isDefault: false };
        }
        return item;
      });
    }

    updatedList = [...baseList, newAddress].slice(0, MAX_SAVED_ADDRESSES);
  }

  const { sanitized } = sanitizeAddressTags(updatedList);

  // Persist to localStorage
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch (e) {}

  // Persist ALL rows to Supabase in batch
  if (userId && sanitized.length > 0) {
    await syncAllToSupabase(sanitized, userId);
  }

  return sanitized;
}

/**
 * Remove an address by ID from Supabase and localStorage.
 * If the removed address was Default, promotes the next remaining address to Default.
 */
export async function deleteAddress(
  addressId: string,
  userId?: string
): Promise<SavedAddress[]> {
  const current = await getSavedAddresses(userId);
  const deletedAddress = current.find((a) => a.id === addressId);
  const remaining = current.filter((a) => a.id !== addressId);

  // If the deleted address was Default and there are remaining addresses, promote the first one
  if (
    deletedAddress &&
    (deletedAddress.tag === "Default" || deletedAddress.isDefault) &&
    remaining.length > 0
  ) {
    remaining[0] = {
      ...remaining[0],
      tag: "Default",
      isDefault: true,
    };
  }

  const { sanitized } = sanitizeAddressTags(remaining);

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch (e) {}

  if (userId) {
    try {
      const supabase = createClient();
      await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", userId);

      // If remaining addresses were updated, re-sync them
      if (sanitized.length > 0) {
        await syncAllToSupabase(sanitized, userId);
      }
    } catch (err: any) {
      console.warn("Supabase address delete notice:", err?.message || err);
    }
  }

  return sanitized;
}
