import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, Truck, ReceiptIndianRupee, Package, ShieldCheck, DollarSign, Wallet, ShoppingBag } from 'lucide-react';

interface LayoutProps {
  activeTab: 'run' | 'inventory' | 'customers' | 'billing';
  setActiveTab: (tab: 'run' | 'inventory' | 'customers' | 'billing') => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, setActiveTab, children }: LayoutProps) {
  const { customers, dailyLogs } = useAppStore();

  const menuItems = [
    { id: 'run', label: "Today's Route", icon: Truck },
    { id: 'inventory', label: "Inventory Stock", icon: Package },
    { id: 'customers', label: "Manage Clients", icon: Users },
    { id: 'billing', label: "Ledger Billings", icon: ReceiptIndianRupee },
  ] as const;

  // 🌟 LIVE FINANCIAL BUSINESS INTELLIGENCE CALCULATOR ENGINE
  const totalActiveCustomers = customers.filter(c => c.isActive).length;
  
  // Filter for items confirmed delivered on today's run
  const deliveredLogs = dailyLogs.filter(l => l.status === 'delivered');
  const pendingDropsCount = dailyLogs.filter(l => l.status === 'pending').length;

  // Aggregate total volume delivered across varieties today
  const totalLitersToday = deliveredLogs.reduce((sum, log) => sum + log.deliveredQuantity, 0);

  // Calculate live financial revenue pipelines dynamically
  let dailyCashRevenue = 0;
  let tokensConsumedCount = 0;

  deliveredLogs.forEach(log => {
    const customer = typeof log.customerId === 'object' ? log.customerId : null;
    if (!customer) return;

    const rate = customer.pricePerLiter || (customer.subscription?.milkVariant === 'DELITE' ? 70 : 60);

    if (customer.subscription?.paymentMode === 'token') {
      tokensConsumedCount += 1; // Tracks how many prepaid coupons were collected
    } else {
      dailyCashRevenue += (log.deliveredQuantity * rate); // Tracks postpaid cash balance accrued
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* PERSISTENT DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200/80 flex-col justify-between shrink-0 h-screen sticky top-0 p-4 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md">🥛</div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight leading-none">MilkyWay Pro</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1.5 uppercase">Business Engine</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-200 ${
                    activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100/50">
          <ShieldCheck className="w-4 h-4 animate-pulse" /> Cloud Connection Live
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base font-black">M</div>
          <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">MilkyWay App</h1>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
      </header>

      {/* MAIN CONTENT HUB CONTAINING THE EXECUTIVE LIVE METRIC STRIP */}
      <div className="flex-1 flex flex-col min-w-0 md:max-h-screen md:overflow-y-auto p-4 max-w-7xl w-full mx-auto space-y-4">
        
        {/* 🌟 AUTOMATED REAL-TIME REVENUE METRICS STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Houses</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalActiveCustomers}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liters Delivered</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalLitersToday}<span className="text-xs font-bold text-slate-400 ml-0.5"> L</span></h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5 bg-gradient-to-br from-blue-50/10 to-transparent">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cash Value Today</p>
              <h3 className="text-xl font-black text-blue-700 mt-0.5">₹{dailyCashRevenue}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Wallet className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tokens Taken / Rem.</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{tokensConsumedCount} <span className="text-xs font-bold text-slate-400">/ {pendingDropsCount} left</span></h3>
            </div>
          </div>

        </div>

        {/* DYNAMIC COMPONENT INJECTION ZONE */}
        <main className="flex-1 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-50 px-4 py-2 flex justify-between shadow-xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${isActive ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[9px] font-black tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
