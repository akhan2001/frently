# Claude Code — Frently MVP Bootstrap Prompt

Use this as your opening prompt when starting a Claude Code session.

---

## Prompt

Read all files in the `/frently-docs` folder before writing any code:
- `CLAUDE.md` — project overview, stack, business rules
- `SCHEMA.md` — Supabase database schema and RLS
- `FORM_FIELDS.md` — listing form steps, fields, validation
- `FLOWS.md` — page map and user flows
- `EMAILS.md` — email triggers and templates

Then scaffold the full Next.js 14 App Router project with the following structure:

```
/app
  /page.tsx                  -- Landing page
  /signup/page.tsx           -- Signup form
  /login/page.tsx            -- Login form
  /dashboard/page.tsx        -- My Listings (auth protected)
  /listings/new/page.tsx     -- Multi-step listing form
  /listings/[id]/page.tsx    -- Listing detail view
  /listings/[id]/edit/page.tsx -- Edit draft
  /api/listings/route.ts     -- POST create listing
  /api/listings/[id]/route.ts -- GET, PATCH listing

/components
  /ui/                       -- Reusable: Button, Input, Select, Toggle, Badge
  /listing/
    StepIndicator.tsx
    Step1Basics.tsx
    Step2Lease.tsx
    Step3Details.tsx
    Step4Media.tsx
    Step5Review.tsx
    ListingCard.tsx

/lib
  supabase.ts                -- Supabase client (browser)
  supabase-server.ts         -- Supabase client (server/RSC)
  validations.ts             -- Zod schemas for each form step
  email.ts                   -- Resend email functions

/types
  listing.ts                 -- TypeScript types matching DB schema
```

## Rules
- Use Tailwind CSS for all styling
- Use Zod for form validation
- Use react-hook-form for form state
- Use Supabase Auth for auth (email/password)
- Protect all `/dashboard` and `/listings/*` routes via middleware
- Apply RLS as defined in SCHEMA.md — never bypass with service role on client
- Never expose hardcoded MLS fields (commission, brokerage ID, showing remarks) in the UI
- Auto-calculate deposit = rent amount on Step 2, display as read-only
- Save draft to Supabase on every "Next" click between steps
- On final submit: set status='pending', fire both emails (EMAILS.md), redirect to /dashboard

## Start with
1. `npx create-next-app@latest frently --typescript --tailwind --app`
2. Install deps: `@supabase/supabase-js @supabase/ssr resend react-hook-form zod @hookform/resolvers`
3. Set up Supabase client files
4. Run the SQL from SCHEMA.md in Supabase SQL editor
5. Build components in order: UI primitives → form steps → API routes → pages
