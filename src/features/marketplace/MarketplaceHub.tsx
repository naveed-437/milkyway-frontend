import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PackagePlus, LayoutGrid, Award, ShieldCheck, Flame, ShoppingBag, Plus } from 'lucide-react';

type ProductCategory = 'Dairy' | 'Spices' | 'Sweets' | 'Groceries' | 'Other';

const categoryStyles: Record<ProductCategory, string> = {
  Dairy: 'bg-blue-50 text-blue-700 border-blue-100',
  Spices: 'bg-rose-50 text-rose-700 border-rose-100',
  Sweets: 'bg-amber-50 text-amber-700 border-amber-100',
  Groceries: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function MarketplaceHub() {
  const { products, fetchProducts, customers, addNewProduct } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<'store' | 'portfolio'>('store');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Dairy');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('10');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalLitersServed = customers.reduce((acc, customer) => {
    const quantity = customer.subscription?.defaultQuantity || 0;
    return acc + quantity * 30;
  }, 12450);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || !unit.trim()) {
      alert('Please fill out all product details');
      return;
    }

    try {
      await addNewProduct({
        name: name.trim(),
        category,
        price: Number(price),
        unit: unit.trim(),
        stockAvailable: Number(stock || 0),
      });

      alert('🎉 Product successfully saved to the marketplace!');
      setName('');
      setPrice('');
      setStock('10');
    } catch (err: any) {
      alert(err.message || 'Unable to add product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 max-w-md mx-auto shadow-inner">
        <button
          onClick={() => setActiveSubTab('store')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
            activeSubTab === 'store' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Dad's Product Store
        </button>
        <button
          onClick={() => setActiveSubTab('portfolio')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
            activeSubTab === 'portfolio' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" /> Achievements Portfolio
        </button>
      </div>

      {activeSubTab === 'store' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-blue-600" /> Catalog New Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  placeholder="Fresh Ghee, Eggs, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Spices">Spices</option>
                    <option value="Sweets">Sweets</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Type *</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    placeholder="kg, packet, litre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rate (₹ Price) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-md transition duration-150"
              >
                Inject into Marketplace
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-extrabold text-slate-800 text-base">Active Store Marketplace</h3>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500 font-bold">
                Total Items: {products.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-md hover:border-slate-200/60 transition flex flex-col justify-between h-44 relative overflow-hidden group"
                >
                  <div className="space-y-1.5">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase ${categoryStyles[item.category] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {item.category}
                    </span>
                    <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition truncate mt-1">
                      {item.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-400">
                      Stock Availability:{' '}
                      <span className={`font-bold ${item.stockAvailable <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.stockAvailable} {item.unit}s left
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Value</span>
                      <h5 className="text-xl font-black text-slate-900">
                        ₹{item.price}
                        <span className="text-xs font-bold text-slate-400"> / {item.unit}</span>
                      </h5>
                    </div>
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm active:scale-95">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Our Achievements & Legacy</h2>
            <p className="text-xs text-slate-400">
              Serving our neighborhood houses daily with fresh cold-chain dairy supplies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Liters Supplied</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalLitersServed.toLocaleString()}+ L</h3>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Daily Streaks</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">365+ Days</h3>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quality Score</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">100% Pure</h3>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">Operational Timeline</h3>
            {[{ time: '5:00 AM', title: 'Supplier Vehicle Intake', text: 'Bulk stock is tested, logged, and moved safely into cold-chain freezers immediately.' }, { time: '6:00 AM', title: 'Town Area Doorstep Runs', text: 'Deliveries deploy sectioned street-by-street (AMBUR Zone) using geospatial maps tracking coordinates.' }, { time: 'Month End', title: 'Digital Invoicing Delivery', text: 'Statements compile autonomously, passing safe receipt summaries straight to client WhatsApp chats.' }].map((item) => (
              <div key={item.time} className="flex gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="min-w-[72px] text-xs font-black text-blue-700 uppercase tracking-wider pt-1">{item.time}</div>
                <div>
                  <p className="font-black text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">Customer Endorsements</h3>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-sm text-slate-700 italic">"The token book is so convenient. My children love the morning DELITE milk variant!"</p>
              <span className="mt-2 block text-xs font-bold text-slate-500">— Ambur Resident (Apt 4B)</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-sm text-slate-700 italic">"Invoices are incredibly accurate. Getting our statement summary via WhatsApp makes payments easy."</p>
              <span className="mt-2 block text-xs font-bold text-slate-500">— Market Area House</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
