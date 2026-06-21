import { ArrowRight, Building2, ChartNoAxesCombined, Check, CirclePlay, Clock3, QrCode, ScanLine, Sparkles, Star, Store, Users, UtensilsCrossed } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryService, menuService, orderService, restaurantService, tableService } from '../api/services';
import TaproLogo from '../components/branding/TaproLogo';
import { ImageWithFallback, initialsFromName } from '../components/shared/ImageWithFallback';
import { useAppDispatch, useAppSelector, useAsyncResource } from '../hooks';
import { addToCart, clearCart, removeFromCart, updateQuantity } from '../store/cartSlice';
import { Button, Card, EmptyState, Input, OrderItemsList, PageHeader, Select, StatusBadge } from '../components/ui';
import { Category, MenuItem } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

const heroImages = {
  chef: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
  dining: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  phone: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
};

const landingLogoSrc = '/assets/tapro-logo.svg';
const landingHeroSrc = '/assets/tapro-hero.png';
const landingHeroFallbackSrc = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80';

type CategoryOption = {
  value: string;
  label: string;
  count: number;
};

const FALLBACK_CATEGORY_LABEL = 'Uncategorized';
const FALLBACK_RESTAURANT_NAME = 'Restaurant Menu';

const toCategoryLookup = (categories?: Category[] | null) =>
  new Map((categories || []).map((category) => [category.id, category.name]));

const resolveCategoryLabel = (item: MenuItem, categoryLookup: Map<number, string>) => {
  const directName = item.categoryName?.trim();
  if (directName) {
    return directName;
  }

  const mappedName = categoryLookup.get(item.categoryId)?.trim();
  if (mappedName) {
    return mappedName;
  }

  return FALLBACK_CATEGORY_LABEL;
};

const resolveCategoryValue = (item: MenuItem) => (item.categoryId ? String(item.categoryId) : 'uncategorized');
const resolveRestaurantName = (name?: string | null) => name?.trim() || FALLBACK_RESTAURANT_NAME;
const resolveRestaurantDescription = (description?: string | null) =>
  description?.trim() || 'Welcome. Browse the menu and order straight to your table.';
