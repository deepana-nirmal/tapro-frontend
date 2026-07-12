import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartLine } from '../types';
import { CustomerTableContext, clampQuantity } from '../utils/cartCalculations';

const CART_STORAGE_KEY = 'tapro_customer_cart_v1';

interface CartState {
  items: CartLine[];
  context: CustomerTableContext | null;
  updatedAt: string | null;
}

const safeStorage = () => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const loadInitialState = (): CartState => {
  const fallback: CartState = {
    items: [],
    context: null,
    updatedAt: null,
  };
  const storage = safeStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(storage.getItem(CART_STORAGE_KEY) || '') as CartState;
    if (!Array.isArray(parsed.items)) {
      return fallback;
    }

    return {
      items: parsed.items.map((item) => ({ ...item, quantity: clampQuantity(item.quantity) })),
      context: parsed.context || null,
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return fallback;
  }
};

const persistState = (state: CartState) => {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
};

const touch = (state: CartState) => {
  state.updatedAt = new Date().toISOString();
  persistState(state);
};

const initialState: CartState = loadInitialState();

const emptyCartState = (): CartState => ({
  items: [],
  context: null,
  updatedAt: null,
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartContext(state, action: PayloadAction<CustomerTableContext>) {
      state.context = action.payload;
      touch(state);
    },
    replaceCartForContext(state, action: PayloadAction<CustomerTableContext>) {
      state.items = [];
      state.context = action.payload;
      touch(state);
    },
    addToCart(state, action: PayloadAction<Omit<CartLine, 'quantity'> & { quantity?: number }>) {
      const existing = state.items.find((item) => item.menuItemId === action.payload.menuItemId);
      const quantity = clampQuantity(action.payload.quantity || 1);
      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + quantity);
      } else {
        state.items.push({ ...action.payload, quantity });
      }
      touch(state);
    },
    updateQuantity(state, action: PayloadAction<{ menuItemId: number; quantity: number }>) {
      const existing = state.items.find((item) => item.menuItemId === action.payload.menuItemId);
      if (existing) {
        existing.quantity = clampQuantity(action.payload.quantity);
        touch(state);
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.menuItemId !== action.payload);
      touch(state);
    },
    clearCart(state) {
      const next = emptyCartState();
      state.items = next.items;
      state.context = next.context;
      state.updatedAt = next.updatedAt;
      persistState(state);
    },
  },
});

export const { addToCart, setCartContext, replaceCartForContext, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
