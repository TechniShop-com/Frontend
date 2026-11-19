import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Boxes, ClipboardList, History, LayoutDashboard, Package, Settings, Shield, Tags, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Role = 'admin' | 'staff';
type Tab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'access' | 'history' | 'settings';
type Category = { id: string; name: string };
type Product = { id: string; title: string; description: string; price: number; brand: string; gender: string; colors: unknown; sizes: unknown; imageUrl: string; images: string[]; stock: number | null; category_id: string | null; is_active: boolean };
type Order = { id: string | number; user_id: string; customerName: string; email: string; address: string; paymentMethod: string; totalPrice: number; items: unknown; status: string; createdAt: string; tracking_number: string | null };
type Profile = { id: string; name: string; email: string; is_deleted?: boolean };
type Membership = { user_id: string; role: Role; created_at: string };
type Audit = { id: number; actor_id: string; action: string; table_name: string; record_id: string; created_at: string };
type ProductForm = { id: string; title: string; description: string; price: string; brand: string; gender: string; colors: string; sizes: string; images: string[]; stock: string; category_id: string; is_active: boolean };

const input = 'w-full rounded-xl border border-[#E2DDD3] bg-[#FAF8F5] px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100';
const button = 'inline-flex items-center justify-center rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50';
const secondary = 'inline-flex items-center justify-center rounded-xl border border-[#E2DDD3] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50';
const panel = 'rounded-3xl border border-[#EBE6DD] bg-white p-5 sm:p-6';
const statusLabels: Record<string, string> = { PENDING: 'Oczekuje', PACKED: 'Spakowane', PAID: 'Oznaczone jako opłacone', SHIPPED: 'Wysłane', COMPLETED: 'Zrealizowane', CANCELLED: 'Anulowane' };
const tabs: { id: Tab; label: string; icon: typeof Package; admin?: boolean }[] = [
  { id: 'overview', label: 'Pulpit', icon: LayoutDashboard }, { id: 'products', label: 'Produkty i magazyn', icon: Boxes },
  { id: 'categories', label: 'Kategorie', icon: Tags }, { id: 'orders', label: 'Zamówienia', icon: ClipboardList },
  { id: 'customers', label: 'Klienci', icon: Users }, { id: 'access', label: 'Dostęp i role', icon: Shield, admin: true },
  { id: 'history', label: 'Historia działań', icon: History, admin: true }, { id: 'settings', label: 'Ustawienia sklepu', icon: Settings, admin: true },
];
const emptyForm = (): ProductForm => ({ id: '', title: '', description: '', price: '', brand: 'TECHNI_SCHOOLS', gender: 'UNISEX', colors: '', sizes: '', images: [], stock: '', category_id: '', is_active: true });
const arrayValue = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
  return [];
};
const date = (value: string) => value ? new Date(value).toLocaleString('pl-PL') : '—';
const price = (value: number) => `${Number(value).toFixed(2)} zł`;
const message = (error: unknown) => error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Spróbuj ponownie.';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>;
}

