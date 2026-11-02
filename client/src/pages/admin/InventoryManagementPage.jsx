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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-[#B3B3B3] mt-0.5">
            Torches, solar street lights aur zatka machines ka live stock instantly adjust karein.
          </p>
        </div>

        {/* Search */}
        <div className="bg-[#242424] p-4 rounded-xl border border-[#383838] shadow-md flex items-center justify-between text-white">
          <div className="relative w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product inventory search karein..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#444444] bg-[#181818] text-white rounded-lg focus:outline-none focus:border-[#00A9A5]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-[#242424] rounded-2xl border border-[#383838] shadow-md overflow-hidden text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1E1E] border-b border-[#383838] text-[#B3B3B3] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Stock Adjust Karein</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383838]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-gray-400">Inventory load ho rahi hai...</td>
                  </tr>
                ) : filteredProducts.map(p => {
                  const currentQty = editingStock[p.id] ?? p.stockQuantity ?? 0;
                  const isLow = currentQty > 0 && currentQty <= 5;
                  const isOut = currentQty <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#2D2D2D]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.mainImage} alt="" className="w-10 h-10 rounded object-cover bg-gray-50" />
                          <span className="font-bold text-white max-w-[200px] truncate block">
                            {p.title_en}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#B3B3B3]">{p.sku}</td>

                      <td className="py-3 px-4 font-bold text-white">₹{p.price?.toLocaleString('en-IN')}</td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOut
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stockQuantity} Pieces
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStock({ ...editingStock, [p.id]: Math.max(0, currentQty - 1) })}
                            className="w-7 h-7 rounded border border-gray-300 font-bold text-[#B3B3B3] hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={currentQty}
                            onChange={(e) => setEditingStock({ ...editingStock, [p.id]: parseInt(e.target.value, 10) || 0 })}
                            className="w-16 px-2 py-1 text-center font-bold border border-gray-300 rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingStock({ ...editingStock, [p.id]: currentQty + 1 })}
                            className="w-7 h-7 rounded border border-gray-300 font-bold text-[#B3B3B3] hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            savedSuccess[p.id]
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#00A9A5] text-white hover:bg-[#008F8B]'
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
