import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserPlus, Phone, MapPin, Milk, RefreshCw, Ticket, Edit3, Trash2, Check, X } from 'lucide-react';
import type { Customer } from '../../types';

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const startEditing = (customer: Customer) => {
    setEditingId(customer._id);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditStreet(customer.address.street);
    setEditArea(customer.address.area);
  };

  const saveInlineEdit = async (id: string) => {
    if (!editName || !editPhone || !editStreet || !editArea) return alert("All fields are required during update");
    
    const payload = {
      name: editName,
      phone: editPhone,
      address: {
        street: editStreet,
        area: editArea,
        city: "Ambur"
      }
    };

    await editCustomerProfile(id, payload);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street || !area) return alert("Please fill in all required fields");

    const payload = {
      name,
      phone,
      address: { street, area, city: city || "Ambur" },
      subscription: {
        type: subType,
        defaultQuantity: Number(defaultQuantity),
        milkVariant,
        paymentMode,
        remainingTokens: paymentMode === 'token' ? 30 : 0 
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to create customer profile");
      
      setName(''); setPhone(''); setStreet(''); setArea(''); setCity('');
      fetchCustomers();
      alert("🎉 Customer profile successfully created!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
      
      {/* LEFT FORM BLOCK PANEL */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" /> Onboard New Family
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number *</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="9876543210" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Flat / Street *</label>
              <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Apt 4B" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Area / Locality *</label>
              <input type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Downtown" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Milk Variety *</label>
              <select value={milkVariant} onChange={e => setMilkVariant(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                <option value="NICE">🥛 NICE Milk</option>
                <option value="DELITE">✨ DELITE Milk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account System *</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                <option value="postpaid">📅 Postpaid Monthly</option>
                <option value="token">🎟️ Prepaid Tokens</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Frequency *</label>
              <select value={subType} onChange={e => setSubType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                <option value="daily">Daily Run</option>
                <option value="alternate">Alternate Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Volume (Liters) *</label>
              <input type="number" value={defaultQuantity} onChange={e => setDefaultQuantity(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition mt-2">
            Save Customer Profile
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: ACTIVE DIRECTORY ARCHIVE VIEW LIST */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Customer Directory ({customers.length})</h2>
          <button onClick={() => fetchCustomers()} className="p-2 hover:bg-slate-50 border rounded-xl transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl mb-4">{error}</div>}

        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
          {customers.map((customer) => {
            const isEditing = editingId === customer._id;
            
            return (
              <div 
                key={customer._id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition ${
                  customer.isActive ? 'border-slate-100 bg-slate-50/40' : 'border-rose-100 bg-rose-50/20 opacity-70'
                }`}
              >
                {/* EDIT FORM STATE */}
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 border text-sm rounded-lg w-full font-bold focus:outline-none" />
                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="px-2 py-1 border text-xs rounded-lg w-full focus:outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={editStreet} onChange={e => setEditStreet(e.target.value)} className="px-2 py-1 border text-xs rounded-lg focus:outline-none" />
                      <input type="text" value={editArea} onChange={e => setEditArea(e.target.value)} className="px-2 py-1 border text-xs rounded-lg focus:outline-none" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-base ${customer.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        {customer.name}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                        customer.subscription?.milkVariant === 'DELITE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {customer.subscription?.milkVariant || 'NICE'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {customer.address.street}, {customer.address.area}</p>
                      <p className="flex items-center gap-1.5"><Milk className="w-3.5 h-3.5" /> {customer.subscription?.defaultQuantity || 0}L / {customer.subscription?.type || 'daily'}</p>
                      {customer.subscription?.paymentMode === 'token' && (
                        <p className="flex items-center gap-1.5 font-bold text-amber-700">
                          <Ticket className="w-3.5 h-3.5" /> {customer.subscription.remainingTokens ?? 0} tokens remaining
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => saveInlineEdit(customer._id)} className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Save customer">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" title="Cancel edit">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {customer.subscription?.paymentMode === 'token' && (
                        <button type="button" onClick={() => refillCustomerTokens(customer._id)} className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100" title="Refill token book">
                          <Ticket className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => startEditing(customer)} className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100" title="Edit customer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => softDeleteCustomer(customer._id)} className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100" title={customer.isActive ? 'Deactivate customer' : 'Activate customer'}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {customers.length === 0 && !loading && (
            <div className="py-12 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No customer profiles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
