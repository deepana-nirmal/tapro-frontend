import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../api/services';
import { useAppSelector, useAsyncResource } from '../hooks';
import { Button, Card, DataTable, Input, PageHeader } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';

export const CustomerDashboardPage = () => (
  <div className="space-y-6">
    <PageHeader title="Customer Account" description="Manage profile, review orders, and continue QR orders." />
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/menu/1/table/1" className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950">Open Menu</a>
          <a href="/checkout" className="rounded-2xl bg-teal-500 px-4 py-2 text-sm font-medium text-white">Review Cart</a>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Account Summary</h2>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Track order statuses and update customer profile data here.</p>
      </Card>
    </div>
  </div>
);

export const CustomerOrdersPage = () => {
  const { data: orders } = useAsyncResource(() => orderService.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Order History" description="Review completed and in-progress orders." />
      <Card>
        <DataTable
          columns={[
            { key: 'id', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'table', label: 'Table', render: (row) => row.tableNumber },
            { key: 'status', label: 'Status', render: (row) => row.status },
            { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.totalAmount, row.restaurantCurrencyCode || 'LKR') },
            { key: 'time', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
          ]}
          rows={orders || []}
        />
      </Card>
    </div>
  );
};

export const CustomerProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Management" description="Update customer account details." />
      <Card>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success('Profile updated');
          }}
        >
          <Input label="Full Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="md:col-span-2">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
