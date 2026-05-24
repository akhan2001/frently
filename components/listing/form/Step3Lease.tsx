"use client";

// Step 3 — Lease. Deposit shown as read-only live preview from rent_amount.
// The DB column is set server-side on submit.
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  INCLUSIONS,
  LEASE_REQUIREMENTS,
  LEASE_TERMS,
  PAYMENT_METHODS,
  PORTION_OF_PROPERTY,
  RENT_MAX,
  RENT_MIN,
  UTILITIES,
} from '@/constants/listing';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Toggle } from '@/components/ui/Toggle';
import type { ListingUpdate } from '@/types/listing';

export function Step3Lease() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ListingUpdate>();
  const rent = useWatch({ control, name: 'rent_amount' });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field
          label="Monthly rent"
          required
          hint={`$${RENT_MIN}–$${RENT_MAX.toLocaleString()}`}
          error={errors.rent_amount?.message}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={RENT_MIN}
            max={RENT_MAX}
            placeholder="2,500"
            {...register('rent_amount', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Deposit" hint="Equal to one month's rent — last month's rent (set automatically)">
          <Input
            disabled
            value={
              typeof rent === 'number' && rent > 0
                ? `$${rent.toLocaleString()}`
                : 'Enter rent to calculate'
            }
            className="bg-page text-muted"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Available date" required error={errors.available_date?.message}>
          <Input type="date" {...register('available_date')} />
        </Field>
        <Field label="Lease term" required error={errors.lease_term?.message}>
          <Select options={LEASE_TERMS} {...register('lease_term')} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Furnished" required error={errors.is_furnished?.message}>
          <Controller
            control={control}
            name="is_furnished"
            render={({ field }) => <Toggle value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Pets allowed" required error={errors.pets_allowed?.message}>
          <Controller
            control={control}
            name="pets_allowed"
            render={({ field }) => <Toggle value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Smoking allowed" required error={errors.smoking_allowed?.message}>
          <Controller
            control={control}
            name="smoking_allowed"
            render={({ field }) => <Toggle value={field.value} onChange={field.onChange} />}
          />
        </Field>
      </div>

      <Field
        label="Utilities included"
        required
        hint="Pick at least one — or pick 'None' if the tenant pays everything."
        error={errors.utilities_included?.message as string | undefined}
      >
        <Controller
          control={control}
          name="utilities_included"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value as string[] | undefined}
              onChange={field.onChange}
              options={UTILITIES}
            />
          )}
        />
      </Field>

      <Field
        label="Lease requirements"
        error={errors.lease_requirements?.message as string | undefined}
      >
        <Controller
          control={control}
          name="lease_requirements"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value as string[] | undefined}
              onChange={field.onChange}
              options={LEASE_REQUIREMENTS}
            />
          )}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Payment method" error={errors.payment_method?.message}>
          <Select options={PAYMENT_METHODS} {...register('payment_method')} />
        </Field>
        <Field label="Portion of property" error={errors.portion_of_property?.message}>
          <Select options={PORTION_OF_PROPERTY} {...register('portion_of_property')} />
        </Field>
      </div>

      <Field
        label="Inclusions"
        hint="Appliances and items that come with the unit"
        error={errors.inclusions?.message as string | undefined}
      >
        <Controller
          control={control}
          name="inclusions"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value as string[] | undefined}
              onChange={field.onChange}
              options={INCLUSIONS}
            />
          )}
        />
      </Field>

      <Field
        label="Exclusions"
        hint="Anything explicitly NOT included"
        error={errors.exclusions?.message}
      >
        <Textarea {...register('exclusions')} rows={3} />
      </Field>
    </div>
  );
}
