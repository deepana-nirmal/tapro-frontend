import { Clock3, Minus, Plus, Search, ShoppingBag, Sparkles, Star, X } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryService, menuService, orderService, restaurantService, tableService } from '../api/services';
import TaproLogo from '../components/branding/TaproLogo';
import { ImageWithFallback, initialsFromName } from '../components/shared/ImageWithFallback';
import { Button, Card, EmptyState, Modal, ModalBody, ModalFooter, OrderItemsList, PageHeader, StatusBadge } from '../components/ui';
import { useAppDispatch, useAppSelector, useAsyncResource } from '../hooks';
import { addToCart, clearCart, removeFromCart, replaceCartForContext, setCartContext, updateQuantity } from '../store/cartSlice';
import { Category, MenuItem, Order } from '../types';
import { CustomerTableContext, cartItemCount, cartSubtotal, clampQuantity, sameTableContext } from '../utils/cartCalculations';
import { filterMenuItems } from '../utils/menuFilters';
import { ORDER_STATUS_STEPS, orderStatusMessage, orderStatusStepIndex, shouldPollOrderStatus } from '../utils/orderStatus';
import { formatCurrency, formatDateTime } from '../utils/format';

type CategoryOption = {
  value: string;
  label: string;
  count: number;
};

const FALLBACK_CATEGORY_LABEL = 'Uncategorized';
const FALLBACK_RESTAURANT_NAME = 'Restaurant Menu';

const toCategoryLookup = (categories?: Category[] | null) =>
  new Map((categories || []).map((category) => [category.id, category.name]));

const resolveCategoryLabel = (item: MenuItem, categoryLookup: Map<number, string>) =>
  item.categoryName?.trim() || categoryLookup.get(item.categoryId)?.trim() || FALLBACK_CATEGORY_LABEL;

const resolveCategoryValue = (item: MenuItem) => (item.categoryId ? String(item.categoryId) : 'uncategorized');
const resolveRestaurantName = (name?: string | null) => name?.trim() || FALLBACK_RESTAURANT_NAME;
const resolveRestaurantDescription = (description?: string | null) =>
  description?.trim() || 'Browse the menu, add dishes to your cart, and place an order directly from your table.';
const resolveTableLabel = (tableNumber?: string | null) => (tableNumber?.trim() ? `Table ${tableNumber.trim()}` : 'Your table');
const isRestaurantOrderable = (status?: string | null) => !status || status === 'ACTIVE';

const readJsonSession = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
};

const customerErrorMessage = (raw?: string | null) => {
  const message = raw?.toLowerCase() || '';
  if (message.includes('table')) {
    return 'This table QR code could not be verified. Please ask restaurant staff for assistance.';
  }
  if (message.includes('restaurant')) {
    return 'This restaurant menu is not available right now.';
  }
  return 'We could not load this ordering session. Please try again or ask restaurant staff for help.';
};

