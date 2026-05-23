# Frently — User Flows & Page Map

## Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing page | No |
| `/signup` | Landlord signup | No |
| `/login` | Login | No |
| `/dashboard` | My Listings overview | Yes |
| `/listings/new` | Multi-step listing form | Yes |
| `/listings/[id]/edit` | Edit draft listing | Yes |
| `/listings/[id]` | Listing detail (read-only) | Yes |
| `/api/listings` | POST create, PATCH update | Yes |
| `/api/listings/[id]` | GET, PATCH, DELETE | Yes |

---

## Flow 1 — New Landlord Submits a Listing

```
Landing (/) 
  → "List My Rental" CTA 
  → /signup (email + password + full name + phone)
  → Email verification (Supabase default)
  → /dashboard (empty state: "You have no listings yet")
  → "Add New Listing" button
  → /listings/new (Step 1)
  → Step 2 → Step 3 → Step 4 → Step 5 (Review)
  → Submit
  → /dashboard (listing appears with status: Pending)
  → Vancor receives email notification
```

---

## Flow 2 — Returning Landlord

```
/login
  → /dashboard
  → See listings with status badges (Draft / Pending / Live / Expired)
  → Click draft → /listings/[id]/edit → resume from last step
```

---

## Dashboard — Listing Card

Each listing card shows:
- Property address
- Rent amount
- Status badge: Draft (grey) / Pending (yellow) / Live (green) / Expired (red)
- Date submitted
- "Edit" button (only for Draft status)
- "View" button

---

## Landing Page — Minimal for MVP

Sections:
1. Hero: "List Your Rental on MLS" + CTA button "Get Started — It's Free"
2. How it works: 3 steps (Enter details → We list on MLS → Tenants find you)
3. Footer: Vancor Realty branding + brokerage disclosure

**Do not build:** tenant search, contractor directory, realtor sign-up, blog. Out of scope for MVP.

---

## API Routes

### POST `/api/listings`
Create new listing (draft).
Body: `{ user_id, ...step1Fields }`
Returns: `{ id, status: 'draft' }`

### PATCH `/api/listings/[id]`
Update listing (any step data).
Body: partial listing fields
If body includes `{ submit: true }`:
- Sets status = 'pending'
- Sets submitted_at = now()
- Triggers Vancor email

### GET `/api/listings/[id]`
Returns listing by ID. RLS ensures only owner can access.
