# Frently — Listing Form Fields

Multi-step form. 5 steps. Progress bar at top. Save as draft on each step.
All steps submit to `/api/listings` via PATCH (upsert by listing ID stored in state).

---

## Step 1 — Property Basics

| Field | Type | Options / Notes | Required |
|-------|------|-----------------|----------|
| Property Type | Select | Condo/Apt, Row/Townhouse, Semi-Detached, Detached, Other | Yes |
| Style | Select | Apartment, Loft, 2-Storey, Bungalow, Backsplit, Other | Yes |
| Street Number | Text | | Yes |
| Street Name | Text | | Yes |
| Unit Number | Text | Leave blank if N/A | No |
| City | Text | | Yes |
| Postal Code | Text | Format: A1A 1A1 | Yes |
| Storeys | Number | 1–4 | Yes |
| Ownership Type | Select | Condominium, Freehold, None | Yes |
| Garage | Radio | Yes / No | Yes |
| Is this a condo? | Toggle | Shows condo fields in Step 3 if Yes | Yes |

---

## Step 2 — Lease Details

| Field | Type | Options / Notes | Required |
|-------|------|-----------------|----------|
| Monthly Rent | Currency | Min $500 | Yes |
| Deposit | Display only | Auto-filled: "Equal to one month's rent ($X,XXX)" | — |
| Available Date | Date picker | Must be today or future | Yes |
| Lease Term | Select | 12 Months, 6 Months, Month-to-Month, Other | Yes |
| Furnished | Toggle | Yes / No | Yes |
| Pets Allowed | Toggle | Yes / No | Yes |
| Smoking Allowed | Toggle | Yes / No | Yes |
| Utilities Included | Multi-checkbox | Hydro, Heat, Water, Internet, Cable TV, Central Air, Parking, None | Yes (pick at least one or None) |

---

## Step 3 — Property Details

| Field | Type | Options / Notes | Required |
|-------|------|-----------------|----------|
| Bedrooms | Select | Studio, 1, 2, 3, 4, 5+ | Yes |
| Bathrooms | Select | 1, 1.5, 2, 2.5, 3, 3+ | Yes |
| Square Footage | Number | Approximate OK | No |
| Parking Spaces | Number | 0–4 | Yes |
| Parking Type | Select | Underground, Surface, Street, None | If parking > 0 |

**If Is Condo = Yes, show these additional fields:**

| Field | Type | Options / Notes | Required |
|-------|------|-----------------|----------|
| Locker Included | Toggle | Yes / No | Yes |
| Locker Number | Text | Only if locker = Yes | No |
| Condo/Maintenance Fee | Currency | Monthly fee amount | Yes |
| Condo Fee Includes | Multi-checkbox | Water, Hydro, Heat, Central Air, Building Insurance, Parking, Internet, Cable TV, Common Elements | Yes |
| Property Management Company | Text | | No |
| Management Phone | Phone | | No |

---

## Step 4 — Description & Photos

| Field | Type | Notes | Required |
|-------|------|-------|----------|
| Property Description | Textarea | Max 2000 chars. Label: "Describe your property (this will appear on MLS and Frently)" | Yes |
| Photos | File upload | Min 1, Max 25. JPG/PNG only. Max 10MB each. Show preview grid. | Yes (min 1) |

**Helper text for description:**
> Include key features, recent upgrades, proximity to transit/schools/amenities, and anything that makes this property stand out.

---

## Step 5 — Review & Submit

Display a read-only summary of all fields entered across Steps 1–4.
Group by section with Edit buttons that jump back to the relevant step.

Show this notice prominently:
> "By submitting, you authorize Vancor Realty (Brokerage #CAS984) to list this property on MLS on your behalf for a commission of $1.00. You may negotiate additional compensation directly with the listing agent."

**Submit button:** "Submit Listing for MLS"

On submit:
- Set `status = 'pending'`
- Set `submitted_at = now()`
- Auto-calculate `deposit_amount = rent_amount`
- Trigger Vancor notification email (see EMAILS.md)
- Redirect to `/dashboard` with success toast

---

## Validation Rules

- Postal code: regex `/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/`
- Rent: must be numeric, min 500, max 50000
- Available date: must be >= today
- Photos: at least 1 required before submit
- Description: min 50 characters
- All Step 1 required fields must be complete before advancing to Step 2 (validate on Next click)

---

## Draft Saving
- Auto-save on "Next" between steps
- "Save as Draft" button visible on all steps
- Drafts appear in landlord dashboard with status badge "Draft"
- Landlord can return and continue from last completed step
