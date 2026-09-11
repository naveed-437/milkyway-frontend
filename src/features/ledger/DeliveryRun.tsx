import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import MonthCalendar from './MonthCalendar';
import DeliveryMap from './DeliveryMap'; // Live Interactive Geolocation Map Panel
import { Check, X, RefreshCw, CalendarDays, Inbox, MapPin } from 'lucide-react';

export default function DeliveryRun() {
  const { dailyLogs, selectedDate, fetchDailyLogs, updateDeliveryStatus, loading, error } = useAppStore();
  
  // 🌟 Filter state: flips between standard daily runs and alternate/custom ones
  const [listFilter, setListFilter] = useState<'daily' | 'alternate'>('daily');

  useEffect(() => {
    fetchDailyLogs(selectedDate);
  }, [selectedDate, fetchDailyLogs]);

  // 🌟 FIX UNIFIED SCHEDULE FILTER EXTRACTORS:
  // Groups data dynamically by schedule rules with strict fallback type guards
  const dailyRuns = dailyLogs.filter(log => {
    const cust = log.customerId;
    if (cust && typeof cust === 'object') {
      return cust.subscription?.type === 'daily' || !cust.subscription?.type;
    }
    return false;
  });

  const alternateRuns = dailyLogs.filter(log => {
    const cust = log.customerId;
    if (cust && typeof cust === 'object') {
      return cust.subscription?.type === 'alternate' || cust.subscription?.type === 'custom';
    }
    return false;
  });

  const activeDisplayList = listFilter === 'daily' ? dailyRuns : alternateRuns;

  // 🌟 SMART AREA NEIGHBORHOOD GROUPER:
  // Aggregates rows into unique local area location maps
  const groupedByArea = activeDisplayList.reduce((groups: { [key: string]: typeof activeDisplayList }, log) => {
    const cust = log.customerId;
    const areaName = cust && typeof cust === 'object' && cust.address?.area 
      ? cust.address.area 
      : 'General Route Area';
    
    if (!groups[areaName]) groups[areaName] = [];
    groups[areaName].push(log);
    return groups;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <section className="space-y-4 lg:sticky lg:top-4">
        <MonthCalendar />

        {activeDisplayList.length > 0 && (
          <DeliveryMap logs={activeDisplayList} />
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            Schedule for: <span className="text-blue-600 font-extrabold">{selectedDate}</span>
          </div>
          <button onClick={() => fetchDailyLogs(selectedDate)} className="p-1.5 text-slate-400 hover:bg-slate-50 border rounded-lg transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </section>

      <section className="space-y-4 min-w-0">
        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1 border border-slate-200/20">
        <button 
          onClick={() => setListFilter('daily')} 
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${listFilter === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          Daily Run ({dailyRuns.length})
        </button>
        <button 
          onClick={() => setListFilter('alternate')} 
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${listFilter === 'alternate' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          Alternate / Custom ({alternateRuns.length})
        </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100">{error}</div>}

        <div className="space-y-6">
        {Object.keys(groupedByArea).map((area) => (
          <div key={area} className="space-y-2">
            
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {area} Zone ({groupedByArea[area].length} Drops)
            </div>

            <div className="space-y-2.5">
              {groupedByArea[area].map((log) => {
                const customer = typeof log.customerId === 'object' ? log.customerId : null;
                if (!customer) return null;

                return (
                  <div key={log._id} className={`bg-white rounded-2xl p-4 border transition duration-200 ${log.status === 'delivered' ? 'border-emerald-200 bg-emerald-50/5' : log.status === 'skipped' ? 'border-red-100 bg-red-50/5' : 'border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-base">{customer.name}</h3>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            customer.subscription?.milkVariant === 'DELITE' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {customer.subscription?.milkVariant || 'NICE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{customer.address?.street}</p>
                        
                        {customer.subscription?.paymentMode === 'token' ? (
                          <p className="text-[10px] font-bold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                            🎟️ Token ({customer.subscription.remainingTokens} Left)
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-blue-600 mt-2 bg-blue-50 px-2 py-0.5 rounded inline-block">
                            🥛 Route Target: {log.deliveredQuantity} Liters
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {log.status === 'pending' ? (
                          <>
                            <button onClick={() => updateDeliveryStatus(log._id, 'skipped', log.deliveredQuantity)} className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"><X className="w-4 h-4" /></button>
                            <button onClick={() => updateDeliveryStatus(log._id, 'delivered', log.deliveredQuantity)} className="w-12 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow-md shadow-emerald-100 transition"><Check className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <div className="text-right">
                            <span className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${log.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{log.status}</span>
                            <button onClick={() => useAppStore.setState({ dailyLogs: dailyLogs.map(l => l._id === log._id ? {...l, status: 'pending'} : l) })} className="block text-[10px] text-slate-400 hover:text-blue-500 underline mt-1.5 ml-auto">Undo</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {activeDisplayList.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-400">No active delivery drops found for this section.</p>
          </div>
        )}
        </div>
      </section>

    </div>
  );
}
