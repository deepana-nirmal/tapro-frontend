import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { dashboardService, menuService, orderService, tableService } from '../api/services';
import { useAsyncResource } from '../hooks';
import { Button, Card, DataTable, Modal, ModalBody, ModalFooter, OrderItemsList, PageHeader, StatCard, StatusBadge } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';
import { Order, OrderStatus } from '../types';
import { STAFF_ACTIVE_STATUSES, STAFF_STATUS_LABELS, formatWaitingTime, getKitchenActionLabel, getKitchenNextStatus, groupKitchenOrders, orderItemCount, waitingMinutes } from '../utils/staffWorkspace';

export const ManagerDashboardPage = () => {
  const { data: metrics } = useAsyncResource(() => dashboardService.managerMetrics(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" description="Monitor shift operations, table usage, and order flow." />
      <div className="grid gap-4 md:grid-cols-3">
        {(metrics || []).map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
    </div>
  );
};

export const ManagerMenuPage = () => {
  const { data: items } = useAsyncResource(() => menuService.listByRestaurant(1), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Manager Menu Control" description="Managers can create categories and update menu items during service." />
      <Card>
        <DataTable
          columns={[
            { key: 'item', label: 'Item', render: (row) => row.name },
            { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price, row.restaurantCurrencyCode || 'LKR') },
            { key: 'availability', label: 'Availability', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'actions', label: 'Actions', render: () => <div className="flex flex-wrap gap-2"><Button variant="ghost">Edit</Button><Button variant="ghost">Create Category</Button></div> },
          ]}
          rows={items || []}
        />
      </Card>
    </div>
  );
};

export const ManagerOrdersPage = () => {
  const { data: orders, setData } = useAsyncResource(() => orderService.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Manager Orders" description="Assign orders and update status across the floor." />
      <Card>
        <DataTable
          columns={[
            { key: 'order', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'table', label: 'Table', render: (row) => row.tableNumber },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} emptyLabel="Could not load orders." /> },
            { key: 'placed', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost">Assign</Button>
                  <Button variant="ghost" onClick={async () => { const updated = await orderService.updateStatus(row.id, 'PREPARING'); setData((orders || []).map((entry) => entry.id === row.id ? updated : entry)); toast.success('Order updated'); }}>Update</Button>
                </div>
              ),
            },
          ]}
          rows={orders || []}
        />
      </Card>
    </div>
  );
};

export const ManagerTablesPage = () => {
  const { data: tables } = useAsyncResource(() => tableService.listByRestaurant(1), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Manager Tables" description="Manage tables and regenerate QR codes as needed." />
      <Card>
        <DataTable
          columns={[
            { key: 'table', label: 'Table', render: (row) => row.tableNumber },
            { key: 'qr', label: 'QR', render: (row) => <a className="text-teal-600 dark:text-teal-300" href={row.qrCodeUrl}>View code</a> },
            { key: 'action', label: 'Action', render: () => <Button variant="ghost">Regenerate QR</Button> },
          ]}
          rows={tables || []}
        />
      </Card>
    </div>
  );
};

