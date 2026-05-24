// Segmented radio (single-select from a short option list). Used for Garage
// Yes/No and any future short enum field.
import { cn } from '@/lib/utils';

export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <div className="inline-flex p-1 rounded-full bg-page border border-line">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={active}
            className={cn(
              'h-9 px-5 rounded-full text-[13px] font-medium transition',
              active ? 'bg-forest text-white' : 'text-body hover:text-ink',
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
