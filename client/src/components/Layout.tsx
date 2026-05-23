import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/api/client';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    product_id: number;
    product_name: string;
    image_url: string;
    message: string;
    is_read: number;
    created_at: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get<{ unreadCount: number; notifications: any[] }>('/api/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setNotificationError(null);
    } catch (e) {
      setNotificationError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);

    const refreshHandler = () => {
      void loadNotifications();
    };
    window.addEventListener('dealsense:notificationsRefresh', refreshHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('dealsense:notificationsRefresh', refreshHandler);
    };
  }, [user]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      void loadNotifications();
    } catch (e) {
      setNotificationError(getErrorMessage(e));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      void loadNotifications();
    } catch (e) {
      setNotificationError(getErrorMessage(e));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 via-slate-950 to-ink-900">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-display text-lg font-bold text-ink-950 shadow-lg shadow-cyan-500/20">
              D
            </span>
            <div>
              <p className="font-display text-base font-semibold tracking-tight text-white">
                DealSense AI
              </p>
              <p className="text-xs text-slate-400">Smart price comparison</p>
            </div>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={linkClass} end>
              Search
            </NavLink>
            <NavLink to="/wishlist" className={linkClass}>
              Wishlist
            </NavLink>
            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleNotifications}
                    className="rounded-lg border border-white/10 bg-slate-950/70 p-2 text-slate-200 hover:bg-white/5"
                  >
                    <span className="sr-only">Open notifications</span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[0.65rem] font-semibold text-ink-950">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/30">
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Notifications</p>
                          <p className="text-xs text-slate-500">Latest price alerts</p>
                        </div>
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notificationError && (
                          <p className="p-4 text-sm text-red-300">{notificationError}</p>
                        )}
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-slate-400">
                            No notifications yet. Price alerts will appear here.
                          </p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`border-b border-white/5 px-4 py-3 ${
                                notification.is_read === 0 ? 'bg-slate-900' : 'bg-slate-950'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={notification.image_url}
                                  alt=""
                                  className="h-11 w-11 rounded-2xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white">{notification.product_name}</p>
                                  <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                                  <p className="mt-2 text-xs text-slate-500">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {notification.is_read === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => void markAsRead(notification.id)}
                                    className="rounded-full border border-cyan-500/40 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10"
                                  >
                                    Read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className="hidden text-sm text-slate-400 sm:inline">{user.name}</span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-cyan-400"
              >
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        DealSense AI — demo data for learning purposes. Not affiliated with any retailer.
      </footer>
    </div>
  );
}
