import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, UserRole } from '../types';
import { mockUsers } from '../utils/mockData';

const defaultPermissions: Record<UserRole, string[]> = {
  Admin: ['dashboard', 'dispatches', 'transporters', 'customers', 'reports', 'analytics', 'upload', 'users', 'settings'],
  Manager: ['dashboard', 'dispatches', 'transporters', 'customers', 'reports', 'analytics', 'upload', 'settings'],
  Operator: ['dashboard', 'dispatches', 'transporters', 'customers', 'upload']
};

const savedUser = localStorage.getItem('dispatch_user');
const savedPermissions = localStorage.getItem('dispatch_permissions');

const initialState: AuthState = {
  currentUser: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  error: null,
  allUsers: mockUsers,
  rolePermissions: savedPermissions ? JSON.parse(savedPermissions) : defaultPermissions,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('dispatch_user', JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.currentUser = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('dispatch_user');
    },
    updateUserRole: (state, action: PayloadAction<{ userId: string; newRole: UserRole }>) => {
      const { userId, newRole } = action.payload;
      state.allUsers = state.allUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      
      if (state.currentUser && state.currentUser.id === userId) {
        state.currentUser.role = newRole;
        localStorage.setItem('dispatch_user', JSON.stringify(state.currentUser));
      }
    },
    switchActiveRole: (state, action: PayloadAction<UserRole>) => {
      if (state.currentUser) {
        state.currentUser.role = action.payload;
        localStorage.setItem('dispatch_user', JSON.stringify(state.currentUser));
      }
    },
    updateRolePermissions: (state, action: PayloadAction<{ role: UserRole; permissions: string[] }>) => {
      const { role, permissions } = action.payload;
      state.rolePermissions[role] = permissions;
      localStorage.setItem('dispatch_permissions', JSON.stringify(state.rolePermissions));
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUserRole, 
  switchActiveRole,
  updateRolePermissions 
} = authSlice.actions;

// Thunk type helper
export const performLogin = (username: string) => (dispatch: any) => {
  dispatch(loginStart());
  const user = mockUsers.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
  
  if (user) {
    dispatch(loginSuccess(user));
    return true;
  } else {
    dispatch(loginFailure("Invalid username. Use 'admin', 'manager', or 'operator'."));
    return false;
  }
};

export default authSlice.reducer;
