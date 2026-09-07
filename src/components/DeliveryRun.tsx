import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check, X, Calendar, Truck, AlertCircle, RefreshCw } from 'lucide-react';

export default function DeliveryRun() {
  const { dailyLogs, fetchDailyLogs, updateDeliveryStatus, loading, error } = useAppStore();
  
  // Default the calendar picker to today's local date (YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Automatically refresh today's list whenever your dad picks a different calendar date
  useEffect(() => {
    fetchDailyLogs(selectedDate);
  }, [selectedDate, fetchDailyLogs]);

  return (
    <div className="max-w-md mx-auto p-4">
      
      {/* Top Controls Layout: Date picker & quick status summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <Truck className="w-5 h-5 text-blue-600" /> Morning Run
          </div>
          <button 
            onClick={() => fetchDailyLogs(selectedDate)}
            className="p-1.5 text-slate-400 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error state message tracker */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 mb-4 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Active Run Card List */}
      <div className="space-y-3">
        {dailyLogs.map((log) => {
          // Type guard helper: ensuring customerId object is populated correctly
          const customer = typeof log.customerId === 'object' ? log.customerId : null;
          if (!customer) return null;

          return (
            <div 
              key={log._id} 
              className={`bg-white rounded-2xl p-4 border transition duration-200 ${
                log.status === 'delivered' ? 'border-emerald-200 bg-emerald-50/10' :
                log.status === 'skipped' ? 'border-red-100 bg-red-50/5' : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{customer.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{customer.address.street}, {customer.address.area}</p>
                  <p className="text-[11px] font-semibold text-blue-600 mt-2 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                    Target: {log.deliveredQuantity} Liters
                  </p>
                </div>

                {/* Right side interactive action check boxes */}
                <div className="flex items-center gap-2">
                  {log.status === 'pending' ? (
                    <>
                      {/* Skip button logic trigger */}
                      <button 
                        onClick={() => updateDeliveryStatus(log._id, 'skipped', log.deliveredQuantity)}
                        className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition active:scale-95"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Delivered button logic trigger */}
                      <button 
                        onClick={() => updateDeliveryStatus(log._id, 'delivered', log.deliveredQuantity)}
                        className="w-12 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow-md shadow-emerald-100 transition active:scale-95"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    /* Display state banner if already submitted */
                    <div className="text-right">
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        log.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.status}
                      </span>
                      <button 
                        onClick={() => useAppStore.setState({ dailyLogs: dailyLogs.map(l => l._id === log._id ? {...l, status: 'pending'} : l) })}
                        className="block text-[10px] text-slate-400 hover:text-blue-500 underline mt-1.5 ml-auto"
                      >
                        Undo action
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty layout placeholder */}
        {dailyLogs.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No scheduled milk runs for this date.</p>
            <p className="text-xs text-slate-400 mt-1">Make sure you have active customer profiles registered!</p>
          </div>
        )}
      </div>

    </div>
  );
}
