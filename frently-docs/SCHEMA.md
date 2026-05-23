# Frently — Supabase Schema

```sql
supabase.schema('frently').from('listings').select('*')
```

## Tables

### `profiles`
Extends Supabase auth.users. Created automatically on signup via trigger.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### `listings`
Core listing table. One row per landlord submission.

```sql
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text default 'draft' check (status in ('draft', 'pending', 'live', 'expired')),

  -- Step 1: Property Basics
  property_type text,           -- 'Condo/Apt', 'Row/Townhouse', 'Detached', etc.
  property_sub_type text,
  street_number text,
  street_name text,
  unit_number text,
  city text,
  province text default 'ON',
  postal_code text,
  style text,                   -- 'Apartment', '2-Storey', 'Loft', etc.
  storeys integer,
  ownership_type text,          -- 'Condominium', 'Freehold', etc.
  garage text,                  -- 'Yes', 'No'
  is_condo boolean default false,

  -- Step 2: Lease Details
  rent_amount numeric(10,2),
  deposit_amount numeric(10,2), -- auto = rent_amount (last month's rent)
  lease_term text,              -- '12 Months', '6 Months', 'Month-to-Month', etc.
  available_date date,
  is_furnished boolean default false,
  pets_allowed boolean default false,
  smoking_allowed boolean default false,

  -- Included utilities (array of strings)
  utilities_included text[],    -- ['Hydro', 'Heat', 'Water', 'Internet', 'Cable TV', etc.]

  -- Step 3: Property Details
  bedrooms integer,
  bathrooms numeric(3,1),       -- allows 1.5, 2.5 etc.
  sqft integer,
  parking_spaces integer default 0,
  parking_type text,            -- 'Underground', 'Surface', 'None'
  locker boolean default false,
  locker_number text,

  -- Condo-specific
  condo_fee numeric(8,2),
  condo_fee_includes text[],
  management_company text,
  management_phone text,

  -- Step 4: Description + Media
  public_remarks text,
  photo_urls text[],            -- Supabase storage paths

  -- Hardcoded MLS fields (never exposed to landlord)
  commission numeric(6,2) default 1.00,
  brokerage_id text default 'CAS984',
  showing_remarks text default 'Contact the Landlord directly for showings at leasing@kwproperty.com. 24 hour notice is required.',

  -- Timestamps
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## RLS Policies

```sql
-- Enable RLS
alter table listings enable row level security;
alter table profiles enable row level security;

-- Landlords can only see/edit their own listings
create policy "Landlords own their listings"
  on listings for all
  using (auth.uid() = user_id);

-- Profiles: users can read/update their own
create policy "Users own their profile"
  on profiles for all
  using (auth.uid() = id);
```

---

## Storage Bucket

```sql
-- Create bucket for listing photos
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);

-- Allow authenticated users to upload
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (auth.role() = 'authenticated');

-- Public read for listing photos
create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');
```
