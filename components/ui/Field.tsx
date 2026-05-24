// Form field shell — label, child input(s), helper/error text.
// Pair with Input/Select/Textarea/etc. below.
import type { ReactNode } from 'react';

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[13px] font-medium text-ink mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      {children}
      {(hint || error) && (
        <div className={'mt-1.5 text-[12px] ' + (error ? 'text-red-500' : 'text-muted')}>
          {error || hint}
        </div>
      )}
    </label>
  );
}
