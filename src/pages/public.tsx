import { ArrowRight, Check, QrCode, Sparkles, Star } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { menuService, orderService, restaurantService, tableService } from '../api/services';
import { ImageWithFallback, initialsFromName } from '../components/shared/ImageWithFallback';
import { useAppDispatch, useAppSelector, useAsyncResource } from '../hooks';
import { addToCart, clearCart, removeFromCart, updateQuantity } from '../store/cartSlice';
import { Button, Card, EmptyState, Input, OrderItemsList, PageHeader, Select, StatusBadge } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';

const heroImages = {
  main: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
  chef: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
  dining: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  phone: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
};

export const LandingPage = () => (
  <div className="min-h-screen bg-light px-4 py-4 text-slate-950 dark:bg-dark dark:text-white">
    <div className="mx-auto max-w-[1500px] rounded-[36px] border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-950 dark:shadow-panel-dark md:p-6">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between md:px-7">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Tapro</p>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Premium restaurant ordering SaaS</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <a href="#experience" className="transition hover:text-slate-950 dark:hover:text-white">Experience</a>
          <a href="#platform" className="transition hover:text-slate-950 dark:hover:text-white">Platform</a>
          <a href="#pricing" className="transition hover:text-slate-950 dark:hover:text-white">Pricing</a>
          <a href="#contact" className="transition hover:text-slate-950 dark:hover:text-white">Contact</a>
          <Link to="/login" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600">
            Open Dashboard
          </Link>
        </nav>
      </header>

      <section className="mt-4">
        <div className="rounded-[34px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <div
            className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-cover bg-center px-6 pb-10 pt-6 dark:border-slate-800 md:min-h-[620px] md:px-10 md:pb-12"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.2), rgba(15,23,42,0.42) 48%, rgba(15,23,42,0.78)), url(${heroImages.main})` }}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div>
                <p className="text-3xl font-semibold text-white">Tapro</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-100">Elevated restaurant commerce</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/80">
                <span>Live ordering</span>
                <span className="h-px w-8 bg-white/20" />
                <Link to="/login" className="rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-950">
                  Book a Demo
                </Link>
              </div>
            </div>

            <div className="mt-16 max-w-3xl md:mt-24 lg:mt-36">
              <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-100">Premium SaaS for Restaurants</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                A beautiful QR ordering system for modern restaurants.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 md:text-lg">
                Give guests a smooth mobile ordering experience while your owners, managers, kitchen staff, and cashiers stay aligned in one fast restaurant platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-600">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#platform" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur">
                  Explore Features
                </a>
              </div>
            </div>

            <div className="mt-12 grid gap-3 md:mt-16 md:grid-cols-3">
              {[
                ['Guest-friendly ordering', 'Search menus, add to cart, and place orders in a few taps.'],
                ['Staff-ready operations', 'Clear dashboards for owners, managers, kitchen, and cashiers.'],
                ['Restaurant insights', 'Track orders, revenue, and performance from one place.'],
              ].map(([title, description], index) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-slate-950/25 p-5 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100">({index + 1})</p>
                  <h3 className="mt-4 text-xl font-semibold leading-tight text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-100">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[34px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">Designed for atmosphere and speed</p>
          <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 dark:text-white md:text-5xl">
                A restaurant experience that feels polished for guests and practical for teams.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <p>
                Tapro is designed like a premium SaaS product, but tuned for restaurants. Guests get a smooth ordering flow while your teams get clear, role-specific tools.
              </p>
              <p>
                From first QR scan to final receipt, the UI stays calm, fast, and reliable during service.
              </p>
            </div>
          </div>
        </div>
        <div
          className="min-h-[320px] rounded-[34px] border border-slate-200 bg-cover bg-center dark:border-slate-800"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,10,0.18), rgba(8,10,10,0.48)), url(${heroImages.phone})` }}
        />
      </section>

      <section id="platform" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <QrCode className="h-5 w-5" />,
              title: 'Guest ordering',
              body: 'Scan-to-order flows that support browsing, cart updates, checkout, and live order tracking.',
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: 'Brand presence',
              body: 'A presentation layer that feels premium enough for fine dining, boutique cafes, and multi-venue groups.',
            },
            {
              icon: <Check className="h-5 w-5" />,
              title: 'Role-based operations',
              body: 'Owners, managers, kitchen teams, and cashiers each get interfaces tuned to their responsibilities.',
            },
            {
              icon: <Star className="h-5 w-5" />,
              title: 'Revenue oversight',
              body: 'Sales snapshots, best sellers, order analytics, subscriptions, and tenant-level reporting.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[30px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                {item.icon}
              </div>
              <h3 className="mt-12 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
            </div>
          ))}
      </section>

      <section id="pricing" className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[34px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">Pricing</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 dark:text-white md:text-5xl">
            Structured for independent restaurants and expanding groups.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['Starter', '$49', 'Single-location launch with QR ordering and core operations.'],
              ['Growth', '$129', 'Multi-role staff management, analytics, and richer operational control.'],
              ['Scale', '$299', 'Enterprise rollout, subscriptions, and high-volume reporting visibility.'],
            ].map(([name, price, description]) => (
              <div key={name} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{name}</p>
                <p className="mt-8 text-5xl font-semibold leading-none text-slate-950 dark:text-white">{price}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="contact" className="rounded-[34px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">Contact</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 dark:text-white">Bring a premium operating system to your restaurant group.</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300">
            Talk to Tapro about onboarding, private-label deployments, multi-restaurant groups, or tailoring the customer ordering layer to your brand.
          </p>
          <div className="mt-8 grid gap-4">
            <Input label="Restaurant Group / Brand" placeholder="Your restaurant group" />
            <Input label="Work Email" placeholder="you@restaurant.com" />
            <Input label="Locations" placeholder="Number of restaurants" />
            <Button className="mt-2 w-full justify-center">Request a Demo</Button>
          </div>
        </div>
      </section>
    </div>
  </div>
);

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
  const { data: items, loading } = useAsyncResource(() => menuService.listByRestaurant(Number(restaurantId)), [restaurantId]);
  const { data: table } = useAsyncResource(() => tableService.getPublicTable(Number(restaurantId), Number(tableId)), [restaurantId, tableId]);
  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      const matchesCategory = categoryFilter === 'all' || String(item.categoryId) === categoryFilter;
      const matchesSearch = item.name.toLowerCase().includes(deferredSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, categoryFilter, deferredSearch]);
  const categoryIds = Array.from(new Set((items || []).map((item) => item.categoryId)));
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    return <div className="p-8 text-center">Loading menu...</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e6_35%,#fffaf4_100%)] px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-6xl pb-28">
        <PageHeader
          title={restaurant?.name || 'QR Menu'}
          description={`${restaurant?.name || `Restaurant ${restaurantId}`} · Table ${table?.tableNumber || tableId}`}
          action={<Link to="/checkout" className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950">Go to cart</Link>}
        />
        <Card className="mt-6 overflow-hidden bg-[radial-gradient(circle_at_top_left,#fde6c8,transparent_42%),linear-gradient(135deg,#fffdf8,#fff5ea)]">
          <div className="flex items-center gap-4">
            <ImageWithFallback
              src={restaurant?.logoUrl}
              alt={`${restaurant?.name || 'Restaurant'} logo`}
              fallback={initialsFromName(restaurant?.name || 'Restaurant')}
              className="h-16 w-16 rounded-2xl object-cover"
              fallbackClassName="h-16 w-16 rounded-2xl text-xl"
            />
            <div>
              <p className="text-lg font-semibold text-slate-950 dark:text-white">{restaurant?.name || `Restaurant ${restaurantId}`}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome! Order freshly prepared food to your table.</p>
              <p className="mt-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                {table ? `Table ${table.tableNumber}` : `Table ${tableId}`}
              </p>
            </div>
          </div>
        </Card>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <Input label="Search food" placeholder="Search dishes..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select label="Category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {Array.from(new Set((items || []).map((item) => item.categoryId))).map((id) => (
              <option key={id} value={id}>{`Category ${id}`}</option>
            ))}
          </Select>
        </div>
        <div className="sticky top-0 z-20 mt-4 flex gap-2 overflow-x-auto rounded-2xl bg-white/80 px-2 py-2 shadow-sm backdrop-blur">
          <button className={`rounded-full px-4 py-2 text-sm font-medium ${categoryFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setCategoryFilter('all')}>
            All
          </button>
          {categoryIds.map((id) => (
            <button key={id} className={`rounded-full px-4 py-2 text-sm font-medium ${categoryFilter === String(id) ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setCategoryFilter(String(id))}>
              {`Category ${id}`}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="rounded-[28px]">
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                fallback={initialsFromName(item.name)}
                className="h-48 w-full rounded-2xl object-cover"
                fallbackClassName="h-48 w-full rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 text-3xl text-slate-700"
              />
              <div className={`flex items-start justify-between gap-3 ${item.imageUrl ? 'mt-4' : ''}`}>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.featured && item.featuredLabel ? <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">{featuredBadgeLabels[item.featuredLabel]}</span> : null}
                    {item.preparationTime ? <span>{`${item.preparationTime} min`}</span> : null}
                    {item.allergens.length ? <span>{`Allergens: ${item.allergens.join(', ')}`}</span> : null}
                  </div>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(item.price)}</span>
                <Button disabled={item.status !== 'AVAILABLE'} onClick={() => { dispatch(addToCart({ menuItemId: item.id, name: item.name, price: item.price })); toast.success(`${item.name} added to cart`); }}>
                  {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Add item'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {cartCount ? (
        <div className="fixed inset-x-4 bottom-4 z-30">
          <Link to="/checkout" className="flex items-center justify-between rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-2xl">
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
