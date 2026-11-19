import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export function UnavailableCartNotice() {
  const { unavailableCount, removeUnavailableItems } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!unavailableCount) return null;
  const remove = async () => {
    setBusy(true); setError('');
    try { await removeUnavailableItems(); }
    catch { setError('Nie udało się usunąć niedostępnych pozycji. Spróbuj ponownie.'); }
    finally { setBusy(false); }
  };
  return <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
    <p>W koszyku {unavailableCount === 1 ? 'jest niedostępny produkt' : `są niedostępne produkty (${unavailableCount})`}. Usuń niedostępne pozycje, aby kontynuować zakupy.</p>
    <button type="button" disabled={busy} onClick={() => void remove()} className="mt-2 font-bold underline disabled:opacity-50">{busy ? 'Usuwanie…' : 'Usuń niedostępne pozycje'}</button>
    {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
  </div>;
}
