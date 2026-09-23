import { useEffect, useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import CustomerManagement from './features/customers/CustomerManagement';
import DeliveryRun from './features/ledger/DeliveryRun';
import BillingManager from './features/billing/BillingManager';
import InventoryManager from './features/inventory/InventoryManager';
import MarketplaceHub from './features/marketplace/MarketplaceHub';
import { useAppStore } from './store/useAppStore';
import { WifiOff } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'run' | 'inventory' | 'marketplace' | 'customers' | 'billing'>('run');
  const { fetchCustomers, checkNetworkStatus, isOfflineMode } = useAppStore();

  useEffect(() => {
    fetchCustomers();

    // 🌟 NATIVE BROWSER NETWORK DETECTORS
    // Listen for real-time cellular data dropouts or recovery cycles
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
    };
  }, [fetchCustomers, checkNetworkStatus]);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="transition-all duration-200 ease-in-out relative">
        
        {/* 🌟 OFFLINE NOTIFICATION CHIP ALERTS BANNER */}
        {isOfflineMode && (
          <div className="mx-4 mb-4 max-w-md rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md animate-bounce sticky top-2 z-50 md:mx-auto">
            <WifiOff className="w-4 h-4" /> 
            Running Offline Mode. Changes saved locally on phone disk storage memory blocks.
          </div>
        )}

        {activeTab === 'run' && <DeliveryRun />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'marketplace' && <MarketplaceHub />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'billing' && <BillingManager />}
      </div>
    </DashboardLayout>
  );
}

export default App;
