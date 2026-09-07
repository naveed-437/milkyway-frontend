import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { FileText, Send, DollarSign, Calendar, Landmark, RefreshCw } from 'lucide-react';

interface BillingSummary {
  month: string;
  customerName: string;
  phone: string;
  pricePerLiter: number;
  totalDeliveriesCount: number;
  totalLitersDelivered: number;
  totalAmountDue: number;
}

export default function BillingManager() {
  const { customers, fetchCustomers } = useAppStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [invoice, setInvoice] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 🌟 SAFE STATE STORE: Keeps the pre-calculated text link ready for Chrome
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const generateBill = async () => {
    if (!selectedCustomerId) {
      alert('Please pick a customer first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/ledger/billing/${selectedCustomerId}?month=${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to calculate billing invoice metrics');
      const data: BillingSummary = await response.json();
      setInvoice(data);

      const cleanPhone = data.phone.replace(/\D/g, '');
      const whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      if (whatsappPhone.length < 10) {
        throw new Error('The customer phone number is invalid for WhatsApp');
      }

      const greetingText = "Hello *" + data.customerName + "*,\n\n" +
        "Here is your milk delivery bill statement summary for *" + data.month + "*:\n\n" +
        "🥛 Total Days Delivered: *" + data.totalDeliveriesCount + " days*\n" +
        "📊 Total Volume: *" + data.totalLitersDelivered + " Liters*\n" +
        "💰 Price per Liter: *₹" + data.pricePerLiter + "*\n\n" +
        "📈 *Total Amount Due: ₹" + data.totalAmountDue + "*\n\n" +
        "Kindly clear the outstanding balance via UPI or cash. Thank you for your continued business!";

      const encodedText = encodeURIComponent(greetingText);
      
      setWhatsappLink(`https://wa.me/${whatsappPhone}?text=${encodedText}`);

    } catch (err: unknown) {
      setInvoice(null);
      setWhatsappLink('');
      alert(err instanceof Error ? err.message : 'Unable to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
      
      {/* LEFT INPUT CONTROLS PANEL */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-600" /> Bill Statement Center
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Customer *</label>
              <select
            value={selectedCustomerId} 
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">-- Choose House --</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>{customer.name} ({customer.address.area})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Billing Month *</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
        </div>

        <button 
          onClick={generateBill}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition duration-200 text-sm shadow-md flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Calculate Invoice Balance
        </button>
      </div>

      {/* RIGHT PREVIEW & SEND PANEL */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex flex-col justify-between">
        {invoice ? (
          <div className="space-y-6">
            <div className="border-b border-dashed border-slate-200 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">INVOICE STATEMENT</h3>
                <p className="text-xs text-slate-400 mt-1">Statement Period: {invoice.month}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  ₹{invoice.pricePerLiter} / Liter
                </span>
              </div>
            </div>

            {/* Micro receipt dashboard layout */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days Delivered</p>
                <h4 className="text-xl font-extrabold text-slate-800 mt-1">{invoice.totalDeliveriesCount}</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <FileText className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Volume</p>
                <h4 className="text-xl font-extrabold text-slate-800 mt-1">{invoice.totalLitersDelivered} L</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-blue-100 bg-blue-50/10">
                <DollarSign className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Amount Due</p>
                <h4 className="text-xl font-black text-blue-700 mt-1">₹{invoice.totalAmountDue}</h4>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
              <p className="text-xs text-slate-500"><strong className="text-slate-700">Billed Client:</strong> {invoice.customerName}</p>
              <p className="text-xs text-slate-500"><strong className="text-slate-700">Contact Number:</strong> +91 {invoice.phone}</p>
            </div>

            {/* 🌟 NATIVE link reading straight from our clean, safe state memory */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-md text-center flex items-center justify-center gap-2 group block"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Dispatch Statement via WhatsApp
            </a>
          </div>
        ) : (
          <div className="text-center py-16 m-auto">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No Statement Generated</p>
            <p className="text-xs text-slate-400 mt-1">Select a family and billing cycle from the options bar to begin calculation checks.</p>
          </div>
        )}
      </div>

    </div>
  );
}
