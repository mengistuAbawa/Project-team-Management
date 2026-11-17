import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

export function PasswordInput({
  autoComplete,
  className = '',
  maxLength,
  minLength,
  onChange,
  required,
  value,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={`relative block ${className || 'mt-2'}`}>
      <LockKeyhole size={17} aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="form-input block h-11 pl-11 pr-11"
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
      />
      <button
        type="button"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible
          ? <EyeOff size={17} aria-hidden="true" />
          : <Eye size={17} aria-hidden="true" />}
      </button>
    </span>
  );
}
