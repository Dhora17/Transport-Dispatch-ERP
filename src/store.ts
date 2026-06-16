import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import dispatchReducer from './features/dispatchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dispatches: dispatchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
