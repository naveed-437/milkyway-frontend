import React, { useCallback, useState, useEffect } from 'react';
import { API_BASE_URL, useAppStore } from '../../store/useAppStore';
import { Package, ClipboardList, ThermometerSnowflake, AlertTriangle, Save, RefreshCw } from 'lucide-react';

interface StockData {
  date: string;
  requirements: { nice: number; delite: number };
  existingIntake: {
    intake: { niceQuantity: number; deliteQuantity: number };
    reconciliation: {
      freezerStoredNice: number;
      freezerStoredDelite: number;
      discardedSpoiledNice: number;
      discardedSpoiledDelite: number;
    };
    isReconciled: boolean;
  } | null;
}

export default function InventoryManager() {
  const { selectedDate } = useAppStore();
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Inputs for 5:00 AM Intake
  const [niceIntake, setNiceIntake] = useState('');
  const [deliteIntake, setDeliteIntake] = useState('');

  // Form Inputs for EOD Freezer Reconciliation
  const [freezerNice, setFreezerNice] = useState('');
  const [freezerDelite, setFreezerDelite] = useState('');
  const [spoiledNice, setSpoiledNice] = useState('');
  const [spoiledDelite, setSpoiledDelite] = useState('');

  const fetchStockMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/requirements?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to load inventory supply aggregates");
      const data = await response.json();
      setStock(data);

      if (data.existingIntake) {
        setNiceIntake(data.existingIntake.intake.niceQuantity.toString());
        setDeliteIntake(data.existingIntake.intake.deliteQuantity.toString());
        setFreezerNice(data.existingIntake.reconciliation.freezerStoredNice.toString());
        setFreezerDelite(data.existingIntake.reconciliation.freezerStoredDelite.toString());
        setSpoiledNice(data.existingIntake.reconciliation.discardedSpoiledNice.toString());
        setSpoiledDelite(data.existingIntake.reconciliation.discardedSpoiledDelite.toString());
      } else {
        setNiceIntake(''); setDeliteIntake('');
        setFreezerNice(''); setFreezerDelite(''); setSpoiledNice(''); setSpoiledDelite('');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchStockMetrics();
  }, [fetchStockMetrics]);

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          niceQuantity: Number(niceIntake),
          deliteQuantity: Number(deliteIntake)
        })
      });
      if (!response.ok) throw new Error("Failed to log morning supply intake");
      alert("🚀 5:00 AM Intake Saved Successfully!");
      fetchStockMetrics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          freezerNice: Number(freezerNice),
          freezerDelite: Number(freezerDelite),
          spoiledNice: Number(spoiledNice),
          spoiledDelite: Number(spoiledDelite)
        })
      });
      if (!response.ok) throw new Error("Failed to reconcile freezer stock logs");
      alert("❄️ End-of-Day Stock Reconciled & Locked!");
      fetchStockMetrics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!stock) return <div className="p-6 text-center text-slate-400">Loading supply-chain logs...</div>;

  // Inventory logic helpers to detect shortages
  const niceShortage = stock.requirements.nice - (Number(niceIntake) || 0);
  const deliteShortage = stock.requirements.delite - (Number(deliteIntake) || 0);

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 📊 CORE COLUMN 1: REQUIREMENTS ANALYSIS ACCORDION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" /> 5:00 AM System Demand
        </h2>
        <p className="text-xs text-slate-400">Total volume calculated across all active customer delivery schedules for {selectedDate}.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">NICE Milk</span>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{stock.requirements.nice}L</h4>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">DELITE Milk</span>
            <h4 className="text-2xl font-black text-amber-600 mt-1">{stock.requirements.delite}L</h4>
          </div>
        </div>

        {/* Shortage alert triggers */}
        {(niceShortage > 0 || deliteShortage > 0) && niceIntake !== '' && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl space-y-1.5">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Route Supply Shortage Alert!
            </h4>
            <p className="text-[11px] text-rose-600">You received less stock than what your delivery list requires:</p>
            <ul className="text-[11px] font-bold text-rose-700 list-disc list-inside">
              {niceShortage > 0 && <li>Short on NICE by {niceShortage} Liters</li>}
              {deliteShortage > 0 && <li>Short on DELITE by {deliteShortage} Liters</li>}
            </ul>
          </div>
        )}
      </div>

      {/* 📦 COLUMN 2: 5:00 AM LOG BULK SUPPLY RECEIVED */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" /> Log Morning Intake
        </h2>
        <form onSubmit={handleIntakeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">NICE Quantity Received (Liters) *</label>
            <input type="number" value={niceIntake} onChange={e => setNiceIntake(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="0" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">DELITE Quantity Received (Liters) *</label>
            <input type="number" value={deliteIntake} onChange={e => setDeliteIntake(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="0" required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
            <Save className="w-4 h-4" /> Save Supply Intake
          </button>
        </form>
      </div>

      {/* ❄️ COLUMN 3: END OF DAY FREEZER COLD-CHAIN RECONCILIATION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ThermometerSnowflake className="w-5 h-5 text-indigo-600" /> Freezer Reconciliation
        </h2>
        <form onSubmit={handleReconcileSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Freezer NICE (L)</label>
              <input type="number" value={freezerNice} onChange={e => setFreezerNice(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Freezer DELITE (L)</label>
              <input type="number" value={freezerDelite} onChange={e => setFreezerDelite(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Spoiled NICE (L)</label>
              <input type="number" value={spoiledNice} onChange={e => setSpoiledNice(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Spoiled DELITE (L)</label>
              <input type="number" value={spoiledDelite} onChange={e => setSpoiledDelite(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="0" />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
            <ThermometerSnowflake className="w-4 h-4" /> Save Reconciliation
          </button>
        </form>
        <button type="button" onClick={fetchStockMetrics} disabled={loading} className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Stock
        </button>
      </div>
    </div>
  );
}