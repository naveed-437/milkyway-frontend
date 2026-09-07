import { create } from 'zustand';
import type { Customer, DeliveryLog } from '../types';

interface AppState {
  customers: Customer[];
  dailyLogs: DeliveryLog[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  fetchDailyLogs: (date: string) => Promise<void>;
  updateDeliveryStatus: (logId: string, status: 'delivered' | 'skipped', quantity: number) => Promise<void>;
  
  // 🌟 NEW ACTION ADDITION:
  refillCustomerTokens: (customerId: string) => Promise<void>;
}

const API_BASE_URL = 'http://localhost:5000/api';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getResponseError = async (response: Response, fallback: string) => {
  try {
    const data = await response.json() as { error?: string; message?: string };
    return data.error ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  dailyLogs: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json() as Customer[];
      set({ customers: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch customers'), loading: false });
    }
  },

  fetchDailyLogs: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/ledger/today?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch delivery checklist');
      const data = await response.json() as DeliveryLog[];
      set({ dailyLogs: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch delivery checklist'), loading: false });
    }
  },

  updateDeliveryStatus: async (logId, status, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ledger/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, deliveredQuantity: quantity }),
      });
      
      if (!response.ok) {
        throw new Error(await getResponseError(response, 'Failed to update status'));
      }
      const updatedLog = await response.json() as DeliveryLog;

      const currentLogs = get().dailyLogs.map((log) =>
        log._id === logId ? updatedLog : log
      );
      set({ dailyLogs: currentLogs, error: null });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to update status') });
    }
  },

  // 🌟 REFILL ACTION IMPLEMENTATION
  refillCustomerTokens: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/refill-tokens`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(await getResponseError(response, 'Failed to load token book'));
      }
      
      // Refresh the customer array cache values to update the UI instantly
      await get().fetchCustomers();
      set({ error: null });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to load token book') });
    }
  }
}));
