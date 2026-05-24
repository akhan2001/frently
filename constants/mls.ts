// Hardcoded MLS / brokerage values. Never exposed in any landlord-facing UI.
// The PATCH route enforces this server-side via a whitelist.

export const MLS_COMMISSION = 1.0;
export const MLS_BROKERAGE_ID = 'CAS984';
export const MLS_BROKERAGE_NAME = 'Vancor Realty';

export const MLS_SHOWING_REMARKS =
  'Contact the Landlord directly for showings at leasing@kwproperty.com. 24 hour notice is required.';

export const VANCOR_NOTIFY_EMAIL = 'leasing@kwproperty.com';

export const DEFAULT_PROVINCE = 'ON';

/** Buyer-brokerage compensation pre-fill on the agent form. */
export const DEFAULT_BUYER_BROKERAGE_COMP =
  '$1.00 — Realtor can negotiate directly with Landlord';

/** Authorization notice shown on the landlord's Step 6 (Review). */
export const MLS_AUTHORIZATION_NOTICE =
  `By submitting, you authorize ${MLS_BROKERAGE_NAME} (Brokerage #${MLS_BROKERAGE_ID}) ` +
  'to list this property on MLS on your behalf for a commission of $1.00. ' +
  'You may negotiate additional compensation directly with the listing agent.';
