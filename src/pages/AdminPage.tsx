import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Product,
  Order,
  OrderStatus,
  DiscountCoupon,
  ProductReview,
  BrandType,
  GenderType,
} from '../types';
import {
  getProducts,
  updateProductStockApi,
  quickAdjustStockApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getOrdersApi,
  updateOrderStatusApi,
  deleteOrderApi,
  getCouponsApi,
  createCouponApi,
  toggleCouponApi,
  deleteCouponApi,
  getAllReviewsApi,
  deleteReviewApi,
  adminLoginApi,
  verifyAdminSessionApi,
  logoutAdminApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Star,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Printer,
  Boxes,
  Lock,
  LogOut,
  KeyRound,
  FileText,
} from 'lucide-react';

type AdminTab = 'overview' | 'inventory' | 'orders' | 'coupons' | 'reviews' | 'customers';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ==========================================
  // STAN AUTORYZACJI ADMINISTRATORA (GATEWAY)
  // ==========================================
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>('');

  // Formularz logowania admina
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // Główne stany panelu
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtry w magazynie
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryBrandFilter, setInventoryBrandFilter] = useState<string>('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Filtry w zamówieniach
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modale
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Formularz nowego produktu
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('129.99');
  const [newBrand, setNewBrand] = useState<BrandType>('TECHNI_SCHOOLS');
  const [newGender, setNewGender] = useState<GenderType>('UNISEX');
  const [newColors, setNewColors] = useState('Fioletowa, Czarna, Szara');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80');
  const [newStock, setNewStock] = useState('30');

  // Formularz nowego kodu rabatowego
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'>('PERCENTAGE');
  const [newCouponValue, setNewCouponValue] = useState('20');
  const [newCouponDesc, setNewCouponDesc] = useState('Specjalna zniżka dla społeczności Techni');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('0');

  // Flash Notice
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Obsługa logowania do panelu administratora
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthLoading(true);

    try {
      const res = await adminLoginApi(adminEmailInput, adminPasswordInput);
      setIsAdminAuthenticated(true);
      setAdminEmail(res.user.email);
      showNotice(`Witaj w Panelu Zarządzania, ${res.user.email}!`);
    } catch (err: any) {
      setAdminAuthError(err.message || 'Błąd autoryzacji administratora. Sprawdź e-mail i hasło.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Wylogowanie z panelu admina
  const handleAdminLogout = async () => {
    if (window.confirm('Czy na pewno chcesz zablokować panel i wylogować się z sesji administratora?')) {
      await logoutAdminApi();
      setIsAdminAuthenticated(false);
      setAdminPasswordInput('');
      setAdminAuthError(null);
    }
  };

  // Ładowanie realnych danych z bazy/pamięci
  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, ords, coups, revs] = await Promise.all([
        getProducts(),
        getOrdersApi(),
        getCouponsApi(),
        getAllReviewsApi(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCoupons(coups);
      setReviews(revs);
    } catch (err) {
      console.error('Błąd wczytywania danych panelu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Weryfikacja sesji administratora przy wejściu na stronę
    verifyAdminSessionApi()
      .then((sessionUser) => {
        if (sessionUser && sessionUser.role === 'admin') {
          setIsAdminAuthenticated(true);
          setAdminEmail(sessionUser.email);
        } else {
          setIsAdminAuthenticated(false);
        }
      })
      .finally(() => {
        setIsVerifyingSession(false);
      });
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }

    const handleProductsUpdate = () => {
      getProducts().then(setProducts);
    };
    const handleOrdersUpdate = () => {
      getOrdersApi().then(setOrders);
    };
    const handleCouponsUpdate = () => {
      getCouponsApi().then(setCoupons);
    };

    window.addEventListener('technishop_products_updated', handleProductsUpdate);
    window.addEventListener('technishop_orders_updated', handleOrdersUpdate);
    window.addEventListener('technishop_coupons_updated', handleCouponsUpdate);

    return () => {
      window.removeEventListener('technishop_products_updated', handleProductsUpdate);
      window.removeEventListener('technishop_orders_updated', handleOrdersUpdate);
      window.removeEventListener('technishop_coupons_updated', handleCouponsUpdate);
    };
  }, [isAdminAuthenticated]);

  // Statystyki
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  }, [orders]);

  const totalItemsInStock = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock ?? 0) <= 10 && (p.stock ?? 0) > 0);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock ?? 0) === 0);
  }, [products]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING');
  }, [orders]);

  // Filtrowane produkty
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.id.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchBrand = inventoryBrandFilter === 'all' || p.brand === inventoryBrandFilter;
      const stock = p.stock ?? 0;
      let matchStock = true;
      if (inventoryStockFilter === 'in_stock') matchStock = stock > 10;
      if (inventoryStockFilter === 'low_stock') matchStock = stock > 0 && stock <= 10;
      if (inventoryStockFilter === 'out_of_stock') matchStock = stock === 0;

      return matchSearch && matchBrand && matchStock;
    });
  }, [products, inventorySearch, inventoryBrandFilter, inventoryStockFilter]);

  // Filtrowane zamówienia
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase();
      const matchSearch =
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        String(o.id).toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q);
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Klienci zagregowani
  const customersList = useMemo(() => {
    const map = new Map<string, { name: string; email: string; ordersCount: number; totalSpent: number; lastOrder: string }>();
    for (const o of orders) {
      const key = o.email.toLowerCase().trim();
      const existing = map.get(key);
      const price = o.status !== 'CANCELLED' ? o.totalPrice : 0;
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += price;
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = o.createdAt;
        }
      } else {
        map.set(key, {
          name: o.customerName,
          email: o.email,
          ordersCount: 1,
          totalSpent: price,
          lastOrder: o.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Obsługa magazynu
  const handleQuickStock = async (productId: string, delta: number) => {
    try {
      const updated = await quickAdjustStockApi(productId, delta);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showNotice(`Zaktualizowano stan dla "${updated.title}": ${updated.stock} szt.`);
    } catch (err: any) {
      showNotice(`Błąd aktualizacji: ${err.message}`);
    }
  };

  // Obsługa zmiany statusu zamówienia
  const handleStatusChange = async (orderId: string | number, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      showNotice(`Zmieniono status zamówienia #${orderId} na "${newStatus}"`);
    } catch (err: any) {
      showNotice(`Błąd zmiany statusu: ${err.message}`);
    }
  };

  // Obsługa usunięcia zamówienia
  const handleDeleteOrder = async (orderId: string | number) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć zamówienie #${orderId}?`)) return;
    try {
      await deleteOrderApi(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showNotice(`Zamówienie #${orderId} zostało usunięte`);
    } catch (err: any) {
      showNotice(`Błąd usuwania zamówienia: ${err.message}`);
    }
  };

  // Dodawanie nowego produktu
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Podaj nazwę produktu');
      return;
    }

    try {
      const colorsArr = newColors.split(',').map((c) => c.trim()).filter(Boolean);
      const sizesArr = newSizes.split(',').map((s) => s.trim()).filter(Boolean);

      const created = await createProductApi({
        title: newTitle.trim(),
        description: newDescription.trim() || 'Oficjalny produkt TechniShop.',
        price: parseFloat(newPrice) || 89.99,
        brand: newBrand,
        gender: newGender,
        colors: colorsArr.length > 0 ? colorsArr : ['Fioletowa', 'Czarna'],
        sizes: sizesArr.length > 0 ? sizesArr : ['S', 'M', 'L', 'XL'],
        imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        stock: parseInt(newStock, 10) || 50,
      });

      setProducts((prev) => [created, ...prev]);
      setIsAddProductOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewPrice('129.99');
      setNewStock('30');
      showNotice(`Pomyślnie dodano nowy towar: "${created.title}"`);
    } catch (err: any) {
      alert(`Błąd dodawania produktu: ${err.message}`);
    }
  };

  // Edycja produktu
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const updated = await updateProductApi(editingProduct.id, editingProduct);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProduct(null);
      showNotice(`Zaktualizowano produkt "${updated.title}"`);
    } catch (err: any) {
      alert(`Błąd aktualizacji produktu: ${err.message}`);
    }
  };

  // Usuwanie produktu
  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!window.confirm(`Czy na pewno usunąć produkt "${title}"?`)) return;
    try {
      await deleteProductApi(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showNotice(`Usunięto produkt "${title}"`);
    } catch (err: any) {
      showNotice(`Błąd usuwania: ${err.message}`);
    }
  };

  // Dostawa magazynowa
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    try {
      const updated = await quickAdjustStockApi(restockProduct.id, restockAmount);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsRestockModalOpen(false);
      setRestockProduct(null);
      showNotice(`Dostawa przyjęta! Dodano +${restockAmount} szt. dla "${updated.title}" (Łącznie: ${updated.stock} szt.)`);
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    }
  };

  // Kupony
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      const updated = await createCouponApi({
        code: newCouponCode.trim().toUpperCase(),
        type: newCouponType,
        value: parseFloat(newCouponValue) || 10,
        description: newCouponDesc.trim() || 'Promocja TechniShop',
        minOrderValue: parseFloat(newCouponMinOrder) || 0,
      });
      setCoupons(updated);
      setNewCouponCode('');
      showNotice(`Utworzono kod rabatowy: ${newCouponCode.trim().toUpperCase()}`);
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    }
  };

  const handleToggleCoupon = async (code: string) => {
    const updated = await toggleCouponApi(code);
    setCoupons(updated);
    showNotice(`Zmieniono status kodu ${code}`);
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Usunąć kod rabatowy ${code}?`)) return;
    const updated = await deleteCouponApi(code);
    setCoupons(updated);
    showNotice(`Usunięto kod ${code}`);
  };

  // Recenzje
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę opinię?')) return;
    const updated = await deleteReviewApi(reviewId);
    setReviews(updated);
    showNotice('Opinia została usunięta');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> Oczekujące
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3" /> Opłacone
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300">
            <Truck className="w-3 h-3" /> Wysłane
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3" /> Zrealizowane
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3 h-3" /> Anulowane
          </span>
        );
      default:
        return <span className="text-xs font-bold">{status}</span>;
    }
  };

  const getStockIndicator = (stock?: number) => {
    const s = stock ?? 0;
    if (s === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" /> Brak towaru (0)
        </span>
      );
    }
    if (s <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Niski stan ({s})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" /> W magazynie ({s})
      </span>
    );
  };

  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#0C0E14] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Weryfikacja sesji administratora...</span>
        </div>
      </div>
    );
  }

  // ========================================================
  // WIDOK 1: EKRAN LOGOWANIA ADMINISTRATORA (JEŚLI NIEZALOGOWANY)
  // ========================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0E14] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Tło i fioletowa poświata */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-950/50 relative z-10 space-y-6">
          {/* Logo i Tarcza */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 border border-purple-400/30">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-black tracking-widest uppercase mt-2">
              Strefa Zastrzeżona
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">TechniShop Management</h1>
            <p className="text-xs text-slate-400 font-medium">
              Wprowadź poświadczenia dostępowe administratora, aby zarządzać sklepem.
            </p>
          </div>

          {/* Alert Błędu */}
          {adminAuthError && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200 text-xs font-semibold flex items-center gap-2.5 animate-in shake duration-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{adminAuthError}</span>
            </div>
          )}

          {/* Formularz Logowania */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Login / E-mail Administratora
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="admin lub admin@technischools.edu.pl"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Hasło Dostępowe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-98 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {adminAuthLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Autoryzuj i Wejdź do Panelu</span>
                </>
              )}
            </button>
          </form>



          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Wróć do sklepu głównego
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // WIDOK 2: ZALOGOWANY PANEL ADMINISTRATORA (DASHBOARD)
  // ========================================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 pb-20">
      {/* Flash Notice */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-500/30 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-bold">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 text-white border-b border-purple-800/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">TechniShop Admin Hub</h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sesja Autoryzowana
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 font-medium hidden sm:block">
                Zalogowano jako: <strong>{adminEmail}</strong> (Uprawnienia Pełne)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer border border-white/10"
              title="Odśwież dane"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Odśwież</span>
            </button>

            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Sklep</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 active:scale-95 text-xs font-black text-white shadow-sm transition-all cursor-pointer"
              title="Wyloguj i zablokuj panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Wyloguj</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Przegląd (Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Boxes className="w-4 h-4 text-purple-400" />
            <span>Magazyn & Towary</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-500/40 text-purple-200">
              {products.length}
            </span>
            {lowStockProducts.length + outOfStockProducts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white">
                ! {lowStockProducts.length + outOfStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>Wszystkie Zamówienia</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-500/40 text-purple-200">
              {orders.length}
            </span>
            {pendingOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                {pendingOrders.length} nowe
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Kody Rabatowe</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-500/40 text-purple-200">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="w-4 h-4 text-purple-400" />
            <span>Opinie ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'border-purple-400 text-white font-black bg-white/5'
                : 'border-transparent text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Klienci ({customersList.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ======================================================== */}
        {/* TAB 1: PRZEGLĄD (DASHBOARD) */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Całkowity Przychód */}
              <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Przychód Sklepu</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-black">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {totalRevenue.toFixed(2)} zł
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Z {orders.length} zrealizowanych zamówień</span>
                  </div>
                </div>
              </div>

              {/* Wszystkie Zamówienia */}
              <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zamówienia</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-black">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {orders.length}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="text-amber-600">{pendingOrders.length} oczekujących</span>
                    <span>•</span>
                    <span className="text-emerald-600">
                      {orders.filter((o) => o.status === 'COMPLETED').length} zrealizowanych
                    </span>
                  </div>
                </div>
              </div>

              {/* Stan Magazynu */}
              <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stan Magazynowy</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-black">
                    <Boxes className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {totalItemsInStock} <span className="text-sm font-semibold text-slate-500">sztuk</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-700 font-bold">
                    <Package className="w-3.5 h-3.5" />
                    <span>{products.length} aktywnych produktów</span>
                  </div>
                </div>
              </div>

              {/* Alerty Zapasów */}
              <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Braki i Niski Stan</span>
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 font-black">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {lowStockProducts.length + outOfStockProducts.length}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold">
                    <span className="text-red-600">{outOfStockProducts.length} wyprzedanych</span>
                    <span>•</span>
                    <span className="text-amber-600">{lowStockProducts.length} niski stan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Szybkie Akcje */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-950/20">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  Zarządzanie Sklepem TechniShop
                </h3>
                <p className="text-xs text-purple-200/80 font-medium">
                  Dodawaj nową odzież szkolną, przyjmuj dostawy do magazynu i aktualizuj statusy wysyłek.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 active:scale-95 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj Nowy Produkt</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-700/80 hover:bg-purple-700 text-white active:scale-95 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer border border-purple-500/40"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Przejdź do Magazynu</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-700/80 hover:bg-purple-700 text-white active:scale-95 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer border border-purple-500/40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Przejdź do Zamówień</span>
                </button>
              </div>
            </div>

            {/* 2-Kolumnowy Układ: Ostatnie Zamówienia & Produkty z Niskim Stanem */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Ostatnie Zamówienia */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E7E2D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-purple-700" />
                    <h3 className="font-black text-sm text-slate-900 tracking-tight">Ostatnie Zamówienia</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    Wszystkie ({orders.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-semibold">Brak zamówień</div>
                ) : (
                  <div className="divide-y divide-[#F0EDE6] space-y-2">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] p-2 rounded-2xl transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-purple-700">#{order.id}</span>
                            <span className="font-extrabold text-xs text-slate-900">{order.customerName}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {order.items.length} poz. • {Number(order.totalPrice).toFixed(2)} zł •{' '}
                            {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="text-[11px] font-bold bg-[#F4F1EA] border border-[#DDD7CC] rounded-xl px-2 py-1 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="PENDING">Oczekujące</option>
                            <option value="PAID">Opłacone</option>
                            <option value="SHIPPED">Wysłane</option>
                            <option value="COMPLETED">Zrealizowane</option>
                            <option value="CANCELLED">Anulowane</option>
                          </select>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                            title="Szczegóły zamówienia"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Produkty Wymagające Uzupełnienia Magazynu */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E7E2D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-black text-sm text-slate-900 tracking-tight">Wymagają Dostawy</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {lowStockProducts.length + outOfStockProducts.length} pozycji
                  </span>
                </div>

                {lowStockProducts.length + outOfStockProducts.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Wszystkie stany magazynowe są optymalne!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3 bg-[#FAF8F5] border border-[#EBE6DC] rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-11 h-11 rounded-xl object-cover border border-[#DDD7CC] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-black text-xs text-slate-900 truncate">{prod.title}</h4>
                            <div className="mt-0.5">{getStockIndicator(prod.stock)}</div>
                          </div>
                        </div>

                        {/* Szybkie dodawanie sztuk */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleQuickStock(prod.id, 5)}
                            className="px-2 py-1 text-[11px] font-black bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors cursor-pointer"
                            title="Dodaj 5 sztuk"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickStock(prod.id, 20)}
                            className="px-2 py-1 text-[11px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                            title="Dodaj 20 sztuk"
                          >
                            +20
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MAGAZYN & TOWARY (INVENTORY & PRODUCTS) */}
        {/* ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header i Narzędzia Magazynowe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-purple-700" />
                  Magazyn Produktów TechniShop ({products.length} pozycji)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Kontrola zapasów ubrań szkolnych, szybkie dodawanie dostaw, edycja cen i dodawanie nowości.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj Nowy Produkt</span>
                </button>
              </div>
            </div>

            {/* Pasek Wyszukiwania i Filtrów */}
            <div className="bg-white p-4 rounded-3xl border border-[#E7E2D8] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj produktu (nazwa, kod SKU)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <select
                  value={inventoryBrandFilter}
                  onChange={(e) => setInventoryBrandFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">Wszystkie Kolekcje</option>
                  <option value="TECHNI_SCHOOLS">Techni Schools (Stacjonarne)</option>
                  <option value="TECHNI_ZDALNI">Techni Zdalni (Platforma Zdalna)</option>
                </select>
              </div>

              <div>
                <select
                  value={inventoryStockFilter}
                  onChange={(e) => setInventoryStockFilter(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">Wszystkie Stany Magazynowe</option>
                  <option value="in_stock">W Magazynie (&gt; 10 szt.)</option>
                  <option value="low_stock">⚠️ Niski Stan (1 - 10 szt.)</option>
                  <option value="out_of_stock">🚫 Brak w Magazynie (0 szt.)</option>
                </select>
              </div>
            </div>

            {/* Tabela Magazynowa */}
            <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Produkt</th>
                      <th className="py-3 px-4">Kolekcja & Płeć</th>
                      <th className="py-3 px-4">Cena</th>
                      <th className="py-3 px-4">Stan Magazynowy</th>
                      <th className="py-3 px-4 text-center">Szybkie Dodawanie Ilości</th>
                      <th className="py-3 px-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE4] font-medium text-slate-700">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-bold">
                          Nie znaleziono produktów spełniających kryteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          {/* Produkt: Miniatura i Dane */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-12 h-12 rounded-xl object-cover border border-[#DDD7CC] shadow-2xs shrink-0"
                              />
                              <div>
                                <h4 className="font-black text-slate-900 text-xs leading-snug">{product.title}</h4>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.id}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Rozmiary: {product.sizes.join(', ')}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Kolekcja */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                              {product.brand === 'TECHNI_SCHOOLS' ? 'Techni Schools' : 'Techni Zdalni'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{product.gender}</div>
                          </td>

                          {/* Cena */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                            {product.price.toFixed(2)} zł
                          </td>

                          {/* Stan magazynowy */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div>{getStockIndicator(product.stock)}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Dokładnie: <strong className="text-slate-900">{product.stock ?? 0}</strong> szt.
                              </div>
                            </div>
                          </td>

                          {/* Szybkie dodawanie ilości towaru */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleQuickStock(product.id, 1)}
                                className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-purple-100 border border-[#DDD7CC] hover:border-purple-300 text-slate-800 hover:text-purple-700 text-[11px] font-black transition-all cursor-pointer"
                                title="Dodaj 1 sztukę"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleQuickStock(product.id, 5)}
                                className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-purple-100 border border-[#DDD7CC] hover:border-purple-300 text-slate-800 hover:text-purple-700 text-[11px] font-black transition-all cursor-pointer"
                                title="Dodaj 5 sztuk"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickStock(product.id, 10)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black shadow-xs transition-all cursor-pointer"
                                title="Dodaj 10 sztuk (Dostawa)"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleQuickStock(product.id, 50)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-[11px] font-black shadow-xs transition-all cursor-pointer"
                                title="Dodaj 50 sztuk (Duża dostawa)"
                              >
                                +50
                              </button>

                              <button
                                onClick={() => {
                                  setRestockProduct(product);
                                  setRestockAmount(20);
                                  setIsRestockModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-purple-700 transition-colors cursor-pointer"
                                title="Wpisz dowolną liczbę sztuk dostawy"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Akcje */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Link
                                to={`/product/${product.id}`}
                                target="_blank"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Podgląd w sklepie"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                                title="Edytuj produkt"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(product.id, product.title)}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Usuń produkt"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* ======================================================== */}
        {/* TAB 3: ZAMÓWIENIA (ORDERS) */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header i Narzędzia Zamówień */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-700" />
                  Baza Zamówień Uczniów i Nauczycieli ({orders.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Rzeczywiste zamówienia ze sklepu: Paczkomaty InPost, odbiór osobisty w szkole, kurier DPD oraz statusy realizacji.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                  Łącznie: <strong>{orders.length} zamówień</strong>
                </span>
              </div>
            </div>

            {/* Pasek Wyszukiwania i Filtrów Zamówień */}
            <div className="bg-white p-4 rounded-3xl border border-[#E7E2D8] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwisku ucznia, emailu, numerze #ID lub adresie..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">Wszystkie Statusy ({orders.length})</option>
                  <option value="PENDING">🟡 Oczekujące na wpłatę ({orders.filter((o) => o.status === 'PENDING').length})</option>
                  <option value="PAID">🔵 Opłacone ({orders.filter((o) => o.status === 'PAID').length})</option>
                  <option value="SHIPPED">🟣 Wysłane ({orders.filter((o) => o.status === 'SHIPPED').length})</option>
                  <option value="COMPLETED">🟢 Zrealizowane ({orders.filter((o) => o.status === 'COMPLETED').length})</option>
                  <option value="CANCELLED">⚪ Anulowane ({orders.filter((o) => o.status === 'CANCELLED').length})</option>
                </select>
              </div>
            </div>

            {/* Tabela Zamówień */}
            <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Numer & Data</th>
                      <th className="py-3 px-4">Zamawiający (Uczeń / Nauczyciel)</th>
                      <th className="py-3 px-4">Sposób Dostawy / Adres</th>
                      <th className="py-3 px-4">Kwota</th>
                      <th className="py-3 px-4">Status Realizacji</th>
                      <th className="py-3 px-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE4] font-medium text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-bold">
                          Brak zamówień spełniających wybrane kryteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          {/* ID & Data */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs font-black text-purple-700">#{order.id}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Dane Klienta */}
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900 text-xs">{order.customerName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{order.email}</span>
                            </div>
                            {order.phone && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{order.phone}</span>
                              </div>
                            )}
                          </td>

                          {/* Adres i Dostawa */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-[11px] font-bold text-slate-800 truncate" title={order.address}>
                              {order.address}
                            </div>
                            <div className="text-[10px] text-purple-700 font-medium mt-0.5">
                              Płatność: {order.paymentMethod}
                            </div>
                            {order.trackingNumber && (
                              <div className="text-[10px] font-mono text-slate-500">
                                List przewozowy: {order.trackingNumber}
                              </div>
                            )}
                          </td>

                          {/* Wartość */}
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-xs">
                            {Number(order.totalPrice).toFixed(2)} zł
                          </td>

                          {/* Zmiana Statusu */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="text-xs font-bold bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl px-2.5 py-1.5 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                              >
                                <option value="PENDING">🟡 PENDING (Oczekuje na wpłatę)</option>
                                <option value="PAID">🔵 PAID (Opłacone - pakowanie)</option>
                                <option value="SHIPPED">🟣 SHIPPED (Wysłano paczkę)</option>
                                <option value="COMPLETED">🟢 COMPLETED (Odebrane)</option>
                                <option value="CANCELLED">⚪ CANCELLED (Anulowane)</option>
                              </select>
                            </div>
                          </td>

                          {/* Akcje */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Szczegóły</span>
                              </button>

                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Usuń zamówienie"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* ======================================================== */}
        {/* TAB 4: KODY RABATOWE (COUPONS) */}
        {/* ======================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-700" />
                  Kody Rabatowe dla Uczniów Techni Schools
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Zarządzaj kodami promocyjnymi dla społeczności szkolnej i zdalnej.
                </p>
              </div>
            </div>

            {/* Formularz dodania nowego kodu */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7E2D8] shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900">Utwórz Nowy Kod Rabatowy</h3>
              <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Kod Rabatowy</label>
                  <input
                    type="text"
                    placeholder="np. SEMESTR2"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Typ Zniżki</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PERCENTAGE">Procentowa (%)</option>
                    <option value="FIXED">Kwotowa (PLN)</option>
                    <option value="FREE_SHIPPING">Darmowa Dostawa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Wartość</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="20"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Min. Koszyk (zł)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                  >
                    Dodaj Kod
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela Kodów */}
            <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Kod</th>
                    <th className="py-3 px-4">Wartość & Warunki</th>
                    <th className="py-3 px-4">Opis Promocji</th>
                    <th className="py-3 px-4">Wykorzystano</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] font-medium text-slate-700">
                  {coupons.map((coupon) => (
                    <tr key={coupon.code} className="hover:bg-[#FAF8F5]/80">
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-purple-700">
                        {coupon.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {coupon.type === 'PERCENTAGE' && `-${coupon.value}% zniżki`}
                        {coupon.type === 'FIXED' && `-${coupon.value} zł`}
                        {coupon.type === 'FREE_SHIPPING' && 'Darmowa Dostawa'}
                        {coupon.minOrderValue ? ` (od ${coupon.minOrderValue} zł)` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{coupon.description}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{coupon.usageCount || 0} zamówień</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleCoupon(coupon.code)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all ${
                            coupon.active !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {coupon.active !== false ? '✓ Aktywny' : 'Dezaktywowany'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: RECENZJE (REVIEWS) */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  Opinie i Recenzje Uczniów ({reviews.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Prawdziwe recenzje materiałów i ubrań wystawione przez uczniów Techni Schools.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs text-slate-900">{rev.authorName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Produkt ID: {rev.productId}</p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE4D9]">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="font-semibold">{rev.date}</span>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Usuń opinię</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: KLIENCI (CUSTOMERS) */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-700" />
                  Klienci i Uczniowie Sklepu ({customersList.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Rzeczywista baza zamawiających wygenerowana na podstawie zamówień w systemie.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Klient</th>
                    <th className="py-3 px-4">Adres E-mail</th>
                    <th className="py-3 px-4">Liczba Zamówień</th>
                    <th className="py-3 px-4">Łącznie Wydano</th>
                    <th className="py-3 px-4">Ostatnie Zamówienie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] font-medium text-slate-700">
                  {customersList.map((c) => (
                    <tr key={c.email} className="hover:bg-[#FAF8F5]/80">
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{c.email}</td>
                      <td className="py-3.5 px-4 font-bold">{c.ordersCount} zamówień</td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {c.totalSpent.toFixed(2)} zł
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(c.lastOrder).toLocaleDateString('pl-PL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: DODAWANIE NOWEGO PRODUKTU */}
      {/* ======================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E7E2D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">Dodaj Nowy Towar do Magazynu</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nazwa Produktu *</label>
                <input
                  type="text"
                  required
                  placeholder="np. Bluza Hoodie Techni Zip 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Cena (PLN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Początkowy Stan Magazynowy (sztuki) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kolekcja / Marka</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value as BrandType)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="TECHNI_SCHOOLS">Techni Schools (Stacjonarne)</option>
                    <option value="TECHNI_ZDALNI">Techni Zdalni (Edukacja Zdalna)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Płeć / Kategoria</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as GenderType)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MEN">Męskie</option>
                    <option value="WOMEN">Damskie</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dostępne Kolory (po przecinku)</label>
                  <input
                    type="text"
                    value={newColors}
                    onChange={(e) => setNewColors(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dostępne Rozmiary (po przecinku)</label>
                  <input
                    type="text"
                    value={newSizes}
                    onChange={(e) => setNewSizes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Zdjęcia Produktu</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Opis Produktu</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Krótki opis materiału, gramatury i kroju..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E7E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md cursor-pointer"
                >
                  Zapisz i Dodaj do Magazynu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDYCJA PRODUKTU */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E7E2D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">Edytuj Produkt #{editingProduct.id}</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nazwa Produktu</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Cena (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Stan Magazynowy (sztuki)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Zdjęcia</label>
                <input
                  type="url"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Opis</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E7E2D8]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md cursor-pointer"
                >
                  Zapisz Zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SZYBKA DOSTAWA TOWARU (RESTOCK MODAL) */}
      {/* ======================================================== */}
      {isRestockModalOpen && restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E7E2D8] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-purple-700" />
                <h3 className="font-black text-sm text-slate-900">Uzupełnij Zapas Magazynowy</h3>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] flex items-center space-x-3">
              <img
                src={restockProduct.imageUrl}
                alt={restockProduct.title}
                className="w-12 h-12 rounded-xl object-cover border border-[#DDD7CC]"
              />
              <div>
                <h4 className="font-black text-xs text-slate-900">{restockProduct.title}</h4>
                <p className="text-[11px] text-slate-500">
                  Aktualnie w magazynie: <strong className="text-purple-700 font-mono">{restockProduct.stock ?? 0} szt.</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Ile sztuk dostarczono do magazynu?
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-slate-900 font-mono text-base font-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRestockAmount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      restockAmount === num ? 'bg-purple-600 text-white' : 'bg-[#FAF8F5] hover:bg-purple-50 text-slate-700 border border-[#DDD7CC]'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-900 font-medium">
                Nowy stan magazynu po zatwierdzeniu wyniesie:{' '}
                <strong className="font-mono text-sm font-black text-purple-900">
                  {(restockProduct.stock ?? 0) + (restockAmount || 0)} szt.
                </strong>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md cursor-pointer"
                >
                  Zatwierdź Dostawę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SZCZEGÓŁY ZAMÓWIENIA */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E7E2D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-slate-900">Zamówienie #{selectedOrder.id}</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Złożone {new Date(selectedOrder.createdAt).toLocaleString('pl-PL')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Zmiana Statusu na górze */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black text-slate-700">Zmień status realizacji zamówienia:</span>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="text-xs font-bold bg-white border border-[#DDD7CC] rounded-xl px-3 py-1.5 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                >
                  <option value="PENDING">🟡 PENDING (Oczekuje na wpłatę)</option>
                  <option value="PAID">🔵 PAID (Opłacone - do spakowania)</option>
                  <option value="SHIPPED">🟣 SHIPPED (Wysłano paczkę)</option>
                  <option value="COMPLETED">🟢 COMPLETED (Pomyślnie odebrane)</option>
                  <option value="CANCELLED">⚪ CANCELLED (Anulowane)</option>
                </select>
              </div>
            </div>

            {/* Dane Klienta & Dostawa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[#EAE4D9] space-y-2">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-700" />
                  Dane Odbiorcy
                </h4>
                <div className="space-y-1 text-slate-600">
                  <p>
                    <strong>Imię i nazwisko:</strong> {selectedOrder.customerName}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {selectedOrder.email}
                  </p>
                  {selectedOrder.phone && (
                    <p>
                      <strong>Telefon:</strong> {selectedOrder.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EAE4D9] space-y-2">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-700" />
                  Dostawa i Płatność
                </h4>
                <div className="space-y-1 text-slate-600">
                  <p>
                    <strong>Adres dostawy:</strong> {selectedOrder.address}
                  </p>
                  <p>
                    <strong>Płatność:</strong> {selectedOrder.paymentMethod}
                  </p>
                  {selectedOrder.trackingNumber && (
                    <p>
                      <strong>Nr przesyłki:</strong> {selectedOrder.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pozycje Zamówienia */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                Zawartość Koszyka ({selectedOrder.items.length} pozycji)
              </h4>

              <div className="divide-y divide-[#EFECE4] border border-[#EAE4D9] rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAF8F5]">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#DDD7CC] shrink-0"
                      />
                      <div>
                        <h5 className="font-black text-xs text-slate-900">{item.product.title}</h5>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Kolor: <strong className="text-slate-800">{item.selectedColor}</strong> • Rozmiar:{' '}
                          <strong className="text-slate-800">{item.selectedSize}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-black text-slate-900">
                        {(item.product.price * item.quantity).toFixed(2)} zł
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} x {item.product.price.toFixed(2)} zł
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Podsumowanie Kwotowe */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Łączna kwota zamówienia:</span>
              <span className="text-xl font-mono font-black text-purple-700">
                {Number(selectedOrder.totalPrice).toFixed(2)} zł
              </span>
            </div>

            {/* Przyciski Akcji */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Drukuj kartę zamówienia</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPage;
