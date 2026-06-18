import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { authService, invitationService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearError, login } from '../store/authSlice';
import { Button, Card, Input, PageHeader, Select } from '../components/ui';
import { defaultPathByRole } from '../utils/auth';
import { UserRole } from '../types';

const authWrapper = (title: string, description: string, children: ReactNode) => (
  <div className="min-h-screen overflow-hidden bg-[linear-gradient(145deg,#f5f7f2_0%,#eef7f2_45%,#dfeee7_100%)] px-4 py-8 dark:bg-[linear-gradient(145deg,#08120f_0%,#0b1a16_45%,#12211d_100%)] sm:px-6 lg:px-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative overflow-hidden rounded-[36px] border border-emerald-900/10 bg-[#123629] p-8 text-white shadow-[0_40px_120px_rgba(18,54,41,0.28)] dark:border-white/10 dark:bg-[#0d211a] sm:p-10 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(244,196,48,0.16),_transparent_28%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-sm font-semibold text-[#123629]">T</span>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-emerald-100/80">Tapro</p>
                <p className="text-sm text-emerald-50/85">Restaurant OS</p>
              </div>
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/78 sm:text-base">{description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Orders in motion', 'Live kitchen, cashier, and floor coordination from one workspace.'],
              ['Restaurant-aware access', 'Each login lands in the right operational surface for that role.'],
              ['Invitation-led staffing', 'Owners and platform admins onboard the right people into the right venue.'],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-2 text-xs leading-6 text-emerald-50/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">{children}</div>
    </div>
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
          required
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
};

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (isAuthenticated && user) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back');
      navigate(location.state?.from || defaultPathByRole[result.payload.user.role], { replace: true });
      return;
    }

    toast.error(result.payload || 'Unable to sign in');
  };

  return authWrapper(
    'Operate every restaurant from one deliberate control plane.',
    'Tapro gives platform admins, owners, kitchen teams, and staff a role-aware workspace for service, menu operations, and restaurant growth.',
    <Card className="w-full max-w-xl border-slate-200/80 bg-white/95 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure Sign In
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Welcome back</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          Sign in to continue into your Tapro workspace. Your destination is chosen automatically from your assigned role.
        </p>
      </div>
      <form className="space-y-5 px-6 py-6 sm:px-8 sm:py-8" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                if (error) {
                  dispatch(clearError());
                }
                setForm({ ...form, email: event.target.value });
              }}
              placeholder="you@restaurant.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
              required
            />
          </div>
        </label>
        <PasswordField
          label="Password"
          value={form.password}
          onChange={(value) => {
            if (error) {
              dispatch(clearError());
            }
            setForm({ ...form, password: value });
          }}
          placeholder="Enter your password"
        />
        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <a className="text-teal-600 dark:text-teal-300" href="/forgot-password">Forgot password?</a>
          <a className="text-teal-600 dark:text-teal-300" href="/register">Customer register</a>
        </div>
        <Button type="submit" className="w-full gap-2 py-3 text-sm" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in to Tapro'}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
        <p className="text-center text-xs leading-6 text-slate-500">
          Your session is secured with JWT authentication and redirected to the correct restaurant workspace after sign-in.
        </p>
      </form>
    </Card>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'CUSTOMER' as UserRole });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await authService.register(form);
    toast.success('Registration submitted');
    navigate('/login');
  };

  return authWrapper(
    'Register',
    'Customer self-service account creation',
    <Card className="p-8">
      <PageHeader title="Create account" description="Customers can register directly. Staff accounts should come through invitations." />
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
          <option value="CUSTOMER">Customer</option>
        </Select>
        <Button type="submit" className="w-full">Register</Button>
      </form>
    </Card>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  return authWrapper(
    'Forgot Password',
    'Password reset request flow',
    <Card className="p-8">
      <PageHeader title="Forgot Password" description="This will call the backend endpoint when it exists; demo mode keeps the frontend flow testable." />
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await authService.forgotPassword(email);
          toast.success('Reset instructions sent');
        }}
      >
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
    </Card>
  );
};

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  return authWrapper(
    'Reset Password',
    'Token-based password reset',
    <Card className="p-8">
      <PageHeader title="Reset Password" description="Reset tokens are read from the `token` query string." />
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await authService.resetPassword(params.get('token') || 'demo-token', password);
          toast.success('Password reset complete');
        }}
      >
        <Input label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button type="submit" className="w-full">Reset password</Button>
      </form>
    </Card>
  );
};

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  return authWrapper(
    'Change Password',
    'Authenticated password rotation',
    <Card className="p-8">
      <PageHeader title="Change Password" description="Useful for owners, managers, and cashiers after first login." />
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await authService.changePassword(form.currentPassword, form.newPassword);
          toast.success('Password updated');
        }}
      >
        <Input label="Current password" type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required />
        <Input label="New password" type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} required />
        <Button type="submit" className="w-full">Change password</Button>
      </form>
    </Card>
  );
};

export const AcceptInvitationPage = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || 'demo-token', [params]);
  const [password, setPassword] = useState('');

  return authWrapper(
    'Accept Invitation',
    'Token validation and account activation',
    <Card className="p-8">
      <PageHeader title="Activate Invitation" description={`Invitation token: ${token}`} />
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await invitationService.accept(token, password);
          toast.success('Invitation accepted');
        }}
      >
        <Input label="Create password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button type="submit" className="w-full">Activate account</Button>
      </form>
    </Card>
  );
};
