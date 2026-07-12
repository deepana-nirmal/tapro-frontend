import {
  ButtonHTMLAttributes,
  ChangeEvent,
  DragEvent,
  forwardRef,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useEffect,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useId,
  useState,
} from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { classNames } from '../ui/utils';

type CommonFieldProps = {
  label?: string;
  error?: string;
  description?: string;
  success?: string;
  fullWidth?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

const control =
  'w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800';

const describedBy = (id: string, description?: ReactNode, error?: ReactNode, success?: ReactNode, extra?: string) =>
  [description && `${id}-description`, error && `${id}-error`, success && `${id}-success`, extra].filter(Boolean).join(' ') || undefined;

export const RequiredLabel = () => <span className="ml-1 text-red-600" aria-hidden>*</span>;

export const FormLabel = ({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-200">
    {children}
    {required ? <RequiredLabel /> : null}
  </label>
);

export const ValidationMessage = ({ children, id, tone = 'error' }: { children: ReactNode; id?: string; tone?: 'error' | 'success' | 'helper' }) => (
  <p
    id={id}
    role={tone === 'error' ? 'alert' : undefined}
    className={classNames(
      'text-xs',
      tone === 'error' && 'text-red-600 dark:text-red-400',
      tone === 'success' && 'text-emerald-700 dark:text-emerald-300',
      tone === 'helper' && 'text-slate-500 dark:text-slate-400'
    )}
  >
    {children}
  </p>
);

export const FormDescription = ({ children, id }: { children: ReactNode; id?: string }) => <ValidationMessage id={id} tone="helper">{children}</ValidationMessage>;
export const FormMessage = ({ children, id }: { children: ReactNode; id?: string }) => <ValidationMessage id={id}>{children}</ValidationMessage>;
export const FormError = ({ message }: { message?: string }) => message ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{message}</div> : null;

export const FormField = ({
  label,
  required,
  description,
  error,
  success,
  id,
  children,
}: PropsWithChildren<{ label?: string; required?: boolean; description?: string; error?: string; success?: string; id?: string }>) => (
  <div className="flex min-w-0 flex-col gap-2">
    {label ? <FormLabel htmlFor={id} required={required}>{label}</FormLabel> : null}
    {children}
    {description ? <FormDescription id={`${id}-description`}>{description}</FormDescription> : null}
    {success ? <ValidationMessage id={`${id}-success`} tone="success">{success}</ValidationMessage> : null}
    {error ? <FormMessage id={`${id}-error`}>{error}</FormMessage> : null}
  </div>
);

export const FormSection = ({ title, description, children }: PropsWithChildren<{ title?: string; description?: string }>) => (
  <section className="grid gap-4">
    {title || description ? (
      <div>
        {title ? <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2> : null}
        {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
    ) : null}
    {children}
  </section>
);

export const FormGrid = ({ children, columns = 2 }: PropsWithChildren<{ columns?: 1 | 2 | 3 }>) => (
  <div className={classNames('grid gap-4', columns === 2 && 'md:grid-cols-2', columns === 3 && 'md:grid-cols-2 xl:grid-cols-3')}>{children}</div>
);

export const FormActions = ({ children }: PropsWithChildren) => <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">{children}</div>;

export const CharacterCounter = ({ value = '', maxLength }: { value?: string; maxLength?: number }) =>
  maxLength ? <span className="text-xs text-slate-500 dark:text-slate-400">{value.length}/{maxLength}</span> : null;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & CommonFieldProps>(
  ({ label, error, description, success, fullWidth = true, id: given, prefix, suffix, ...props }, ref) => {
    const auto = useId();
    const id = given || auto;
    const input = (
      <input
        {...props}
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, description, error, success, props['aria-describedby'])}
        className={classNames(control, 'min-h-11', !fullWidth && 'w-auto', Boolean(prefix || suffix) && 'px-0', props.className)}
      />
    );

    return (
      <FormField id={id} label={label} required={props.required} description={description} error={error} success={success}>
        {prefix || suffix ? (
          <div className={classNames(control, 'flex min-h-11 items-center gap-2 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/15')}>
            {prefix ? <span className="shrink-0 text-slate-500">{prefix}</span> : null}
            {input}
            {suffix ? <span className="shrink-0 text-slate-500">{suffix}</span> : null}
          </div>
        ) : input}
      </FormField>
    );
  }
);

export const TextInput = Input;
export const NumberInput = Input;
export const DateInput = Input;

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & CommonFieldProps & { strength?: ReactNode }>(
  ({ strength, type: _type, ...props }, ref) => (
    <div className="grid gap-2">
      <Input {...props} ref={ref} type="password" autoComplete={props.autoComplete || 'current-password'} />
      {strength ? <div>{strength}</div> : null}
    </div>
  )
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFieldProps & { showCounter?: boolean }>(
  ({ label, error, description, success, id: given, showCounter, value, maxLength, ...props }, ref) => {
    const auto = useId();
    const id = given || auto;
    return (
      <FormField id={id} label={label} required={props.required} description={description} error={error} success={success}>
        <textarea
          {...props}
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, description, error, success, props['aria-describedby'])}
          className={classNames(control, 'min-h-28 py-3', props.className)}
        />
        {showCounter ? <CharacterCounter value={String(value || '')} maxLength={maxLength} /> : null}
      </FormField>
    );
  }
);

