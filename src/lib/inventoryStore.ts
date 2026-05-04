import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export interface InventoryItem {
  id: string;             // stable: "<class>-<n>"
  label: string;          // "Apple"
  className: string;      // raw COCO class "apple"
  category: "fruit" | "vegetable" | "food" | "container";
  emoji: string;
  color: string;          // sampled HSL color from camera
  quantity: number;       // count
  confidence: number;     // last best confidence
  addedAt: number;
  updatedAt: number;
  source: "camera" | "manual";
}

const STORAGE_KEY = "smartfridge.inventory.v1";
const EVT = "smartfridge:inventory";

async function read(): Promise<InventoryItem[]> {
  try {
    // Use Supabase if available, otherwise fall back to localStorage
    if (supabase) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) throw error;
      if (data) return data;
    }
  } catch (error) {
    console.warn('Supabase read failed, using localStorage:', error);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InventoryItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: InventoryItem[]) {
  try {
    // Try Supabase first
    if (supabase) {
      const { error } = await supabase
        .from('inventory')
        .upsert(items, { onConflict: 'id' });

      if (error) throw error;
    }
  } catch (error) {
    console.warn('Supabase write failed, using localStorage:', error);
  }

  // Always write to localStorage as fallback
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch (error) {
    console.error('Failed to save inventory:', error);
  }
}

export async function getInventory() {
  return await read();
}

export async function clearInventory() {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .neq('id', '');

      if (error) throw error;
    }
  } catch (error) {
    console.warn('Supabase clear failed, using localStorage:', error);
  }

  // Fallback to localStorage
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVT));
}

export async function removeInventoryItem(id: string) {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  } catch (error) {
    console.warn('Supabase delete failed, using localStorage:', error);
  }

  // Fallback to localStorage
  const items = await read();
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent(EVT));
}

/** Add (or increment quantity of) a detected item. Dedupes by className. */
export async function upsertDetection(input: Omit<InventoryItem, "id" | "addedAt" | "updatedAt" | "quantity"> & { quantity?: number }) {
  const items = await read();
  const idx = items.findIndex((i) => i.className === input.className && i.source === "camera");
  const now = Date.now();
  if (idx >= 0) {
    const next = { ...items[idx] };
    next.quantity = items[idx].quantity + (input.quantity ?? 1);
    next.confidence = Math.max(items[idx].confidence, input.confidence);
    next.color = input.color || items[idx].color;
    next.updatedAt = now;
    items[idx] = next;
  } else {
    items.unshift({
      id: `${input.className}-${now}`,
      addedAt: now,
      updatedAt: now,
      quantity: input.quantity ?? 1,
      ...input,
    });
  }
  await write(items);
}

export function useInventory(): InventoryItem[] {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const data = await read();
      setItems(data);
    };

    fetchInventory();

    const onChange = async () => {
      const data = await read();
      setItems(data);
    };

    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return items;
}
