'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { CartItem, Product, DeliveryMethod, OrderDetails } from '@/lib/types';

interface CartState {
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  orderDetails: OrderDetails | null;
  isCartOpen: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DELIVERY_METHOD'; method: DeliveryMethod }
  | { type: 'SET_ORDER_DETAILS'; details: OrderDetails }
  | { type: 'TOGGLE_CART'; open?: boolean }
  | { type: 'SET_TOAST'; toast: CartState['toast'] }
  | { type: 'LOAD_CART'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], orderDetails: null };
    case 'SET_DELIVERY_METHOD':
      return { ...state, deliveryMethod: action.method };
    case 'SET_ORDER_DETAILS':
      return { ...state, orderDetails: action.details };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: action.open ?? !state.isCartOpen };
    case 'SET_TOAST':
      return { ...state, toast: action.toast };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  deliveryMethod: 'delivery',
  orderDetails: null,
  isCartOpen: false,
  toast: null,
};

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setOrderDetails: (details: OrderDetails) => void;
  toggleCart: (open?: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yachtdrop-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'LOAD_CART', items: parsed });
        }
      }
    } catch {}
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yachtdrop-cart', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    dispatch({ type: 'SET_TOAST', toast: { message: `${product.name.slice(0, 30)} added to cart`, type: 'success' } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 2500);
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setDeliveryMethod = useCallback((method: DeliveryMethod) => {
    dispatch({ type: 'SET_DELIVERY_METHOD', method });
  }, []);

  const setOrderDetails = useCallback((details: OrderDetails) => {
    dispatch({ type: 'SET_ORDER_DETAILS', details });
  }, []);

  const toggleCart = useCallback((open?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', open });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    dispatch({ type: 'SET_TOAST', toast: { message, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 2500);
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setDeliveryMethod,
        setOrderDetails,
        toggleCart,
        showToast,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
