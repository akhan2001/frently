// Text/number/date input. Forwards `register(...)` props as-is.
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          'w-full h-11 px-3.5 rounded-lg border border-[#DDDDDD] bg-white text-[14px] text-ink',
          'placeholder:text-muted outline-none transition',
          'focus:border-forest focus:ring-[3px] focus:ring-forest/15',
          'aria-[invalid=true]:border-red-400',
          className,
        )}
      />
    );
  },
);
