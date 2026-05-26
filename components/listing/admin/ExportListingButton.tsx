'use client';

import { IconDownload } from '@/components/icons';
import { exportSingleListing } from '@/utils/export';
import type { Listing } from '@/types/listing';

interface ExportListingButtonProps {
  listing: Listing & { landlord_name?: string; landlord_email?: string };
}

export function ExportListingButton({ listing }: ExportListingButtonProps) {
  return (
    <button
      onClick={() => exportSingleListing(listing)}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition shrink-0"
    >
      <IconDownload size={15} />
      Export Listing (.xlsx)
    </button>
  );
}
