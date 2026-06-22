import { useState } from 'react';
import toast from 'react-hot-toast';
import { dashboardService, menuService, orderService, tableService } from '../api/services';
import { useAsyncResource } from '../hooks';
import { Button, Card, DataTable, OrderItemsList, PageHeader, StatCard, StatusBadge } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';

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
            { key: 'actions', label: 'Actions', render: () => <div className="flex gap-2"><Button variant="ghost">Edit</Button><Button variant="ghost">Create Category</Button></div> },
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
                <div className="flex gap-2">
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
  const { data: metrics } = useAsyncResource(() => dashboardService.kitchenMetrics(), []);
  const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: orders } = useAsyncResource(
    () => (tab === 'ACTIVE' ? orderService.kitchenOrders() : orderService.kitchenPastOrders()),
    [tab, refreshKey]
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Kitchen Dashboard" description="Track pending, preparing, and ready orders." />
      <div className="grid gap-4 md:grid-cols-3">
        {(metrics || []).map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
      <Card>
        <div className="flex gap-3">
          <Button variant={tab === 'ACTIVE' ? 'primary' : 'ghost'} onClick={() => setTab('ACTIVE')}>Active Orders</Button>
          <Button variant={tab === 'PAST' ? 'primary' : 'ghost'} onClick={() => setTab('PAST')}>Past Orders</Button>
        </div>
      </Card>
      <Card>
        <DataTable
          columns={[
            { key: 'order', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} emptyLabel="Could not load orders." /> },
            { key: 'notes', label: 'Special Notes', render: () => 'No special notes' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            ...(tab === 'ACTIVE' ? [{
              key: 'actions',
              label: 'Actions',
              render: (row: any) => (
                <div className="flex gap-2">
                  {row.status === 'PENDING' ? <Button variant="ghost" onClick={async () => { await orderService.kitchenUpdateStatus(row.id, 'PREPARING'); setRefreshKey((value) => value + 1); toast.success('Marked preparing'); }}>Mark Preparing</Button> : null}
                  {row.status === 'PREPARING' ? <Button onClick={async () => { await orderService.kitchenUpdateStatus(row.id, 'READY'); setRefreshKey((value) => value + 1); toast.success('Marked ready'); }}>Mark Ready</Button> : null}
                  {row.status === 'READY' ? <Button onClick={async () => { await orderService.kitchenUpdateStatus(row.id, 'COMPLETED'); setRefreshKey((value) => value + 1); toast.success('Marked completed'); }}>Mark Completed</Button> : null}
                </div>
              ),
            }] : []),
          ]}
          rows={orders || []}
        />
      </Card>
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
            { key: 'receipt', label: 'Receipt', render: () => <div className="flex gap-2"><Button variant="ghost">View Bill</Button><Button>Print Receipt</Button></div> },
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
                <div className="flex gap-2">
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
