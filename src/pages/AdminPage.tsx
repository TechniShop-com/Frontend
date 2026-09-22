import React, { useEffect, useState } from 'react';
import { Order, Product, Claim } from '../types';
import { ShieldCheck, Package, ShoppingBag, AlertCircle, Plus, Edit2, Check, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'claims'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  // Selected Order Status Edit
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBrand, setNewBrand] = useState('BOTH');
  const [newCategory, setNewCategory] = useState('Odzież');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVariantSize, setNewVariantSize] = useState('M');
  const [newVariantColor, setNewVariantColor] = useState('Granatowy');
  const [newVariantPrice, setNewVariantPrice] = useState('149.99');
  const [newVariantStock, setNewVariantStock] = useState('20');

  // Claims state
  const [claims, setClaims] = useState<Claim[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAdminOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders', {
        params: {
          fulfillmentStatus: fulfillmentFilter,
          paymentStatus: paymentFilter,
          search: orderSearch,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    }
  };

  const fetchAdminProducts = async () => {
    try {
      const res = await axios.get('/api/products?brand=ALL');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  };

  const fetchAdminClaims = async () => {
    try {
      const res = await axios.get('/api/admin/claims');
      setClaims(res.data);
    } catch (err) {
      console.error('Error fetching admin claims:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchAdminOrders();
    if (activeTab === 'products') fetchAdminProducts();
    if (activeTab === 'claims') fetchAdminClaims();
  }, [activeTab, fulfillmentFilter, paymentFilter, orderSearch]);

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setLoading(true);
    try {
      await axios.patch(`/api/admin/orders/${selectedOrder.id}/status`, {
        fulfillmentStatus: newFulfillmentStatus || undefined,
        paymentStatus: newPaymentStatus || undefined,
        note: statusNote,
      });

      setMessage('Status zamówienia został zaktualizowany.');
      setSelectedOrder(null);
      setStatusNote('');
      fetchAdminOrders();
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variantId: string, currentStock: number) => {
    const newStockStr = prompt('Podaj nowy stan magazynowy (szt.):', currentStock.toString());
    if (newStockStr === null) return;
    const stock = parseInt(newStockStr, 10);
    if (isNaN(stock)) return;

    try {
      await axios.patch(`/api/admin/products/variants/${variantId}`, { stock });
      fetchAdminProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/admin/products', {
        title: newTitle,
        description: newDescription,
        brand: newBrand,
        category: newCategory,
        imageUrl: newImageUrl,
        variants: [
          {
            size: newVariantSize,
            color: newVariantColor,
            price: newVariantPrice,
            stock: newVariantStock,
          },
        ],
      });

      setShowAddProductModal(false);
      setNewTitle('');
      setNewDescription('');
      fetchAdminProducts();
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimStatusChange = async (claimId: string, status: string) => {
    const adminNote = prompt('Dodaj notatkę dla klienta (opcjonalnie):');
    try {
      await axios.patch(`/api/admin/claims/${claimId}`, { status, adminNote });
      fetchAdminClaims();
    } catch (err) {
      console.error('Error updating claim:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Zarządzania TechniShop MVP</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Obsługa Sklepu & CMS MVP</h1>
          <p className="text-xs text-gray-400 mt-1">Zarządzaj realizacją zamówień, stanami magazynowymi oraz zgłoszeniami.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Zamówienia</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'products' ? 'bg-cyan-400 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Magazyn & Oferta</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'claims' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Zwroty & Reklamacje</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
          {message}
        </div>
      )}

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs">
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Status Realizacji</label>
                <select
                  value={fulfillmentFilter}
                  onChange={(e) => setFulfillmentFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none font-medium"
                >
                  <option value="ALL">Wszystkie Statusy</option>
                  <option value="NEW">Nowe</option>
                  <option value="IN_REALIZATION">W realizacji</option>
                  <option value="READY_FOR_PICKUP">Gotowe do odbioru w szkole</option>
                  <option value="SHIPPED">Wysłane</option>
                  <option value="COMPLETED">Zakończone</option>
                  <option value="CANCELLED">Anulowane</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Status Płatności</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none font-medium"
                >
                  <option value="ALL">Wszystkie</option>
                  <option value="PAID">Opłacona (PAID)</option>
                  <option value="PENDING">Oczekuje (PENDING)</option>
                  <option value="FAILED">Nieudana (FAILED)</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Szukaj po numerze TS lub nazwisku..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none w-full sm:w-64"
            />
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Numer Zamówienia</th>
                    <th className="p-4">Klient & Kontakt</th>
                    <th className="p-4">Dostawa</th>
                    <th className="p-4">Kwota</th>
                    <th className="p-4">Status Płatności</th>
                    <th className="p-4">Status Realizacji</th>
                    <th className="p-4 text-right">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{o.customerFirstName} {o.customerLastName}</div>
                        <div className="text-[11px] text-gray-400">{o.customerEmail} | {o.customerPhone}</div>
                      </td>
                      <td className="p-4 font-medium">
                        {o.deliveryMethod === 'SCHOOL_PICKUP' && <span className="text-emerald-600 font-bold">Odbiór w szkole</span>}
                        {o.deliveryMethod === 'PACZKOMAT' && <span>Paczkomat {o.paczkomatCode}</span>}
                        {o.deliveryMethod === 'COURIER' && <span>Kurier</span>}
                      </td>
                      <td className="p-4 font-extrabold text-gray-900">{o.finalAmount.toFixed(2)} zł</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {o.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setNewFulfillmentStatus(o.fulfillmentStatus);
                            setNewPaymentStatus(o.paymentStatus);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] transition-colors"
                        >
                          Edytuj Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="font-bold text-base text-gray-900">
                  Edycja Statusu Zamówienia <span className="font-mono text-emerald-600">{selectedOrder.orderNumber}</span>
                </h3>

                <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status Realizacji *</label>
                    <select
                      value={newFulfillmentStatus}
                      onChange={(e) => setNewFulfillmentStatus(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                    >
                      <option value="NEW">NOWE (NEW)</option>
                      <option value="IN_REALIZATION">W REALIZACJI (IN_REALIZATION)</option>
                      <option value="READY_FOR_PICKUP">GOTOWE DO ODBIORU W SZKOLE (READY_FOR_PICKUP)</option>
                      <option value="SHIPPED">WYSŁANE (SHIPPED)</option>
                      <option value="COMPLETED">ZAKOŃCZONE (COMPLETED)</option>
                      <option value="CANCELLED">ANULOWANE (CANCELLED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status Płatności *</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
                    >
                      <option value="PENDING">OCZEKUJE (PENDING)</option>
                      <option value="PAID">OPŁACONA (PAID)</option>
                      <option value="FAILED">NIEUDANA (FAILED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Notatka zmian w historii (audit log)</label>
                    <input
                      type="text"
                      placeholder="np. Zapakowano i przekazano do sekretariatu Techni Schools"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                    >
                      Zapisz Zmiany
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS & STOCK MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Magazyn i Oferta Produktowa</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj Nowy Produkt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {p.brand}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{p.category}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>

                  {/* Variants List */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Warianty i Stany Magazynowe:
                    </span>
                    {p.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-xl">
                        <span className="font-semibold text-gray-800">
                          {[v.size, v.color].filter(Boolean).join(' / ')} ({v.price.toFixed(2)} zł)
                        </span>
                        <button
                          onClick={() => handleUpdateStock(v.id, v.stock)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px]"
                        >
                          Stan: {v.stock} szt. ✏️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <h3 className="font-bold text-base text-gray-900">Dodaj Nowy Produkt Merch</h3>

                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Tytuł Produktu *</label>
                    <input
                      type="text"
                      required
                      placeholder="np. Bluza Techni Schools Zipper"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Opis *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Opis produktu i materiału..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Marka *</label>
                      <select
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                      >
                        <option value="TECHNI_SCHOOLS">Techni Schools</option>
                        <option value="TECHNI_ZDALNI">Techni Zdalni</option>
                        <option value="BOTH">Obie Marki (BOTH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Kategoria *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                      >
                        <option value="Odzież">Odzież</option>
                        <option value="Akcesoria">Akcesoria</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">URL Zdjęcia</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="font-bold block text-gray-900 mb-2">Pierwszy Wariant:</span>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Rozmiar (np. M)"
                        value={newVariantSize}
                        onChange={(e) => setNewVariantSize(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Kolor"
                        value={newVariantColor}
                        onChange={(e) => setNewVariantColor(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Cena zł"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Stan szt."
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                    >
                      Utwórz Produkt
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLAIMS & RETURNS MANAGEMENT */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Zgłoszenia Zwrotów i Reklamacji</h2>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Data Zgłoszenia</th>
                    <th className="p-4">Zamówienie #</th>
                    <th className="p-4">Typ</th>
                    <th className="p-4">Powód / Uzasadnienie</th>
                    <th className="p-4">Status Zgłoszenia</th>
                    <th className="p-4 text-right">Akcja Admina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                        Brak zgłoszeń zwrotów lub reklamacji.
                      </td>
                    </tr>
                  ) : (
                    claims.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString('pl-PL')}</td>
                        <td className="p-4 font-mono font-bold text-slate-900">{c.order?.orderNumber}</td>
                        <td className="p-4 font-bold">
                          {c.type === 'RETURN' ? (
                            <span className="text-emerald-600">Zwrot (14 dni)</span>
                          ) : (
                            <span className="text-purple-600">Reklamacja</span>
                          )}
                        </td>
                        <td className="p-4 max-w-xs truncate">{c.reason}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            c.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleClaimStatusChange(c.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px]"
                          >
                            Zatwierdź
                          </button>
                          <button
                            onClick={() => handleClaimStatusChange(c.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px]"
                          >
                            Odrzuć
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
