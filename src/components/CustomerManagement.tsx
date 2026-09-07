import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, Milk, Phone, RefreshCw, Ticket, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.ts';

type SubscriptionType = 'daily' | 'alternate' | 'custom';
type MilkVariant = 'NICE' | 'DELITE';
type PaymentMode = 'postpaid' | 'token';

export default function CustomerManagement() {
  const { customers, fetchCustomers, refillCustomerTokens, loading, error } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('60');
  const [subType, setSubType] = useState<SubscriptionType>('daily');
  const [defaultQuantity, setDefaultQuantity] = useState('1');
  const [milkVariant, setMilkVariant] = useState<MilkVariant>('NICE');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('postpaid');

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim() || !street.trim() || !area.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      address: { street: street.trim(), area: area.trim(), city: city.trim() || 'Mumbai' },
      pricePerLiter: Number(pricePerLiter),
      subscription: {
        type: subType,
        defaultQuantity: Number(defaultQuantity),
        milkVariant,
        paymentMode,
        remainingTokens: paymentMode === 'token' ? 30 : 0,
      },
    };

    try {
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer profile');
      }

      setName('');
      setPhone('');
      setStreet('');
      setArea('');
      setCity('');
      await fetchCustomers();
      alert('Customer profile successfully created!');
    } catch (caughtError: unknown) {
      alert(caughtError instanceof Error ? caughtError.message : 'Failed to create customer profile');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-4 mx-auto max-w-7xl lg:grid-cols-3">
      <div className="h-fit p-6 space-y-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="flex gap-2 items-center mb-4 text-xl font-bold text-slate-800">
          <UserPlus className="w-5 h-5 text-blue-600" /> Onboard New Family
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Full Name *</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Phone Number *</label>
            <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="9876543210" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Flat / Street *</label>
              <input type="text" value={street} onChange={(event) => setStreet(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apt 4B" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Area / Locality *</label>
              <input type="text" value={area} onChange={(event) => setArea(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Downtown" />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">City</label>
            <input type="text" value={city} onChange={(event) => setCity(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mumbai" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Milk Variety *</label>
              <select value={milkVariant} onChange={(event) => setMilkVariant(event.target.value as MilkVariant)} className="px-3 py-2 w-full text-sm font-medium bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="NICE">NICE Milk</option>
                <option value="DELITE">DELITE Milk</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Account System *</label>
              <select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as PaymentMode)} className="px-3 py-2 w-full text-sm font-medium bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="postpaid">Postpaid Monthly</option>
                <option value="token">Prepaid Tokens</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Frequency *</label>
              <select value={subType} onChange={(event) => setSubType(event.target.value as SubscriptionType)} className="px-3 py-2 w-full text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="daily">Daily</option>
                <option value="alternate">Alternate</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Liters *</label>
              <input type="number" min="0.1" step="0.1" value={defaultQuantity} onChange={(event) => setDefaultQuantity(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">Rate / L *</label>
              <input type="number" min="0" step="0.01" value={pricePerLiter} onChange={(event) => setPricePerLiter(event.target.value)} className="px-3 py-2 w-full text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="flex justify-center items-center py-2.5 mt-2 w-full text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md transition hover:bg-blue-700">Save Customer Profile</button>
        </form>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Customer Directory ({customers.length})</h2>
          <button type="button" onClick={() => void fetchCustomers()} className="p-2 rounded-xl border border-slate-200 transition hover:bg-slate-50" aria-label="Refresh customers"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl">{error}</div>}

        <div className="pr-2 space-y-3 max-h-[550px] overflow-y-auto">
          {customers.map((customer) => {
            const subscription = customer.subscription;
            const isTokenCustomer = subscription.paymentMode === 'token';

            return (
              <div key={customer._id} className="flex flex-col gap-4 justify-between p-4 bg-slate-50/40 rounded-xl border border-slate-100 transition sm:flex-row sm:items-center hover:border-slate-200">
                <div>
                  <div className="flex gap-2 items-center">
                    <h3 className="text-base font-bold text-slate-800">{customer.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${subscription.milkVariant === 'DELITE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{subscription.milkVariant}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                    <span className="flex gap-1 items-center"><Phone className="w-3 h-3" /> {customer.phone}</span>
                    <span className="flex gap-1 items-center"><MapPin className="w-3 h-3" /> {customer.address.street}, {customer.address.area}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-between items-center pt-2 border-t border-slate-100 sm:pt-0 sm:border-t-0 sm:justify-end">
                  <div className="text-right">
                    <span className="inline-flex gap-1 items-center px-2.5 py-0.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-full"><Milk className="w-3 h-3" /> {subscription.type}: {subscription.defaultQuantity}L</span>
                    {isTokenCustomer ? (
                      <span className={`flex gap-1 items-center mt-1 text-[11px] font-bold ${subscription.remainingTokens <= 5 ? 'text-rose-700' : 'text-emerald-700'}`}><Ticket className="w-3 h-3" /> {subscription.remainingTokens} Tokens Left</span>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Rate: ₹{customer.pricePerLiter}/L</p>
                    )}
                  </div>

                  {isTokenCustomer && (
                    <button type="button" onClick={() => {
                      if (window.confirm(`Load a new 30-day token book for ${customer.name}?`)) {
                        void refillCustomerTokens(customer._id);
                      }
                    }} className="flex gap-1 justify-center items-center p-2 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-sm transition hover:bg-emerald-700">
                      <Ticket className="w-3 h-3" /> +30
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {customers.length === 0 && !loading && <p className="py-8 text-sm text-center text-slate-400">No customers registered yet. Onboard your first house using the form.</p>}
        </div>
      </div>
    </div>
  );
}
