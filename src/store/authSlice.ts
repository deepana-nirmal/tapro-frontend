import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../api/services';
import { AuthResponse, LoginCredentials, SessionUser } from '../types';
import { buildSessionUser, isTokenExpired } from '../utils/auth';

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getStoredState = (): Pick<AuthState, 'token' | 'user' | 'isAuthenticated'> => {
  const token = localStorage.getItem('tapro_token');
  const userJson = localStorage.getItem('tapro_user');
  const storedUser = userJson ? (JSON.parse(userJson) as SessionUser) : null;

  if (!token || isTokenExpired(token)) {
    authService.logout();
    return { token: null, user: null, isAuthenticated: false };
  }

  return {
    token,
    user: (() => {
      const rebuilt = buildSessionUser(token, storedUser?.email, storedUser?.backendRole, storedUser?.restaurantId);
      return storedUser ? { ...storedUser, ...rebuilt, name: storedUser.name || rebuilt.name } : rebuilt;
    })(),
    isAuthenticated: true,
  };
};

const initialState: AuthState = {
  ...getStoredState(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue('Backend is not reachable. Check REACT_APP_API_URL for deployed environments.');
      }

      return rejectWithValue(error.response?.data?.message || 'Unable to sign in');
    }
  }
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => getStoredState());

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      authService.logout();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to sign in';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
