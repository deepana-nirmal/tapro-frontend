import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryService, menuService } from '../../api/services';
import { useAsyncResource } from '../../hooks';
import { Category, MenuItem, MenuItemFormValues } from '../../types';
import { ImageWithFallback, initialsFromName } from '../shared/ImageWithFallback';
import { Button, Card, EmptyState, Input, Select, StatusBadge, Textarea } from '../ui';
import { formatCurrency } from '../../utils/format';
import { validateImageFile } from '../../utils/upload';

type WorkspaceMode = 'OWNER' | 'SUPER_ADMIN';

type MenuItemFormState = {
  name: string;
  description: string;
  price: number;
  status: MenuItem['status'];
  featured: boolean;
  featuredLabel: NonNullable<MenuItem['featuredLabel']>;
  preparationTime: number;
  ingredients: string;
  allergens: string;
};

const emptyMenuItemForm = (): MenuItemFormState => ({
  name: '',
  description: '',
  price: 0,
  status: 'AVAILABLE',
  featured: false,
  featuredLabel: 'TODAY_SPECIAL',
  preparationTime: 0,
  ingredients: '',
  allergens: '',
});

const featuredLabelOptions = [
  { value: 'TODAY_SPECIAL', label: "Today's Special" },
  { value: 'CHEF_RECOMMENDED', label: 'Chef Recommended' },
  { value: 'BEST_SELLER', label: 'Best Seller' },
] as const;

const toMenuPayload = (restaurantId: number, categoryId: number, values: MenuItemFormState): MenuItemFormValues => ({
  name: values.name,
  description: values.description,
  price: Number(values.price),
  status: values.status,
  featured: values.featured,
  featuredLabel: values.featured ? values.featuredLabel : null,
  preparationTime: Number(values.preparationTime),
  categoryId,
  restaurantId,
  ingredients: values.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
  allergens: values.allergens.split(',').map((item) => item.trim()).filter(Boolean),
  imageUrl: '',
});

