import React, { useState, useEffect } from 'react';
import { Boxes, Search, Check, AlertTriangle, ArrowUpDown } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { api } from '../../services/api.js';

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState({});
  const [savedSuccess, setSavedSuccess] = useState({});

  const fetchProducts = () => {
    setLoading(true);
    api.getProducts({ limit: 100 })
      .then(res => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
          const initialStock = {};
          res.products.forEach(p => {
            initialStock[p.id] = p.stockQuantity ?? 0;
          });
          setEditingStock(initialStock);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener('meh_data_synced', fetchProducts);
    window.addEventListener('focus', fetchProducts);
    return () => {
      window.removeEventListener('meh_data_synced', fetchProducts);
      window.removeEventListener('focus', fetchProducts);
    };
  }, []);

  const handleStockUpdate = async (productId) => {
    const qty = Number(editingStock[productId]);
    if (isNaN(qty) || qty < 0) return;

    try {
      await api.updateStock(productId, qty);
      setSavedSuccess(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setSavedSuccess(prev => ({ ...prev, [productId]: false }));
      }, 2000);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error updating stock');
    }
  };

  const filteredProducts = products.filter(p =>
    !search ||
    p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 text-[#252A25]">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#171C17]">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-[#252A25] mt-0.5">
            Torches, solar street lights aur zatka machines ka live stock instantly adjust karein.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-[#D5DDD2] shadow-sm flex items-center justify-between text-[#252A25]">
          <div className="relative w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product inventory search karein..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5DDD2] bg-white text-[#171C17] placeholder-[#596358] rounded-xl focus:outline-none focus:border-[#24532F] focus:ring-1 focus:ring-[#24532F]"
            />
            <Search className="w-4 h-4 text-[#596358] absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-[#D5DDD2] shadow-sm overflow-hidden text-[#252A25]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E6] border-b border-[#D5DDD2] text-[#596358] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Stock Adjust Karein</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDD2]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-[#596358]">Inventory load ho rahi hai...</td>
                  </tr>
                ) : filteredProducts.map(p => {
                  const currentQty = editingStock[p.id] ?? p.stockQuantity ?? 0;
                  const isLow = currentQty > 0 && currentQty <= 5;
                  const isOut = currentQty <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.mainImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#FAF9F6] border border-[#D5DDD2]" />
                          <span className="font-bold text-[#171C17] max-w-[200px] truncate block">
                            {p.title_en}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#596358]">{p.sku}</td>

                      <td className="py-3 px-4 font-bold text-[#171C17]">₹{p.price?.toLocaleString('en-IN')}</td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          isOut
                            ? 'bg-[#B94343]/15 text-[#B94343]'
                            : isLow
                            ? 'bg-[#FAF9F6] text-[#B7791F] border border-[#B7791F]/30'
                            : 'bg-[#DCE8D5] text-[#183D22]'
                        }`}>
                          {p.stockQuantity} Pieces
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStock({ ...editingStock, [p.id]: Math.max(0, currentQty - 1) })}
                            className="w-7 h-7 rounded-lg border border-[#D5DDD2] bg-[#FAF9F6] font-bold text-[#171C17] hover:bg-[#F3F0E6] transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={currentQty}
                            onChange={(e) => setEditingStock({ ...editingStock, [p.id]: parseInt(e.target.value, 10) || 0 })}
                            className="w-16 px-2 py-1 text-center font-bold border border-[#D5DDD2] bg-white text-[#171C17] rounded-lg text-xs focus:outline-none focus:border-[#24532F]"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingStock({ ...editingStock, [p.id]: currentQty + 1 })}
                            className="w-7 h-7 rounded-lg border border-[#D5DDD2] bg-[#FAF9F6] font-bold text-[#171C17] hover:bg-[#F3F0E6] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            savedSuccess[p.id]
                              ? 'bg-[#2E7D46] text-white'
                              : 'bg-[#24532F] text-white hover:bg-[#183D22]'
                          }`}
                        >
                          {savedSuccess[p.id] ? '✓ Stock Update Ho Gaya' : 'Stock Update Karein'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
