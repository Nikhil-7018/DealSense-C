import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

type WishItem = {
  product_id: number;
  name: string;
  description: string;
  category: string;
  image_url: string;
  added_at: string;
  alert_enabled: number;
  alert_target_price: number | null;
};

export function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ items: WishItem[] }>('/api/wishlist');
      setItems(res.data.items);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  async function remove(productId: number) {
    setError(null);
    try {
      await api.delete('/api/wishlist/remove', { data: { productId } });
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  if (authLoading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center">
        <p className="text-slate-300">Sign in to view and manage your wishlist.</p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-ink-950"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-slate-400">Loading wishlist…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Your wishlist</h1>
        <p className="text-sm text-slate-500">{items.length} saved items</p>
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.product_id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-center"
          >
            <img
              src={item.image_url}
              alt=""
              className="h-24 w-24 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link
                to={`/product/${item.product_id}`}
                className="font-medium text-white hover:text-cyan-300"
              >
                {item.name}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.description}</p>
              <p className="mt-2 text-xs text-slate-500">Added {new Date(item.added_at).toLocaleString()}</p>
              {item.alert_enabled ? (
                <p className="mt-2 text-sm text-emerald-300">
                  Price alert set at ₹{item.alert_target_price?.toLocaleString('en-IN')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No price alert set</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void remove(item.product_id)}
              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-950/50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && (
        <p className="text-slate-500">
          Nothing saved yet.{' '}
          <Link to="/" className="text-cyan-400 underline">
            Search products
          </Link>
        </p>
      )}
    </div>
  );
}
