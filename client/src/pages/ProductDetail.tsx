import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

type CurrentPrice = {
  storeId: number;
  storeName: string;
  storeSlug: string;
  price: number;
  recordedAt: string;
  isLowest: boolean;
};

type PricesResponse = {
  product: {
    id: number;
    name: string;
    description: string;
    category: string;
    url?: string;
    image_url: string;
  };
  currentPrices: CurrentPrice[];
  chartData: Record<string, string | number>[];
  chartStoreKeys: string[];
};

type PredictResponse = {
  predictedPrice: number | null;
  recommendation: 'Buy Now' | 'Wait';
  trend: string;
  rationale: string;
  forecastDays: number;
  slopePerDay: number;
};

type AlertStatus = {
  alertEnabled: boolean;
  alertTargetPrice: number | null;
};

const CHART_COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'];

export function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const { user } = useAuth();

  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [predict, setPredict] = useState<PredictResponse | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishMessage, setWishMessage] = useState<string | null>(null);
  const [priceMessage, setPriceMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const loadPrices = useCallback(async () => {
    if (!Number.isInteger(productId) || productId < 1) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PricesResponse>(`/api/prices/${productId}`);
      setPrices(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadPredict = useCallback(async () => {
    setPredLoading(true);
    try {
      const res = await api.get<PredictResponse>(`/api/predict/${productId}`);
      setPredict(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setPredLoading(false);
    }
  }, [productId]);

  const loadAlertStatus = useCallback(async () => {
    if (!user) {
      setAlertStatus(null);
      return;
    }
    try {
      const res = await api.get<AlertStatus>('/api/wishlist/alert', {
        params: { productId },
      });
      setAlertStatus(res.data);
      setTargetPriceInput(res.data.alertTargetPrice?.toString() ?? '');
    } catch (e) {
      const message = getErrorMessage(e);
      if (!message.toLowerCase().includes('not found')) {
        setError(message);
      }
      setAlertStatus(null);
    }
  }, [productId, user]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  useEffect(() => {
    if (!user) {
      setAlertStatus(null);
      return;
    }
    void loadAlertStatus();
  }, [loadAlertStatus, user]);

  const chartData = useMemo(() => prices?.chartData ?? [], [prices]);
  const storeKeys = useMemo(() => prices?.chartStoreKeys ?? [], [prices]);

  async function toggleWishlist() {
    setWishMessage(null);
    if (!user) {
      setWishMessage('Sign in to use the wishlist.');
      return;
    }
    try {
      await api.post('/api/wishlist/add', { productId });
      setWishMessage('Saved to wishlist.');
    } catch (e) {
      setWishMessage(getErrorMessage(e));
    }
  }

  async function updatePriceFromUrl() {
    setPriceMessage(null);
    setError(null);
    setFetchingPrice(true);
    try {
      await api.get(`/api/fetch-price/${productId}`);
      await loadPrices();
      window.dispatchEvent(new Event('dealsense:notificationsRefresh'));
      setPriceMessage('Latest price saved under Live Fetch.');
    } catch (e) {
      setPriceMessage(getErrorMessage(e));
    } finally {
      setFetchingPrice(false);
    }
  }

  async function saveAlert(enabled: boolean) {
    setAlertMessage(null);
    setError(null);
    setAlertLoading(true);
    try {
      const targetPrice = enabled ? Number(targetPriceInput) : null;
      if (enabled && (!Number.isFinite(targetPrice) || targetPrice <= 0)) {
        setAlertMessage('Enter a valid target price to enable alerts.');
        return;
      }

      const res = await api.patch('/api/wishlist/alert', {
        productId,
        enabled,
        targetPrice,
      });
      setAlertStatus({
        alertEnabled: res.data.alertEnabled,
        alertTargetPrice: res.data.alertTargetPrice,
      });
      setAlertMessage(enabled ? 'Price alert enabled.' : 'Price alert disabled.');
    } catch (e) {
      setAlertMessage(getErrorMessage(e));
    } finally {
      setAlertLoading(false);
    }
  }

  if (loading) {
    return (
      <p className="text-slate-400" aria-live="polite">
        Loading product…
      </p>
    );
  }

  if (error || !prices) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-200">
        {error || 'Not found'}{' '}
        <Link to="/" className="underline">
          Back home
        </Link>
      </div>
    );
  }

  const { product, currentPrices } = prices;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <img
          src={product.image_url}
          alt=""
          className="h-64 w-full rounded-2xl object-cover lg:w-72"
        />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cyan-300/90">
              {product.category}
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-white">{product.name}</h1>
            <p className="mt-3 text-slate-400">{product.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadPredict()}
              disabled={predLoading}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {predLoading ? 'Analyzing…' : 'Run AI prediction'}
            </button>
            <button
              type="button"
              onClick={() => void updatePriceFromUrl()}
              disabled={fetchingPrice}
              className="rounded-xl border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60"
            >
              {fetchingPrice ? 'Updating…' : 'Update Price'}
            </button>
            <button
              type="button"
              onClick={() => void toggleWishlist()}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/5"
            >
              Add to wishlist
            </button>
          </div>
          {user && (
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Price drop alert</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Set a target price and get notified when this item drops below that threshold.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    alertStatus?.alertEnabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {alertStatus?.alertEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1">
                  <span className="sr-only">Target price</span>
                  <input
                    type="number"
                    min={1}
                    value={targetPriceInput}
                    onChange={(event) => setTargetPriceInput(event.target.value)}
                    placeholder="Target price (₹)"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void saveAlert(true)}
                  disabled={alertLoading}
                  className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {alertLoading ? 'Saving…' : 'Enable alert'}
                </button>
                <button
                  type="button"
                  onClick={() => void saveAlert(false)}
                  disabled={alertLoading || !alertStatus?.alertEnabled}
                  className="rounded-xl border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60"
                >
                  Disable alert
                </button>
              </div>
              {alertStatus?.alertEnabled && alertStatus.alertTargetPrice != null && (
                <p className="mt-3 text-sm text-emerald-300">
                  Alert targets ₹{alertStatus.alertTargetPrice.toLocaleString('en-IN')}.
                </p>
              )}
              {alertMessage && (
                <p className="mt-3 text-sm text-cyan-200" aria-live="polite">
                  {alertMessage}
                </p>
              )}
            </div>
          )}
          {priceMessage && (
            <p className="text-sm text-cyan-200" aria-live="polite">
              {priceMessage}
            </p>
          )}
          {wishMessage && (
            <p className="text-sm text-cyan-200" aria-live="polite">
              {wishMessage}
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold text-white">Store prices</h2>
        <p className="text-sm text-slate-500">
          Includes <strong className="text-slate-300">Live Fetch</strong> (scraped from the product
          URL). Lowest price is highlighted.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {currentPrices.map((cp) => (
            <div
              key={cp.storeId}
              className={`rounded-2xl border p-4 ${
                cp.isLowest
                  ? 'border-emerald-400/50 bg-emerald-500/10 ring-1 ring-emerald-400/30'
                  : 'border-white/10 bg-slate-900/70'
              }`}
            >
              <p className="text-sm text-slate-400">{cp.storeName}</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                ₹{cp.price.toLocaleString('en-IN')}
              </p>
              {cp.isLowest && (
                <p className="mt-2 text-xs font-medium text-emerald-300">Lowest right now</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white">Price history</h2>
        <div className="mt-4 h-80 w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          {chartData.length === 0 ? (
            <p className="text-slate-500">No historical points yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `₹${Number(v) / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                {storeKeys.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="font-display text-xl font-semibold text-white">AI outlook</h2>
        {!predict && (
          <p className="mt-3 text-sm text-slate-400">
            Run a prediction to estimate the next-week low and whether to buy now or wait.
          </p>
        )}
        {predict && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Recommendation</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  predict.recommendation === 'Buy Now' ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {predict.recommendation}
              </p>
              <p className="mt-2 text-sm text-slate-400">{predict.rationale}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Forecast ({predict.forecastDays}d) — min series
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {predict.predictedPrice != null
                  ? `₹${predict.predictedPrice.toLocaleString('en-IN')}`
                  : '—'}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Trend: <span className="text-slate-200">{predict.trend}</span> · slope{' '}
                {Number.isFinite(predict.slopePerDay)
                  ? predict.slopePerDay.toFixed(2)
                  : '0.00'}{' '}
                / step
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