const resolveTableLabel = (tableNumber?: string | null) => {
  const normalized = tableNumber?.trim();
  return normalized ? `Table ${normalized}` : 'Your table';
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const [ctaEmail, setCtaEmail] = useState('');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,78,85,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_26%),linear-gradient(180deg,#fffefb_0%,#f6f7f3_100%)] px-4 py-4 text-slate-950">
      <div className="mx-auto max-w-[1560px] rounded-[40px] border border-white/70 bg-white/88 p-4 shadow-[0_45px_120px_rgba(15,23,42,0.12)] backdrop-blur md:p-6">
        <header className="landing-navbar flex flex-col gap-5 rounded-[30px] border border-slate-200/80 bg-white md:flex-row md:items-center md:justify-between">
          <div className="logo-wrapper landing-brand">
            <img src={landingLogoSrc} alt="Tapro logo" className="tapro-logo tapro-logo-navbar" />
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600 md:gap-6">
            <a href="#how-it-works" className="transition hover:text-slate-950">How It Works</a>
            <a href="#features" className="transition hover:text-slate-950">Features</a>
            <a href="#operators" className="transition hover:text-slate-950">Teams</a>
            <a href="#contact" className="transition hover:text-slate-950">Contact</a>
            <Link to="/login" className="nav-login">
              Login
            </Link>
            <Link to="/register" className="nav-cta">
              Get Started
            </Link>
          </nav>
        </header>

        <section className="mt-4 rounded-[34px] border border-slate-900/10 bg-[#03292d] p-3 shadow-[0_25px_80px_rgba(3,41,45,0.18)]">
          <div
            className="hero-section relative overflow-hidden rounded-[30px] px-6 pb-8 pt-6 md:min-h-[720px] md:px-10 md:pb-10"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(3,22,22,0.92) 0%, rgba(3,22,22,0.76) 46%, rgba(3,22,22,0.42) 100%), url(${landingHeroSrc}), url(${landingHeroFallbackSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%)]" />
            <div className="relative flex flex-col gap-10">
              <div className="flex flex-col gap-4 border-b border-white/12 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="logo-wrapper landing-logo rounded-full border border-white/15 bg-white/92 px-4 py-2 shadow-lg shadow-slate-950/10">
                  <img src={landingLogoSrc} alt="Tapro logo" className="tapro-logo tapro-logo-hero" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/84">
                  <div className="hero-pill border border-white/14 bg-slate-950/24 px-4 py-2.5 text-white/88">
                    <span className="round-icon bg-white/10 text-[#F59E0B]">
                      <CirclePlay className="h-4 w-4" />
                    </span>
                    <span>See how Tapro works</span>
                  </div>
                  <Link to="/login" className="hero-pill bg-white px-5 py-2.5 font-medium text-slate-950 transition hover:bg-slate-100">
                    View Demo
                    <span className="round-icon bg-slate-950 text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
                <div className="max-w-3xl pt-4 md:pt-10 lg:pt-16">
                  <p className="text-[11px] uppercase tracking-[0.36em] text-[#F7C15B]">Restaurant SaaS for modern service</p>
                  <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                    QR ordering made simple for modern restaurants
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/88 md:text-lg">
                    Tapro helps restaurants manage QR table ordering, live kitchen updates, menus, staff, and multi-branch operations from one clean platform.
                  </p>

                  <form
                    className="mt-8 flex flex-col gap-3 rounded-[30px] bg-white/96 p-3 shadow-[0_20px_40px_rgba(2,20,23,0.28)] sm:flex-row sm:items-center"
                    onSubmit={(event) => {
                      event.preventDefault();
                      navigate('/register');
                    }}
                  >
                    <input
                      type="email"
                      autoComplete="email"
                      value={ctaEmail}
                      onChange={(event) => setCtaEmail(event.target.value)}
                      placeholder="Email address"
                      className="min-w-0 flex-1 rounded-full border border-transparent bg-transparent px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-200"
                    />
                    <button
                      type="submit"
                      className="hero-pill justify-center bg-[#F59E0B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#EA8A00]"
                    >
                      Get Started
                    </button>
                  </form>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/82">
                    <Link to="/login" className="hero-pill border border-white/14 bg-slate-950/24 px-4 py-2.5 text-white transition hover:bg-slate-950/34">
                      <span className="round-icon bg-white/10 text-[#F7C15B]">
                        <CirclePlay className="h-4 w-4" />
                      </span>
                      See how Tapro works
                    </Link>
                    <span className="hero-pill px-2 py-1 text-white/78">
                      <Clock3 className="h-4 w-4 text-[#F7C15B]" />
                      Go live fast across single or multi-branch operations
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-[28px] border border-white/12 bg-[#082a2f]/74 p-5 text-white shadow-[0_24px_60px_rgba(2,20,23,0.18)]">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/66">Trusted service layer</p>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {[
                        ['24/7', 'Live menu access'],
                        ['4 roles', 'Owner to kitchen'],
                        ['1 flow', 'Scan to checkout'],
                      ].map(([value, label]) => (
                        <div key={value} className="rounded-2xl border border-white/12 bg-black/18 p-4">
                          <p className="text-2xl font-semibold">{value}</p>
                          <p className="mt-2 text-xs leading-5 text-white/76">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/12 bg-[#041d21]/74 p-5 text-white shadow-[0_24px_60px_rgba(2,20,23,0.18)]">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#F7C15B]">Operations at a glance</p>
                    <div className="mt-6 space-y-4">
                      {[
                        ['Live QR ordering', 'Guests browse, order, and track from their phones.'],
                        ['Kitchen coordination', 'Tickets update in real time for kitchen and cashier teams.'],
                        ['Multi-branch visibility', 'Owners monitor menus, orders, and service from one dashboard.'],
                      ].map(([title, copy]) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                          <p className="font-semibold">{title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/80">{copy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Guest-friendly ordering', 'Search menus, choose dishes, and place orders with a refined mobile-first flow.'],
                  ['Role-specific workspaces', 'Owners, floor staff, cashiers, and kitchen teams each get the right view for service.'],
                  ['Clear business visibility', 'Track orders, table demand, and multi-location performance without extra tooling.'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-[24px] border border-white/12 bg-[#082a2f]/68 p-5 text-white">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f5_100%)] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#064E55]/68">How Tapro works</p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              Built to move guests from scan to service without slowing your floor down.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
              Tapro connects the guest menu, restaurant staff, and owner reporting layer so every table order stays visible from first scan to final handoff.
            </p>
            <div className="mt-10 space-y-4">
              {[
                ['1', 'Guests scan a table QR code and browse a polished digital menu.'],
                ['2', 'Orders reach kitchen and cashier views instantly with table context attached.'],
                ['3', 'Owners track menu performance, staffing, and multi-branch activity from one workspace.'],
              ].map(([step, copy]) => (
                <div key={step} className="flex gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#064E55] text-sm font-semibold text-white">{step}</div>
                  <p className="text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className="min-h-[280px] rounded-[34px] border border-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(2,20,23,0.12), rgba(2,20,23,0.54)), url(${heroImages.phone})` }}
            />
            <div className="rounded-[34px] border border-slate-200 bg-[#08383b] p-6 text-white">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#F7C15B]">Why teams choose Tapro</p>
              <div className="mt-8 grid gap-4">
                {[
                  [<ScanLine className="h-5 w-5" />, 'Fast guest onboarding', 'Table-side ordering with no app install friction.'],
                  [<UtensilsCrossed className="h-5 w-5" />, 'Better service flow', 'Kitchen, cashier, and front-of-house stay in sync.'],
                  [<Building2 className="h-5 w-5" />, 'Multi-location control', 'A single platform for menus, staff, and reporting.'],
                ].map(([icon, title, copy]) => (
                  <div key={title as string} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#F7C15B]">{icon}</div>
                    <p className="mt-4 text-lg font-semibold">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/74">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <QrCode className="h-5 w-5" />,
              title: 'QR ordering preview',
              body: 'A public-facing menu flow designed for scan, search, category browsing, and conversion.',
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: 'Brand-ready presentation',
              body: 'A polished interface tuned for independent restaurants, boutique cafes, and expanding groups.',
            },
            {
              icon: <Check className="h-5 w-5" />,
              title: 'Role-aware operations',
              body: 'Owners, managers, kitchen teams, and cashiers each get a focused operational surface.',
            },
            {
              icon: <ChartNoAxesCombined className="h-5 w-5" />,
              title: 'Revenue oversight',
              body: 'Sales snapshots, best sellers, service health, and performance visibility from one product.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#064E55]/10 bg-[#064E55]/6 text-[#064E55]">
                {item.icon}
              </div>
              <h3 className="mt-12 text-2xl font-semibold leading-tight text-slate-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#08383b_0%,#0d474a_65%,#11555a_100%)] p-6 text-white md:p-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#F7C15B]">QR Ordering Preview</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
              A guest menu that feels calm, fast, and easy to order from.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm font-semibold">Real category browsing</p>
                <p className="mt-2 text-sm leading-6 text-white/74">Guests can move between dishes, categories, and search results without losing momentum.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm font-semibold">Responsive checkout flow</p>
                <p className="mt-2 text-sm leading-6 text-white/74">Cart updates, table context, and order tracking stay visible on mobile from start to finish.</p>
              </div>
            </div>
            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/18 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Customer menu route</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/58">/menu/:restaurantId/table/:tableId</p>
                </div>
                <Link to="/menu/1/table/1" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
                  Open sample
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f4_100%)] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#064E55]/70">Restaurant operations preview</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              One operating layer for menus, tables, staff, and service health.
            </h2>
            <div className="mt-8 grid gap-4">
              {[
                [<Store className="h-5 w-5" />, 'Owner dashboard', 'View active orders, sales signals, and restaurant profile details.'],
                [<Users className="h-5 w-5" />, 'Staff coordination', 'Keep floor, cashier, and kitchen teams aligned as service changes live.'],
                [<Star className="h-5 w-5" />, 'Menu control', 'Tune categories, featured items, and availability without leaving the platform.'],
              ].map(([icon, title, copy]) => (
                <div key={title as string} className="flex gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D7] text-[#F59E0B]">
                    {icon}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="operators" className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf9_100%)] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#064E55]/68">Owner / Kitchen / Staff role highlights</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              The right interface for the right operator at the right moment.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                ['Owners', 'Track branch performance, manage categories, and maintain brand consistency across locations.'],
                ['Kitchen', 'Follow live order status, table context, and service pacing with less manual coordination.'],
                ['Staff', 'Handle cashier, floor, and manager workflows with clear role-based routes and permissions.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[26px] border border-slate-200 bg-white p-5">
                  <p className="text-lg font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#FFF7EC_0%,#FFF2D9_100%)] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-700">Trusted Restaurants / Prestigious Customers</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              Designed for restaurants that want polished guest experience and cleaner operations.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Boutique dining', 'Premium on-table ordering without an app install.'],
                ['Busy casual', 'Fast-moving service teams and live order visibility.'],
                ['Growing groups', 'Shared operating standards across multiple branches.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[26px] border border-amber-200 bg-white/80 p-5">
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[34px] border border-slate-200 bg-[#042c30] p-6 text-white md:p-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#F7C15B]">CTA section</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
              Bring Tapro into your restaurant and simplify service from QR scan to kitchen handoff.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/74">
              Start with one venue or launch across a group. Tapro keeps guest ordering and staff operations in one product with brand-ready presentation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#EA8A00]">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/12">
                View Demo
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8faf8_100%)] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#064E55]/68">Contact section</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              Talk to Tapro about onboarding, multi-branch rollout, or platform customization.
            </h2>
            <div className="mt-8 grid gap-4">
              <Input label="Restaurant Group / Brand" placeholder="Your restaurant group" />
              <Input label="Work Email" type="email" autoComplete="email" placeholder="you@restaurant.com" />
              <Input label="Locations" placeholder="Number of restaurants" />
              <Button className="mt-2 w-full justify-center bg-[#064E55] hover:bg-[#053B40]">Request a Demo</Button>
            </div>
          </div>
        </section>

        <footer className="mt-4 rounded-[30px] border border-slate-200 bg-white px-5 py-6 md:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <TaproLogo imageClassName="h-11 md:h-12" />
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Premium QR ordering and restaurant operations software for modern service teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              <a href="#how-it-works" className="transition hover:text-slate-900">How Tapro Works</a>
              <a href="#features" className="transition hover:text-slate-900">Features</a>
              <a href="#operators" className="transition hover:text-slate-900">Teams</a>
              <a href="#contact" className="transition hover:text-slate-900">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const RestaurantMenuPage = () => {
  const { restaurantId = '1', tableId = '1' } = useParams();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const featuredBadgeLabels: Record<'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER', string> = {
    TODAY_SPECIAL: "Today's Special",
    CHEF_RECOMMENDED: 'Chef Recommended',
    BEST_SELLER: 'Best Seller',
  };
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: restaurant } = useAsyncResource(() => restaurantService.getPublicById(Number(restaurantId)), [restaurantId]);
  const { data: items, loading } = useAsyncResource(() => menuService.listPublicByRestaurant(Number(restaurantId)), [restaurantId]);
  const { data: categories } = useAsyncResource(() => categoryService.listPublicByRestaurant(Number(restaurantId)), [restaurantId]);
  const { data: table } = useAsyncResource(() => tableService.getPublicTable(Number(restaurantId), Number(tableId)), [restaurantId, tableId]);
  const categoryLookup = useMemo(() => toCategoryLookup(categories), [categories]);
  const restaurantName = resolveRestaurantName(restaurant?.name);
  const restaurantDescription = resolveRestaurantDescription(restaurant?.description);
  const tableLabel = resolveTableLabel(table?.tableNumber);
  const restaurantMeta = [restaurant?.address?.trim(), restaurant?.phone?.trim()].filter(Boolean).join(' · ');
  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const options = new Map<string, CategoryOption>();

    (items || []).forEach((item) => {
      const value = resolveCategoryValue(item);
      const label = resolveCategoryLabel(item, categoryLookup);
      const existing = options.get(value);

      if (existing) {
        existing.count += 1;
        if (existing.label === FALLBACK_CATEGORY_LABEL && label !== FALLBACK_CATEGORY_LABEL) {
          existing.label = label;
        }
        return;
      }

      options.set(value, {
        value,
        label,
        count: 1,
      });
    });

    return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [categoryLookup, items]);
  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      const matchesCategory = categoryFilter === 'all' || resolveCategoryValue(item) === categoryFilter;
      const haystack = [item.name, item.description, resolveCategoryLabel(item, categoryLookup)].join(' ').toLowerCase();
      const matchesSearch = haystack.includes(deferredSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, categoryFilter, deferredSearch, categoryLookup]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (categoryFilter !== 'all' && !categoryOptions.some((option) => option.value === categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, categoryOptions]);

  useEffect(() => {
    if (!table) {
      return;
    }

    sessionStorage.setItem('tapro_active_table', JSON.stringify({
      restaurantId: Number(restaurantId),
      tableId: Number(tableId),
      tableNumber: table.tableNumber,
    }));
  }, [restaurantId, tableId, table]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-600">Loading menu...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe7c2_0%,rgba(255,231,194,0.38)_18%,transparent_42%),linear-gradient(180deg,#fff6ea_0%,#fff0df_28%,#fffaf3_100%)] px-4 py-4 text-slate-950">
      <div className="mx-auto max-w-6xl pb-28">
        <section className="relative overflow-hidden rounded-[34px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,243,224,0.92))] p-4 shadow-[0_24px_80px_rgba(148,82,24,0.12)] md:p-6">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.28),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="rounded-[28px] border border-white/80 bg-white/90 p-1 shadow-lg shadow-amber-950/5">
                <ImageWithFallback
                  src={restaurant?.logoUrl}
                  alt={`${restaurantName} logo`}
                  fallback={initialsFromName(restaurantName)}
                  className="h-20 w-20 rounded-[22px] object-cover md:h-24 md:w-24"
                  fallbackClassName="h-20 w-20 rounded-[22px] bg-[linear-gradient(135deg,#1f2937,#475569)] text-2xl md:h-24 md:w-24 md:text-3xl"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <TaproLogo variant="mark" withWordmark={false} imageClassName="h-10 w-10 rounded-2xl" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">Tapro Table Ordering</p>
                </div>
                <h1 className="mt-2 truncate text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">{restaurantName}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{restaurantDescription}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    {tableLabel}
                  </span>
                  {restaurantMeta ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600">
                      {restaurantMeta}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <Link to="/checkout" className="hidden shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/15 md:inline-flex">
              View Cart
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-[30px] border border-amber-100 bg-white/80 p-4 shadow-sm backdrop-blur md:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <Input
              label="Search dishes"
              placeholder="Search dishes, drinks, or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select label="Browse category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>{`${category.label} (${category.count})`}</option>
              ))}
            </Select>
          </div>
          <div className="mt-4 overflow-hidden rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,247,237,0.96))]">
            <div className="flex gap-3 overflow-x-auto px-3 py-3">
              <button
                className={`shrink-0 rounded-[22px] border px-4 py-3 text-left text-sm font-medium transition ${
                  categoryFilter === 'all'
                    ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                }`}
                onClick={() => setCategoryFilter('all')}
              >
                <span className="block">All</span>
                <span className={`mt-1 block text-xs ${categoryFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>{items?.length || 0} dishes</span>
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  className={`shrink-0 rounded-[22px] border px-4 py-3 text-left text-sm font-medium transition ${
                    categoryFilter === category.value
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                  onClick={() => setCategoryFilter(category.value)}
                >
                  <span className="block">{category.label}</span>
                  <span className={`mt-1 block text-xs ${categoryFilter === category.value ? 'text-emerald-50/90' : 'text-slate-500'}`}>
                    {category.count} dish{category.count === 1 ? '' : 'es'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {filteredItems.length ? (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="rounded-[30px] border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,249,240,0.98))] p-4">
                <div className="overflow-hidden rounded-[24px]">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    fallback={initialsFromName(item.name)}
                    className="h-52 w-full rounded-[24px] object-cover transition duration-500 hover:scale-[1.03]"
                    fallbackClassName="h-52 w-full rounded-[24px] bg-[linear-gradient(135deg,#fde6c8,#ffd8b4,#ffc6a5)] text-4xl text-slate-700"
                  />
                </div>
                <div className={`flex items-start justify-between gap-3 ${item.imageUrl ? 'mt-4' : ''}`}>
                  <div className="min-w-0">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                      {resolveCategoryLabel(item, categoryLookup)}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {item.featured && item.featuredLabel ? <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">{featuredBadgeLabels[item.featuredLabel]}</span> : null}
                      {item.preparationTime ? <span>{`${item.preparationTime} min`}</span> : null}
                      {item.allergens.length ? <span>{`Allergens: ${item.allergens.join(', ')}`}</span> : null}
                    </div>
                  </div>
                  <StatusBadge value={item.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'} />
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-semibold text-slate-950">{formatCurrency(item.price)}</span>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.status === 'AVAILABLE' ? 'Available now' : 'Currently unavailable'}
                    </p>
                  </div>
                  <Button
                    disabled={item.status !== 'AVAILABLE'}
                    className="min-w-[112px]"
                    onClick={() => {
                      dispatch(addToCart({ menuItemId: item.id, name: item.name, price: item.price }));
                      toast.success(`${item.name} added to cart`);
                    }}
                  >
                    {item.status === 'AVAILABLE' ? 'Add item' : 'Unavailable'}
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        ) : (
          <div className="mt-8">
            <EmptyState
              title={categoryFilter === 'all' ? 'No dishes found.' : 'No dishes found in this category.'}
              description={categoryFilter === 'all'
                ? 'Try another search term or check back when the restaurant updates its menu.'
                : 'Try another category or clear your search to see more menu items.'}
            />
          </div>
        )}
      </div>
      {cartCount ? (
        <div className="fixed inset-x-4 bottom-4 z-30">
          <Link to="/checkout" className="flex items-center justify-between rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-2xl shadow-slate-950/20">
            <div>
              <p className="text-sm font-semibold">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</p>
              <p className="text-xs text-slate-300">Ready to place your order</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{formatCurrency(cartTotal)}</p>
              <p className="text-xs text-slate-300">View cart</p>
            </div>
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const activeTableContext = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('tapro_active_table') || '{}') as { restaurantId?: number; tableNumber?: string };
    } catch {
      return {};
    }
  })();
  const [tableNumber, setTableNumber] = useState(activeTableContext.tableNumber || 'A1');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitOrder = async () => {
    if (!cart.length) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const requestedRestaurantId = activeTableContext.restaurantId || 1;
      const order = await orderService.create({
        restaurantId: requestedRestaurantId,
        tableNumber,
        items: cart.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      });
      const redirectRestaurantId = order.restaurantId || order.tenantId || requestedRestaurantId;
      const trackingUrl = `/orders/track/${order.id}?restaurantId=${redirectRestaurantId}`;
      sessionStorage.setItem('tapro_last_order', JSON.stringify({
        id: order.id,
        restaurantId: redirectRestaurantId,
      }));
      dispatch(clearCart());
      toast.success('Your order has been placed.');
      navigate(trackingUrl);
    } catch (submitError: any) {
      toast.error(submitError?.response?.data?.message || 'Could not place your order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e6_35%,#fffaf4_100%)] px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Checkout" description="Review order summary and place the order." />
        {!cart.length ? (
          <EmptyState title="Cart is empty" description="Add items from the QR menu first." />
        ) : (
          <>
            <Card>
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <Input label="Table number" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} />
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Orders are submitted to `/api/orders` and carry table context for kitchen and cashier follow-up.
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-950 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input type="number" min={1} value={item.quantity} onChange={(event) => dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: Number(event.target.value) }))} className="w-24" />
                      <Button variant="ghost" onClick={() => dispatch(removeFromCart(item.menuItemId))}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Total: {formatCurrency(total)}</p>
                <Button onClick={submitOrder}>Place order</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export const TrackOrderPage = () => {
  const { orderId = '1001' } = useParams();
  const [searchParams] = useSearchParams();
  const lastOrderContext = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('tapro_last_order') || '{}') as { restaurantId?: number };
    } catch {
      return {};
    }
  })();
  const restaurantIdFromQuery = Number(searchParams.get('restaurantId') || '') || undefined;
  const restaurantId = restaurantIdFromQuery || lastOrderContext.restaurantId;

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    sessionStorage.setItem('tapro_last_order', JSON.stringify({
      id: Number(orderId),
      restaurantId,
    }));
  }, [orderId, restaurantId]);

  const { data: order, loading, error } = useAsyncResource(
    () => orderService.getPublicById(Number(orderId), restaurantId),
    [orderId, restaurantId]
  );
  const { data: restaurant } = useAsyncResource(
    () => (restaurantId ? restaurantService.getPublicById(restaurantId) : Promise.resolve(null)),
    [restaurantId]
  );

  if (loading) {
    return <div className="p-8">Loading order...</div>;
  }

  if (error) {
    return <div className="p-8">{error}</div>;
  }

  if (!order) {
    return <div className="p-8">Order not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e6_35%,#fffaf4_100%)] px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Your order is being prepared" description="Track each stage from received to completed." />
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <ImageWithFallback
              src={restaurant?.logoUrl}
              alt={`${restaurant?.name || 'Restaurant'} logo`}
              fallback={initialsFromName(restaurant?.name || 'Restaurant')}
              className="h-16 w-16 rounded-2xl object-cover"
              fallbackClassName="h-16 w-16 rounded-2xl text-xl"
            />
            <div>
              <p className="text-lg font-semibold">{restaurant?.name || 'Restaurant'}</p>
              <p className="text-sm text-slate-500">We are preparing your food fresh for your table.</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Placed {formatDateTime(order.orderTime)}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Table {order.tableNumber}</h2>
            </div>
            <StatusBadge value={order.status} />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {['PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((step) => (
              <div key={step} className={`rounded-2xl p-4 text-center text-sm ${step === order.status ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                {step === 'PENDING' ? 'Received' : step.charAt(0) + step.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Items</h3>
            <div className="mt-3">
              <OrderItemsList items={order.items} emptyLabel="Could not load orders." />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">Total: {formatCurrency(order.totalAmount)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
