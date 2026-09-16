import { useState, useEffect, type FormEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserPlus, Phone, MapPin, RefreshCw, Edit3, Trash2, Check, X, Wallet } from 'lucide-react';
import type { Customer } from '../../types';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://milkyway-backend-1jaq.onrender.com/api';

export default function CustomerManagement() {
  const { customers, fetchCustomers, refillCustomerTokens, editCustomerProfile, softDeleteCustomer, loading, error } = useAppStore();

  // Onboarding Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [subType, setSubType] = useState<'daily' | 'alternate' | 'custom'>('daily');
  const [defaultQuantity, setDefaultQuantity] = useState('1');
  const [milkVariant, setMilkVariant] = useState<'NICE' | 'DELITE'>('NICE');
  const [paymentMode, setPaymentMode] = useState<'postpaid' | 'token'>('postpaid');

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCity, setEditCity] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const startEditing = (customer: Customer) => {
    setEditingId(customer._id);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditStreet(customer.address.street);
    setEditArea(customer.address.area);
    setEditCity(customer.address.city);
  };

  const saveInlineEdit = async (id: string) => {
    if (!editName || !editPhone || !editStreet || !editArea) return alert("All fields are required during update");

    const payload = {
      name: editName,
      phone: editPhone,
      address: { street: editStreet, area: editArea, city: editCity }
    };

    await editCustomerProfile(id, payload);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !street.trim() || !area.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const quantity = Number(defaultQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert('Liters daily must be greater than zero');
      return;
    }

    const payload = {
      name,
      phone,
      address: { street, area, city: city || "Ambur" },
      subscription: {
        type: subType,
        defaultQuantity: quantity,
        milkVariant,
        paymentMode,
        remainingTokens: paymentMode === 'token' ? 30 : 0
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to create customer profile");

      setName(''); setPhone(''); setStreet(''); setArea(''); setCity('');
      await fetchCustomers();
      alert('Customer profile successfully created');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">

      {/* ONBOARDING ACCORDION FORM */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
        <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" /> Onboard New Family
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number *</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="9876543210" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Flat / Street *</label>
              <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Apt 4B" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Area / Locality *</label>
              <input type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Downtown" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Milk Variety *</label>
              <select value={milkVariant} onChange={e => setMilkVariant(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none">
                <option value="NICE">NICE Variant</option>
                <option value="DELITE">DELITE Variant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account System *</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none">
                <option value="postpaid">Postpaid Cash</option>
                <option value="token">Prepaid Tokens</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency *</label>
              <select value={subType} onChange={e => setSubType(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none">
                <option value="daily">Daily Run</option>
                <option value="alternate">Alternate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Liters Daily *</label>
              <input type="number" value={defaultQuantity} onChange={e => setDefaultQuantity(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md transition duration-200 mt-2">
            Save Customer Profile
          </button>
        </form>
      </div>

      {/* 🚀 UPGRADED PREMIUM DIRECTORY WORKSPACE */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Customer Directories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Total Registered Accounts: {customers.length}</p>
          </div>
          <button onClick={() => fetchCustomers()} className="p-2.5 text-slate-400 hover:bg-slate-50 border border-slate-200 rounded-xl transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {!loading && customers.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              No customer accounts found.
            </p>
          )}

          {customers.map((customer) => {
            const isEditing = editingId === customer._id;
            const isTokenClient = customer.subscription?.paymentMode === 'token';
            const litersPerDay = customer.subscription?.defaultQuantity || 1;

            // Calculate remaining delivery days based on their volume consumption math
            const dynamicDaysRemaining = isTokenClient
              ? Math.floor((customer.subscription?.remainingTokens || 0) / litersPerDay)
              : 0;

            return (
              <div
                key={customer._id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row justify-between md:items-center gap-4 ${customer.isActive ? 'border-slate-100 bg-slate-50/30 hover:border-slate-200/80 hover:shadow-sm' : 'border-rose-100 bg-rose-50/10 opacity-60'
                  }`}
              >
                {isEditing ? (
                  <>
                    <div className="flex-1 space-y-2">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm font-bold focus:outline-none" aria-label="Customer name" />
                      <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Customer phone" />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input type="text" value={editStreet} onChange={e => setEditStreet(e.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Street" />
                        <input type="text" value={editArea} onChange={e => setEditArea(e.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Area" />
                        <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="City" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveInlineEdit(customer._id)} className="rounded-xl bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700" title="Save changes" aria-label="Save changes">
                        <Check className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border bg-slate-100 p-2 text-slate-600" title="Cancel editing" aria-label="Cancel editing">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-base font-extrabold text-slate-800 ${!customer.isActive ? 'text-slate-400 line-through' : ''}`}>{customer.name}</h3>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider ${customer.subscription?.milkVariant === 'DELITE' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
                          {customer.subscription?.milkVariant || 'NICE'}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{isTokenClient ? 'Token book' : 'Postpaid'}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {customer.phone}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {customer.address.street}, {customer.address.area}, {customer.address.city}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">Subscription: {litersPerDay}L / {customer.subscription?.type || 'daily'}</p>
                      {isTokenClient && <p className={`mt-1 text-xs font-bold ${dynamicDaysRemaining <= 4 ? 'text-rose-600' : 'text-emerald-700'}`}>{dynamicDaysRemaining} delivery days remaining</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {isTokenClient && <div className="mr-2 text-right"><p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase text-slate-400"><Wallet className="h-3 w-3" /> Balance</p><p className={`text-lg font-black ${customer.subscription.remainingTokens <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>{customer.subscription.remainingTokens}</p></div>}
                      {isTokenClient && customer.isActive && <button type="button" onClick={() => { if (confirm(`Refill a new 30-day token book for ${customer.name}?`)) refillCustomerTokens(customer._id); }} className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700" title="Refill 30 tokens"><Wallet className="h-4 w-4" /> +30</button>}
                      <button type="button" onClick={() => startEditing(customer)} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700" title="Edit customer" aria-label="Edit customer"><Edit3 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { if (confirm(`Toggle active route status for ${customer.name}?`)) softDeleteCustomer(customer._id); }} className={`rounded-xl border p-2 transition ${customer.isActive ? 'border-rose-100 text-rose-400 hover:bg-rose-50' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`} title={customer.isActive ? 'Deactivate customer' : 'Activate customer'} aria-label={customer.isActive ? 'Deactivate customer' : 'Activate customer'}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
