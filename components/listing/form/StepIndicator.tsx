// Step indicator — dots + labels. Royal green for completed steps.
import { LISTING_STEPS, TOTAL_STEPS } from '@/constants/listing';
import { cn } from '@/lib/utils';

export function StepIndicator({ current }: { current: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] text-muted mb-3">
        <span>
          Step {current} of {TOTAL_STEPS}
        </span>
        <span className="text-ink font-medium">{LISTING_STEPS[current - 1]?.label}</span>
      </div>
      <ol className="flex items-center gap-2">
        {LISTING_STEPS.map((s) => {
          const done = s.step < current;
          const active = s.step === current;
          return (
            <li key={s.step} className="flex-1 flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition',
                  done || active ? 'bg-forest' : 'bg-line',
                  active && 'ring-4 ring-forest/15',
                )}
                aria-current={active ? 'step' : undefined}
              />
              <span
                className={cn(
                  'text-[10.5px] font-medium uppercase tracking-[0.08em] text-center',
                  active ? 'text-ink' : 'text-muted',
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
