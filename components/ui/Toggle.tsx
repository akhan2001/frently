// Two-state segmented toggle for Yes/No booleans (furnished, pets, smoking,
// is_condo, locker). Controlled via value/onChange; intended for use inside
// a react-hook-form <Controller>.
import { cn } from '@/lib/utils';

export function Toggle({
  value,
  onChange,
  labels = ['No', 'Yes'],
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  labels?: [string, string];
}) {
  return (
    <div className="inline-flex p-1 rounded-full bg-page border border-line">
      {[false, true].map((v, i) => {
        const active = value === v;
        return (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={cn(
              'h-9 px-5 rounded-full text-[13px] font-medium transition',
              active ? 'bg-forest text-white' : 'text-body hover:text-ink',
            )}
          >
            {labels[i]}
          </button>
        );
      })}
    </div>
  );
}
