// Outbound transactional email via Resend. Server-only.
// Gracefully no-ops if RESEND_API_KEY is missing so local dev doesn't break;
// real sends require the key + a verified `from` domain.
//
// Templates from frently-docs/EMAILS.md.

import 'server-only';
import { Resend } from 'resend';
import {
  MLS_BROKERAGE_ID,
  MLS_BROKERAGE_NAME,
  MLS_COMMISSION,
  MLS_SHOWING_REMARKS,
  VANCOR_NOTIFY_EMAIL,
} from '@/constants/mls';
import type { Listing, Profile } from '@/types/listing';

const FROM = 'Frently <listings@frently.ca>';

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — email send skipped.');
    return null;
  }
  return new Resend(key);
}

function fmtAddress(l: Listing) {
  return [
    [l.street_number, l.street_name].filter(Boolean).join(' '),
    l.unit_number && `Unit ${l.unit_number}`,
    [l.city, l.province, l.postal_code].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(', ');
}

function fmtBool(b: boolean | null | undefined) {
  return b === true ? 'Yes' : b === false ? 'No' : '—';
}

function fmtList(arr: string[] | null | undefined) {
  return arr && arr.length > 0 ? arr.join(', ') : '—';
}

/** Vancor admin notification — landlord submits a new listing. */
export async function sendVancorNotification(
  listing: Listing,
  profile: Profile | null,
  landlordEmail: string,
) {
  const resend = client();
  if (!resend) return;
  const address = fmtAddress(listing);
  const text = `New listing submitted via Frently. Please enter into MLS.

PROPERTY
--------
Address: ${address || '—'}
Type: ${listing.property_type ?? '—'} — ${listing.style ?? '—'}
Storeys: ${listing.storeys ?? '—'}
Ownership: ${listing.ownership_type ?? '—'}

LEASE DETAILS
-------------
Rent: $${listing.rent_amount?.toLocaleString() ?? '—'}/month
Deposit: $${listing.deposit_amount?.toLocaleString() ?? '—'} (last month's rent)
Available: ${listing.available_date ?? '—'}
Lease Term: ${listing.lease_term ?? '—'}
Furnished: ${fmtBool(listing.is_furnished)}
Pets: ${fmtBool(listing.pets_allowed)}
Smoking: ${fmtBool(listing.smoking_allowed)}
Utilities Included: ${fmtList(listing.utilities_included)}

PROPERTY DETAILS
----------------
Bedrooms: ${listing.bedrooms ?? '—'}
Bathrooms: ${listing.bathrooms ?? '—'}
Sqft: ${listing.sqft_total ?? '—'}
Parking: ${listing.parking_spaces} (${listing.parking_type ?? '—'})
Locker: ${fmtBool(listing.locker)}
${
  listing.is_condo
    ? `\nCONDO\n-----\nCondo Fee: $${listing.condo_fee?.toLocaleString() ?? '—'}/month\nCondo Fee Includes: ${fmtList(listing.condo_fee_includes)}\nManagement: ${listing.management_company ?? '—'}\nManagement Phone: ${listing.management_phone ?? '—'}\n`
    : ''
}
MLS FIELDS (HARDCODED)
-----------------------
Commission: $${MLS_COMMISSION.toFixed(2)}
Brokerage ID: ${MLS_BROKERAGE_ID}
Showing Remarks: ${MLS_SHOWING_REMARKS}

DESCRIPTION
-----------
${listing.public_remarks ?? '—'}

PHOTOS
------
${(listing.photo_urls ?? []).map((u) => `- ${u}`).join('\n') || '—'}

LANDLORD
--------
Name: ${profile?.full_name ?? '—'}
Email: ${landlordEmail}
Phone: ${profile?.phone ?? '—'}

Submitted: ${listing.submitted_at ?? '—'}
Listing ID: ${listing.id}
`;

  await resend.emails.send({
    from: FROM,
    to: VANCOR_NOTIFY_EMAIL,
    subject: `New Listing Submission — ${address || listing.id}`,
    text,
  });
}

/** Landlord confirmation — sent on submit, alongside the Vancor email. */
export async function sendLandlordConfirmation(
  listing: Listing,
  profile: Profile | null,
  landlordEmail: string,
) {
  const resend = client();
  if (!resend) return;
  const address = fmtAddress(listing);
  const name = profile?.full_name ?? 'there';
  const text = `Hi ${name},

Your rental listing at ${address || 'your address'} has been received.

Our team at ${MLS_BROKERAGE_NAME} will review and submit it to MLS within 1 business day.
You'll hear from us if we need anything.

LISTING SUMMARY
---------------
Address: ${address || '—'}
Rent: $${listing.rent_amount?.toLocaleString() ?? '—'}/month
Available: ${listing.available_date ?? '—'}
Status: Pending MLS Submission

You can view your listing at:
${process.env.NEXT_PUBLIC_APP_URL ?? 'https://frently.ca'}/listings/${listing.id}

Questions? Contact us at ${VANCOR_NOTIFY_EMAIL}

— The Frently Team
Powered by ${MLS_BROKERAGE_NAME}, Brokerage #${MLS_BROKERAGE_ID}
`;
  await resend.emails.send({
    from: FROM,
    to: landlordEmail,
    subject: "Your listing has been submitted — we'll take it from here",
    text,
  });
}

/** Sent when the agent marks a listing ready_for_mls. */
export async function sendAgentNotification(listing: Listing) {
  const resend = client();
  if (!resend) return;
  const address = fmtAddress(listing);
  const text = `A listing has been marked ready for MLS submission.

Address: ${address || '—'}
Listing ID: ${listing.id}
Reviewed at: ${listing.agent_reviewed_at ?? '—'}

All Part 2 fields are complete. Please proceed with the manual ITSO submission.
`;
  await resend.emails.send({
    from: FROM,
    to: VANCOR_NOTIFY_EMAIL,
    subject: `Listing Ready for MLS — ${address || listing.id}`,
    text,
  });
}
