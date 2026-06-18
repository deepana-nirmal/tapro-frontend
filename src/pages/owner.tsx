import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryService, dashboardService, invitationService, menuService, orderService, ownerAnalyticsService, ownerStaffService, restaurantService, tableService } from '../api/services';
import { CategoryWorkspace } from '../components/category/CategoryWorkspace';
import { useAppSelector, useAsyncResource } from '../hooks';
import { ImageWithFallback, initialsFromName } from '../components/shared/ImageWithFallback';
import { Button, Card, DataTable, Input, LoadingBlock, OrderItemsList, PageHeader, Select, StatCard, StatusBadge, Textarea } from '../components/ui';
import { formatCurrency, formatDateTime } from '../utils/format';
import { validateImageFile } from '../utils/upload';
import { OwnerInvitationRole, RestaurantFormValues } from '../types';

export const OwnerDashboardPage = () => {
  const { data: metrics } = useAsyncResource(() => dashboardService.ownerMetrics(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Owner Dashboard" description="Sales, table activity, and top-performing menu items." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(metrics || []).map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
    </div>
  );
};

export const RestaurantProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const restaurantId = user?.restaurantId;
  const [refreshKey, setRefreshKey] = useState(0);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [form, setForm] = useState<RestaurantFormValues>({
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const { data: restaurant, loading, error } = useAsyncResource(
    () => (restaurantId ? restaurantService.getById(restaurantId) : Promise.reject(new Error('No restaurant assigned'))),
    [restaurantId, refreshKey]
  );

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    setForm({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      logoUrl: restaurant.logoUrl || '',
      description: restaurant.description || '',
      openingHours: restaurant.openingHours || '',
      serviceChargePercentage: restaurant.serviceChargePercentage ?? 0,
      taxPercentage: restaurant.taxPercentage ?? 0,
      currency: restaurant.currency || 'USD',
      themeColor: restaurant.themeColor || '#10b981',
    });
  }, [restaurant]);

  if (loading) {
    return <LoadingBlock label="Loading restaurant settings..." />;
  }

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurant Settings" description="Restaurant settings are available once an owner is assigned to a restaurant." />
        <Card><p className="text-sm text-rose-600">No restaurant is assigned to this account.</p></Card>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurant Settings" description="Update your restaurant identity, pricing defaults, and customer-facing profile." />
        <Card><p className="text-sm text-rose-600">{error || 'Unable to load restaurant settings.'}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Restaurant Settings" description="Update branding, contact details, tax, service charge, and customer-facing profile settings." />
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
                  await restaurantService.uploadOwnerLogo(file);
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
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaveLoading(true);
            setSaveError('');

            try {
              await restaurantService.update(restaurant.id, form);
              toast.success('Restaurant settings updated');
            } catch (submitError: any) {
              const message = submitError?.response?.data?.message || submitError?.message || 'Unable to save restaurant settings.';
              setSaveError(message);
              toast.error(message);
            } finally {
              setSaveLoading(false);
            }
          }}
        >
          <Input label="Restaurant Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Support Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
          <Input label="Currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} required maxLength={10} />
          <Input label="Theme Color" value={form.themeColor} onChange={(event) => setForm({ ...form, themeColor: event.target.value })} placeholder="#10b981" required />
          <Textarea label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <Textarea label="Opening Hours" value={form.openingHours} onChange={(event) => setForm({ ...form, openingHours: event.target.value })} />
          <Input label="Service Charge (%)" type="number" min="0" max="100" step="0.01" value={form.serviceChargePercentage} onChange={(event) => setForm({ ...form, serviceChargePercentage: Number(event.target.value) })} required />
          <Input label="Tax (%)" type="number" min="0" max="100" step="0.01" value={form.taxPercentage} onChange={(event) => setForm({ ...form, taxPercentage: Number(event.target.value) })} required />
          {saveError ? <p className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{saveError}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={saveLoading}>{saveLoading ? 'Saving...' : 'Save settings'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const StaffManagementPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const restaurantId = user?.restaurantId;
  const { data: staffMembers, loading, error, setData } = useAsyncResource(
    () => (restaurantId ? ownerStaffService.list() : Promise.resolve([])),
    [restaurantId]
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'STAFF' as OwnerInvitationRole });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const resetInviteForm = () => {
    setForm({ email: '', role: 'STAFF' });
    setEmailError('');
    setSubmitError('');
  };

  const refreshRow = (updated: { id: number }) => {
    setData((staffMembers || []).map((item) => item.id === updated.id ? { ...item, ...updated } : item));
  };

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff Management" description="Invite and manage restaurant staff accounts." />
        <Card><p className="text-sm text-rose-600">No restaurant is assigned to this owner account.</p></Card>
      </div>
    );
  }

  if (loading) {
    return <LoadingBlock label="Loading staff accounts..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff Management" description="Invite staff, review active users, and control account access." />
        <Card><p className="text-sm text-rose-600">{error}</p></Card>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setInviteLoading(true);
    setEmailError('');
    setSubmitError('');

    try {
      await invitationService.sendInvitation(form.email.trim(), form.role, restaurantId);
      toast.success('Invitation sent');
      resetInviteForm();
      setInviteModalOpen(false);
    } catch (submitActionError: any) {
      const message = submitActionError?.response?.data?.message || 'Unable to send invitation.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Invite STAFF and KITCHEN users, review active accounts, and control access for your restaurant."
        action={<Button onClick={() => { resetInviteForm(); setInviteModalOpen(true); }}>Invite User</Button>}
      />
      <Card>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (row) => <div><div className="font-semibold">{row.name}</div><div className="text-xs text-slate-400">{row.email}</div></div> },
            { key: 'role', label: 'Role', render: (row) => <StatusBadge value={row.role} /> },
            { key: 'restaurant', label: 'Restaurant', render: (row) => row.restaurantName || 'Assigned restaurant' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.enabled ? 'ACTIVE' : 'DISABLED'} /> },
            {
              key: 'actions',
              label: 'Status Controls',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    disabled={actionLoadingId === row.id || row.enabled}
                    onClick={async () => {
                      setActionLoadingId(row.id);
                      try {
                        refreshRow(await ownerStaffService.enable(row.id));
                        toast.success('User enabled');
                      } catch (actionError: any) {
                        toast.error(actionError?.response?.data?.message || 'Unable to enable user.');
                      } finally {
                        setActionLoadingId(null);
                      }
                    }}
                  >
                    Enable
                  </Button>
                  <Button
                    variant="danger"
                    disabled={actionLoadingId === row.id || !row.enabled}
                    onClick={async () => {
                      setActionLoadingId(row.id);
                      try {
                        refreshRow(await ownerStaffService.disable(row.id));
                        toast.success('User disabled');
                      } catch (actionError: any) {
                        toast.error(actionError?.response?.data?.message || 'Unable to disable user.');
                      } finally {
                        setActionLoadingId(null);
                      }
                    }}
                  >
                    Disable
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={actionLoadingId === row.id}
                    onClick={async () => {
                      setActionLoadingId(row.id);
                      try {
                        await ownerStaffService.resetPassword(row.id);
                        toast.success('Password reset email sent');
                      } catch (actionError: any) {
                        toast.error(actionError?.response?.data?.message || 'Unable to reset password.');
                      } finally {
                        setActionLoadingId(null);
                      }
                    }}
                  >
                    Reset Password
                  </Button>
                </div>
              ),
            },
          ]}
          rows={staffMembers || []}
        />
      </Card>
      {inviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Invite User</h2>
              <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>Close</Button>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={submit}>
              <Input
                label="Email"
                type="email"
                value={form.email}
                error={emailError}
                onChange={(event) => {
                  setForm({ ...form, email: event.target.value });
                  if (emailError) {
                    setEmailError('');
                  }
                }}
                placeholder="staff@restaurant.com"
                required
              />
              <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as OwnerInvitationRole })}>
                <option value="" disabled>
                  Select role
                </option>
                <option value="STAFF">Staff</option>
                <option value="KITCHEN">Kitchen</option>
              </Select>
              <Select label="Restaurant" value={String(restaurantId)} disabled>
                <option value={String(restaurantId)}>{user?.restaurantId ? 'Your assigned restaurant' : 'Restaurant required'}</option>
              </Select>
              <p className="text-sm text-slate-600 dark:text-slate-300">This invitation is locked to your assigned restaurant. Owners can invite only STAFF and KITCHEN users.</p>
              {submitError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={inviteLoading}>{inviteLoading ? 'Sending...' : 'Send invitation'}</Button>
                <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const TableManagementPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const restaurantId = user?.restaurantId;
  const { data: tables, loading, error, setData } = useAsyncResource(
    () => (restaurantId ? tableService.listByRestaurant(restaurantId) : Promise.resolve([])),
    [restaurantId]
  );
  const [tableNumber, setTableNumber] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingTable, setEditingTable] = useState<{ id: number; tableNumber: string } | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const downloadQr = async (imageUrl: string, tableLabel: string) => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Unable to download QR code.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${tableLabel}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const printQr = (imageUrl: string) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Unable to open print window.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head><title>Print QR</title></head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
          <img src="${imageUrl}" alt="QR Code" style="max-width:420px;width:100%;" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Table Management" description="Create, edit, and manage permanent QR codes for your restaurant tables." />
        <Card><p className="text-sm text-rose-600">No restaurant is assigned to this owner account.</p></Card>
      </div>
    );
  }

  if (loading) {
    return <LoadingBlock label="Loading tables..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Table Management" description="Create, edit, and manage permanent QR codes for your restaurant tables." />
        <Card><p className="text-sm text-rose-600">{error}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" description="Create tables, maintain permanent QR links, and download or print QR assets without regenerating menu routes." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setCreateLoading(true);
              setCreateError('');
              try {
                const created = await tableService.create({ tableNumber, restaurantId });
                setData([...(tables || []), created]);
                setTableNumber('');
                toast.success('Table created');
              } catch (submitError: any) {
                const message = submitError?.response?.data?.message || 'Unable to create table.';
                setCreateError(message);
                toast.error(message);
              } finally {
                setCreateLoading(false);
              }
            }}
          >
            <Input label="Table Number" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} required />
            {createError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</p> : null}
            <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create table'}</Button>
          </form>
        </Card>
        <Card>
          <DataTable
            columns={[
              { key: 'table', label: 'Table', render: (row) => <div><div className="font-semibold">{row.tableNumber}</div><div className="text-xs text-slate-400">{row.qrCodeUrl}</div></div> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'ACTIVE' : 'INACTIVE'} /> },
              { key: 'qr', label: 'QR Preview', render: (row) => row.qrImageUrl ? <img src={row.qrImageUrl} alt={row.tableNumber} className="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-slate-800" /> : 'No QR' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => { setEditingTable({ id: row.id, tableNumber: row.tableNumber }); setEditTableNumber(row.tableNumber); setEditError(''); }}>Edit</Button>
                    <Button variant="ghost" onClick={() => window.open(row.qrImageUrl || row.qrCodeUrl, '_blank', 'noopener,noreferrer')}>Generate QR</Button>
                    <Button variant="ghost" onClick={() => window.open(row.qrCodeUrl, '_blank', 'noopener,noreferrer')}>Open Menu</Button>
                    <Button variant="ghost" onClick={async () => { try { await downloadQr(row.qrImageUrl || row.qrCodeUrl, row.tableNumber); toast.success('QR download started'); } catch (downloadError: any) { toast.error(downloadError?.message || 'Unable to download QR.'); } }}>Download QR</Button>
                    <Button variant="ghost" onClick={() => printQr(row.qrImageUrl || row.qrCodeUrl)}>Print QR</Button>
                    <Button variant="danger" onClick={() => setDeleteTarget(row.id)}>Delete</Button>
                  </div>
                ),
              },
            ]}
            rows={tables || []}
          />
        </Card>
      </div>
      {editingTable ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Edit Table</h2>
              <Button variant="ghost" onClick={() => setEditingTable(null)}>Close</Button>
            </div>
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setEditLoading(true);
                setEditError('');
                try {
                  const updated = await tableService.update(editingTable.id, { tableNumber: editTableNumber, restaurantId });
                  setData((tables || []).map((table) => table.id === updated.id ? updated : table));
                  setEditingTable(null);
                  toast.success('Table updated');
                } catch (submitError: any) {
                  const message = submitError?.response?.data?.message || 'Unable to update table.';
                  setEditError(message);
                  toast.error(message);
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              <Input label="Table Number" value={editTableNumber} onChange={(event) => setEditTableNumber(event.target.value)} required />
              <p className="text-sm text-slate-600 dark:text-slate-300">Permanent QR links are preserved. Updating the table number will not regenerate the QR route.</p>
              {editError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{editError}</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save changes'}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingTable(null)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Delete Table</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">This permanently removes the table record. Existing QR prints for this table will no longer open an active menu.</p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="danger"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    await tableService.delete(deleteTarget);
                    setData((tables || []).filter((table) => table.id !== deleteTarget));
                    setDeleteTarget(null);
                    toast.success('Table deleted');
                  } catch (deleteError: any) {
                    toast.error(deleteError?.response?.data?.message || 'Unable to delete table.');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete table'}
              </Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const CategoryManagementPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const restaurantId = user?.restaurantId;

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Menu Categories" description="Create and maintain category structure for the restaurant menu." />
        <Card><p className="text-sm text-rose-600">No restaurant is assigned to this account.</p></Card>
      </div>
    );
  }

  return (
    <CategoryWorkspace
      restaurantId={restaurantId}
      mode="OWNER"
      title="Menu Categories"
      description="Create categories, upload category images, and manage menu items directly inside each category."
    />
  );
};

