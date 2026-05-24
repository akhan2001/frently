// Multi-select chip group for array-valued fields (utilities, condo_fee_includes).
import { cn } from '@/lib/utils';

export function CheckboxGroup<T extends string>({
  value = [],
  onChange,
  options,
}: {
  value: T[] | undefined;
  onChange: (next: T[]) => void;
  options: readonly T[];
}) {
  const set = new Set(value);
  function toggle(o: T) {
    if (set.has(o)) set.delete(o);
    else set.add(o);
    onChange(Array.from(set) as T[]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = set.has(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center h-9 px-3.5 rounded-full text-[13px] font-medium border transition',
              active
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-ink border-line hover:border-muted',
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
