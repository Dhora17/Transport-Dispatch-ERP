import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DispatchState, DispatchRecord } from '../types';
import { mockDispatches } from '../utils/mockData';

const loadInitialDispatches = (): DispatchRecord[] => {
  const saved = localStorage.getItem('dispatch_records');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved dispatches, loading default mock data", e);
    }
  }
  return mockDispatches;
};

const initialState: DispatchState = {
  items: loadInitialDispatches(),
  loading: false,
  error: null,
};

// Helper to calculate amounts and profit with TypeScript typing
const calculateFields = (dispatch: Partial<DispatchRecord> & { id: string }): DispatchRecord => {
  const loadedQty = Number(dispatch.loadedQty) || 0;
  const paidQty = Number(dispatch.paidQty) || 0;
  const samratBillQty = Number(dispatch.samratBillQty) || 0;
  const ourRate = Number(dispatch.ourRate) || 0;
  const samratRate = Number(dispatch.samratRate) || 0;

  const paidAmount = Number((paidQty * ourRate).toFixed(2));
  const samratBillAmount = Number((samratBillQty * samratRate).toFixed(2));
  const profit = Number((samratBillAmount - paidAmount).toFixed(2));

  return {
    id: dispatch.id,
    date: dispatch.date || new Date().toISOString().split('T')[0],
    lrNo: dispatch.lrNo || '',
    from: dispatch.from || '',
    customerName: dispatch.customerName || '',
    destination: dispatch.destination || '',
    invoiceNo: dispatch.invoiceNo || '',
    truckNo: dispatch.truckNo || '',
    loadedQty,
    paidQty,
    samratBillQty,
    ourRate,
    samratRate,
    paidAmount,
    samratBillAmount,
    profit,
    transporterName: dispatch.transporterName || '',
    createdAt: dispatch.createdAt || new Date().toISOString(),
  };
};

const dispatchSlice = createSlice({
  name: 'dispatches',
  initialState,
  reducers: {
    addDispatch: (state, action: PayloadAction<Omit<DispatchRecord, 'id' | 'paidAmount' | 'samratBillAmount' | 'profit' | 'createdAt'>>) => {
      const newId = `DSP-${Date.now()}`;
      const processed = calculateFields({
        ...action.payload,
        id: newId,
        createdAt: new Date().toISOString()
      });
      state.items.unshift(processed);
      localStorage.setItem('dispatch_records', JSON.stringify(state.items));
    },
    updateDispatch: (state, action: PayloadAction<Partial<DispatchRecord> & { id: string }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = calculateFields({
          ...state.items[index],
          ...action.payload
        });
        localStorage.setItem('dispatch_records', JSON.stringify(state.items));
      }
    },
    deleteDispatch: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('dispatch_records', JSON.stringify(state.items));
    },
    bulkImportDispatches: (state, action: PayloadAction<Array<Omit<DispatchRecord, 'id' | 'paidAmount' | 'samratBillAmount' | 'profit' | 'createdAt'>>>) => {
      const processedRows = action.payload.map((row, idx) => {
        const newId = `DSP-EXL-${Date.now()}-${idx}`;
        return calculateFields({
          ...row,
          id: newId,
          createdAt: new Date().toISOString()
        });
      });
      state.items = [...processedRows, ...state.items];
      localStorage.setItem('dispatch_records', JSON.stringify(state.items));
    },
    resetDispatches: (state) => {
      state.items = mockDispatches;
      localStorage.setItem('dispatch_records', JSON.stringify(mockDispatches));
    }
  }
});

export const { addDispatch, updateDispatch, deleteDispatch, bulkImportDispatches, resetDispatches } = dispatchSlice.actions;

export default dispatchSlice.reducer;