export const CategoryWorkspace = ({
  restaurantId,
  mode,
  currencyCode = 'LKR',
  title,
  description,
}: {
  restaurantId: number;
  mode: WorkspaceMode;
  currencyCode?: 'LKR' | 'USD';
  title?: string;
  description?: string;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryActionId, setCategoryActionId] = useState<number | null>(null);
  const [showCreateMenuItem, setShowCreateMenuItem] = useState(false);
  const [createMenuItem, setCreateMenuItem] = useState<MenuItemFormState>(emptyMenuItemForm());
  const [createMenuImage, setCreateMenuImage] = useState<File | null>(null);
  const [menuCreateLoading, setMenuCreateLoading] = useState(false);
  const [menuCreateError, setMenuCreateError] = useState('');
  const [editingMenuItemId, setEditingMenuItemId] = useState<number | null>(null);
  const [editMenuItem, setEditMenuItem] = useState<MenuItemFormState>(emptyMenuItemForm());
  const [editMenuImage, setEditMenuImage] = useState<File | null>(null);
  const [menuEditLoading, setMenuEditLoading] = useState(false);
  const [menuEditError, setMenuEditError] = useState('');
  const [menuActionId, setMenuActionId] = useState<number | null>(null);

  const { data: categories, loading: categoriesLoading, error: categoriesError } = useAsyncResource(
    () => categoryService.listByRestaurant(restaurantId),
    [restaurantId, refreshKey]
  );
  const { data: items, loading: itemsLoading, error: itemsError } = useAsyncResource(
    () => menuService.listByRestaurantForManagement(restaurantId),
    [restaurantId, refreshKey]
  );

  useEffect(() => {
    if (!categories?.length) {
      setSelectedCategoryId(null);
      return;
    }

    if (!selectedCategoryId || !categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () => categories?.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const selectedCategoryItems = useMemo(
    () => (items || []).filter((item) => item.categoryId === selectedCategoryId),
    [items, selectedCategoryId]
  );

  const refetch = () => setRefreshKey((current) => current + 1);

  const uploadCategoryImage = async (category: Category, file: File) => {
    if (mode === 'SUPER_ADMIN') {
      await categoryService.uploadImageForRestaurant(restaurantId, category.id, file);
      return;
    }

    await categoryService.uploadImageForOwner(category.id, file);
  };

  const submitCategory = async (event: FormEvent) => {
    event.preventDefault();
    setCategorySubmitting(true);
    setCategoryError('');

    try {
      const created = await categoryService.create({ name: categoryName.trim(), restaurantId, visible: true });
      setCategoryName('');

      if (categoryImageFile) {
        validateImageFile(categoryImageFile);
        await uploadCategoryImage(created, categoryImageFile);
        setCategoryImageFile(null);
      }

      setSelectedCategoryId(created.id);
      refetch();
      toast.success('Category created');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to create category.';
      setCategoryError(message);
      toast.error(message);
    } finally {
      setCategorySubmitting(false);
    }
  };

  const saveCategoryDetails = async () => {
    if (!selectedCategory) {
      return;
    }

    setCategoryActionId(selectedCategory.id);
    try {
      await categoryService.update(selectedCategory.id, {
        name: editingCategoryName.trim() || selectedCategory.name,
        restaurantId,
        imageUrl: selectedCategory.imageUrl,
        visible: selectedCategory.visible,
      });

      if (categoryImageFile) {
        validateImageFile(categoryImageFile);
        await uploadCategoryImage(selectedCategory, categoryImageFile);
        setCategoryImageFile(null);
      }

      setEditingCategory(false);
      refetch();
      toast.success('Category updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update category.');
    } finally {
      setCategoryActionId(null);
    }
  };

  const updateCategoryVisibility = async (category: Category, visible: boolean) => {
    setCategoryActionId(category.id);
    try {
      await categoryService.updateVisibility(category.id, visible);
      refetch();
      toast.success(visible ? 'Category shown' : 'Category hidden');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update category visibility.');
    } finally {
      setCategoryActionId(null);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setCategoryActionId(category.id);
    try {
      await categoryService.delete(category.id);
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId(null);
      }
      refetch();
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to delete category.');
    } finally {
      setCategoryActionId(null);
    }
  };

  const submitCreateMenuItem = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCategory) {
      return;
    }

    setMenuCreateLoading(true);
    setMenuCreateError('');

    try {
      const item = await menuService.create(toMenuPayload(restaurantId, selectedCategory.id, createMenuItem));
      if (createMenuImage) {
        validateImageFile(createMenuImage);
        await menuService.uploadImage(item.id, createMenuImage);
      }
      setCreateMenuItem(emptyMenuItemForm());
      setCreateMenuImage(null);
      setShowCreateMenuItem(false);
      refetch();
      toast.success('Menu item created');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to create menu item.';
      setMenuCreateError(message);
      toast.error(message);
    } finally {
      setMenuCreateLoading(false);
    }
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuItemId(item.id);
    setEditMenuImage(null);
    setMenuEditError('');
    setEditMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      status: item.status,
      featured: item.featured,
      featuredLabel: item.featuredLabel || 'TODAY_SPECIAL',
      preparationTime: item.preparationTime,
      ingredients: (item.ingredients || []).join(', '),
      allergens: (item.allergens || []).join(', '),
    });
  };

  const submitEditMenuItem = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCategory || !editingMenuItemId) {
      return;
    }

    setMenuEditLoading(true);
    setMenuEditError('');

    try {
      await menuService.update(editingMenuItemId, toMenuPayload(restaurantId, selectedCategory.id, editMenuItem));
      if (editMenuImage) {
        validateImageFile(editMenuImage);
        await menuService.uploadImage(editingMenuItemId, editMenuImage);
      }
      setEditingMenuItemId(null);
      setEditMenuImage(null);
      refetch();
      toast.success('Menu item updated');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to update menu item.';
      setMenuEditError(message);
      toast.error(message);
    } finally {
      setMenuEditLoading(false);
    }
  };

  const updateMenuItemStatus = async (item: MenuItem, status: MenuItem['status']) => {
    setMenuActionId(item.id);
    try {
      await menuService.updateStatus(item.id, status);
      refetch();
      toast.success('Menu item updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update menu item status.');
    } finally {
      setMenuActionId(null);
    }
  };

  const toggleFeatured = async (item: MenuItem) => {
    setMenuActionId(item.id);
    try {
      await menuService.updateFeatured(item.id, !item.featured, item.featured ? undefined : item.featuredLabel || 'TODAY_SPECIAL');
      refetch();
      toast.success(item.featured ? 'Item unfeatured' : 'Item featured');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update featured status.');
    } finally {
      setMenuActionId(null);
    }
  };

  const deleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    setMenuActionId(item.id);
    try {
      await menuService.delete(item.id);
      refetch();
      toast.success('Menu item deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to delete menu item.');
    } finally {
      setMenuActionId(null);
    }
  };

  const renderMenuItemForm = (
    values: MenuItemFormState,
    setValues: (value: MenuItemFormState) => void,
    imageFile: File | null,
    setImageFile: (file: File | null) => void,
    loading: boolean,
    error: string,
    submitLabel: string,
    onSubmit: (event: FormEvent) => Promise<void>
  ) => (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <Input label="Name" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required />
      <Input label="Price" type="number" min="0.01" step="0.01" value={values.price} onChange={(event) => setValues({ ...values, price: Number(event.target.value) })} required />
      <Textarea label="Description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
      <Input label="Preparation Time" type="number" min="0" step="1" value={values.preparationTime} onChange={(event) => setValues({ ...values, preparationTime: Number(event.target.value) })} required />
      <Textarea label="Ingredients" value={values.ingredients} onChange={(event) => setValues({ ...values, ingredients: event.target.value })} placeholder="Tomato, Cheese" />
      <Textarea label="Allergens" value={values.allergens} onChange={(event) => setValues({ ...values, allergens: event.target.value })} placeholder="Dairy, Gluten" />
      <Select label="Availability Status" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as MenuItem['status'] })}>
        <option value="AVAILABLE">Available</option>
        <option value="OUT_OF_STOCK">Out Of Stock</option>
        <option value="HIDDEN">Hidden</option>
      </Select>
      <Select label="Featured" value={String(values.featured)} onChange={(event) => setValues({ ...values, featured: event.target.value === 'true' })}>
        <option value="false">Standard</option>
        <option value="true">Featured</option>
      </Select>
      {values.featured ? (
        <Select label="Featured Label" value={values.featuredLabel} onChange={(event) => setValues({ ...values, featuredLabel: event.target.value as MenuItemFormState['featuredLabel'] })}>
          {featuredLabelOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      ) : null}
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
        <span>Image Upload</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setImageFile(event.target.files?.[0] || null)}
        />
        {imageFile ? <span className="text-xs text-slate-500">{imageFile.name}</span> : null}
      </label>
      {error ? <p className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );

  if (categoriesLoading || itemsLoading) {
    return <Card><p className="text-sm text-slate-500">Loading categories...</p></Card>;
  }

  if (categoriesError || itemsError) {
    return <Card><p className="text-sm text-rose-600">{categoriesError || itemsError}</p></Card>;
  }

  return (
    <div className="space-y-6">
      {(title || description) ? (
        <Card>
          {title ? <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2> : null}
          {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
        </Card>
      ) : null}

      <Card>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Create Category</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitCategory}>
          <Input label="Category Name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
            <span>Category Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCategoryImageFile(event.target.files?.[0] || null)}
            />
          </label>
          {categoryError ? <p className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{categoryError}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={categorySubmitting}>{categorySubmitting ? 'Creating...' : 'Create category'}</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(categories || []).map((category) => (
          <Card key={category.id} className={`cursor-pointer transition ${selectedCategoryId === category.id ? 'ring-2 ring-emerald-400' : ''}`}>
            <button type="button" className="w-full text-left" onClick={() => { setSelectedCategoryId(category.id); setEditingCategory(false); setEditingCategoryName(category.name); }}>
              <ImageWithFallback
                src={category.imageUrl}
                alt={category.name}
                fallback={initialsFromName(category.name)}
                className="h-40 w-full rounded-2xl object-cover"
                fallbackClassName="h-40 w-full rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 text-3xl text-slate-700"
              />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {category.visible ? 'Visible' : 'Hidden'} · {category.menuItemCount || 0} items
                  </p>
                </div>
                <StatusBadge value={category.visible ? 'VISIBLE' : 'HIDDEN'} />
              </div>
            </button>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => { setSelectedCategoryId(category.id); setEditingCategory(true); setEditingCategoryName(category.name); }}>Edit</Button>
              <Button variant="ghost" disabled={categoryActionId === category.id} onClick={() => updateCategoryVisibility(category, !category.visible)}>
                {category.visible ? 'Hide' : 'Show'}
              </Button>
              <Button variant="danger" disabled={categoryActionId === category.id} onClick={() => deleteCategory(category)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {!categories?.length ? (
        <EmptyState title="No categories yet" description="Create a category to start organizing menu items." />
      ) : null}

      {selectedCategory ? (
        <Card>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-1 gap-4">
              <ImageWithFallback
                src={selectedCategory.imageUrl}
                alt={selectedCategory.name}
                fallback={initialsFromName(selectedCategory.name)}
                className="h-28 w-28 rounded-3xl object-cover"
                fallbackClassName="h-28 w-28 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 text-2xl text-slate-700"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">{selectedCategory.name}</h3>
                  <StatusBadge value={selectedCategory.visible ? 'VISIBLE' : 'HIDDEN'} />
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{selectedCategoryItems.length} menu items in this category.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => { setEditingCategory((current) => !current); setEditingCategoryName(selectedCategory.name); }}>Edit category</Button>
                  <Button variant="ghost" disabled={categoryActionId === selectedCategory.id} onClick={() => updateCategoryVisibility(selectedCategory, !selectedCategory.visible)}>
                    {selectedCategory.visible ? 'Hide category' : 'Show category'}
                  </Button>
                  <Button onClick={() => setShowCreateMenuItem((current) => !current)}>{showCreateMenuItem ? 'Close form' : 'Add Menu Item'}</Button>
                </div>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
                <span>Update Category Image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setCategoryImageFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {editingCategory ? (
            <div className="mt-6 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Input label="Category Name" value={editingCategoryName} onChange={(event) => setEditingCategoryName(event.target.value)} />
                <div className="flex items-end gap-2">
                  <Button disabled={categoryActionId === selectedCategory.id} onClick={saveCategoryDetails}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingCategory(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : null}

          {showCreateMenuItem ? (
            <div className="mt-6 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Add Menu Item</h4>
              <div className="mt-4">
                {renderMenuItemForm(
                  createMenuItem,
                  setCreateMenuItem,
                  createMenuImage,
                  setCreateMenuImage,
                  menuCreateLoading,
                  menuCreateError,
                  'Create menu item',
                  submitCreateMenuItem
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {selectedCategoryItems.length ? selectedCategoryItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      fallback={initialsFromName(item.name)}
                      className="h-24 w-24 rounded-2xl object-cover"
                      fallbackClassName="h-24 w-24 rounded-2xl bg-slate-100 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950 dark:text-white">{item.name}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.description}</p>
                      <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{formatCurrency(item.price, item.restaurantCurrencyCode || currencyCode)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge value={item.status} />
                        <StatusBadge value={item.featured ? item.featuredLabel || 'FEATURED' : 'STANDARD'} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => openEditMenuItem(item)}>Edit</Button>
                    <Button variant="ghost" disabled={menuActionId === item.id} onClick={() => updateMenuItemStatus(item, 'AVAILABLE')}>Mark Available</Button>
                    <Button variant="ghost" disabled={menuActionId === item.id} onClick={() => updateMenuItemStatus(item, 'OUT_OF_STOCK')}>Out Of Stock</Button>
                    <Button variant="ghost" disabled={menuActionId === item.id} onClick={() => updateMenuItemStatus(item, 'HIDDEN')}>
                      {item.status === 'HIDDEN' ? 'Hidden' : 'Hide'}
                    </Button>
                    <Button variant="ghost" disabled={menuActionId === item.id} onClick={() => toggleFeatured(item)}>
                      {item.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button variant="danger" disabled={menuActionId === item.id} onClick={() => deleteMenuItem(item)}>Delete</Button>
                  </div>
                </div>
              </div>
            )) : <EmptyState title="No menu items yet" description="Add the first menu item directly inside this category." />}
          </div>

          {editingMenuItemId ? (
            <div className="mt-6 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Edit Menu Item</h4>
                <Button variant="ghost" onClick={() => setEditingMenuItemId(null)}>Close</Button>
              </div>
              <div className="mt-4">
                {renderMenuItemForm(
                  editMenuItem,
                  setEditMenuItem,
                  editMenuImage,
                  setEditMenuImage,
                  menuEditLoading,
                  menuEditError,
                  'Save changes',
                  submitEditMenuItem
                )}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
};
