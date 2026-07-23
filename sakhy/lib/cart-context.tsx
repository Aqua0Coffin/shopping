"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  color: string;
  price: number; // in paise
  quantity: number;
  image?: string;
  fabricType: string;
  stockQty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { variantId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { variantId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "SET_CART"; payload: CartItem[] };

const CART_STORAGE_KEY = "sakhy_cart_v1";

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.variantId === action.payload.variantId
      );

      let newItems: CartItem[];
      if (existingItemIndex > -1) {
        newItems = [...state.items];
        const existingItem = newItems[existingItemIndex];
        const newQty = existingItem.quantity + action.payload.quantity;
        // Cap quantity at available stock
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(newQty, existingItem.stockQty),
        };
      } else {
        newItems = [...state.items, action.payload];
      }

      // Save to localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      return { ...state, items: newItems, isOpen: true }; // Open cart drawer on add
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.variantId !== action.payload.variantId
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      return { ...state, items: newItems };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) => {
        if (item.variantId === action.payload.variantId) {
          const qty = Math.max(1, Math.min(action.payload.quantity, item.stockQty));
          return { ...item, quantity: qty };
        }
        return item;
      });
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      return { ...state, items: newItems };
    }

    case "CLEAR_CART":
      localStorage.removeItem(CART_STORAGE_KEY);
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        dispatch({ type: "SET_CART", payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to parse cart storage", e);
    }
  }, []);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...item, quantity: item.quantity ?? 1 } as CartItem,
    });
  };

  const removeItem = (variantId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { variantId } });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
