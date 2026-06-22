import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invitationService, persistSession, restaurantService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../hooks';
import { restoreSession } from '../store/authSlice';
import { Button, Card, Input, LoadingBlock, PageHeader, Select } from '../components/ui';
import { invitationPathByBackendRole } from '../utils/auth';
import { Invitation, InvitationRole, InvitationVerifyResponse, Restaurant } from '../types';

const invitationRoles: Record<'SUPER_ADMIN' | 'OWNER', Array<{ value: InvitationRole; label: string }>> = {
  SUPER_ADMIN: [
    { value: 'OWNER', label: 'Owner' },
    { value: 'STAFF', label: 'Staff' },
    { value: 'KITCHEN', label: 'Kitchen' },
  ],
  OWNER: [
    { value: 'STAFF', label: 'Staff' },
    { value: 'KITCHEN', label: 'Kitchen' },
  ],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleLabel = (role: string) => role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (value) => value.toUpperCase());

export const AdminInvitationsPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isOwner = user?.backendRole === 'OWNER';
  const roleOptions = invitationRoles[isOwner ? 'OWNER' : 'SUPER_ADMIN'];
  const defaultRole = roleOptions[0]?.value || 'STAFF';
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitationRole>(defaultRole);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [restaurantFieldError, setRestaurantFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationError, setInvitationError] = useState('');
  const isSuperAdmin = user?.backendRole === 'SUPER_ADMIN';
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    let active = true;

    const loadRestaurants = async () => {
      setRestaurantsLoading(true);
      setRestaurantError('');

      try {
        if (isOwner) {
          if (!user?.restaurantId) {
            throw new Error('Owner account is not assigned to a restaurant.');
          }

          const restaurant = await restaurantService.getById(user.restaurantId);
          if (!active) {
            return;
          }

          setRestaurants([restaurant]);
          setRestaurantId(String(restaurant.id));
        } else {
          const result = await (isSuperAdmin ? restaurantService.listAdmin() : restaurantService.list());
          if (!active) {
            return;
          }

          setRestaurants(result);
          setRestaurantId((current) => current || (result[0] ? String(result[0].id) : ''));
        }
      } catch (error: any) {
        if (active) {
          setRestaurantError(error?.response?.data?.message || error?.message || 'Unable to load restaurants.');
        }
      } finally {
        if (active) {
          setRestaurantsLoading(false);
        }
      }
    };

    loadRestaurants();

    return () => {
      active = false;
    };
  }, [isOwner, isSuperAdmin, user?.restaurantId]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setInvitations([]);
      setInvitationError('');
      setInvitationsLoading(false);
      return;
    }

    let active = true;
    setInvitationsLoading(true);
    setInvitationError('');

    invitationService.listSuperAdmin()
      .then((result) => {
        if (active) {
          setInvitations(result);
        }
      })
      .catch((error: any) => {
        if (active) {
          setInvitationError(error?.response?.data?.message || error?.message || 'Unable to load invitations.');
        }
      })
      .finally(() => {
        if (active) {
          setInvitationsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!emailPattern.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!role) {
      setRoleError('Role is required.');
      valid = false;
    } else {
      setRoleError('');
    }

    if (!restaurantId) {
      setRestaurantFieldError('Restaurant selection is required.');
      valid = false;
    } else {
      setRestaurantFieldError('');
    }

    if (!valid) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (isSuperAdmin) {
        await invitationService.sendSuperAdminInvitation(email.trim(), role, Number(restaurantId));
      } else {
        await invitationService.sendInvitation(email.trim(), role, Number(restaurantId));
      }
      setSuccessMessage(`Invitation sent to ${email.trim()}.`);
      setEmail('');
      setRole(defaultRole);
      if (isSuperAdmin) {
        setInvitations(await invitationService.listSuperAdmin());
      }
      toast.success('Invitation sent');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to send the invitation right now.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Invitations"
        description="Invite restaurant-specific users into Tapro. Restaurant assignment is part of the invitation and enforced by the backend."
      />
      <Card className="max-w-2xl">
        {restaurantsLoading ? <LoadingBlock label="Loading restaurants..." /> : null}
        {!restaurantsLoading && restaurantError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{restaurantError}</p>
        ) : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
            <span>Restaurant</span>
            <Select
              value={restaurantId}
              onChange={(event) => {
                setRestaurantId(event.target.value);
                if (restaurantFieldError) {
                  setRestaurantFieldError('');
                }
              }}
              disabled={restaurantsLoading || !!restaurantError || isOwner}
              required
            >
              <option value="" disabled>
                {restaurants.length ? 'Select restaurant' : 'No restaurants available'}
              </option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
            {restaurantFieldError ? <span className="text-xs text-rose-500">{restaurantFieldError}</span> : null}
          </label>
          <Input
            label="Email"
            type="email"
            value={email}
            error={emailError}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) {
                setEmailError('');
              }
            }}
            placeholder="owner@restaurant.com"
            required
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-100">
            <span>Role</span>
            <Select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as InvitationRole);
                if (roleError) {
                  setRoleError('');
                }
              }}
              disabled={restaurantsLoading || !!restaurantError}
              required
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {roleError ? <span className="text-xs text-rose-500">{roleError}</span> : null}
          </label>
          {successMessage ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p> : null}
          {errorMessage ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}
          <Button type="submit" className="w-full sm:w-fit" disabled={loading || restaurantsLoading || !!restaurantError}>
            {loading ? 'Sending invitation...' : 'Send invitation'}
          </Button>
        </form>
      </Card>
      {isSuperAdmin ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recent Invitations</h2>
            {invitationsLoading ? <span className="text-sm text-slate-400">Refreshing...</span> : null}
          </div>
          {invitationError ? <p className="mt-4 text-sm text-rose-600">{invitationError}</p> : null}
          {!invitationError && !invitationsLoading && !invitations.length ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">No invitations sent yet.</p>
          ) : null}
          <div className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">{invitation.email}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {roleLabel(invitation.role)}{invitation.restaurantName ? ` · ${invitation.restaurantName}` : ''}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{invitation.status}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await invitationService.deleteSuperAdmin(invitation.id);
                      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
                      toast.success('Invitation removed');
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || 'Unable to remove invitation.');
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export const AcceptInvitationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() || '', [params]);
  const [verification, setVerification] = useState<InvitationVerifyResponse | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(true);
  const [verifyError, setVerifyError] = useState('');
  const [form, setForm] = useState({ name: '', password: '' });
  const [errors, setErrors] = useState({ name: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!token) {
        if (active) {
          setVerifyError('Invitation token is missing.');
          setVerifyLoading(false);
        }
        return;
      }

      setVerifyLoading(true);
      setVerifyError('');

      try {
        const result = await invitationService.verifyInvitation(token);
        if (!active) {
          return;
        }

        if (!result.valid) {
          setVerifyError('This invitation is no longer valid.');
          setVerification(null);
        } else {
          setVerification(result);
        }
      } catch (error: any) {
        if (active) {
          setVerifyError(error?.response?.data?.message || 'Unable to verify this invitation.');
          setVerification(null);
        }
      } finally {
        if (active) {
          setVerifyLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    let valid = true;
    const nextErrors = { name: '', password: '' };

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
      valid = false;
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
      valid = false;
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    setErrors(nextErrors);

    if (!valid || !verification) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const auth = await invitationService.acceptInvitation(token, form.name.trim(), form.password);
      persistSession(auth.token, {
        ...auth.user,
        name: form.name.trim(),
      });
      await dispatch(restoreSession());
      toast.success('Account created successfully');
      navigate(invitationPathByBackendRole[auth.role || auth.user.backendRole], { replace: true });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to accept the invitation.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (verifyLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#e0f2fe_100%)] px-4 py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.2),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <div className="mx-auto max-w-3xl">
          <LoadingBlock label="Verifying invitation..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#e0f2fe_100%)] px-4 py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.2),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto max-w-3xl">
        <Card className="p-8">
          <PageHeader
            title="Accept Invitation"
            description={verification ? 'Create your account to continue into the Tapro workspace.' : 'This page verifies the invitation token before account creation.'}
          />
          {verifyError ? (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{verifyError}</p>
          ) : null}
          {verification ? (
            <>
              <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-950">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Invited Email</p>
                  <p className="mt-1 font-medium text-slate-950 dark:text-white">{verification.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role</p>
                  <p className="mt-1 font-medium text-slate-950 dark:text-white">{roleLabel(verification.role)}</p>
                </div>
              </div>
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <Input
                  label="Name"
                  value={form.name}
                  error={errors.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  error={errors.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
                {submitError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
                <Button type="submit" className="w-full sm:w-fit" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Accept invitation'}
                </Button>
              </form>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