export const KitchenDashboardPage = () => {
  const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('PENDING');
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const { data: orders, loading, error, setData } = useAsyncResource(
    () => (tab === 'ACTIVE' ? orderService.kitchenOrders() : orderService.kitchenPastOrders()),
    [tab, refreshKey]
  );
  const groupedOrders = useMemo(() => groupKitchenOrders(orders || []), [orders]);
  const activeOrders = (orders || []).filter((order) => STAFF_ACTIVE_STATUSES.includes(order.status));
  const currentMobileOrders = groupedOrders[activeStatus] || [];

  useEffect(() => {
    if (!orders) {
      return;
    }
    setLastUpdatedAt(new Date());
  }, [orders]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden && tab === 'ACTIVE') {
        setRefreshKey((value) => value + 1);
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [tab]);

  const updateOrderStatus = async (order: Order) => {
    const nextStatus = getKitchenNextStatus(order.status);
    if (!nextStatus || updatingOrderId) {
      return;
    }

    setUpdatingOrderId(order.id);
    try {
      const updated = await orderService.kitchenUpdateStatus(order.id, nextStatus);
      setData((orders || []).filter((entry) => entry.id !== updated.id).concat(STAFF_ACTIVE_STATUSES.includes(updated.status) ? [updated] : []));
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(STAFF_ACTIVE_STATUSES.includes(updated.status) ? updated : null);
      }
      toast.success(`Order #${order.id} updated to ${STAFF_STATUS_LABELS[updated.status]}`);
    } catch (updateError: any) {
      toast.error(updateError?.response?.data?.message || 'Unable to update this order. Refreshing queue.');
      setRefreshKey((value) => value + 1);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const nextStatus = getKitchenNextStatus(order.status);
    const waiting = formatWaitingTime(waitingMinutes(order.orderTime));
    const currencyCode = order.restaurantCurrencyCode || 'LKR';

    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order #{order.id}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">Table {order.tableNumber}</h2>
            <p className="mt-1 text-sm text-slate-500">{waiting} · {formatDateTime(order.orderTime)}</p>
          </div>
          <StatusBadge value={order.status} />
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">{orderItemCount(order)} item{orderItemCount(order) === 1 ? '' : 's'}</span>
            <span className="text-slate-500">{formatCurrency(order.totalAmount, currencyCode)}</span>
          </div>
          <div className="mt-3 space-y-2">
            {order.items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 break-words font-medium">{item.quantity} × {item.itemName}</span>
                <span className="shrink-0 text-slate-500">{formatCurrency(item.subTotal, currencyCode)}</span>
              </div>
            ))}
            {order.items.length > 4 ? <p className="text-xs text-slate-500">+{order.items.length - 4} more items</p> : null}
          </div>
        </div>
        <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
          <Button variant="ghost" size="large" onClick={() => setSelectedOrder(order)}>View details</Button>
          <Button size="large" disabled={!nextStatus || updatingOrderId === order.id} loading={updatingOrderId === order.id} onClick={() => updateOrderStatus(order)}>
            {getKitchenActionLabel(order.status)}
          </Button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Kitchen Order Queue" description="Touch-friendly active order board for pending, preparing, and ready kitchen work." />
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <Button variant={tab === 'ACTIVE' ? 'primary' : 'ghost'} onClick={() => setTab('ACTIVE')}>Active Queue</Button>
            <Button variant={tab === 'PAST' ? 'primary' : 'ghost'} onClick={() => setTab('PAST')}>Recent Completed</Button>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            {tab === 'ACTIVE' ? `${activeOrders.length} active orders` : `${orders?.length || 0} completed orders`}
            {lastUpdatedAt ? ` · Updated ${lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
      </Card>
      {error ? <Card><p className="text-sm text-rose-600">{error}</p></Card> : null}
      {loading ? <Card><p className="text-sm text-slate-500">Loading kitchen queue...</p></Card> : null}
      {!loading && !error && tab === 'ACTIVE' ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden" role="tablist" aria-label="Kitchen queue statuses">
            {STAFF_ACTIVE_STATUSES.map((status) => (
              <button key={status} type="button" role="tab" aria-selected={activeStatus === status} onClick={() => setActiveStatus(status)} className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold ${activeStatus === status ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'}`}>
                {STAFF_STATUS_LABELS[status]} · {groupedOrders[status].length}
              </button>
            ))}
          </div>
          <section className="grid gap-4 lg:hidden">
            {currentMobileOrders.length ? currentMobileOrders.map((order) => <OrderCard key={order.id} order={order} />) : <Card><p className="text-sm text-slate-500">No {STAFF_STATUS_LABELS[activeStatus].toLowerCase()} orders.</p></Card>}
          </section>
          <section className="hidden gap-4 lg:grid lg:grid-cols-3">
            {STAFF_ACTIVE_STATUSES.map((status) => (
              <div key={status} className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-950 dark:text-white">{STAFF_STATUS_LABELS[status]}</h2>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{groupedOrders[status].length}</span>
                </div>
                <div className="space-y-3">
                  {groupedOrders[status].length ? groupedOrders[status].map((order) => <OrderCard key={order.id} order={order} />) : <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 dark:bg-slate-900">No orders in this stage.</p>}
                </div>
              </div>
            ))}
          </section>
          {!activeOrders.length ? <Card><p className="text-sm text-slate-500">No active kitchen orders right now. New orders will appear after the next refresh.</p></Card> : null}
        </>
      ) : null}
      {!loading && !error && tab === 'PAST' ? (
        <Card>
          <DataTable<Order>
            columns={[
              { key: 'order', label: 'Order', render: (row) => `#${row.id}` },
              { key: 'table', label: 'Table', render: (row) => row.tableNumber },
              { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} currencyCode={row.restaurantCurrencyCode || 'LKR'} emptyLabel="Could not load orders." /> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'time', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
            ]}
            rows={orders || []}
          />
        </Card>
      ) : null}
      <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order details'} description={selectedOrder ? `Table ${selectedOrder.tableNumber} · ${STAFF_STATUS_LABELS[selectedOrder.status]}` : undefined}>
        {selectedOrder ? (
          <>
            <ModalBody>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div>
                    <p className="text-sm text-slate-500">Placed {formatDateTime(selectedOrder.orderTime)}</p>
                    <p className="mt-1 text-xl font-semibold">Table {selectedOrder.tableNumber}</p>
                  </div>
                  <StatusBadge value={selectedOrder.status} />
                </div>
                <OrderItemsList items={selectedOrder.items} currencyCode={selectedOrder.restaurantCurrencyCode || 'LKR'} emptyLabel="No items found for this order." />
                <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Order notes are not provided by the current backend response.</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button size="large" disabled={!getKitchenNextStatus(selectedOrder.status) || updatingOrderId === selectedOrder.id} loading={updatingOrderId === selectedOrder.id} onClick={() => updateOrderStatus(selectedOrder)}>
                {getKitchenActionLabel(selectedOrder.status)}
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export const CashierDashboardPage = () => {
  const { data: metrics } = useAsyncResource(() => dashboardService.cashierMetrics(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Cashier Dashboard" description="Pending settlements and daily revenue." />
      <div className="grid gap-4 md:grid-cols-2">
        {(metrics || []).map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
    </div>
  );
};

export const BillingPage = () => {
  const { data: orders } = useAsyncResource(() => orderService.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Generate bills, view line items, and prepare receipts." />
      <Card>
        <DataTable
          columns={[
            { key: 'order', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'table', label: 'Table', render: (row) => row.tableNumber },
            { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} currencyCode={row.restaurantCurrencyCode || 'LKR'} emptyLabel="Could not load orders." /> },
            { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.totalAmount, row.restaurantCurrencyCode || 'LKR') },
            { key: 'receipt', label: 'Receipt', render: () => <div className="flex flex-wrap gap-2"><Button variant="ghost">View Bill</Button><Button>Print Receipt</Button></div> },
          ]}
          rows={orders || []}
        />
      </Card>
    </div>
  );
};

export const PaymentsPage = () => {
  const { data: orders, setData } = useAsyncResource(() => orderService.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Record cash, card, and online payment completion." />
      <Card>
        <DataTable
          columns={[
            { key: 'order', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} currencyCode={row.restaurantCurrencyCode || 'LKR'} emptyLabel="Could not load orders." /> },
            { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.totalAmount, row.restaurantCurrencyCode || 'LKR') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost">Cash</Button>
                  <Button variant="ghost">Card</Button>
                  <Button onClick={async () => { const updated = await orderService.updateStatus(row.id, 'COMPLETED'); setData((orders || []).map((entry) => entry.id === row.id ? updated : entry)); toast.success('Order closed'); }}>Mark Paid</Button>
                </div>
              ),
            },
          ]}
          rows={orders || []}
        />
      </Card>
    </div>
  );
};
