import { create } from 'zustand';
import type { Customer, DeliveryLog, Product } from '../types'; // 🌟 Added Product typing anchor mapping

interface OfflineQueueItem {
  logId: string;
  status: 'delivered' | 'skipped';
  quantity: number;
}

const OFFLINE_QUEUE_KEY = 'milkyway_offline_queue';

const readOfflineQueue = (): OfflineQueueItem[] => {
  const storedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!storedQueue) return [];

  try {
    const parsedQueue: unknown = JSON.parse(storedQueue);
    return Array.isArray(parsedQueue) ? parsedQueue as OfflineQueueItem[] : [];
  } catch {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return [];
  }
};

const saveOfflineQueue = (queue: OfflineQueueItem[]) => {
  if (queue.length === 0) {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return;
  }
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

interface AppState {
  customers: Customer[];
  dailyLogs: DeliveryLog[];
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  isOfflineMode: boolean;

  setSelectedDate: (date: string) => void;
  fetchCustomers: () => Promise<void>;
  fetchDailyLogs: (date: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  addNewProduct: (productPayload: {
    name: string;
    category: string;
    price: number;
    unit: string;
    stockAvailable: number;
  }) => Promise<void>;
  updateDeliveryStatus: (logId: string, status: 'delivered' | 'skipped', quantity: number) => Promise<void>;
  refillCustomerTokens: (customerId: string) => Promise<void>;
  editCustomerProfile: (customerId: string, updatedPayload: Partial<Customer>) => Promise<void>;
  softDeleteCustomer: (customerId: string) => Promise<void>;

  syncOfflineQueue: () => Promise<void>;
  checkNetworkStatus: () => void;
}

// 🌟 FIXED API PATHING: Enforces the trailing '/api' suffix on your Render live web connection string
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api' 
  : 'https://milkyway-backend-1jaq.onrender.com/api';

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  dailyLogs: [],
  products: [], // Initial empty marketplace array state
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  isOfflineMode: !navigator.onLine, // Initial network connectivity check parameters

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchDailyLogs(date);
  },

  checkNetworkStatus: () => {
    const onlineStatus = navigator.onLine;
    set({ isOfflineMode: !onlineStatus });
    if (onlineStatus) {
      get().syncOfflineQueue(); // Auto-flush cached queues immediately when connection recovers
    }
  },

  fetchCustomers: async () => {
    // If the phone is completely offline, fall back directly to reading your local storage cache cards
    if (!navigator.onLine) {
      const cachedCust = localStorage.getItem('milkyway_cached_customers');
      if (cachedCust) set({ customers: JSON.parse(cachedCust) });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      set({ customers: data, loading: false });
      
      // Save backup values into hardware disk memory blocks
      localStorage.setItem('milkyway_cached_customers', JSON.stringify(data));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchDailyLogs: async (date: string) => {
    if (!navigator.onLine) {
      const cachedLogs = localStorage.getItem(`milkyway_logs_${date}`);
      if (cachedLogs) set({ dailyLogs: JSON.parse(cachedLogs) });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/ledger/today?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch delivery checklist');
      const data = await response.json();
      set({ dailyLogs: data, loading: false });
      
      // Save local backup data block for this specific date string layout
      localStorage.setItem(`milkyway_logs_${date}`, JSON.stringify(data));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProducts: async () => {
    if (!navigator.onLine) {
      const cachedProducts = localStorage.getItem('milkyway_cached_products');
      if (cachedProducts) set({ products: JSON.parse(cachedProducts) });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/store/catalog`);
      if (!response.ok) throw new Error('Failed to fetch marketplace catalog database rows');
      const data = await response.json();
      set({ products: data, error: null });
      localStorage.setItem('milkyway_cached_products', JSON.stringify(data));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addNewProduct: async (productPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/store/add-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save product to database');
      }

      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateDeliveryStatus: async (logId, status, quantity) => {
    const currentLogs = get().dailyLogs;
    
    // LOCAL UI HYDRATION MOCK FOR INSTANT DOORSTEP INTERACTIONS
    const updatedLogs = currentLogs.map((log) => {
      if (log._id === logId) {
        // Optimistically calculate temporary local token metrics display adjustments if token customer
        const customer = typeof log.customerId === 'object' ? log.customerId : null;
        if (customer && customer.subscription?.paymentMode === 'token' && status === 'delivered' && log.status === 'pending') {
          customer.subscription.remainingTokens = Math.max(0, (customer.subscription.remainingTokens || 0) - quantity);
        }
        return { ...log, status };
      }
      return log;
    });

    set({ dailyLogs: updatedLogs });
    localStorage.setItem(`milkyway_logs_${get().selectedDate}`, JSON.stringify(updatedLogs));

    // THE OFFLINE INTERCEPTOR PIPELINE
    if (!navigator.onLine) {
      const queue = readOfflineQueue();
      queue.push({ logId, status, quantity });
      saveOfflineQueue(queue);
      return;
    }

    // Standard live execution sequence if connection parameters are fully functional
    try {
      const response = await fetch(`${API_BASE_URL}/ledger/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, deliveredQuantity: quantity }),
      });
      if (!response.ok) throw new Error('Failed to synchronize status with server');
    } catch {
      const queue = readOfflineQueue();
      queue.push({ logId, status, quantity });
      saveOfflineQueue(queue);
      set({ error: "Saved locally. Will sync when online." });
    }
  },

  // BACKGROUND FLUSH QUEUE LOGIC: Pushes queued modifications back to cloud
  syncOfflineQueue: async () => {
    if (!navigator.onLine) return;

    const queue = readOfflineQueue();
    if (queue.length === 0) return;

    set({ loading: true });

    const remainingQueue: OfflineQueueItem[] = [];
    for (const item of queue) {
      try {
        const response = await fetch(`${API_BASE_URL}/ledger/${item.logId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: item.status, deliveredQuantity: item.quantity }),
        });
        if (!response.ok) throw new Error(`Sync failed with status ${response.status}`);
      } catch {
        remainingQueue.push(item);
        console.error('Failed to sync individual queue row:', item.logId);
      }
    }

    saveOfflineQueue(remainingQueue);
    await get().fetchDailyLogs(get().selectedDate);
    await get().fetchCustomers();
    set({ loading: false, error: remainingQueue.length > 0 ? 'Some offline updates are still waiting to sync.' : null });
  },

  refillCustomerTokens: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/refill-tokens`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to load token book');
      await get().fetchCustomers();
    } catch (err: any) { set({ error: err.message }); }
  },

  editCustomerProfile: async (customerId, updatedPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      if (!response.ok) throw new Error('Failed to update customer file');
      await get().fetchCustomers();
    } catch (err: any) { set({ error: err.message }); }
  },

  softDeleteCustomer: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/toggle-status`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to change customer active status');
      await get().fetchCustomers();
    } catch (err: any) { set({ error: err.message }); }
  }
}));
