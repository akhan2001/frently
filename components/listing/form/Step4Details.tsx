"use client";

// Step 4 — Property Details. Condo block renders when is_condo is true
// (set on Step 1).
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  BALCONY_TYPES,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  CONDO_AMENITIES,
  CONDO_FEE_INCLUDES,
  LOCKER_TYPES,
  PARKING_SPACES_MAX,
  PARKING_SPACES_MIN,
  PARKING_TYPES,
} from '@/constants/listing';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import type { ListingUpdate } from '@/types/listing';

export function Step4Details() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ListingUpdate>();

  const isCondo = useWatch({ control, name: 'is_condo' });
  const parking = useWatch({ control, name: 'parking_spaces' });
  const locker = useWatch({ control, name: 'locker' });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Bedrooms" required error={errors.bedrooms?.message}>
          <Select options={BEDROOM_OPTIONS} {...register('bedrooms')} />
        </Field>
        <Field label="Bathrooms" required error={errors.bathrooms?.message}>
          <Select options={BATHROOM_OPTIONS} {...register('bathrooms')} />
        </Field>
        <Field
          label="Square footage"
          hint="Approximate is fine"
          error={errors.sqft_total?.message}
        >
          <Input
            type="number"
            inputMode="numeric"
            placeholder="740"
            {...register('sqft_total', { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field
          label="Parking spaces"
          required
          hint={`${PARKING_SPACES_MIN}–${PARKING_SPACES_MAX}`}
          error={errors.parking_spaces?.message}
        >
          <Input
            type="number"
            min={PARKING_SPACES_MIN}
            max={PARKING_SPACES_MAX}
            {...register('parking_spaces', { valueAsNumber: true })}
          />
        </Field>
        <Field
          label="Parking type"
          required={typeof parking === 'number' && parking > 0}
          error={errors.parking_type?.message}
        >
          <Select
            options={PARKING_TYPES}
            disabled={!parking || parking === 0}
            {...register('parking_type')}
          />
        </Field>
      </div>

      {isCondo && (
        <div className="rounded-2xl border border-line bg-page p-5 space-y-5">
          <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium">
            Condo details
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              label="Condo / maintenance fee"
              required
              hint="Monthly amount"
              error={errors.condo_fee?.message}
            >
              <Input
                type="number"
                inputMode="numeric"
                placeholder="450"
                {...register('condo_fee', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Balcony" error={errors.balcony?.message}>
              <Select options={BALCONY_TYPES} {...register('balcony')} />
            </Field>
          </div>

          <Field
            label="Condo fee includes"
            required
            error={errors.condo_fee_includes?.message as string | undefined}
          >
            <Controller
              control={control}
              name="condo_fee_includes"
              render={({ field }) => (
                <CheckboxGroup
                  value={field.value as string[] | undefined}
                  onChange={field.onChange}
                  options={CONDO_FEE_INCLUDES}
                />
              )}
            />
          </Field>

          <Field
            label="Condo amenities"
            error={errors.condo_amenities?.message as string | undefined}
          >
            <Controller
              control={control}
              name="condo_amenities"
              render={({ field }) => (
                <CheckboxGroup
                  value={field.value as string[] | undefined}
                  onChange={field.onChange}
                  options={CONDO_AMENITIES}
                />
              )}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Management company" error={errors.management_company?.message}>
              <Input {...register('management_company')} />
            </Field>
            <Field label="Management phone" error={errors.management_phone?.message}>
              <Input type="tel" placeholder="(416) 555 0142" {...register('management_phone')} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <Field label="Locker included" error={errors.locker?.message}>
              <Controller
                control={control}
                name="locker"
                render={({ field }) => (
                  <Toggle value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>
            <Field label="Locker type" error={errors.locker_type?.message}>
              <Select
                options={LOCKER_TYPES}
                disabled={!locker}
                {...register('locker_type')}
              />
            </Field>
            <Field label="Locker number" error={errors.locker_number?.message}>
              <Input disabled={!locker} {...register('locker_number')} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
