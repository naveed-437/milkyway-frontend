import { useState, useEffect } from 'react'; // 🌟 1. Added useEffect here
import DashboardLayout from './layouts/DashboardLayout';
import CustomerManagement from './features/customers/CustomerManagement';
import DeliveryRun from './features/ledger/DeliveryRun';
import BillingManager from './features/billing/BillingManager';
import InventoryManager from './features/inventory/InventoryManager';
import { useAppStore } from './store/useAppStore'; // 🌟 2. Import the app store hook

function App() {
  const [activeTab, setActiveTab] = useState<'run' | 'inventory' | 'customers' | 'billing'>('run');
  const { fetchCustomers } = useAppStore(); // 🌟 3. Extract fetchCustomers action

  // 🌟 4. FORCE SYSTEM-WIDE INITIAL SYNCHRONIZATION ON BOOT:
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="transition-all duration-200 ease-in-out">
        {activeTab === 'run' && <DeliveryRun />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'billing' && <BillingManager />}
      </div>
    </DashboardLayout>
  );
}

export default App;