export const TextArea = Textarea;

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & CommonFieldProps & { placeholder?: string }>(
  ({ label, error, description, success, children, id: given, placeholder, ...props }, ref) => {
    const auto = useId();
    const id = given || auto;
    return (
      <FormField id={id} label={label} required={props.required} description={description} error={error} success={success}>
        <select
          {...props}
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, description, error, success, props['aria-describedby'])}
          className={classNames(control, 'min-h-11', props.className)}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children}
        </select>
      </FormField>
    );
  }
);

export const SelectInput = Select;

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string; description?: string }>(
  ({ label, error, description, id: given, ...props }, ref) => {
    const auto = useId();
    const id = given || auto;
    return (
      <FormField id={id} error={error} description={description}>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <input {...props} ref={ref} id={id} type="checkbox" aria-invalid={!!error} className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
          <span>{label}</span>
        </label>
      </FormField>
    );
  }
);

export const CheckboxInput = Checkbox;

export const RadioGroup = ({ children, label }: PropsWithChildren<{ label?: string }>) => (
  <fieldset className="grid gap-2">
    {label ? <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</legend> : null}
    {children}
  </fieldset>
);

export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }>(({ label, ...props }, ref) => (
  <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
    <input {...props} ref={ref} type="radio" className="h-5 w-5 border-slate-300 text-emerald-600 focus:ring-emerald-600" />
    <span>{label}</span>
  </label>
));

export const Switch = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }>(({ label, ...props }, ref) => (
  <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
    <input {...props} ref={ref} type="checkbox" role="switch" className="peer sr-only" />
    <span aria-hidden className="relative h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-600/20" />
    <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
  </label>
));

export const SwitchInput = Switch;

