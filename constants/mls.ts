// Hardcoded MLS / brokerage business rules.
// These are NEVER shown to or editable by the landlord.
// Source of truth: frently-docs/CLAUDE.md ("Key Business Rules") and SCHEMA.md.

/** Commission paid to the brokerage. The realtor negotiates the rest directly. */
export const COMMISSION = 1.0;

/** Vancor Realty — licensed Ontario brokerage handling the MLS submission. */
export const BROKERAGE_ID = 'CAS984';
export const BROKERAGE_NAME = 'Vancor Realty';

/** Shown on the MLS listing for showing instructions. */
export const SHOWING_REMARKS =
  'Contact the Landlord directly for showings at leasing@kwproperty.com. 24 hour notice is required.';

/** Recipient of the new-listing notification email (see EMAILS.md). */
export const VANCOR_NOTIFY_EMAIL = 'leasing@kwproperty.com';

/** All MVP listings are Ontario properties. */
export const DEFAULT_PROVINCE = 'ON';

/**
 * Landlord-facing authorization notice shown on the Review & Submit step.
 * Wording is legally significant — do not paraphrase.
 */
export const MLS_AUTHORIZATION_NOTICE =
  `By submitting, you authorize ${BROKERAGE_NAME} (Brokerage #${BROKERAGE_ID}) ` +
  'to list this property on MLS on your behalf for a commission of $1.00. ' +
  'You may negotiate additional compensation directly with the listing agent.';
