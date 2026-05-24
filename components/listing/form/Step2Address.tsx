"use client";

// Step 2 — Address. Province is locked to ON (Ontario-only MVP).
import { useFormContext } from 'react-hook-form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { ListingUpdate } from '@/types/listing';

export function Step2Address() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingUpdate>();

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-[1fr_2fr_1fr] gap-5">
        <Field label="Street number" required error={errors.street_number?.message}>
          <Input {...register('street_number')} />
        </Field>
        <Field label="Street name" required error={errors.street_name?.message}>
          <Input {...register('street_name')} />
        </Field>
        <Field
          label="Unit"
          hint="Leave blank if N/A"
          error={errors.unit_number?.message}
        >
          <Input {...register('unit_number')} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="City" required error={errors.city?.message}>
          <Input {...register('city')} />
        </Field>
        <Field
          label="Postal code"
          required
          hint="Format: A1A 1A1"
          error={errors.postal_code?.message}
        >
          <Input {...register('postal_code')} placeholder="M5V 3A8" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Province" hint="Frently is Ontario-only for now">
          <Input value="ON" disabled className="bg-page text-muted" />
        </Field>
        <Field label="Nearest cross street" error={errors.cross_street?.message}>
          <Input {...register('cross_street')} placeholder="Bathurst & Bloor" />
        </Field>
      </div>
    </div>
  );
}
