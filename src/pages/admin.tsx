import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { dashboardService, reportingService, restaurantService, subscriptionService, superAdminRestaurantService, superAdminUserService } from '../api/services';
import { CategoryWorkspace } from '../components/category/CategoryWorkspace';
import { ImageWithFallback, initialsFromName } from '../components/shared/ImageWithFallback';
import { useAsyncResource } from '../hooks';
import { Button, Card, DataTable, Input, LoadingBlock, OrderItemsList, PageHeader, Select, StatCard, StatusBadge, Textarea } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';
import { validateImageFile } from '../utils/upload';
import { AdminInvitationsPage } from './invitations';
import { BackendRole, Restaurant, SuperAdminUser, SuperAdminUserRequest, UsersByRestaurantGroup } from '../types';

const manageableRoles: Array<{ value: Extract<BackendRole, 'OWNER' | 'STAFF' | 'KITCHEN'>; label: string }> = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'KITCHEN', label: 'Kitchen' },
];

const manageableRoleValues = new Set<BackendRole>(manageableRoles.map((role) => role.value));

const emptyUserForm = (): SuperAdminUserRequest => ({
  name: '',
  email: '',
  role: 'OWNER',
  restaurantId: null,
  password: '',
  enabled: true,
});

export const SuperAdminDashboardPage = () => {
  const { data: metrics, loading, error } = useAsyncResource(() => dashboardService.superAdminMetrics(), []);
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useAsyncResource(() => dashboardService.activities(), []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Super Admin Dashboard" description="Platform-wide revenue, tenant health, and recent activity." />
        <Card><p className="text-sm text-rose-600">{error || 'Unable to load dashboard. Please try again.'}</p></Card>
      </div>
    );
  }

  if (!metrics?.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Super Admin Dashboard" description="Platform-wide revenue, tenant health, and recent activity." />
        <Card><p className="text-sm text-slate-500 dark:text-slate-300">No dashboard metrics available yet.</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin Dashboard" description="Platform-wide revenue, tenant health, and recent activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
      <Card>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recent Activities</h2>
        {activitiesLoading ? <LoadingBlock label="Loading recent activities..." /> : null}
        {!activitiesLoading && activitiesError ? <p className="mt-4 text-sm text-rose-600">{activitiesError}</p> : null}
        {!activitiesLoading && !activitiesError && !(activities || []).length ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">No recent activity found.</p>
        ) : null}
        <div className="mt-4 space-y-4">
          {(activities || []).map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{activity.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activity.description}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const RestaurantsManagementPage = () => {
  const { data: restaurants, loading, error, setData } = useAsyncResource(() => restaurantService.listAdmin(), []);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    description: '',
    openingHours: '',
    serviceChargePercentage: 0,
    taxPercentage: 0,
    currency: 'USD',
    themeColor: '#10b981',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const reloadRestaurants = async () => {
    setData(await restaurantService.listAdmin());
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await restaurantService.create(form);
      await reloadRestaurants();
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
        description: '',
        openingHours: '',
        serviceChargePercentage: 0,
        taxPercentage: 0,
        currency: 'USD',
        themeColor: '#10b981',
      });
      toast.success('Restaurant created successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to create restaurant.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading restaurants...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurants" description="Create restaurants, review tenant health, and open a restaurant-specific workspace." />
        <Card><p className="text-sm text-rose-600">{error || 'Unable to load restaurants. Please try again.'}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Restaurants" description="Create restaurants, review tenant health, and open a restaurant-specific workspace." />
      {!restaurants?.length ? (
        <Card><p className="text-sm text-slate-500 dark:text-slate-300">No restaurants found. Create your first restaurant.</p></Card>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Create Restaurant</h2>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Textarea label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            {submitError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
            <Button type="submit" disabled={submitLoading}>{submitLoading ? 'Creating...' : 'Create restaurant'}</Button>
          </form>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {(restaurants || []).map((restaurant) => (
            <Card key={restaurant.id} className="rounded-[28px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={restaurant.logoUrl}
                    alt={`${restaurant.name} logo`}
                    fallback={initialsFromName(restaurant.name)}
                    className="h-16 w-16 rounded-2xl object-cover"
                    fallbackClassName="h-16 w-16 rounded-2xl text-xl"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{restaurant.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{restaurant.email || 'No contact email'}</p>
                  </div>
                </div>
                <StatusBadge value={restaurant.status || 'ACTIVE'} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Address</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{restaurant.address || 'No address'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contact</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{restaurant.phone || 'No phone'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Active Orders</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{restaurant.activeOrderCount ?? 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Today Revenue</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {typeof restaurant.todayRevenue === 'number' ? formatCurrency(restaurant.todayRevenue) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="inline-flex items-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950" to={`/super-admin/restaurants/${restaurant.id}`}>View Details</Link>
                <Button
                  variant="ghost"
                  disabled={actionLoadingId === restaurant.id}
                  onClick={async () => {
                    setActionLoadingId(restaurant.id);
                    try {
                      if (restaurant.status === 'ACTIVE') {
                        await restaurantService.suspend(restaurant.id);
                        toast.success('Restaurant suspended successfully');
                      } else {
                        await restaurantService.activate(restaurant.id);
                        toast.success('Restaurant activated successfully');
                      }
                      await reloadRestaurants();
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || 'Unable to update restaurant status.');
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >
                  {restaurant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </Button>
                <Button
                  variant="danger"
                  disabled={actionLoadingId === restaurant.id}
                  onClick={async () => {
                    setActionLoadingId(restaurant.id);
                    try {
                      await restaurantService.delete(restaurant.id);
                      await reloadRestaurants();
                      toast.success('Restaurant deleted successfully');
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || 'Unable to delete restaurant.');
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SuperAdminUsersManagementPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groups, setGroups] = useState<UsersByRestaurantGroup[]>([]);
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | BackendRole>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SuperAdminUser | null>(null);
  const [form, setForm] = useState<SuperAdminUserRequest>(emptyUserForm());
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reloadAll = async () => {
    setLoading(true);
    setPageError('');

    try {
      const [restaurantList, groupedUsers, allUsers] = await Promise.all([
        restaurantService.listAdmin(),
        superAdminUserService.listByRestaurant(),
        superAdminUserService.list(),
      ]);
      setRestaurants(restaurantList);
      setGroups(groupedUsers);
      setUsers(allUsers);
    } catch (error: any) {
      setPageError(error?.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchesUser = (user: SuperAdminUser) => {
      const matchesSearch = !normalizedSearch
        || user.name.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    };

    return groups
      .filter((group) => restaurantFilter === 'ALL' || String(group.restaurantId ?? 'UNASSIGNED') === restaurantFilter)
      .map((group) => ({
        ...group,
        owners: group.owners.filter(matchesUser),
        staff: group.staff.filter(matchesUser),
        kitchen: group.kitchen.filter(matchesUser),
        superAdmins: group.superAdmins.filter(matchesUser),
        unassigned: group.unassigned.filter(matchesUser),
      }))
      .filter((group) => (
        group.owners.length
        || group.staff.length
        || group.kitchen.length
        || group.superAdmins.length
        || group.unassigned.length
      ));
  }, [groups, restaurantFilter, roleFilter, search]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyUserForm());
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (user: SuperAdminUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: manageableRoleValues.has(user.role) ? (user.role as Extract<BackendRole, 'OWNER' | 'STAFF' | 'KITCHEN'>) : 'OWNER',
      restaurantId: user.restaurantId ?? null,
      enabled: user.enabled,
    });
    setModalError('');
    setModalOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (!editingUser && !form.password?.trim()) {
        throw new Error('Password is required for new users.');
      }

      const payload: SuperAdminUserRequest = {
        ...form,
        password: editingUser ? undefined : form.password,
      };

      if (editingUser) {
        await superAdminUserService.update(editingUser.id, payload);
        toast.success('User updated successfully');
      } else {
        await superAdminUserService.create(payload);
        toast.success('User created successfully');
      }

      setModalOpen(false);
      await reloadAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to save user.';
      setModalError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user: SuperAdminUser) => {
    setActionLoadingId(user.id);
    try {
      if (user.enabled) {
        await superAdminUserService.disable(user.id);
        toast.success('User disabled successfully');
      } else {
        await superAdminUserService.enable(user.id);
        toast.success('User enabled successfully');
      }
      await reloadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteUser = async (user: SuperAdminUser) => {
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await superAdminUserService.delete(user.id);
      toast.success('User deleted successfully');
      await reloadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderUserRow = (user: SuperAdminUser) => {
    const manageable = manageableRoleValues.has(user.role);

    return (
      <div key={user.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-slate-950 dark:text-white">{user.name}</p>
              <StatusBadge value={user.enabled ? 'ACTIVE' : 'DISABLED'} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{user.role.replace(/_/g, ' ')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" disabled={!manageable || actionLoadingId === user.id} onClick={() => openEditModal(user)}>
              Edit
            </Button>
            <Button variant="ghost" disabled={!manageable || actionLoadingId === user.id} onClick={() => toggleStatus(user)}>
              {actionLoadingId === user.id ? 'Saving...' : user.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="danger" disabled={!manageable || actionLoadingId === user.id} onClick={() => deleteUser(user)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const roleSections = (group: UsersByRestaurantGroup) => [
    { title: 'Owner users', users: group.owners },
    { title: 'Staff users', users: group.staff },
    { title: 'Kitchen users', users: group.kitchen },
  ];

  if (loading) {
    return <LoadingBlock label="Loading users..." />;
  }

  if (pageError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users Management" description="View all users by restaurant and manage operational accounts." />
        <Card><p className="text-sm text-rose-600">{pageError}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Management"
        description="View platform users by restaurant, create operational accounts, and manage ownership or staff assignments."
        action={<Button onClick={openCreateModal}>Create user</Button>}
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" />
          <Select label="Filter by restaurant" value={restaurantFilter} onChange={(event) => setRestaurantFilter(event.target.value)}>
            <option value="ALL">All restaurants</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
            <option value="UNASSIGNED">Unassigned / Platform Users</option>
          </Select>
          <Select label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'ALL' | BackendRole)}>
            <option value="ALL">All roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="OWNER">Owner</option>
            <option value="STAFF">Staff</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="ADMIN">Admin</option>
            <option value="CASHIER">Cashier</option>
            <option value="CUSTOMER">Customer</option>
          </Select>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
          {users.length} total users loaded from the backend. Only OWNER, STAFF, and KITCHEN users are editable from this screen.
        </p>
      </Card>

      <div className="grid gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.restaurantName}>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{group.restaurantName}</h2>
            <div className="mt-5 space-y-6">
              {group.restaurantId == null ? (
                <>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Super Admin users</h3>
                    {group.superAdmins.length ? group.superAdmins.map(renderUserRow) : <p className="text-sm text-slate-500">No super admin users.</p>}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Unassigned users</h3>
                    {group.unassigned.length ? group.unassigned.map(renderUserRow) : <p className="text-sm text-slate-500">No unassigned users.</p>}
                  </div>
                </>
              ) : (
                roleSections(group).map((section) => (
                  <div key={section.title} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{section.title}</h3>
                    {section.users.length ? section.users.map(renderUserRow) : <p className="text-sm text-slate-500">No users in this category.</p>}
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{editingUser ? 'Edit user' : 'Create user'}</h2>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Close</Button>
            </div>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
              <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Extract<BackendRole, 'OWNER' | 'STAFF' | 'KITCHEN'> })}>
                {manageableRoles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </Select>
              <Select
                label="Restaurant"
                value={form.restaurantId ?? ''}
                onChange={(event) => setForm({ ...form, restaurantId: event.target.value ? Number(event.target.value) : null })}
              >
                <option value="" disabled>Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                ))}
              </Select>
              {!editingUser ? (
                <Input
                  label="Password"
                  type="password"
                  value={form.password || ''}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              ) : null}
              <Select label="Status" value={form.enabled ? 'enabled' : 'disabled'} onChange={(event) => setForm({ ...form, enabled: event.target.value === 'enabled' })}>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </Select>
              {modalError ? <p className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{modalError}</p> : null}
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingUser ? 'Save changes' : 'Create user'}</Button>
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const InvitationManagementPage = () => {
  return <AdminInvitationsPage />;
};

export const SubscriptionManagementPage = () => {
  const { data: plans, setData } = useAsyncResource(() => subscriptionService.plans(), []);
  const { data: subscriptions } = useAsyncResource(() => subscriptionService.subscriptions(), []);
  const [form, setForm] = useState<{
    id: string;
    name: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    features: string;
  }>({ id: '', name: '', price: 49, billingCycle: 'MONTHLY', features: 'QR ordering, Dashboard access' });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const plan = {
      id: form.id || form.name.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      price: Number(form.price),
      billingCycle: form.billingCycle,
      active: true,
      features: form.features.split(',').map((item) => item.trim()),
    };
    await subscriptionService.createPlan(plan);
    setData([...(plans || []), plan]);
    toast.success('Plan saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Create plans, assign billing tiers, and watch active subscriptions." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Input label="Plan name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Input label="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required />
            <Select label="Billing cycle" value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value as 'MONTHLY' | 'YEARLY' })}>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </Select>
            <Textarea label="Features (comma separated)" value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} />
            <Button type="submit">Create plan</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Active Subscriptions</h2>
          <div className="mt-4 space-y-3">
            {(subscriptions || []).map((subscription) => (
              <div key={subscription.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-950 dark:text-white">{subscription.restaurantName}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-300">{subscription.planName}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge value={subscription.status} />
                    <div className="mt-2 text-xs text-slate-400">Renews {subscription.renewalDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <DataTable
          columns={[
            { key: 'name', label: 'Plan', render: (row) => row.name },
            { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
            { key: 'cycle', label: 'Billing', render: (row) => row.billingCycle },
            { key: 'features', label: 'Features', render: (row) => row.features.join(', ') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <Button variant="danger" onClick={async () => { await subscriptionService.deletePlan(row.id); setData((plans || []).filter((item) => item.id !== row.id)); toast.success('Plan deleted'); }}>
                  Delete
                </Button>
              ),
            },
          ]}
          rows={plans || []}
        />
      </Card>
    </div>
  );
};

export const PlatformReportsPage = () => {
  const { data: revenue } = useAsyncResource(() => reportingService.platformRevenue(), []);
  const { data: growth } = useAsyncResource(() => reportingService.restaurantGrowth(), []);
  const { data: analytics } = useAsyncResource(() => reportingService.orderAnalytics(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Reports" description="Revenue statistics, restaurant growth, and order analytics." />
      <div className="grid gap-6 xl:grid-cols-3">
        {([
          ['Platform Revenue', revenue],
          ['Restaurant Growth', growth],
          ['Order Analytics', analytics],
        ] as Array<[string, typeof revenue]>).map(([title, points]) => (
          <Card key={title}>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
            <div className="mt-4 space-y-3">
              {(points as any[] || []).map((point) => (
                <div key={point.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                  <span>{point.label}</span>
                  <span className="font-semibold">{formatCurrency(point.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const PlatformSettingsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Platform Settings" description="SaaS-wide settings and audit logs." />
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Platform Settings</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Configure platform branding, email sending domains, invoice rules, and tenant defaults.</p>
          <p>These controls are ready for direct backend integration once the corresponding settings API is added.</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Audit Logs</h2>
        <div className="mt-4 space-y-3">
          {['Restaurant deleted', 'Plan assigned', 'Owner invitation resent'].map((entry) => (
            <div key={entry} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {entry}
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export const SuperAdminRestaurantDetailPage = () => {
  const { restaurantId = '1' } = useParams();
  const numericRestaurantId = Number(restaurantId);
  const [tab, setTab] = useState<'OVERVIEW' | 'ACTIVE' | 'PAST' | 'USERS' | 'ANALYTICS' | 'MENU' | 'CATEGORIES' | 'TABLES' | 'SETTINGS'>('OVERVIEW');
  const [preset, setPreset] = useState<'ALL_TIME' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'>('ALL_TIME');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [tableFilter, setTableFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');

  const getRange = () => {
    const now = new Date();
    const format = (value: Date) => value.toISOString().slice(0, 10);

    if (preset === 'ALL_TIME') {
      return { from: undefined, to: undefined };
    }

    if (preset === 'TODAY') {
      const today = format(now);
      return { from: today, to: today };
    }

    if (preset === 'THIS_WEEK') {
      const current = new Date(now);
      const day = current.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      current.setDate(current.getDate() + diffToMonday);
      return { from: format(current), to: format(now) };
    }

    if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: format(start), to: format(now) };
    }

    return { from: customFrom || undefined, to: customTo || undefined };
  };

  const range = getRange();
  const { data: restaurant, loading: restaurantLoading } = useAsyncResource(
    () => superAdminRestaurantService.getById(numericRestaurantId),
    [numericRestaurantId, refreshKey]
  );
  const { data: activeOrders } = useAsyncResource(() => superAdminRestaurantService.activeOrders(numericRestaurantId), [numericRestaurantId, refreshKey]);
  const { data: pastOrders } = useAsyncResource(
    () => superAdminRestaurantService.pastOrders(numericRestaurantId, {
      from: range.from,
      to: range.to,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      tableNumber: tableFilter || undefined,
    }),
    [numericRestaurantId, preset, customFrom, customTo, statusFilter, tableFilter, refreshKey]
  );
  const { data: menuItems } = useAsyncResource(() => superAdminRestaurantService.menuItems(numericRestaurantId), [numericRestaurantId, refreshKey]);
  const { data: tables } = useAsyncResource(() => superAdminRestaurantService.tables(numericRestaurantId), [numericRestaurantId, refreshKey]);
  const { data: users } = useAsyncResource(() => superAdminRestaurantService.users(numericRestaurantId), [numericRestaurantId, refreshKey]);
  const { data: analytics } = useAsyncResource(() => superAdminRestaurantService.analytics(numericRestaurantId), [numericRestaurantId, refreshKey]);

  if (restaurantLoading || !restaurant) {
    return <LoadingBlock label="Loading restaurant workspace..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={restaurant.name} description="Super admin restaurant workspace." action={<Link className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950" to="/super-admin/restaurants">Back to restaurants</Link>} />
      <Card>
        <div className="flex flex-wrap gap-3">
          {[
            ['OVERVIEW', 'Overview'],
            ['ACTIVE', 'Active Orders'],
            ['PAST', 'Past Orders'],
            ['USERS', 'Staff & Kitchen Users'],
            ['ANALYTICS', 'Revenue / Analytics'],
            ['MENU', 'Menu Items'],
            ['CATEGORIES', 'Categories'],
            ['TABLES', 'Tables & QR'],
            ['SETTINGS', 'Restaurant Settings'],
          ].map(([value, label]) => (
            <Button key={value} variant={tab === value ? 'primary' : 'ghost'} onClick={() => setTab(value as typeof tab)}>{label}</Button>
          ))}
        </div>
      </Card>
      {tab === 'OVERVIEW' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Status" value={restaurant.status || 'ACTIVE'} helper="Restaurant lifecycle state" tone="blue" />
            <StatCard label="Active Orders" value={activeOrders?.length || 0} helper="Pending, preparing, ready" tone="amber" />
            <StatCard label="Past Orders" value={pastOrders?.length || 0} helper="Completed and cancelled" tone="emerald" />
            <StatCard label="Team Members" value={users?.length || 0} helper="Staff and kitchen accounts" tone="rose" />
          </div>
          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={restaurant.logoUrl}
                  alt={`${restaurant.name} logo`}
                  fallback={initialsFromName(restaurant.name)}
                  className="h-20 w-20 rounded-2xl object-cover"
                  fallbackClassName="h-20 w-20 rounded-2xl text-2xl"
                />
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{restaurant.name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{restaurant.address || 'No address available'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{restaurant.phone || 'No contact number'} · {restaurant.email || 'No email'}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Today Revenue</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{typeof restaurant.todayRevenue === 'number' ? formatCurrency(restaurant.todayRevenue) : 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Active Order Count</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{restaurant.activeOrderCount ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : null}
      {tab === 'ACTIVE' ? (
        <Card>
          <DataTable
            columns={[
              { key: 'id', label: 'Order', render: (row) => `#${row.id}` },
              { key: 'table', label: 'Table', render: (row) => row.tableNumber },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} emptyLabel="Could not load orders." /> },
              { key: 'total', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
              { key: 'time', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
            ]}
            rows={activeOrders || []}
          />
        </Card>
      ) : null}
      {tab === 'PAST' ? (
        <>
          <Card>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Select label="Date Range" value={preset} onChange={(event) => setPreset(event.target.value as typeof preset)}>
                <option value="ALL_TIME">All time</option>
                <option value="TODAY">Today</option>
                <option value="THIS_WEEK">This week</option>
                <option value="THIS_MONTH">This month</option>
                <option value="CUSTOM">Custom range</option>
              </Select>
              <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                <option value="ALL">All statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
              <Input label="Table Number" value={tableFilter} onChange={(event) => setTableFilter(event.target.value)} placeholder="T1" />
              <Input label="From" type="date" value={customFrom} disabled={preset !== 'CUSTOM'} onChange={(event) => setCustomFrom(event.target.value)} />
              <Input label="To" type="date" value={customTo} disabled={preset !== 'CUSTOM'} onChange={(event) => setCustomTo(event.target.value)} />
            </div>
          </Card>
          <Card>
            <DataTable
              columns={[
                { key: 'id', label: 'Order', render: (row) => `#${row.id}` },
                { key: 'table', label: 'Table', render: (row) => row.tableNumber },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
                { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} emptyLabel="Could not load orders." /> },
                { key: 'total', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
                { key: 'time', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
              ]}
              rows={pastOrders || []}
            />
          </Card>
        </>
      ) : null}
      {tab === 'MENU' ? (
        <Card>
          <DataTable
            columns={[
              { key: 'name', label: 'Item', render: (row) => row.name },
              { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={menuItems || []}
          />
        </Card>
      ) : null}
      {tab === 'CATEGORIES' ? (
        <CategoryWorkspace
          restaurantId={numericRestaurantId}
          mode="SUPER_ADMIN"
          title="Categories"
          description="Open any category to manage visibility, images, and category-specific menu items for this restaurant."
        />
      ) : null}
      {tab === 'TABLES' ? (
        <Card>
          <DataTable
            columns={[
              { key: 'table', label: 'Table', render: (row) => row.tableNumber },
              { key: 'active', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'ACTIVE' : 'INACTIVE'} /> },
              { key: 'qr', label: 'QR', render: (row) => <a className="text-teal-600 dark:text-teal-300" href={row.qrCodeUrl}>Open QR</a> },
            ]}
            rows={tables || []}
          />
        </Card>
      ) : null}
      {tab === 'USERS' ? (
        <Card>
          <DataTable
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'email', label: 'Email', render: (row) => row.email },
              { key: 'role', label: 'Role', render: (row) => <StatusBadge value={row.role} /> },
              { key: 'enabled', label: 'Account', render: (row) => <StatusBadge value={row.enabled ? 'ACTIVE' : 'DISABLED'} /> },
            ]}
            rows={users || []}
          />
        </Card>
      ) : null}
      {tab === 'SETTINGS' ? (
        <Card>
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={logoPreviewUrl || restaurant.logoUrl}
                alt={`${restaurant.name} logo`}
                fallback={initialsFromName(restaurant.name)}
                className="h-20 w-20 rounded-2xl object-cover"
                fallbackClassName="h-20 w-20 rounded-2xl text-2xl"
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Restaurant Logo</h2>
                <p className="text-sm text-slate-500">Upload JPG, PNG, or WEBP up to 5MB.</p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
              {logoUploading ? 'Uploading...' : 'Upload Logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={logoUploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (!file) {
                    return;
                  }

                  setLogoUploading(true);
                  try {
                    validateImageFile(file);
                    setLogoPreviewUrl(URL.createObjectURL(file));
                    await superAdminRestaurantService.uploadLogo(numericRestaurantId, file);
                    setRefreshKey((value) => value + 1);
                    setLogoPreviewUrl('');
                    toast.success('Restaurant logo updated');
                  } catch (uploadError: any) {
                    setLogoPreviewUrl('');
                    toast.error(uploadError?.response?.data?.message || uploadError?.message || 'Could not upload image. Please try another image under 5MB.');
                  } finally {
                    setLogoUploading(false);
                  }
                }}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold text-slate-950 dark:text-white">{restaurant.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-semibold text-slate-950 dark:text-white">{restaurant.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-semibold text-slate-950 dark:text-white">{restaurant.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-semibold text-slate-950 dark:text-white">{restaurant.status || 'ACTIVE'}</p>
            </div>
          </div>
        </Card>
      ) : null}
      {tab === 'ANALYTICS' && analytics ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue Today" value={formatCurrency(analytics.revenue.today)} helper="Completed and ready orders today" tone="emerald" />
          <StatCard label="Revenue Week" value={formatCurrency(analytics.revenue.week)} helper="Current week revenue" tone="blue" />
          <StatCard label="Revenue Month" value={formatCurrency(analytics.revenue.month)} helper="Current month revenue" tone="amber" />
          <StatCard label="Average Order" value={formatCurrency(analytics.averageOrderValue)} helper="Average completed/ready order" tone="rose" />
        </div>
      ) : null}
    </div>
  );
};
