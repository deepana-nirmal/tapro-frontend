import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartLine } from '../types';

interface CartState {
  items: CartLine[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartLine, 'quantity'> & { quantity?: number }>) {
      const existing = state.items.find((item) => item.menuItemId === action.payload.menuItemId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    updateQuantity(state, action: PayloadAction<{ menuItemId: number; quantity: number }>) {
      const existing = state.items.find((item) => item.menuItemId === action.payload.menuItemId);
      if (existing) {
        existing.quantity = Math.max(1, action.payload.quantity);
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.menuItemId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
