# Frently — Emails

Using Resend (resend.com). Send via `/api/listings/[id]` on submit.

---

## Email 1 — Vancor Notification (Internal)

**Trigger:** Landlord submits listing (status changes to 'pending')
**To:** leasing@kwproperty.com
**From:** listings@frently.ca (or noreply@frently.ca)
**Subject:** New Listing Submission — [ADDRESS]

```
New listing submitted via Frently. Please enter into MLS.

PROPERTY
--------
Address: [street_number] [street_name], Unit [unit_number], [city], ON [postal_code]
Type: [property_type] — [style]
Storeys: [storeys]
Ownership: [ownership_type]

LEASE DETAILS
-------------
Rent: $[rent_amount]/month
Deposit: $[deposit_amount] (last month's rent)
Available: [available_date]
Lease Term: [lease_term]
Furnished: [is_furnished]
Pets: [pets_allowed]
Smoking: [smoking_allowed]
Utilities Included: [utilities_included joined by ', ']

PROPERTY DETAILS
----------------
Bedrooms: [bedrooms]
Bathrooms: [bathrooms]
Sqft: [sqft]
Parking: [parking_spaces] ([parking_type])
Locker: [locker]

[IF CONDO]
Condo Fee: $[condo_fee]/month
Condo Fee Includes: [condo_fee_includes]
Management Company: [management_company]
Management Phone: [management_phone]

MLS FIELDS (HARDCODED)
-----------------------
Commission: $1.00
Brokerage ID: CAS984
Showing Remarks: Contact the Landlord directly for showings at leasing@kwproperty.com. 24 hour notice is required.

DESCRIPTION
-----------
[public_remarks]

PHOTOS
------
[list of photo_urls as clickable links]

LANDLORD
--------
Name: [profiles.full_name]
Email: [auth.users.email]
Phone: [profiles.phone]

Submitted: [submitted_at]
Listing ID: [id]
```

---

## Email 2 — Landlord Confirmation

**Trigger:** Same event as Email 1
**To:** Landlord's email
**Subject:** Your listing has been submitted — we'll take it from here

```
Hi [full_name],

Your rental listing at [address] has been received.

Our team at Vancor Realty will review and submit it to MLS within 1 business day.
You'll hear from us if we need anything.

LISTING SUMMARY
---------------
Address: [address]
Rent: $[rent_amount]/month
Available: [available_date]
Status: Pending MLS Submission

You can view your listing at:
https://frently.ca/listings/[id]

Questions? Contact us at leasing@kwproperty.com

— The Frently Team
Powered by Vancor Realty, Brokerage #CAS984
```

---

## Implementation

Use Resend SDK in a Next.js API route:

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Send both emails in parallel on submit
await Promise.all([
  resend.emails.send({ to: 'leasing@kwproperty.com', ... }),
  resend.emails.send({ to: landlordEmail, ... })
]);
```
