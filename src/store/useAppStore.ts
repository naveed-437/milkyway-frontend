import { create } from 'zustand';
import type { Customer, DeliveryLog } from '../types';

interface AppState {
  customers: Customer[];
  dailyLogs: DeliveryLog[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  fetchCustomers: () => Promise<void>;
  fetchDailyLogs: (date: string) => Promise<void>;
  updateDeliveryStatus: (logId: string, status: 'delivered' | 'skipped', quantity: number) => Promise<void>;
  refillCustomerTokens: (customerId: string) => Promise<void>;
  
  // 🌟 NEW INTERACTIVE FRONTEND ACTIONS ADDED HERE:
  editCustomerProfile: (customerId: string, updatedPayload: Partial<Customer>) => Promise<void>;
  softDeleteCustomer: (customerId: string) => Promise<void>;
}

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://milkyway-backend-1jaq.onrender.com/api';
  

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  dailyLogs: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchDailyLogs(date);
  },

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      set({ customers: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchDailyLogs: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/ledger/today?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch delivery checklist');
      const data = await response.json();
      set({ dailyLogs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      const updatedLog = await response.json();
      set({ dailyLogs: get().dailyLogs.map((log) => log._id === logId ? updatedLog : log) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  refillCustomerTokens: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/refill-tokens`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to load token book');
      await get().fetchCustomers();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // 🌟 EDIT ACTION IMPLEMENTATION:
  editCustomerProfile: async (customerId, updatedPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      if (!response.ok) throw new Error('Failed to update customer file');
      await get().fetchCustomers(); // Refresh locally cached array
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // 🌟 SOFT DELETE ACTION IMPLEMENTATION:
  softDeleteCustomer: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/toggle-status`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to deactivate customer profile');
      await get().fetchCustomers(); // Refresh locally cached array
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
