import { useEffect, useState, type FormEvent } from 'react';
import { Check, Edit3, MapPin, Phone, RefreshCw, Trash2, UserPlus, Wallet, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Customer } from '../../types';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://milkyway-backend-1jaq.onrender.com/api';

export default function CustomerManagement() {
  const {
    customers,
    fetchCustomers,
    refillCustomerTokens,
    editCustomerProfile,
    softDeleteCustomer,
    loading,
    error,
  } = useAppStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [subType, setSubType] = useState<'daily' | 'alternate' | 'custom'>('daily');
  const [defaultQuantity, setDefaultQuantity] = useState('1');
  const [milkVariant, setMilkVariant] = useState<'NICE' | 'DELITE'>('NICE');
  const [paymentMode, setPaymentMode] = useState<'postpaid' | 'token'>('postpaid');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCity, setEditCity] = useState('');

  useEffect(() => {
    void fetchCustomers();
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
    if (![editName, editPhone, editStreet, editArea, editCity].every(value => value.trim())) {
      alert('All customer fields are required during update');
      return;
    }

    await editCustomerProfile(id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: {
        street: editStreet.trim(),
        area: editArea.trim(),
        city: editCity.trim(),
      },
    });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (![name, phone, street, area].every(value => value.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    const dailyLiters = Number(defaultQuantity);
    if (!Number.isFinite(dailyLiters) || dailyLiters <= 0) {
      alert('Liters daily must be greater than zero');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      address: { street: street.trim(), area: area.trim(), city: city.trim() || 'Ambur' },
      subscription: {
        type: subType,
        defaultQuantity: dailyLiters,
        milkVariant,
        paymentMode,
        remainingTokens: paymentMode === 'token' ? dailyLiters * 30 : 0,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        throw new Error(responseData?.error || 'Failed to create customer profile');
      }

      setName('');
      setPhone('');
      setStreet('');
      setArea('');
      setCity('');
      await fetchCustomers();
      alert(paymentMode === 'token'
        ? `Profile successfully created with a starting balance of ${dailyLiters * 30} tokens`
        : 'Customer profile successfully created');
    } catch (submissionError) {
      alert(submissionError instanceof Error ? submissionError.message : 'Failed to create customer profile');
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-3">
      <div className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-800">
          <UserPlus className="h-5 w-5 text-blue-600" /> Onboard New Family
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Full Name *<input type="text" value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none" placeholder="John Doe" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Phone Number *<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none" placeholder="9876543210" />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Flat / Street *<input type="text" value={street} onChange={event => setStreet(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none" placeholder="Apt 4B" /></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Area / Locality *<input type="text" value={area} onChange={event => setArea(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none" placeholder="Downtown" /></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Milk Variety *<select value={milkVariant} onChange={event => setMilkVariant(event.target.value as 'NICE' | 'DELITE')} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none"><option value="NICE">NICE Variant</option><option value="DELITE">DELITE Variant</option></select></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Account System *<select value={paymentMode} onChange={event => setPaymentMode(event.target.value as 'postpaid' | 'token')} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none"><option value="postpaid">Postpaid Cash</option><option value="token">Prepaid Tokens</option></select></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Frequency *<select value={subType} onChange={event => setSubType(event.target.value as 'daily' | 'alternate' | 'custom')} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none"><option value="daily">Daily Run</option><option value="alternate">Alternate</option><option value="custom">Custom</option></select></label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Liters Daily *<input type="number" min="0.1" step="0.1" value={defaultQuantity} onChange={event => setDefaultQuantity(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:outline-none" /></label>
          </div>

          <button type="submit" className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-blue-700">Save Customer Profile</button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Customer Directories</h2>
            <p className="mt-0.5 text-xs text-slate-400">Total Registered Accounts: {customers.length}</p>
          </div>
          <button type="button" onClick={() => void fetchCustomers()} className="rounded-xl border border-slate-200 p-2.5 text-slate-400 transition hover:bg-slate-50" title="Refresh customers" aria-label="Refresh customers"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>

        {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}
        <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
          {!loading && customers.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">No customer accounts found.</p>}

          {customers.map(customer => {
            const isEditing = editingId === customer._id;
            const isTokenClient = customer.subscription?.paymentMode === 'token';
            const litersPerDay = customer.subscription?.defaultQuantity || 1;
            const remainingTokens = customer.subscription?.remainingTokens || 0;
            const daysRemaining = isTokenClient ? Math.floor(remainingTokens / litersPerDay) : 0;

            return (
              <div key={customer._id} className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 transition md:flex-row md:items-center ${customer.isActive ? 'border-slate-100 bg-slate-50/30 hover:border-slate-200/80 hover:shadow-sm' : 'border-rose-100 bg-rose-50/10 opacity-60'}`}>
                {isEditing ? (
                  <>
                    <div className="flex-1 space-y-2">
                      <input type="text" value={editName} onChange={event => setEditName(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm font-bold focus:outline-none" aria-label="Customer name" />
                      <input type="tel" value={editPhone} onChange={event => setEditPhone(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Customer phone" />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input type="text" value={editStreet} onChange={event => setEditStreet(event.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Street" />
                        <input type="text" value={editArea} onChange={event => setEditArea(event.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="Area" />
                        <input type="text" value={editCity} onChange={event => setEditCity(event.target.value)} className="rounded-xl border px-3 py-2 text-xs focus:outline-none" aria-label="City" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void saveInlineEdit(customer._id)} className="rounded-xl bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700" title="Save changes" aria-label="Save changes"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border bg-slate-100 p-2 text-slate-600" title="Cancel editing" aria-label="Cancel editing"><X className="h-4 w-4" /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-base font-extrabold ${customer.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{customer.name}</h3>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider ${customer.subscription?.milkVariant === 'DELITE' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>{customer.subscription?.milkVariant || 'NICE'}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{isTokenClient ? 'Token book' : 'Postpaid'}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {customer.phone}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {customer.address.street}, {customer.address.area}, {customer.address.city}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">Subscription: {litersPerDay}L / {customer.subscription?.type || 'daily'}</p>
                      {isTokenClient && <p className={`mt-1 text-xs font-bold ${daysRemaining <= 4 ? 'text-rose-600' : 'text-emerald-700'}`}>{daysRemaining} full delivery days left</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {isTokenClient && <div className="mr-2 text-right"><p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase text-slate-400"><Wallet className="h-3 w-3" /> Balance</p><p className={`text-lg font-black ${remainingTokens <= litersPerDay * 3 ? 'text-rose-600' : 'text-slate-800'}`}>{remainingTokens} tokens</p></div>}
                      {isTokenClient && customer.isActive && <button type="button" onClick={() => { if (confirm(`Load a new 30-day token book (+${litersPerDay * 30} tokens) for ${customer.name}?`)) void refillCustomerTokens(customer._id); }} className="rounded-xl bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700" title={`Load ${litersPerDay * 30} tokens`}>+30 Days</button>}
                      <button type="button" onClick={() => startEditing(customer)} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700" title="Edit customer" aria-label="Edit customer"><Edit3 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { if (confirm(`Toggle active route status for ${customer.name}?`)) void softDeleteCustomer(customer._id); }} className={`rounded-xl border p-2 transition ${customer.isActive ? 'border-rose-100 text-rose-400 hover:bg-rose-50' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`} title={customer.isActive ? 'Deactivate customer' : 'Activate customer'} aria-label={customer.isActive ? 'Deactivate customer' : 'Activate customer'}><Trash2 className="h-4 w-4" /></button>
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
