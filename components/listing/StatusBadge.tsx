// Status pill — colors per spec:
//   draft → gray, pending → yellow, in_review → blue,
//   ready_for_mls → purple, live → green, expired → red.
import type { ListingStatus } from '@/types/listing';

const STYLES: Record<ListingStatus, { bg: string; text: string; dot: string; label: string }> = {
  draft:         { bg: 'bg-zinc-100',    text: 'text-zinc-700',    dot: 'bg-zinc-400',   label: 'Draft' },
  pending:       { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',  label: 'Pending' },
  in_review:     { bg: 'bg-sky-50',      text: 'text-sky-700',     dot: 'bg-sky-500',    label: 'In review' },
  ready_for_mls: { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-500', label: 'Ready for MLS' },
  live:          { bg: 'bg-forest-50',   text: 'text-forest',      dot: 'bg-forest',     label: 'Live' },
  expired:       { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500',    label: 'Expired' },
  withdrawn:     { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400',  label: 'Withdrawn' },
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  const s = STYLES[status] ?? STYLES.draft;
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium ' +
        s.bg + ' ' + s.text
      }
    >
      <span className={'w-1.5 h-1.5 rounded-full ' + s.dot} /> {s.label}
    </span>
  );
}