export const MenuItemsManagementPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const restaurantId = user?.restaurantId;
  const featuredLabelOptions = [
    { value: 'TODAY_SPECIAL', label: "Today's Special" },
    { value: 'CHEF_RECOMMENDED', label: 'Chef Recommended' },
    { value: 'BEST_SELLER', label: 'Best Seller' },
  ] as const;
  const { data: categories } = useAsyncResource(
    () => (restaurantId ? categoryService.listByRestaurant(restaurantId) : Promise.resolve([])),
    [restaurantId]
  );
  const { data: items, loading, error, setData } = useAsyncResource(
    () => (restaurantId ? menuService.listByRestaurantForManagement(restaurantId) : Promise.resolve([])),
    [restaurantId]
  );
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: number;
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
    featured: boolean;
    featuredLabel: 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER';
    preparationTime: number;
    categoryId: number;
    ingredients: string;
    allergens: string;
  }>({
    name: '',
    description: '',
    price: 0,
    status: 'AVAILABLE' as const,
    featured: false,
    featuredLabel: 'TODAY_SPECIAL',
    preparationTime: 0,
    categoryId: 0,
    ingredients: '',
    allergens: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [createError, setCreateError] = useState('');
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: number;
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
    featured: boolean;
    featuredLabel: 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER';
    preparationTime: number;
    categoryId: number;
    imageUrl: string;
    ingredients: string;
    allergens: string;
  }>({
    name: '',
    description: '',
    price: 0,
    status: 'AVAILABLE' as const,
    featured: false,
    featuredLabel: 'TODAY_SPECIAL',
    preparationTime: 0,
    categoryId: 0,
    imageUrl: '',
    ingredients: '',
    allergens: '',
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!form.categoryId && categories?.length) {
      setForm((current) => ({ ...current, categoryId: categories[0].id }));
    }
  }, [categories, form.categoryId]);

  const resetCreateForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      status: 'AVAILABLE' as const,
      featured: false,
      featuredLabel: 'TODAY_SPECIAL',
      preparationTime: 0,
      categoryId: categories?.[0]?.id || 0,
      ingredients: '',
      allergens: '',
    });
    setCreateImageFile(null);
  };

  const toPayload = (values: typeof form | typeof editForm) => ({
    name: values.name,
    description: values.description,
    price: Number(values.price),
    status: values.status,
    featured: values.featured,
    featuredLabel: values.featured ? values.featuredLabel : null,
    preparationTime: Number(values.preparationTime),
    categoryId: Number(values.categoryId),
    restaurantId: restaurantId || 0,
    imageUrl: 'imageUrl' in values ? values.imageUrl : '',
    ingredients: values.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
    allergens: values.allergens.split(',').map((item) => item.trim()).filter(Boolean),
  });

  const refreshRow = (updated: any) => {
    setData((items || []).map((item) => item.id === updated.id ? updated : item));
  };

  const openEditModal = (item: any) => {
    setEditingItemId(item.id);
    setEditImageFile(null);
    setEditError('');
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      status: item.status,
      featured: item.featured,
      featuredLabel: item.featuredLabel || 'TODAY_SPECIAL',
      preparationTime: item.preparationTime,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      ingredients: (item.ingredients || []).join(', '),
      allergens: (item.allergens || []).join(', '),
    });
  };

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Menu Management" description="Menu management is available once an owner is assigned to a restaurant." />
        <Card><p className="text-sm text-rose-600">No restaurant is assigned to this account.</p></Card>
      </div>
    );
  }

  if (loading) {
    return <LoadingBlock label="Loading menu management..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Menu Management" description="Create, edit, hide, feature, and price menu items for customers." />
        <Card><p className="text-sm text-rose-600">{error}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="Create, edit, hide, feature, and price menu items for customers." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!form.categoryId) {
                setCreateError('Select a category before creating a menu item.');
                return;
              }

              setCreateLoading(true);
              setCreateError('');

              try {
                let item = await menuService.create(toPayload(form));
                if (createImageFile) {
                  validateImageFile(createImageFile);
                  item = await menuService.uploadImage(item.id, createImageFile);
                }
                setData([...(items || []), item]);
                resetCreateForm();
                toast.success('Menu item created');
              } catch (submitError: any) {
                const message = submitError?.response?.data?.message || submitError?.message || 'Unable to create menu item.';
                setCreateError(message);
                toast.error(message);
              } finally {
                setCreateLoading(false);
              }
            }}
          >
            <Input label="Item Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <Input label="Price" type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required />
            <Input label="Preparation Time (minutes)" type="number" min="0" step="1" value={form.preparationTime} onChange={(event) => setForm({ ...form, preparationTime: Number(event.target.value) })} required />
            <Select label="Category" value={String(form.categoryId)} onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}>
              <option value="0">Select category</option>
              {(categories || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            {!categories?.length ? <p className="text-sm text-amber-600">No categories yet. Create a category first.</p> : null}
            <Textarea label="Ingredients" value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} placeholder="Tomato, Basil, Olive oil" />
            <Textarea label="Allergens" value={form.allergens} onChange={(event) => setForm({ ...form, allergens: event.target.value })} placeholder="Dairy, Nuts" />
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
              <span>Image Upload</span>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setCreateImageFile(event.target.files?.[0] || null)} />
            </label>
            <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN' })}>
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_STOCK">Out Of Stock</option>
              <option value="HIDDEN">Hidden</option>
            </Select>
            <Select label="Featured" value={String(form.featured)} onChange={(event) => setForm({ ...form, featured: event.target.value === 'true' })}>
              <option value="false">Standard item</option>
              <option value="true">Featured item</option>
            </Select>
            {form.featured ? (
              <Select label="Featured Label" value={form.featuredLabel} onChange={(event) => setForm({ ...form, featuredLabel: event.target.value as 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER' })}>
                {featuredLabelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            ) : null}
            {createError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</p> : null}
            <Button type="submit" disabled={createLoading || !categories?.length}>{createLoading ? 'Creating...' : 'Create item'}</Button>
          </form>
        </Card>
        <Card>
          <DataTable
            columns={[
              {
                key: 'item',
                label: 'Item',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={row.imageUrl}
                      alt={row.name}
                      fallback={initialsFromName(row.name)}
                      className="h-14 w-14 rounded-2xl object-cover"
                      fallbackClassName="h-14 w-14 rounded-2xl bg-slate-100 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    />
                    <div>
                      <div className="font-semibold">{row.name}</div>
                      <div className="text-xs text-slate-400">{row.description}</div>
                    </div>
                  </div>
                ),
              },
              { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
              { key: 'prep', label: 'Prep', render: (row) => `${row.preparationTime} min` },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'featured', label: 'Featured', render: (row) => <StatusBadge value={row.featured ? row.featuredLabel || 'FEATURED' : 'STANDARD'} /> },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" disabled={actionLoadingId === row.id} onClick={async () => { setActionLoadingId(row.id); try { refreshRow(await menuService.updateStatus(row.id, 'AVAILABLE')); toast.success('Item marked available'); } catch (toggleError: any) { toast.error(toggleError?.response?.data?.message || 'Unable to update item status.'); } finally { setActionLoadingId(null); } }}>Mark Available</Button>
                    <Button variant="ghost" disabled={actionLoadingId === row.id} onClick={async () => { setActionLoadingId(row.id); try { refreshRow(await menuService.updateStatus(row.id, 'OUT_OF_STOCK')); toast.success('Item marked out of stock'); } catch (toggleError: any) { toast.error(toggleError?.response?.data?.message || 'Unable to update item status.'); } finally { setActionLoadingId(null); } }}>Out Of Stock</Button>
                    <Button variant="ghost" disabled={actionLoadingId === row.id} onClick={async () => { setActionLoadingId(row.id); try { refreshRow(await menuService.updateStatus(row.id, 'HIDDEN')); toast.success('Item hidden from customers'); } catch (toggleError: any) { toast.error(toggleError?.response?.data?.message || 'Unable to update item status.'); } finally { setActionLoadingId(null); } }}>Hide</Button>
                    <Button variant="ghost" disabled={actionLoadingId === row.id} onClick={async () => { setActionLoadingId(row.id); try { refreshRow(await menuService.updateFeatured(row.id, !row.featured, !row.featured ? row.featuredLabel || 'TODAY_SPECIAL' : undefined)); toast.success(!row.featured ? 'Item marked featured' : 'Featured flag removed'); } catch (toggleError: any) { toast.error(toggleError?.response?.data?.message || 'Unable to update featured status.'); } finally { setActionLoadingId(null); } }}>{row.featured ? 'Unfeature' : 'Feature'}</Button>
                    <Button variant="ghost" onClick={() => openEditModal(row)}>Edit</Button>
                    <Button variant="danger" onClick={() => setDeleteTarget(row.id)}>Delete</Button>
                  </div>
                ),
              },
            ]}
            rows={items || []}
          />
        </Card>
      </div>
      {editingItemId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Edit Menu Item</h2>
              <Button variant="ghost" onClick={() => setEditingItemId(null)}>Close</Button>
            </div>
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setEditLoading(true);
                setEditError('');

                try {
                  let updated = await menuService.update(editingItemId, toPayload(editForm));
                  if (editImageFile) {
                    validateImageFile(editImageFile);
                    updated = await menuService.uploadImage(editingItemId, editImageFile);
                  }
                  refreshRow(updated);
                  setEditingItemId(null);
                  toast.success('Menu item updated');
                } catch (submitError: any) {
                  const message = submitError?.response?.data?.message || submitError?.message || 'Unable to update menu item.';
                  setEditError(message);
                  toast.error(message);
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              <Input label="Item Name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
              <Textarea label="Description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
              <Input label="Price" type="number" min="0.01" step="0.01" value={editForm.price} onChange={(event) => setEditForm({ ...editForm, price: Number(event.target.value) })} required />
              <Input label="Preparation Time (minutes)" type="number" min="0" step="1" value={editForm.preparationTime} onChange={(event) => setEditForm({ ...editForm, preparationTime: Number(event.target.value) })} required />
              <Select label="Category" value={String(editForm.categoryId)} onChange={(event) => setEditForm({ ...editForm, categoryId: Number(event.target.value) })}>
                {(categories || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
              <Textarea label="Ingredients" value={editForm.ingredients} onChange={(event) => setEditForm({ ...editForm, ingredients: event.target.value })} />
              <Textarea label="Allergens" value={editForm.allergens} onChange={(event) => setEditForm({ ...editForm, allergens: event.target.value })} />
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
                <span>Replace Image</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setEditImageFile(event.target.files?.[0] || null)} />
              </label>
              <Select label="Status" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value as 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN' })}>
                <option value="AVAILABLE">Available</option>
                <option value="OUT_OF_STOCK">Out Of Stock</option>
                <option value="HIDDEN">Hidden</option>
              </Select>
              <Select label="Featured" value={String(editForm.featured)} onChange={(event) => setEditForm({ ...editForm, featured: event.target.value === 'true' })}>
                <option value="false">Standard item</option>
                <option value="true">Featured item</option>
              </Select>
              {editForm.featured ? (
                <Select label="Featured Label" value={editForm.featuredLabel} onChange={(event) => setEditForm({ ...editForm, featuredLabel: event.target.value as 'TODAY_SPECIAL' | 'CHEF_RECOMMENDED' | 'BEST_SELLER' })}>
                  {featuredLabelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              ) : null}
              {editError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{editError}</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save changes'}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingItemId(null)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Delete Menu Item</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">This will permanently remove the menu item from management and customer menus.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="danger" disabled={deleteLoading} onClick={async () => { setDeleteLoading(true); try { await menuService.delete(deleteTarget); setData((items || []).filter((item) => item.id !== deleteTarget)); setDeleteTarget(null); toast.success('Menu item deleted'); } catch (deleteError: any) { toast.error(deleteError?.response?.data?.message || 'Unable to delete menu item.'); } finally { setDeleteLoading(false); } }}>{deleteLoading ? 'Deleting...' : 'Delete item'}</Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const OwnerOrdersPage = () => {
  const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [preset, setPreset] = useState<'ALL_TIME' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'>('ALL_TIME');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [tableFilter, setTableFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

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
  const { data: orders, loading, error } = useAsyncResource(
    () => (
      tab === 'ACTIVE'
        ? orderService.ownerActiveOrders()
        : orderService.ownerPastOrders({
            from: range.from,
            to: range.to,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            tableNumber: tableFilter || undefined,
          })
    ),
    [tab, preset, customFrom, customTo, statusFilter, tableFilter, refreshKey]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage live service orders and review archived order history." />
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button variant={tab === 'ACTIVE' ? 'primary' : 'ghost'} onClick={() => setTab('ACTIVE')}>Active Orders</Button>
          <Button variant={tab === 'PAST' ? 'primary' : 'ghost'} onClick={() => setTab('PAST')}>Past Orders</Button>
        </div>
      </Card>
      {tab === 'PAST' ? (
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
      ) : null}
      {loading ? <LoadingBlock label={`Loading ${tab === 'ACTIVE' ? 'active' : 'past'} orders...`} /> : null}
      {error ? <Card><p className="text-sm text-rose-600">{error}</p></Card> : null}
      {!loading && !error ? (
      <Card>
        <DataTable
          columns={[
            { key: 'id', label: 'Order', render: (row) => `#${row.id}` },
            { key: 'table', label: 'Table', render: (row) => row.tableNumber },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'items', label: 'Items', render: (row) => <OrderItemsList items={row.items} emptyLabel="Could not load orders." /> },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
            { key: 'time', label: 'Placed', render: (row) => formatDateTime(row.orderTime) },
            ...(tab === 'ACTIVE'
              ? [{
                  key: 'actions',
                  label: 'Actions',
                  render: (row: any) => (
                    <div className="flex gap-2">
                      {row.status === 'PENDING' ? <Button variant="ghost" onClick={async () => { await orderService.ownerUpdateStatus(row.id, 'PREPARING'); setRefreshKey((value) => value + 1); toast.success('Order moved to preparing'); }}>Start Preparing</Button> : null}
                      {row.status === 'PREPARING' ? <Button variant="ghost" onClick={async () => { await orderService.ownerUpdateStatus(row.id, 'READY'); setRefreshKey((value) => value + 1); toast.success('Order marked ready'); }}>Mark Ready</Button> : null}
                      {row.status === 'READY' ? <Button variant="ghost" onClick={async () => { await orderService.ownerUpdateStatus(row.id, 'COMPLETED'); setRefreshKey((value) => value + 1); toast.success('Order marked completed'); }}>Mark Completed</Button> : null}
                      <Button variant="danger" onClick={async () => { await orderService.updateStatus(row.id, 'CANCELLED'); setRefreshKey((value) => value + 1); toast.success('Order rejected'); }}>Reject</Button>
                    </div>
                  ),
                }]
              : []),
          ]}
          rows={orders || []}
        />
      </Card>
      ) : null}
    </div>
  );
};

export const OwnerReportsPage = () => {
  const { data: analytics, loading, error } = useAsyncResource(() => ownerAnalyticsService.getAnalytics(), []);

  if (loading) {
    return <LoadingBlock label="Loading analytics..." />;
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurant Reports" description="Real-time revenue, order volume, and item performance for your restaurant." />
        <Card><p className="text-sm text-rose-600">{error || 'Unable to load analytics.'}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Restaurant Reports" description="Real backend revenue, order volume, item performance, and ordering hour trends." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue Today" value={formatCurrency(analytics.revenue.today)} helper="Revenue booked since midnight" tone="emerald" />
        <StatCard label="Revenue This Week" value={formatCurrency(analytics.revenue.week)} helper="Revenue booked since Monday" tone="blue" />
        <StatCard label="Revenue This Month" value={formatCurrency(analytics.revenue.month)} helper="Revenue booked this month" tone="amber" />
        <StatCard label="Average Order Value" value={formatCurrency(analytics.averageOrderValue)} helper="Average non-cancelled order total" tone="rose" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Orders Today</h3>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{analytics.orders.today}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Orders This Week</h3>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{analytics.orders.week}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Orders This Month</h3>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{analytics.orders.month}</p>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Top Selling Items</h3>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'name', label: 'Item', render: (row) => row.itemName },
                { key: 'quantity', label: 'Qty', render: (row) => row.quantity },
                { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
              ]}
              rows={analytics.topSellingItems}
            />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Least Selling Items</h3>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'name', label: 'Item', render: (row) => row.itemName },
                { key: 'quantity', label: 'Qty', render: (row) => row.quantity },
                { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
              ]}
              rows={analytics.leastSellingItems}
            />
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Peak Ordering Hours</h3>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: 'hour', label: 'Hour', render: (row) => `${String(row.hour).padStart(2, '0')}:00` },
              { key: 'count', label: 'Orders', render: (row) => row.orderCount },
            ]}
            rows={analytics.peakOrderingHours}
          />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Revenue Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>{`Today: ${formatCurrency(analytics.revenue.today)}`}</p>
            <p>{`Week: ${formatCurrency(analytics.revenue.week)}`}</p>
            <p>{`Month: ${formatCurrency(analytics.revenue.month)}`}</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>{`Today: ${analytics.orders.today}`}</p>
            <p>{`Week: ${analytics.orders.week}`}</p>
            <p>{`Month: ${analytics.orders.month}`}</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Peak Window</h3>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
            {analytics.peakOrderingHours[0] ? `${String(analytics.peakOrderingHours[0].hour).padStart(2, '0')}:00` : 'N/A'}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {analytics.peakOrderingHours[0] ? `${analytics.peakOrderingHours[0].orderCount} orders in the busiest hour` : 'No order activity yet'}
          </p>
        </Card>
      </div>
    </div>
  );
};