export function AdminPage() {
  const [auth, setAuth] = useState<'loading' | 'login' | 'denied' | 'ready' | 'error'>('loading');
  const [identity, setIdentity] = useState<{ id: string; email: string; role: Role } | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [thresholdInput, setThresholdInput] = useState('5');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<ProductForm | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessRole, setAccessRole] = useState<Role>('staff');
  const authGeneration = useRef(0);
  const authorizedUserId = useRef<string | null>(null);

  const verify = useCallback(async (generation: number) => {
    if (!isSupabaseConfigured) { setAuth('error'); setError('Nie skonfigurowano połączenia z Supabase.'); return; }
    try {
      const { data: session, error: authError } = await supabase.auth.getUser();
      if (generation !== authGeneration.current) return;
      if (authError || !session.user) { setIdentity(null); setAuth('login'); return; }
      const { data, error: roleError } = await supabase.from('admin_users').select('role').eq('user_id', session.user.id).maybeSingle();
      if (generation !== authGeneration.current) return;
      if (roleError) throw roleError;
      if (!data || (data.role !== 'admin' && data.role !== 'staff')) { setIdentity(null); setAuth('denied'); return; }
      authorizedUserId.current = session.user.id;
      setIdentity({ id: session.user.id, email: session.user.email || '', role: data.role }); setAuth('ready');
    } catch (e) { if (generation === authGeneration.current) { setError(message(e)); setAuth('error'); } }
  }, []);

  useEffect(() => {
    let active = true;
    const reset = (hasSession: boolean) => {
      const generation = ++authGeneration.current;
      authorizedUserId.current = null;
      setIdentity(null); setProducts([]); setCategories([]); setOrders([]); setProfiles([]); setMemberships([]); setAudit([]);
      setForm(null); setSelectedOrder(null); setSearch(''); setNotice(''); setError(''); setCategoryName(''); setEditingCategory(null);
      setAccessEmail(''); setAccessRole('staff'); setOrderStatus(''); setTracking(''); setTab('overview'); setLoading(false); setBusy(false);
      setLowStockThreshold(5); setThresholdInput('5');
      setAuth(hasSession ? 'loading' : 'login');
      if (hasSession) window.setTimeout(() => { if (active && generation === authGeneration.current) void verify(generation); }, 0);
    };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id && session.user.id === authorizedUserId.current) return;
      reset(Boolean(session));
    });
    // INITIAL_SESSION normally triggers the listener; this also handles a
    // delayed auth initialization without trusting a locally stored role.
    reset(true);
    return () => { active = false; ++authGeneration.current; data.subscription.unsubscribe(); };
  }, [verify]);

  const load = useCallback(async () => {
    if (!identity) return;
    const generation = authGeneration.current;
    setLoading(true); setError('');
    try {
      const results = await Promise.all([
        supabase.from('Product').select('*').order('createdAt', { ascending: false }),
        supabase.from('product_categories').select('*').order('name'),
        supabase.from('orders').select('*').order('createdAt', { ascending: false }),
        supabase.from('profiles').select('id,name,email,is_deleted').order('name'),
        supabase.from('store_settings').select('low_stock_threshold').eq('id', true).single(),
        ...(identity.role === 'admin' ? [supabase.from('admin_users').select('user_id,role,created_at'), supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)] : []),
      ]);
      if (generation !== authGeneration.current) return;
      for (const result of results) if (result.error) throw result.error;
      setProducts((results[0].data || []) as Product[]); setCategories((results[1].data || []) as Category[]);
      setOrders((results[2].data || []) as Order[]); setProfiles((results[3].data || []) as Profile[]);
      const threshold = Number((results[4].data as { low_stock_threshold: number }).low_stock_threshold);
      setLowStockThreshold(threshold); setThresholdInput(String(threshold));
      if (identity.role === 'admin') { setMemberships((results[5].data || []) as Membership[]); setAudit((results[6].data || []) as Audit[]); }
    } catch (e) { if (generation === authGeneration.current) setError(`Nie udało się wczytać danych panelu: ${message(e)}`); }
    finally { if (generation === authGeneration.current) setLoading(false); }
  }, [identity]);
  useEffect(() => { if (auth === 'ready') void load(); }, [auth, load]);

  const run = async (action: (isCurrent: () => boolean) => Promise<void>, success: string) => {
    const generation = authGeneration.current;
    setBusy(true); setError(''); setNotice('');
    try { await action(() => generation === authGeneration.current); if (generation === authGeneration.current) { setNotice(success); await load(); } }
    catch (e) { if (generation === authGeneration.current) setError(message(e)); }
    finally { if (generation === authGeneration.current) setBusy(false); }
  };
  const openProduct = (product?: Product) => {
    setForm(product ? { id: product.id, title: product.title, description: product.description || '', price: String(product.price), brand: product.brand, gender: product.gender, colors: arrayValue(product.colors).join(', '), sizes: arrayValue(product.sizes).join(', '), images: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [], stock: product.stock == null ? '' : String(product.stock), category_id: product.category_id || '', is_active: product.is_active !== false } : emptyForm());
    setNotice(''); setError('');
  };
  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault(); if (!form) return;
    if (!form.images.length) { setError('Dodaj co najmniej jedno zdjęcie produktu.'); return; }
    const stock = form.stock === '' ? null : Number(form.stock);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) { setError('Stan magazynowy musi być liczbą całkowitą nie mniejszą od zera.'); return; }
    const payload = { title: form.title.trim(), description: form.description.trim(), price: Number(form.price), brand: form.brand, gender: form.gender, colors: JSON.stringify(form.colors.split(',').map(s => s.trim()).filter(Boolean)), sizes: JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)), imageUrl: form.images[0], images: form.images, stock, category_id: form.category_id || null, is_active: form.is_active };
    if (!payload.title || !Number.isFinite(payload.price) || payload.price < 0) { setError('Podaj nazwę i prawidłową cenę.'); return; }
    void run(async isCurrent => {
      const result = form.id ? await supabase.from('Product').update(payload).eq('id', form.id).select('id').single() : await supabase.from('Product').insert({ ...payload, id: crypto.randomUUID() }).select('id').single();
      if (result.error) throw result.error; if (isCurrent()) setForm(null);
    }, 'Produkt zapisany.');
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length || !form) return;
    const generation = authGeneration.current;
    setBusy(true); setError('');
    try {
      for (const file of Array.from(files)) {
        if (generation !== authGeneration.current) return;
        if (!file.type.startsWith('image/')) throw new Error('Wybierz pliki graficzne.');
        const path = `${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        if (generation !== authGeneration.current) return;
        const url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
        setForm(previous => previous ? { ...previous, images: [...previous.images, url] } : previous);
      }
    } catch (e) { if (generation === authGeneration.current) setError(`Nie udało się przesłać kolejnego zdjęcia. Wcześniej przesłane zdjęcia pozostają w formularzu. ${message(e)}`); }
    finally { if (generation === authGeneration.current) setBusy(false); }
  };
  const filteredProducts = useMemo(() => products.filter(p => `${p.title} ${p.id}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const filteredOrders = useMemo(() => orders.filter(o => `${o.id} ${o.customerName} ${o.email}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const customerOrders = (profile: Profile) => orders.filter(o => o.user_id === profile.id);
  const changeTab = (next: Tab) => { setTab(next); setSearch(''); setForm(null); setSelectedOrder(null); setError(''); setNotice(''); };

  if (auth !== 'ready') return <div className="min-h-screen bg-[#FAF7F2] px-5 py-16"><div className="mx-auto max-w-lg space-y-6"><Link to="/"><Logo size="md" /></Link><div className={panel}><h1 className="text-2xl font-black">Panel sklepu</h1>{auth === 'loading' ? <p className="mt-4" role="status">Sprawdzanie dostępu…</p> : auth === 'login' ? <p className="mt-4 text-slate-600">Zaloguj się na konto z dostępem do panelu. <Link className="font-bold text-purple-700" to="/login">Przejdź do logowania</Link></p> : auth === 'denied' ? <p className="mt-4 text-slate-600">To konto nie ma dostępu do panelu.</p> : <p className="mt-4 text-red-700" role="alert">Nie udało się sprawdzić dostępu. {error}</p>}<Link className="mt-6 inline-block text-sm font-bold text-purple-700" to="/">Wróć do sklepu</Link></div></div></div>;

  return <div className="min-h-screen bg-[#FAF7F2] text-slate-900 lg:flex">
    <aside className="border-b border-[#E7E2D8] bg-[#F5F2EB] p-5 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
      <Link to="/" aria-label="TechniShop — wróć do sklepu"><Logo size="md" /></Link><p className="mt-5 text-sm text-slate-500">Panel sklepu</p>
      <nav aria-label="Nawigacja panelu" className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">{tabs.filter(item => !item.admin || identity?.role === 'admin').map(item => <button key={item.id} disabled={busy} onClick={() => changeTab(item.id)} aria-current={tab === item.id ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${tab === item.id ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-white'}`}><item.icon size={18} />{item.label}</button>)}</nav>
      <div className="mt-6 border-t border-[#E2DDD3] pt-4 text-sm text-slate-600"><p className="break-all">{identity?.email}</p><p className="mt-1 text-xs">{identity?.role === 'admin' ? 'Administrator' : 'Pracownik sklepu'}</p><Link to="/" className="mt-4 inline-flex items-center gap-2 font-semibold text-purple-700"><ArrowLeft size={16}/> Wróć do sklepu</Link></div>
    </aside>
    <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-10"><div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-purple-700">TechniShop / Panel sklepu</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{tabs.find(item => item.id === tab)?.label}</h1></div><button className={secondary} onClick={() => void load()} disabled={loading}>Odśwież dane</button></header>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}{loading && <p role="status" className="text-sm text-slate-500">Wczytywanie danych…</p>}
      {tab === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[{ label: 'Nowe zamówienia', value: orders.filter(o => o.status === 'PENDING').length }, { label: `Produkty z niskim stanem (≤ ${lowStockThreshold})`, value: products.filter(p => p.stock != null && p.stock <= lowStockThreshold).length }, { label: 'Produkty bez określonego stanu', value: products.filter(p => p.stock == null).length }].map(stat => <div key={stat.label} className={panel}><p className="text-sm text-slate-600">{stat.label}</p><p className="mt-3 text-3xl font-black">{stat.value}</p></div>)}</div><section className={panel}><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Ostatnie zamówienia</h2><button className="text-sm font-bold text-purple-700" onClick={() => changeTab('orders')}>Wszystkie zamówienia</button></div>{orders.length === 0 ? <p className="mt-5 text-sm text-slate-500">Brak zamówień.</p> : <ul className="mt-3 divide-y divide-[#EBE6DD]">{orders.slice(0, 5).map(order => <li key={order.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>#{order.id} · {order.customerName}</span><span>{statusLabels[order.status] || order.status} · {price(order.totalPrice)}</span></li>)}</ul>}</section></>}
      {tab === 'products' && <>{form ? <form className={`${panel} space-y-5`} onSubmit={saveProduct}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{form.id ? 'Edycja produktu' : 'Nowy produkt'}</h2><button type="button" disabled={busy} className={secondary} onClick={() => setForm(null)}>Anuluj</button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nazwa"><input required className={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></Field><Field label="Cena (zł)"><input required type="number" min="0" step="0.01" className={input} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}/></Field><Field label="Stan magazynowy (puste = nieokreślony)"><input type="number" min="0" step="1" className={input} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}/></Field><Field label="Kategoria"><select className={input} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">Bez kategorii</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Marka"><select className={input} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}><option value="TECHNI_SCHOOLS">Techni Schools</option><option value="TECHNI_ZDALNI">Techni Zdalni</option></select></Field><Field label="Dla kogo"><select className={input} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="UNISEX">Unisex</option><option value="WOMEN">Kobiety</option><option value="MEN">Mężczyźni</option></select></Field><Field label="Kolory, oddzielone przecinkami"><input className={input} value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })}/></Field><Field label="Rozmiary, oddzielone przecinkami"><input className={input} value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })}/></Field></div><Field label="Opis"><textarea className={input} rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></Field><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}/> Produkt widoczny w sklepie</label><div><Field label="Dodaj zdjęcia"><input type="file" accept="image/*" multiple className={input} disabled={busy} onChange={e => { void upload(e.target.files); e.target.value = ''; }}/></Field><p className="mt-2 text-sm text-slate-500">Pierwsze zdjęcie jest zdjęciem głównym.</p><ul className="mt-3 space-y-2">{form.images.map((url, index) => <li key={`${url}-${index}`} className="flex items-center gap-3 rounded-xl border border-[#EBE6DD] p-2"><img src={url} alt={`Zdjęcie produktu ${index + 1}`} className="h-14 w-14 rounded-lg object-cover"/><span className="flex-1 text-sm">Zdjęcie {index + 1}{index === 0 ? ' · główne' : ''}</span>{index > 0 && <button type="button" className={secondary} onClick={() => { const images = [...form.images]; [images[index - 1], images[index]] = [images[index], images[index - 1]]; setForm({ ...form, images }); }}>Wyżej</button>}<button type="button" className={secondary} onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })}>Usuń</button></li>)}</ul></div><button className={button} disabled={busy}>Zapisz produkt</button></form> : <section className={panel}><div className="flex flex-wrap gap-3"><input aria-label="Szukaj produktu" placeholder="Szukaj produktu" className={`${input} max-w-sm`} value={search} onChange={e => setSearch(e.target.value)}/><button className={button} onClick={() => openProduct()}>Dodaj produkt</button></div><div className="mt-5 divide-y divide-[#EBE6DD]">{filteredProducts.length === 0 ? <p className="py-4 text-sm text-slate-500">Brak produktów.</p> : filteredProducts.map(product => <div key={product.id} className="flex flex-wrap items-center gap-4 py-4"><img src={product.imageUrl} alt="" className="h-16 w-16 rounded-xl bg-[#FAF8F5] object-cover"/><div className="min-w-0 flex-1"><p className="font-bold">{product.title}</p><p className="mt-1 text-sm text-slate-500">{price(product.price)} · Stan: {product.stock == null ? 'nieokreślony' : product.stock} · {product.is_active === false ? 'Ukryty' : 'Widoczny'}</p></div><button className={secondary} onClick={() => openProduct(product)}>Edytuj</button></div>)}</div></section>}</>}
      {tab === 'categories' && <section className={`${panel} space-y-5`}><form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); const name = categoryName.trim(); if (!name) return; void run(async isCurrent => { const result = editingCategory ? await supabase.from('product_categories').update({ name }).eq('id', editingCategory).select('id').single() : await supabase.from('product_categories').insert({ name }).select('id').single(); if (result.error) throw result.error; if (isCurrent()) { setCategoryName(''); setEditingCategory(null); } }, 'Kategoria zapisana.'); }}><input aria-label="Nazwa kategorii" required placeholder="Nazwa kategorii" className={`${input} max-w-sm`} value={categoryName} onChange={e => setCategoryName(e.target.value)}/><button className={button} disabled={busy}>{editingCategory ? 'Zapisz' : 'Dodaj kategorię'}</button>{editingCategory && <button type="button" className={secondary} onClick={() => { setEditingCategory(null); setCategoryName(''); }}>Anuluj</button>}</form><ul className="divide-y divide-[#EBE6DD]">{categories.map(category => <li key={category.id} className="flex flex-wrap items-center gap-3 py-3"><span className="flex-1 font-semibold">{category.name}</span><button className={secondary} onClick={() => { setEditingCategory(category.id); setCategoryName(category.name); }}>Edytuj</button><button className={secondary} disabled={busy} onClick={() => { if (window.confirm(`Usunąć kategorię „${category.name}”?`)) void run(async () => { const { error: err } = await supabase.from('product_categories').delete().eq('id', category.id).select('id').single(); if (err) throw err; }, 'Kategoria usunięta.'); }}>Usuń</button></li>)}</ul>{categories.length === 0 && <p className="text-sm text-slate-500">Brak kategorii.</p>}</section>}
      {tab === 'orders' && <>{selectedOrder ? <section className={`${panel} space-y-5`}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Zamówienie #{selectedOrder.id}</h2><p className="text-sm text-slate-500">{date(selectedOrder.createdAt)}</p></div><button className={secondary} onClick={() => setSelectedOrder(null)}>Wróć do listy</button></div><div className="grid gap-5 text-sm sm:grid-cols-2"><div><h3 className="font-bold">Klient i dostawa</h3><p className="mt-2 whitespace-pre-line">{selectedOrder.customerName}\n{selectedOrder.email}\n{selectedOrder.address}</p></div><div><h3 className="font-bold">Zamówienie</h3><p className="mt-2">Kwota: {price(selectedOrder.totalPrice)}</p><p>Wybrana metoda płatności: {selectedOrder.paymentMethod || '—'}</p></div></div><div><h3 className="font-bold">Produkty</h3><ul className="mt-2 divide-y divide-[#EBE6DD]">{(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, index: number) => <li key={index} className="py-2 text-sm">{item.product?.title || 'Produkt'} · {item.selectedColor || '—'} · {item.selectedSize || '—'} · {item.quantity} szt.</li>)}</ul></div><form className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void run(async isCurrent => { const { data, error: err } = await supabase.from('orders').update({ status: orderStatus, tracking_number: tracking.trim() || null }).eq('id', selectedOrder.id).select('*').single(); if (err) throw err; if (isCurrent()) setSelectedOrder(data as Order); }, 'Zamówienie zapisane.'); }}><Field label="Status realizacji"><select className={input} value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>{Object.entries(statusLabels).filter(([value]) => value !== 'PAID' || selectedOrder.status === 'PAID').map(([value, label]) => <option key={value} value={value} disabled={value === 'PAID'}>{label}</option>)}</select></Field><Field label="Numer przesyłki"><input className={input} value={tracking} onChange={e => setTracking(e.target.value)}/></Field><div><button disabled={busy} className={button}>Zapisz zmiany</button></div></form></section> : <section className={panel}><input aria-label="Szukaj zamówienia" placeholder="Szukaj po numerze, kliencie lub e-mailu" className={`${input} max-w-md`} value={search} onChange={e => setSearch(e.target.value)}/><div className="mt-5 divide-y divide-[#EBE6DD]">{filteredOrders.length === 0 ? <p className="py-4 text-sm text-slate-500">Brak zamówień.</p> : filteredOrders.map(order => <div key={order.id} className="flex flex-wrap items-center gap-4 py-4"><div className="flex-1"><p className="font-bold">#{order.id} · {order.customerName}</p><p className="mt-1 text-sm text-slate-500">{date(order.createdAt)} · {statusLabels[order.status] || order.status} · {price(order.totalPrice)}</p></div><button className={secondary} onClick={() => { setSelectedOrder(order); setOrderStatus(order.status); setTracking(order.tracking_number || ''); }}>Szczegóły</button></div>)}</div></section>}</>}
      {tab === 'customers' && <section className={panel}><input aria-label="Szukaj klienta" placeholder="Szukaj klienta" className={`${input} max-w-sm`} value={search} onChange={e => setSearch(e.target.value)}/><div className="mt-5 divide-y divide-[#EBE6DD]">{profiles.filter(p => `${p.name} ${p.email}`.toLowerCase().includes(search.toLowerCase())).map(profile => <details key={profile.id} className="py-4"><summary className="cursor-pointer font-bold">{profile.name} <span className="font-normal text-slate-500">· {profile.email}{profile.is_deleted ? ' · konto nieaktywne' : ''}</span></summary><div className="mt-3 text-sm text-slate-600"><p>Liczba zamówień: {customerOrders(profile).length}</p><ul className="mt-2 space-y-1">{customerOrders(profile).map(order => <li key={order.id}>#{order.id} · {date(order.createdAt)} · {price(order.totalPrice)}</li>)}</ul></div></details>)}{profiles.length === 0 && <p className="py-4 text-sm text-slate-500">Brak klientów.</p>}</div></section>}
      {tab === 'access' && identity?.role === 'admin' && <section className={`${panel} space-y-5`}><p className="text-sm text-slate-600">Dostęp można nadać istniejącemu kontu sklepu.</p><form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); void run(async isCurrent => { const { error: err } = await supabase.rpc('admin_set_access', { p_email: accessEmail.trim(), p_role: accessRole }); if (err) throw err; if (isCurrent()) setAccessEmail(''); }, 'Dostęp zapisany.'); }}><input type="email" required aria-label="E-mail pracownika" placeholder="E-mail konta" className={`${input} max-w-sm`} value={accessEmail} onChange={e => setAccessEmail(e.target.value)}/><select aria-label="Rola" className={`${input} max-w-xs`} value={accessRole} onChange={e => setAccessRole(e.target.value as Role)}><option value="staff">Pracownik sklepu</option><option value="admin">Administrator</option></select><button className={button} disabled={busy}>Nadaj dostęp</button></form><ul className="divide-y divide-[#EBE6DD]">{memberships.map(member => { const profile = profiles.find(p => p.id === member.user_id); return <li key={member.user_id} className="flex flex-wrap items-center gap-3 py-4"><div className="flex-1"><p className="font-bold">{profile?.name || member.user_id}</p><p className="text-sm text-slate-500">{profile?.email || 'Brak profilu'} · {member.role === 'admin' ? 'Administrator' : 'Pracownik sklepu'}</p></div>{member.user_id !== identity.id && <><button disabled={busy} className={secondary} onClick={() => { void run(async () => { const { error: err } = await supabase.rpc('admin_set_role', { p_user_id: member.user_id, p_role: member.role === 'admin' ? 'staff' : 'admin' }); if (err) throw err; }, 'Rola zmieniona.'); }}>Zmień rolę</button><button disabled={busy} className={secondary} onClick={() => { if (window.confirm('Odebrać tej osobie dostęp do panelu?')) void run(async () => { const { error: err } = await supabase.rpc('admin_remove_access', { p_user_id: member.user_id }); if (err) throw err; }, 'Dostęp odebrany.'); }}>Odbierz dostęp</button></>}</li>; })}</ul></section>}
      {tab === 'history' && identity?.role === 'admin' && <section className={panel}><p className="text-sm text-slate-500">Ostatnie 200 zapisanych działań.</p><div className="mt-4 divide-y divide-[#EBE6DD]">{audit.length === 0 ? <p className="py-4 text-sm text-slate-500">Brak zapisanych działań.</p> : audit.map(entry => <div key={entry.id} className="py-3 text-sm"><p className="font-semibold">{entry.action === 'INSERT' ? 'Dodanie' : entry.action === 'UPDATE' ? 'Zmiana' : entry.action === 'DELETE' ? 'Usunięcie' : entry.action} · {entry.table_name} · {entry.record_id}</p><p className="mt-1 text-slate-500">{profiles.find(p => p.id === entry.actor_id)?.email || entry.actor_id} · {date(entry.created_at)}</p></div>)}</div></section>}
      {tab === 'settings' && identity?.role === 'admin' && <section className={panel}><form className="max-w-sm space-y-4" onSubmit={e => { e.preventDefault(); const value = Number(thresholdInput); if (!Number.isInteger(value) || value < 0) { setError('Próg musi być liczbą całkowitą nie mniejszą od zera.'); return; } void run(async () => { const { error: err } = await supabase.from('store_settings').update({ low_stock_threshold: value }).eq('id', true).select('id').single(); if (err) throw err; }, 'Ustawienia zapisane.'); }}><Field label="Próg niskiego stanu magazynowego"><input required type="number" min="0" step="1" className={input} value={thresholdInput} onChange={e => setThresholdInput(e.target.value)}/></Field><p className="text-sm text-slate-500">Produkty o stanie równym lub niższym pojawią się na pulpicie.</p><button className={button} disabled={busy}>Zapisz ustawienia</button></form></section>}
    </div></main>
  </div>;
}
