// Listing card — placeholder shape for MVP. Once real data flows, swap the
// striped photo slot for an <Image> and the skeleton bars for real text.
export function ListingCardPlaceholder() {
  return (
    <article className="bg-white rounded-2xl border border-line overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] ph-stripes flex items-center justify-center">
        <span className="ph-label">unit photo</span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <span className="ph-bar h-3 w-1/3" />
        <span className="ph-bar h-4 w-3/4" />
        <div className="border-t border-line pt-3 flex items-center gap-3">
          <span className="ph-bar h-3 w-16" />
          <span className="ph-bar h-3 w-16" />
          <span className="ph-bar h-3 w-16" />
        </div>
        <div className="mt-1 flex items-end justify-between">
          <span className="ph-bar h-5 w-24" />
          <span className="ph-bar h-8 w-24 rounded-full" />
        </div>
      </div>
    </article>
  );
}
