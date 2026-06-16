export type UserRole = 'Admin' | 'Manager' | 'Operator';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface DispatchRecord {
  id: string;
  date: string;
  lrNo: string;
  from: string;
  customerName: string;
  destination: string;
  invoiceNo: string;
  truckNo: string;
  loadedQty: number;
  paidQty: number;
  samratBillQty: number;
  ourRate: number;
  samratRate: number;
  paidAmount: number;
  samratBillAmount: number;
  transporterName: string;
  profit: number;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  error: string | null;
  allUsers: User[];
  rolePermissions: Record<UserRole, string[]>;
}

export interface DispatchState {
  items: DispatchRecord[];
  loading: boolean;
  error: string | null;
}
