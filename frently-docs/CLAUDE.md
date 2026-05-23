# Frently MVP — Claude Code Context

## What We're Building
Frently is a rental listing platform where landlords submit properties that get listed on MLS via Vancor Realty (a licensed Ontario brokerage). This is the MVP only — landlord intake form → Vancor gets notified → Vancor manually submits to MLS.

## Two Separate Entities
- **Frently** — the platform (not a brokerage). Landlord-facing. Owned by Vancor.
- **Vancor Realty** — licensed Ontario brokerage. Brokerage ID: CAS984. Handles the actual MLS submission.

## Stack
- **Framework:** Next.js 14 (App Router)
- **Database + Auth:** Supabase
- **Hosting:** Vercel
- **Email:** Resend (or Supabase Edge Functions + SMTP)
- **Storage:** Supabase Storage (photos)
- **Styling:** Tailwind CSS

## Key Business Rules (hardcoded, never shown to landlord)
- Commission = $1.00 (Realtor negotiates directly with landlord)
- Brokerage ID = CAS984
- Deposit = always last month's rent (auto-calculated from rent amount)
- Showing remarks = "Contact the Landlord directly for showings at leasing@kwproperty.com. 24 hour notice is required."
- MLS submission is MANUAL by Vancor for MVP — no RESO/ITSO API integration yet

## Reference Files
- `SCHEMA.md` — Supabase database schema
- `FORM_FIELDS.md` — All listing form fields, steps, validation rules
- `FLOWS.md` — User flows and page map
- `EMAILS.md` — Email templates and triggers

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
VANCOR_NOTIFY_EMAIL=leasing@kwproperty.com
```

## What's Out of Scope for MVP
- RESO/ITSO API (automated MLS submission)
- Tenant search or map
- Payments or subscriptions
- Realtor portal
- Contractor/service provider ads
- Property management features
