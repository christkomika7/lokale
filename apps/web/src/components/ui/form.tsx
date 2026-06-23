interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

interface FormInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

interface FormSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

interface FormToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: FormInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
    />
  );
}

export function FormSelect({ value, onChange, options }: FormSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-[13px] text-neutral-700 dark:text-neutral-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FormToggle({ checked, onChange, label }: FormToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 py-2"
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-amber-400" : "bg-slate-200 dark:bg-neutral-700"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </div>
      <span className="text-[13px] text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
    </button>
  );
}
