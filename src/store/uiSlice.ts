import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  darkMode: boolean;
}

const initialState: UiState = {
  darkMode: localStorage.getItem('tapro_theme') === 'dark',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      localStorage.setItem('tapro_theme', action.payload ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', action.payload);
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('tapro_theme', state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
  },
});

export const { setDarkMode, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
