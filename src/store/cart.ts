'use client';

import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  isOpen: boolean;
  
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      set({
        items: data.items || [],
        total: data.total || 0,
        itemCount: data.itemCount || 0,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de l\'ajout au panier');
      }
      
      await get().fetchCart();
      set({ isOpen: true });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateItem: async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      await get().fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  removeItem: async (itemId: string) => {
    try {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      await get().fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  },

  clearCart: async () => {
    try {
      await fetch('/api/cart', { method: 'DELETE' });
      set({ items: [], total: 0, itemCount: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  closeCart: () => set({ isOpen: false }),
}));
