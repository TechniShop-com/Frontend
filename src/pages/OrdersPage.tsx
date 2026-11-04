import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { getMyOrdersApi } from '../services/api';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

const labels: Record<string, string> = { PENDING: 'Oczekuje', PAID: 'Opłacone', SHIPPED: 'Wysłane', COMPLETED: 'Zrealizowane', CANCELLED: 'Anulowane' };

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'login' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) { if (active) setState('login'); return; }
        const result = await getMyOrdersApi();
        if (active) { setOrders(result); setState('ready'); }
      } catch { if (active) setState('error'); }
    };
    void load();
    return () => { active = false; };
  }, []);
  return <div className="max-w-5xl mx-auto w-full px-4 py-10 space-y-6">
    <Link to="/account" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-700"><ArrowLeft size={16}/> Moje konto</Link>
    <div><h1 className="text-3xl font-black tracking-tight">Moje zamówienia</h1><p className="mt-2 text-sm text-slate-500">Historia zamówień przypisanych do Twojego konta.</p></div>
    {state === 'loading' && <p role="status">Wczytywanie zamówień…</p>}
    {state === 'login' && <p>Zaloguj się, aby zobaczyć zamówienia. <Link className="font-bold text-purple-700" to="/login">Zaloguj się</Link></p>}
    {state === 'error' && <p role="alert" className="text-red-700">Nie udało się pobrać zamówień. Spróbuj ponownie później.</p>}
    {state === 'ready' && orders.length === 0 && <div className="rounded-3xl border border-[#EBE6DD] bg-white p-8 text-slate-600"><Package className="mb-4 text-purple-700"/><p>Nie masz jeszcze żadnych zamówień.</p><Link to="/products" className="inline-block mt-3 font-bold text-purple-700">Przejdź do produktów</Link></div>}
    {state === 'ready' && orders.map(order => <details key={order.id} className="rounded-3xl border border-[#EBE6DD] bg-white p-5 sm:p-6">
      <summary className="cursor-pointer font-bold flex flex-wrap items-center justify-between gap-3"><span>Zamówienie #{order.id}<span className="block mt-1 text-sm font-normal text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('pl-PL') : ''}</span></span><span className="text-sm text-purple-700">{labels[order.status] || order.status} · {Number(order.totalPrice).toFixed(2)} zł</span></summary>
      <ul className="mt-5 divide-y divide-[#EBE6DD]">{order.items.map((item, index) => <li key={index} className="py-3 text-sm"><span className="font-bold">{item.product?.title || 'Produkt'}</span><span className="text-slate-500"> · {item.selectedColor} · {item.selectedSize} · {item.quantity} szt.</span></li>)}</ul>
    </details>)}
  </div>;
}
