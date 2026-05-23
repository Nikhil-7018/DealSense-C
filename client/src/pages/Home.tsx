import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '@/api/client';

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url: string;
};

export function Home() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 320);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<{ products: Product[] }>('/api/products/search', { params: { q: debounced } })
      .then((res) => {
        if (!cancelled) setProducts(res.data.products);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-8 shadow-2xl shadow-cyan-900/10">
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          Find the best deal, backed by simple AI trends
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Search products, compare store prices, view history charts, and get a &quot;Buy Now&quot;
          or &quot;Wait&quot; hint from linear regression on recent lows.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search phones, laptops, audio..."
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-slate-100 outline-none ring-cyan-500/30 placeholder:text-slate-500 focus:ring-2 sm:max-w-xl"
          />
          {loading && (
            <span className="text-sm text-cyan-300/80" aria-live="polite">
              Searching…
            </span>
          )}
        </div>
        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white">Results</h2>
        <p className="text-sm text-slate-500">
          {products.length} item{products.length === 1 ? '' : 's'}
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                to={`/product/${p.id}`}
                className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <img
                  src={p.image_url}
                  alt=""
                  className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{p.description}</p>
                  <p className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs text-cyan-200 ring-1 ring-white/10">
                    {p.category}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {!loading && products.length === 0 && (
          <p className="mt-6 text-slate-500">No products match that search. Try another keyword.</p>
        )}
      </section>
    </div>
  );
}
