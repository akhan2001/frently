import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          'w-full min-h-[120px] px-3.5 py-2.5 rounded-lg border border-[#DDDDDD] bg-white text-[14px] text-ink',
          'placeholder:text-muted outline-none transition resize-y',
          'focus:border-forest focus:ring-[3px] focus:ring-forest/15',
          'aria-[invalid=true]:border-red-400',
          className,
        )}
      />
    );
  },
);
