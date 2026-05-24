// Native <select> styled to match Input. Pass options as a readonly tuple
// from constants/listing.ts.
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: readonly string[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { options, placeholder = 'Select…', className, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      {...props}
      className={cn(
        'w-full h-11 px-3 rounded-lg border border-[#DDDDDD] bg-white text-[14px] text-ink',
        'outline-none transition',
        'focus:border-forest focus:ring-[3px] focus:ring-forest/15',
        'aria-[invalid=true]:border-red-400',
        className,
      )}
      defaultValue={props.defaultValue ?? ''}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
});