const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const maxImageSize = 5 * 1024 * 1024;
const formatFileSize = (size: number) => `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;

export const FileUploader = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & CommonFieldProps & {
  previewUrl?: string;
  onRemove?: () => void;
  onFileSelect?: (file: File | null) => void;
  uploading?: boolean;
  progress?: number;
}>(
  ({ label, error, description, success, id: given, previewUrl, onRemove, onFileSelect, uploading, progress, accept = imageTypes.join(','), ...props }, ref) => {
    const auto = useId();
    const id = given || auto;
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState('');
    const [fileMeta, setFileMeta] = useState<{ name: string; size: string; dimensions?: string; preview?: string } | null>(null);
    const visibleError = error || localError;

    useEffect(() => () => {
      if (fileMeta?.preview) URL.revokeObjectURL(fileMeta.preview);
    }, [fileMeta?.preview]);

    const validateFile = (file: File | null) => {
      if (!file) return null;
      if (!imageTypes.includes(file.type)) return 'Use a JPG, PNG, WEBP, or GIF image.';
      if (file.size > maxImageSize) return 'Use an image under 5MB.';
      return null;
    };

    const setSelectedFile = (file: File | null) => {
      const validationMessage = validateFile(file);
      setLocalError(validationMessage || '');
      if (!file || validationMessage) {
        setFileMeta(null);
        onFileSelect?.(null);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setFileMeta({ name: file.name, size: formatFileSize(file.size), preview: objectUrl });
      const image = new Image();
      image.onload = () => setFileMeta((current) => current ? { ...current, dimensions: `${image.naturalWidth} × ${image.naturalHeight}px` } : current);
      image.onerror = () => setLocalError('This image could not be previewed. Try another file.');
      image.src = objectUrl;
      onFileSelect?.(file);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if ((event.target.files?.length || 0) > 1) {
        setLocalError('Select one image at a time.');
        onFileSelect?.(null);
        return;
      }
      setSelectedFile(event.target.files?.[0] || null);
      props.onChange?.(event);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      if (props.disabled) return;
      if (event.dataTransfer.files.length > 1) {
        setLocalError('Select one image at a time.');
        onFileSelect?.(null);
        return;
      }
      setSelectedFile(event.dataTransfer.files[0] || null);
    };

    const removeFile = () => {
      setLocalError('');
      setFileMeta(null);
      onFileSelect?.(null);
      onRemove?.();
    };

    const activePreview = previewUrl || fileMeta?.preview;

    return (
      <FormField id={id} label={label} required={props.required} description={description || fileMeta?.name} error={visibleError} success={success}>
        <div className={classNames('grid gap-3 rounded-2xl border border-dashed p-4 transition', dragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700')}>
          {activePreview ? <img src={activePreview} alt="" className="h-36 w-full rounded-xl object-cover" /> : null}
          <label
            htmlFor={id}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-600 transition hover:bg-slate-100 focus-within:ring-4 focus-within:ring-emerald-600/15 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <UploadCloud aria-hidden className="h-6 w-6" />
            <span className="font-medium">{dragging ? 'Drop image here' : 'Drag image here or browse'}</span>
            <span className="text-xs text-slate-500">PNG, JPG, WEBP, or GIF. One image, up to 5MB.</span>
          </label>
          <input
            {...props}
            ref={ref}
            id={id}
            type="file"
            accept={accept}
            aria-invalid={!!visibleError}
            aria-describedby={describedBy(id, description || fileMeta?.name, visibleError, success, props['aria-describedby'])}
            onChange={handleChange}
            className="sr-only"
          />
          {fileMeta ? (
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <div className="font-medium text-slate-800 dark:text-slate-100">{fileMeta.name}</div>
              <div>{fileMeta.size}{fileMeta.dimensions ? ` • ${fileMeta.dimensions}` : ''}</div>
            </div>
          ) : null}
          {typeof progress === 'number' || uploading ? (
            <div aria-live="polite" className="grid gap-1 text-xs text-slate-500">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${Math.max(8, Math.min(progress ?? 40, 100))}%` }} />
              </div>
              <span>{uploading ? 'Uploading image…' : `Upload ${progress}% complete`}</span>
            </div>
          ) : null}
          {onRemove || fileMeta ? (
            <button type="button" onClick={removeFile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <X aria-hidden className="h-4 w-4" />
              Remove
            </button>
          ) : null}
        </div>
      </FormField>
    );
  }
);

export const ImageUploader = FileUploader;

export const LoadingButton = ({ loading, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={classNames(
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950',
      props.className
    )}
  >
    {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
    {children}
  </button>
);
