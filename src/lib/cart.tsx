"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Selection } from "./quote";

export type FileRef = { url: string; name: string; size: number };
export type CartItem = { id: string; productId: string; selection: Selection; qty: number; files: FileRef[] };

const KEY = "printshop-cart-v1";

type Ctx = {
  items: CartItem[];
  ready: boolean;
  add: (i: Pick<CartItem, "productId" | "selection" | "qty">) => void;
  update: (id: string, patch: Partial<Omit<CartItem, "id">>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback<Ctx["add"]>((i) => {
    const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setItems((cur) => [...cur, { ...i, id, files: [] }]);
  }, []);
  const update = useCallback<Ctx["update"]>((id, patch) => {
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((it) => it.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, ready, add, update, remove, clear }), [items, ready, add, update, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
