import { useEffect, useState } from 'react';
import CustomerManagement from './components/CustomerManagement';
import DeliveryRun from './components/DeliveryRun';
import BillingManager from './components/BillingManager'; // 🌟 1. Import new component
import { useAppStore } from './store/useAppStore';
import { Users, Truck, ShoppingBag, Layers, ReceiptIndianRupee } from 'lucide-react';

function App() {
  // 🌟 2. Update the tab string type selector options rule
  const [activeTab, setActiveTab] = useState<'run' | 'customers' | 'billing'>('run');
  const { customers, dailyLogs, fetchCustomers, fetchDailyLogs } = useAppStore();

  useEffect(() => {
    fetchCustomers();
    const todayStr = new Date().toISOString().split('T')[0];
    fetchDailyLogs(todayStr);
  }, [fetchCustomers, fetchDailyLogs]);

  const totalActiveCustomers = customers.filter(c => c.isActive).length;
  const deliveredTodayCount = dailyLogs.filter(l => l.status === 'delivered').length;
  const totalLitersToday = dailyLogs
    .filter(l => l.status === 'delivered')
    .reduce((sum, log) => sum + log.deliveredQuantity, 0);
  const pendingHousesCount = dailyLogs.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-16">
      
      {/* Header Platform */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md">
              🥛
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-base tracking-tight leading-none">MilkyWay Pro</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">Dairy Business Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Server Sync Active
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* Analytics Dashboard summary band */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Houses</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalActiveCustomers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Milk Volume Out</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalLitersToday}<span className="text-xs font-bold text-slate-400 ml-1">Ltrs</span></h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl"><Layers className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Delivered Run</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{deliveredTodayCount}<span className="text-xs font-bold text-slate-400 ml-1">Houses</span></h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl"><Truck className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Remaining Drops</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{pendingHousesCount}</h3>
            </div>
          </div>
        </div>

        {/* 🌟 3. Updated Three-Tab Button Navigation Bar */}
        <div className="max-w-xl mx-auto bg-slate-200/50 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200/30 mb-6">
          <button 
            onClick={() => setActiveTab('run')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
              activeTab === 'run' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" /> Route Run
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
              activeTab === 'customers' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Customers
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
              activeTab === 'billing' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ReceiptIndianRupee className="w-4 h-4" /> Billings
          </button>
        </div>

        {/* 🌟 4. Dynamic Router Render Canvas */}
        <main className="transition-all duration-300">
          {activeTab === 'run' && <DeliveryRun />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'billing' && <BillingManager />}
        </main>

      </div>
    </div>
  );
}

export default App;
