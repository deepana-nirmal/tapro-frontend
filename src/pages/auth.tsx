import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail } from 'lucide-react';
import { authService } from '../api/services';
import { AuthFormCard, AuthLayout, AuthSubmitButton, FormError, FormSuccess, PasswordField } from '../components/auth/AuthComponents';
import { Input } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearError, login } from '../store/authSlice';
import { UserRole } from '../types';
import { defaultPathByRole } from '../utils/auth';
import { clearRememberedEmail, getRememberedEmail, rememberEmail } from '../utils/authStorage';
import { focusFirstError, validateConfirmPassword, validateEmail, validatePassword, validateRequiredToken } from '../utils/authValidation';
import { normalizeAuthError } from '../utils/errorMessages';

const CUSTOMER_ROLE: UserRole = 'CUSTOMER';

type LoginErrors = { email: string; password: string };
type PasswordPairErrors = { password: string; confirmPassword: string };

const getSafeReturnTo = (value: unknown) => {
  if (typeof value !== 'string') return '';
  if (!value.startsWith('/') || value.startsWith('//')) return '';
  return value;
};

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);
  const rememberedEmail = getRememberedEmail();
  const [form, setForm] = useState({ email: rememberedEmail, password: '', rememberMe: Boolean(rememberedEmail) });
  const [errors, setErrors] = useState<LoginErrors>({ email: '', password: '' });

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  if (isAuthenticated && user) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    if (error) dispatch(clearError());
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      focusFirstError(nextErrors);
      return;
    }

    const email = form.email.trim();
    const result = await dispatch(login({ email, password: form.password, rememberMe: form.rememberMe }));
    if (login.fulfilled.match(result)) {
      if (form.rememberMe) rememberEmail(email);
      else clearRememberedEmail();
      toast.success('Welcome back');
      const returnTo = getSafeReturnTo((location.state as { from?: string } | null)?.from);
      navigate(returnTo || defaultPathByRole[result.payload.user.role], { replace: true });
    }
  };

  return (
    <AuthLayout title="Welcome back" description="Sign in to manage your restaurant, menu, tables, staff, and orders.">
      <AuthFormCard
        eyebrow="Secure sign in"
        title="Welcome back"
        description="Use your Tapro account to continue into the right workspace for your role."
        footer={<span>New to Tapro? <Link className="font-semibold text-emerald-700" to="/register">Create a customer account</Link></span>}
      >
        <form className="grid gap-5" onSubmit={onSubmit} aria-busy={loading}>
          <Input
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => updateField('email', event.target.value)}
            disabled={loading}
            required
          />
          <PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
            value={form.password}
            error={errors.password}
            onChange={(value) => updateField('password', value)}
            disabled={loading}
          />
          <div className="flex flex-col gap-3 text-sm min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => updateField('rememberMe', event.target.checked)}
                disabled={loading}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
              />
              <span>Remember me</span>
            </label>
            <Link className="font-medium text-emerald-700" to="/forgot-password">Forgot password?</Link>
          </div>
          <FormError message={error || undefined} />
          <AuthSubmitButton loading={loading} loadingText="Signing in...">
            Sign in <ArrowRight aria-hidden className="h-4 w-4" />
          </AuthSubmitButton>
          <p className="text-xs leading-5 text-slate-500">
            Remember Me stores your session in this browser. Without it, the session is limited to this browser tab session. Token expiration is still controlled by the backend.
          </p>
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', acceptTerms: false });
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', acceptTerms: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const setField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setFormError('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      acceptTerms: form.acceptTerms ? '' : 'You must accept the Privacy Policy and Terms.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await authService.register({ email: form.email.trim(), password: form.password, role: CUSTOMER_ROLE });
      toast.success('Registration submitted');
      navigate('/login', { replace: true });
    } catch (error) {
      setFormError(normalizeAuthError(error, 'Unable to create the account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your Tapro account" description="Start with a customer account. Staff and restaurant-owner access is managed through secure invitations.">
      <AuthFormCard
        eyebrow="Customer registration"
        title="Create your Tapro account"
        description="Public registration creates a customer account only. Restaurant staff and owner accounts must use an invitation."
        footer={<span>Already have an account? <Link className="font-semibold text-emerald-700" to="/login">Sign in</Link></span>}
      >
        <form className="grid gap-5" onSubmit={onSubmit} aria-busy={submitting}>
          <Input name="email" label="Email" type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(event) => setField('email', event.target.value)} disabled={submitting} required />
          <PasswordField name="password" label="Password" autoComplete="new-password" helperText="Use at least 6 characters." value={form.password} error={errors.password} onChange={(value) => setField('password', value)} disabled={submitting} />
          <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(value) => setField('confirmPassword', value)} disabled={submitting} />
          <label className="inline-flex min-h-11 items-start gap-3 text-sm text-slate-700">
            <input name="acceptTerms" type="checkbox" checked={form.acceptTerms} onChange={(event) => setField('acceptTerms', event.target.checked)} disabled={submitting} className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
            <span>I agree to the <Link className="font-semibold text-emerald-700" to="/privacy">Privacy Policy</Link> and <Link className="font-semibold text-emerald-700" to="/terms">Terms and Conditions</Link>.</span>
          </label>
          {errors.acceptTerms ? <p role="alert" className="text-xs text-red-600">{errors.acceptTerms}</p> : null}
          <FormError message={formError} />
          <AuthSubmitButton loading={submitting} loadingText="Creating account...">Create customer account</AuthSubmitButton>
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextError = validateEmail(email);
    setEmailError(nextError);
    if (nextError) {
      focusFirstError({ email: nextError });
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccess('');
    try {
      await authService.forgotPassword(email.trim());
      setSuccess('If an account exists for this email, password reset instructions have been sent.');
    } catch (error) {
      setFormError(normalizeAuthError(error, 'Unable to request password reset instructions.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Forgot your password?" description="Request secure reset instructions for your Tapro account.">
      <AuthFormCard
        eyebrow="Password recovery"
        title="Forgot your password?"
        description="Enter the email associated with your Tapro account. If an eligible account exists, reset instructions will be sent."
        footer={<Link className="font-semibold text-emerald-700" to="/login">Back to sign in</Link>}
      >
        <form className="grid gap-5" onSubmit={onSubmit} aria-busy={submitting}>
          <Input name="email" label="Email" type="email" autoComplete="email" value={email} error={emailError} onChange={(event) => { setEmail(event.target.value); setEmailError(''); setFormError(''); }} disabled={submitting} required />
          <FormSuccess message={success} />
          <FormError message={formError} />
          <AuthSubmitButton loading={submitting} loadingText="Sending...">
            Send reset link <Mail aria-hidden className="h-4 w-4" />
          </AuthSubmitButton>
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() || '', [params]);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<PasswordPairErrors>({ password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(validateRequiredToken(token, 'Reset token'));
  const [success, setSuccess] = useState('');

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setFormError(validateRequiredToken(token, 'Reset token'));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const tokenError = validateRequiredToken(token, 'Reset token');
    const nextErrors = {
      password: validatePassword(form.password, 'New password'),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(nextErrors);
    setFormError(tokenError);
    if (tokenError || nextErrors.password || nextErrors.confirmPassword) {
      focusFirstError(tokenError ? { password: tokenError } : nextErrors);
      return;
    }

    setSubmitting(true);
    setSuccess('');
    try {
      await authService.resetPassword(token, form.password);
      setSuccess('Password reset complete. You can now sign in with your new password.');
      setForm({ password: '', confirmPassword: '' });
    } catch (error) {
      setFormError(normalizeAuthError(error, 'This reset link is invalid or has expired. Request a new password reset link.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" description="Choose a new password for your Tapro account.">
      <AuthFormCard
        eyebrow="Password reset"
        title="Reset password"
        description="Enter and confirm a new password. Reset links may expire for security."
        footer={<Link className="font-semibold text-emerald-700" to="/login">Back to sign in</Link>}
      >
        <form className="grid gap-5" onSubmit={onSubmit} aria-busy={submitting}>
          <PasswordField name="password" label="New password" autoComplete="new-password" helperText="Use at least 6 characters." value={form.password} error={errors.password} onChange={(value) => setField('password', value)} disabled={submitting || Boolean(success)} />
          <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(value) => setField('confirmPassword', value)} disabled={submitting || Boolean(success)} />
          <FormSuccess message={success} />
          <FormError message={formError && !success ? formError : ''} />
          <AuthSubmitButton loading={submitting} loadingText="Resetting..." disabled={Boolean(success)}>Reset password</AuthSubmitButton>
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setFormError('');
    setSuccess('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {
      currentPassword: validatePassword(form.currentPassword, 'Current password'),
      newPassword: validatePassword(form.newPassword, 'New password'),
      confirmPassword: validateConfirmPassword(form.newPassword, form.confirmPassword),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      setSuccess('Password updated.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setFormError(normalizeAuthError(error, 'Unable to update password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Change password" description="Keep your Tapro account credentials current.">
      <AuthFormCard eyebrow="Account security" title="Change password" description="Enter your current password and choose a new one.">
        <form className="grid gap-5" onSubmit={onSubmit} aria-busy={submitting}>
          <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" value={form.currentPassword} error={errors.currentPassword} onChange={(value) => setField('currentPassword', value)} disabled={submitting} />
          <PasswordField name="newPassword" label="New password" autoComplete="new-password" helperText="Use at least 6 characters." value={form.newPassword} error={errors.newPassword} onChange={(value) => setField('newPassword', value)} disabled={submitting} />
          <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(value) => setField('confirmPassword', value)} disabled={submitting} />
          <FormSuccess message={success} />
          <FormError message={formError} />
          <AuthSubmitButton loading={submitting} loadingText="Updating...">Update password</AuthSubmitButton>
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};
