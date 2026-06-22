import { Bell, ChevronDown, LogOut, Menu, Store } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import TaproLogo from '../branding/TaproLogo';
import { getNavigationForUser } from '../../config/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../store/authSlice';
import { toggleDarkMode } from '../../store/uiSlice';
import { Button, ThemeToggle, classNames } from '../ui';

const AppShell = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <Outlet />;
  }

  const navItems = getNavigationForUser(user);
  const restaurantLabel = user.restaurantId ? `Restaurant ${user.restaurantId}` : 'Platform';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eefbf6_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_20%),linear-gradient(180deg,#020617_0%,#0b1120_100%)] dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-40 flex w-80' : 'hidden'} flex-col border-r border-slate-200 bg-white/95 p-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 xl:static xl:flex xl:w-80`}>
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 text-slate-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-white">
            <TaproLogo size="sm" className="max-w-[240px]" />
            <h2 className="mt-3 text-2xl font-semibold">{user.name}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{user.backendRole.replace('_', ' ')}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-200',
                    isActive
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100'
                      : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white'
                  )
                }
              >
                {item.icon}
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </NavLink>
            ))}
          </nav>
        </aside>
        {mobileOpen ? <button className="fixed inset-0 z-30 bg-slate-950/30 xl:hidden" onClick={() => setMobileOpen(false)} /> : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/86 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 xl:hidden" onClick={() => setMobileOpen((value) => !value)}>
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Tapro Operations</p>
                  <h1 className="text-lg font-semibold text-slate-950 dark:text-white">Operations Workspace</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 md:inline-flex">
                  <Store className="h-4 w-4 text-emerald-600" />
                  {restaurantLabel}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <Bell className="h-4 w-4" />
                </button>
                <ThemeToggle darkMode={darkMode} onToggle={() => dispatch(toggleDarkMode())} />
                <Button variant="ghost" onClick={() => dispatch(logout())} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