const QuantityControl = ({ value, onChange, disabled }: { value: number; onChange: (quantity: number) => void; disabled?: boolean }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
    <button type="button" disabled={disabled || value <= 1} onClick={() => onChange(clampQuantity(value - 1))} className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Decrease quantity">
      <Minus className="h-4 w-4" />
    </button>
    <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
    <button type="button" disabled={disabled} onClick={() => onChange(clampQuantity(value + 1))} className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Increase quantity">
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

export const RestaurantMenuPage = () => {
  const { restaurantId = '', tableId = '' } = useParams();
  const numericRestaurantId = Number(restaurantId);
  const numericTableId = Number(tableId);
  const dispatch = useAppDispatch();
  const { items: cart, context: cartContext } = useAppSelector((state) => state.cart);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  const { data: restaurant, loading: restaurantLoading, error: restaurantError } = useAsyncResource(
    () => restaurantService.getPublicById(numericRestaurantId),
    [numericRestaurantId]
  );
  const { data: items, loading: itemsLoading, error: itemsError } = useAsyncResource(
    () => menuService.listPublicByRestaurant(numericRestaurantId),
    [numericRestaurantId]
  );
  const { data: categories, error: categoriesError } = useAsyncResource(
    () => categoryService.listPublicByRestaurant(numericRestaurantId),
    [numericRestaurantId]
  );
  const { data: table, loading: tableLoading, error: tableError } = useAsyncResource(
    () => tableService.getPublicTable(numericRestaurantId, numericTableId),
    [numericRestaurantId, numericTableId]
  );

  const categoryLookup = useMemo(() => toCategoryLookup(categories), [categories]);
  const restaurantName = resolveRestaurantName(restaurant?.name);
  const restaurantCurrency = restaurant?.currencyCode || 'LKR';
  const currentContext = useMemo<CustomerTableContext | null>(() => {
    if (!restaurant || !table?.tableNumber) {
      return null;
    }

    return { restaurantId: numericRestaurantId, tableId: numericTableId, tableNumber: table.tableNumber };
  }, [numericRestaurantId, numericTableId, restaurant, table]);
  const restaurantMeta = [restaurant?.address?.trim(), restaurant?.openingHours?.trim()].filter(Boolean).join(' · ');
  const restaurantAvailable = isRestaurantOrderable(restaurant?.status);
  const tableAvailable = table?.active !== false;
  const canOrder = Boolean(currentContext && restaurantAvailable && tableAvailable);

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const options = new Map<string, CategoryOption>();
    (items || []).forEach((item) => {
      if (item.status === 'HIDDEN') {
        return;
      }
      const value = resolveCategoryValue(item);
      const label = resolveCategoryLabel(item, categoryLookup);
      const existing = options.get(value);
      if (existing) {
        existing.count += 1;
        return;
      }
      options.set(value, { value, label, count: 1 });
    });
    return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [categoryLookup, items]);

  const visibleItems = useMemo(() => (items || []).filter((item) => item.status !== 'HIDDEN'), [items]);
  const filteredItems = useMemo(() => filterMenuItems(
    visibleItems,
    { search: deferredSearch, category: categoryFilter, availableOnly, featuredOnly },
    {
      valueFor: (item) => resolveCategoryValue(item),
      labelFor: (item) => resolveCategoryLabel(item, categoryLookup),
    }
  ), [availableOnly, categoryFilter, categoryLookup, deferredSearch, featuredOnly, visibleItems]);
  const featuredCount = visibleItems.filter((item) => item.featured).length;
  const cartTotal = cartSubtotal(cart);
  const cartCount = cartItemCount(cart);
  const activeError = restaurantError || itemsError || categoriesError || tableError;

  useEffect(() => {
    if (categoryFilter !== 'all' && !categoryOptions.some((option) => option.value === categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, categoryOptions]);

  useEffect(() => {
    if (!currentContext) {
      return;
    }

    sessionStorage.setItem('tapro_active_table', JSON.stringify(currentContext));
    if (!cart.length || sameTableContext(cartContext, currentContext)) {
      dispatch(setCartContext(currentContext));
    }
  }, [cart.length, cartContext, currentContext, dispatch]);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    if (!currentContext || !canOrder) {
      toast.error('This ordering session is not ready. Please ask restaurant staff for help.');
      return;
    }
    if (item.status !== 'AVAILABLE') {
      toast.error('This item is not currently available.');
      return;
    }
    if (cart.length && cartContext && !sameTableContext(cartContext, currentContext)) {
      const confirmed = window.confirm('Your cart belongs to another table or restaurant. Clear it and start a new order here?');
      if (!confirmed) {
        return;
      }
      dispatch(replaceCartForContext(currentContext));
    } else {
      dispatch(setCartContext(currentContext));
    }
    dispatch(addToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      categoryName: resolveCategoryLabel(item, categoryLookup),
      currencyCode: restaurantCurrency,
      quantity,
    }));
    toast.success(`${item.name} added to cart`);
  }, [canOrder, cart.length, cartContext, categoryLookup, currentContext, dispatch, restaurantCurrency]);

  if (restaurantLoading || itemsLoading || tableLoading) {
    return <div className="min-h-screen bg-orange-50 p-8 text-center text-sm text-slate-600">Loading your table menu...</div>;
  }

  if (activeError || !restaurant || !table) {
    return (
      <div className="min-h-screen bg-orange-50 px-4 py-8 text-slate-950">
        <div className="mx-auto max-w-xl">
          <EmptyState title="Ordering session unavailable" description={customerErrorMessage(activeError)} />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[radial-gradient(circle_at_top,#ffe8c8_0%,rgba(255,239,213,0.45)_25%,transparent_46%),linear-gradient(180deg,#fff8ef_0%,#fff3e2_36%,#fffaf4_100%)] px-3 py-3 text-slate-950 sm:px-4 sm:py-4">
      <header className="sticky top-0 z-20 mx-auto mb-3 flex max-w-6xl items-center justify-between gap-3 rounded-b-[28px] border border-amber-100 bg-white/92 px-3 py-3 shadow-lg shadow-amber-950/5 backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{restaurantName}</p>
          <p className="text-xs text-slate-500">{resolveTableLabel(table.tableNumber)}</p>
        </div>
        <Link to="/checkout" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          <ShoppingBag className="h-4 w-4" />
          {cartCount}
        </Link>
      </header>

      <main className="mx-auto max-w-6xl pb-32">
        <section className="relative overflow-hidden rounded-[34px] border border-amber-200/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(148,82,24,0.12)] md:p-6">
          <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.3),transparent_56%)]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-col gap-4 min-[440px]:flex-row min-[440px]:items-center">
              <ImageWithFallback
                src={restaurant.logoUrl}
                alt={`${restaurantName} logo`}
                fallback={initialsFromName(restaurantName)}
                className="h-24 w-24 rounded-[28px] border border-white object-cover shadow-lg"
                fallbackClassName="h-24 w-24 rounded-[28px] bg-[linear-gradient(135deg,#1f2937,#475569)] text-3xl"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TaproLogo variant="mark" withWordmark={false} imageClassName="h-9 w-9 rounded-2xl" />
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{restaurantAvailable ? 'Ordering open' : 'Ordering unavailable'}</span>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{resolveTableLabel(table.tableNumber)}</span>
                </div>
                <h1 className="mt-3 text-[clamp(2rem,9vw,3.4rem)] font-semibold leading-none tracking-[-0.05em]">{restaurantName}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{resolveRestaurantDescription(restaurant.description)}</p>
                {restaurantMeta ? <p className="mt-3 text-sm text-slate-500">{restaurantMeta}</p> : null}
              </div>
            </div>
            <Link to="/checkout" className="hidden shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg md:inline-flex">
              View cart · {cartCount}
            </Link>
          </div>
        </section>

        {!restaurantAvailable || !tableAvailable ? (
          <div className="mt-5">
            <EmptyState title={!restaurantAvailable ? 'Restaurant ordering is unavailable' : 'This table is inactive'} description="Please ask restaurant staff for assistance before placing an order." />
          </div>
        ) : null}

        <section className="mt-5 rounded-[30px] border border-amber-100 bg-white/86 p-4 shadow-sm backdrop-blur md:p-5">
          <label className="relative block">
            <span className="sr-only">Search menu</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes, ingredients, or allergens..." className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
            {search ? (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            <button type="button" onClick={() => setCategoryFilter('all')} className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${categoryFilter === 'all' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
              All <span className="ml-2 text-xs opacity-75">{visibleItems.length}</span>
            </button>
            {categoryOptions.map((category) => (
              <button key={category.value} type="button" onClick={() => setCategoryFilter(category.value)} className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${categoryFilter === category.value ? 'border-emerald-600 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                {category.label} <span className="ml-2 text-xs opacity-75">{category.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setAvailableOnly((value) => !value)} className={`rounded-full border px-4 py-2 text-sm font-medium ${availableOnly ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>Available now</button>
            <button type="button" onClick={() => setFeaturedOnly((value) => !value)} disabled={!featuredCount} className={`rounded-full border px-4 py-2 text-sm font-medium ${featuredOnly ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-50`}>Featured {featuredCount ? `(${featuredCount})` : ''}</button>
          </div>
        </section>

        {filteredItems.length ? (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const unavailable = item.status !== 'AVAILABLE' || !canOrder;
              return (
                <Card key={item.id} className="flex min-w-0 flex-col rounded-[30px] border-amber-100 bg-white/95 p-4">
                  <button type="button" onClick={() => { setSelectedItem(item); setDetailQuantity(1); }} className="min-w-0 text-left">
                    <ImageWithFallback src={item.imageUrl} alt={item.name} fallback={initialsFromName(item.name)} className="h-52 w-full rounded-[24px] object-cover" fallbackClassName="h-52 w-full rounded-[24px] bg-[linear-gradient(135deg,#fde6c8,#ffd8b4,#ffc6a5)] text-4xl text-slate-700" />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{resolveCategoryLabel(item, categoryLookup)}</p>
                        <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                      <StatusBadge value={item.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'} />
                    </div>
                  </button>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    {item.featured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800"><Star className="h-3 w-3" /> Featured</span> : null}
                    {item.preparationTime ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1"><Clock3 className="h-3 w-3" /> {item.preparationTime} min</span> : null}
                  </div>
                  <div className="mt-auto flex flex-col gap-3 pt-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                    <p className="text-lg font-semibold">{formatCurrency(item.price, restaurantCurrency)}</p>
                    <Button disabled={unavailable} className="w-full min-[420px]:w-auto" onClick={() => addItem(item)}>
                      {unavailable ? 'Unavailable' : 'Add'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </section>
        ) : (
          <div className="mt-8">
            <EmptyState title="No dishes match your filters" description="Try clearing search, changing category, or showing unavailable items." />
          </div>
        )}
      </main>

      {cartCount ? (
        <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 sm:inset-x-4">
          <Link to="/checkout" className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-2xl shadow-slate-950/20">
            <div className="min-w-0">
              <p className="font-semibold">{cartCount} item{cartCount === 1 ? '' : 's'} in cart</p>
              <p className="text-xs text-slate-300">Review and place order</p>
            </div>
            <p className="shrink-0 text-lg font-semibold">{formatCurrency(cartTotal, restaurantCurrency)}</p>
          </Link>
        </div>
      ) : null}

      <Modal open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} title={selectedItem?.name || 'Menu item'} description="Review details before adding to your cart.">
        {selectedItem ? (
          <>
            <ModalBody>
              <ImageWithFallback src={selectedItem.imageUrl} alt={selectedItem.name} fallback={initialsFromName(selectedItem.name)} className="h-56 w-full rounded-3xl object-cover" fallbackClassName="h-56 w-full rounded-3xl bg-[linear-gradient(135deg,#fde6c8,#ffd8b4,#ffc6a5)] text-4xl text-slate-700" />
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{resolveCategoryLabel(selectedItem, categoryLookup)}</p>
                    <p className="mt-2 text-2xl font-semibold">{formatCurrency(selectedItem.price, restaurantCurrency)}</p>
                  </div>
                  <StatusBadge value={selectedItem.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'} />
                </div>
                <p className="text-sm leading-6 text-slate-600">{selectedItem.description || 'No description provided.'}</p>
                {selectedItem.ingredients.length ? <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Ingredients:</span> {selectedItem.ingredients.join(', ')}</p> : null}
                {selectedItem.allergens.length ? <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Allergens:</span> {selectedItem.allergens.join(', ')}</p> : null}
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  Custom item options are not configured for this menu yet. Your order will include this item and quantity only.
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <QuantityControl value={detailQuantity} onChange={setDetailQuantity} disabled={selectedItem.status !== 'AVAILABLE'} />
              <Button disabled={selectedItem.status !== 'AVAILABLE' || !canOrder} onClick={() => { addItem(selectedItem, detailQuantity); setSelectedItem(null); }}>
                Add {detailQuantity} · {formatCurrency(selectedItem.price * detailQuantity, restaurantCurrency)}
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cart, context: cartContext } = useAppSelector((state) => state.cart);
  const [submitting, setSubmitting] = useState(false);
  const activeTableContext = cartContext || readJsonSession<CustomerTableContext | null>('tapro_active_table', null);
  const restaurantId = activeTableContext?.restaurantId;
  const tableNumber = activeTableContext?.tableNumber;
  const tableId = activeTableContext?.tableId;
  const total = cartSubtotal(cart);
  const { data: restaurant, error: restaurantError } = useAsyncResource(
    () => (restaurantId ? restaurantService.getPublicById(restaurantId) : Promise.resolve(null)),
    [restaurantId]
  );
  const { data: latestItems } = useAsyncResource(
    () => (restaurantId ? menuService.listPublicByRestaurant(restaurantId) : Promise.resolve([])),
    [restaurantId]
  );
  const { data: table, error: tableError } = useAsyncResource(
    () => (restaurantId && tableId ? tableService.getPublicTable(restaurantId, tableId) : Promise.resolve(null)),
    [restaurantId, tableId]
  );
  const currencyCode = restaurant?.currencyCode || cart[0]?.currencyCode || 'LKR';
  const availableItemIds = useMemo(() => new Set((latestItems || []).filter((item) => item.status === 'AVAILABLE').map((item) => item.id)), [latestItems]);
  const unavailableLines = latestItems?.length ? cart.filter((item) => !availableItemIds.has(item.menuItemId)) : [];
  const canSubmit = Boolean(cart.length && restaurantId && tableNumber && table?.active !== false && isRestaurantOrderable(restaurant?.status) && !unavailableLines.length);

  const submitOrder = async () => {
    if (submitting) {
      return;
    }
    if (!cart.length) {
      toast.error('Cart is empty.');
      return;
    }
    if (!restaurantId || !tableNumber) {
      toast.error('Open the QR menu again so Tapro can verify your table.');
      return;
    }
    if (unavailableLines.length) {
      toast.error('Remove unavailable items before placing this order.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.create({
        restaurantId,
        tableNumber,
        items: cart.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      });
      const redirectRestaurantId = order.restaurantId || order.tenantId || restaurantId;
      sessionStorage.setItem('tapro_last_order', JSON.stringify({ id: order.id, restaurantId: redirectRestaurantId }));
      dispatch(clearCart());
      toast.success('Your order has been placed.');
      navigate(`/orders/track/${order.id}?restaurantId=${redirectRestaurantId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e6_35%,#fffaf4_100%)] px-3 py-5 text-slate-950 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-6 pb-28">
        <PageHeader title="Checkout" description="Review your table order. The restaurant confirms final kitchen handling from Tapro." />
        {!cart.length ? (
          <Card>
            <EmptyState title="Cart is empty" description="Add items from the QR menu first." />
            {activeTableContext ? <div className="mt-4 flex justify-center"><Link to={`/menu/${activeTableContext.restaurantId}/table/${activeTableContext.tableId || ''}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Return to menu</Link></div> : null}
          </Card>
        ) : (
          <>
            <Card>
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Ordering for</p>
                  <p className="mt-2 text-xl font-semibold">{tableNumber ? resolveTableLabel(tableNumber) : 'Verified table needed'}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
                  Orders use the QR table context and submit only menu item IDs and quantities to the backend. No manual table changes are allowed from checkout.
                </div>
              </div>
              {restaurantError || tableError ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{customerErrorMessage(restaurantError || tableError)}</p> : null}
              {unavailableLines.length ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Some items changed availability. Remove them before placing the order.</p> : null}
            </Card>
            <Card>
              <div className="space-y-4">
                {cart.map((item) => {
                  const unavailable = unavailableLines.some((line) => line.menuItemId === item.menuItemId);
                  return (
                    <div key={item.menuItemId} className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${unavailable ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
                      <div className="min-w-0">
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-sm text-slate-600">{formatCurrency(item.price, currencyCode)} each</p>
                        {unavailable ? <p className="mt-1 text-xs font-semibold text-amber-800">Currently unavailable</p> : null}
                      </div>
                      <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center">
                        <QuantityControl value={item.quantity} onChange={(quantity) => dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity }))} />
                        <Button variant="ghost" className="w-full min-[420px]:w-auto" onClick={() => dispatch(removeFromCart(item.menuItemId))}>Remove</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
      {cart.length ? (
        <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 sm:inset-x-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-3xl bg-white p-3 shadow-2xl shadow-slate-950/15 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subtotal shown by menu prices</p>
              <p className="text-xl font-semibold">{formatCurrency(total, currencyCode)}</p>
            </div>
            <Button disabled={!canSubmit || submitting} onClick={submitOrder} className="w-full min-[520px]:w-auto">
              {submitting ? 'Placing order...' : 'Place order'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const TrackOrderPage = () => {
  const { orderId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const lastOrderContext = readJsonSession<{ restaurantId?: number }>('tapro_last_order', {});
  const restaurantId = Number(searchParams.get('restaurantId') || '') || lastOrderContext.restaurantId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: restaurant } = useAsyncResource(
    () => (restaurantId ? restaurantService.getPublicById(restaurantId) : Promise.resolve(null)),
    [restaurantId]
  );

  const loadOrder = useCallback(async () => {
    if (!restaurantId) {
      setError('Open the tracking link from your order confirmation so Tapro can verify the restaurant.');
      setLoading(false);
      return;
    }
    try {
      const result = await orderService.getPublicById(Number(orderId), restaurantId);
      setOrder(result);
      setError(null);
      sessionStorage.setItem('tapro_last_order', JSON.stringify({ id: result.id, restaurantId }));
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [orderId, restaurantId]);

  useEffect(() => {
    setLoading(true);
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!shouldPollOrderStatus(order?.status)) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        loadOrder();
      }
    }, 12000);
    return () => window.clearInterval(interval);
  }, [loadOrder, order?.status]);

  if (loading) {
    return <div className="min-h-screen bg-orange-50 p-8 text-center text-sm text-slate-600">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <EmptyState title="Order tracking unavailable" description={customerErrorMessage(error)} />
          <div className="mt-4 flex justify-center"><Button onClick={loadOrder}>Retry</Button></div>
        </div>
      </div>
    );
  }

  const activeStep = orderStatusStepIndex(order.status);
  const currencyCode = order.restaurantCurrencyCode || restaurant?.currencyCode || 'LKR';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e6_35%,#fffaf4_100%)] px-3 py-5 text-slate-950 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title={order.status === 'CANCELLED' ? 'Order cancelled' : 'Track your order'} description={orderStatusMessage(order.status)} />
        <Card>
          <div className="mb-6 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center">
            <ImageWithFallback src={restaurant?.logoUrl} alt={`${restaurant?.name || 'Restaurant'} logo`} fallback={initialsFromName(restaurant?.name || 'Restaurant')} className="h-16 w-16 rounded-2xl object-cover" fallbackClassName="h-16 w-16 rounded-2xl text-xl" />
            <div className="min-w-0">
              <p className="text-lg font-semibold">{restaurant?.name || 'Restaurant'}</p>
              <p className="text-sm text-slate-500">Placed {formatDateTime(order.orderTime)} · Table {order.tableNumber}</p>
            </div>
            <div className="min-[420px]:ml-auto"><StatusBadge value={order.status} /></div>
          </div>
          {order.status === 'CANCELLED' ? (
            <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Please speak to restaurant staff if you need help with this order.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-5">
              {ORDER_STATUS_STEPS.map((step, index) => {
                const reached = index <= activeStep;
                return (
                  <div key={step.status} className={`rounded-2xl border p-4 text-center text-sm ${reached ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-500'}`}>
                    <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-white/15">
                      {reached ? <Sparkles className="h-4 w-4" /> : index + 1}
                    </div>
                    <p className="font-semibold">{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 rounded-2xl bg-white/70 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Items</h2>
            <div className="mt-3">
              <OrderItemsList items={order.items} currencyCode={currencyCode} emptyLabel="Could not load order items." />
            </div>
            <p className="mt-4 text-lg font-semibold">Total: {formatCurrency(order.totalAmount, currencyCode)}</p>
          </div>
          {shouldPollOrderStatus(order.status) ? <p className="mt-4 text-center text-xs text-slate-500">Status refreshes automatically while this order is active.</p> : null}
        </Card>
      </div>
    </div>
  );
};
