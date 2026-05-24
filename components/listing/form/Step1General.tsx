"use client";

// Step 1 — General. Property type/style/storeys/ownership/garage + is_condo
// toggle. If is_condo, expose building_name and condo_corp_number here so
// the landlord can attach them at the same time.
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  OWNERSHIP_TYPES,
  PROPERTY_TYPES,
  STOREYS_MAX,
  STOREYS_MIN,
  STYLES,
} from '@/constants/listing';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import type { ListingUpdate } from '@/types/listing';

export function Step1General() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ListingUpdate>();
  const isCondo = useWatch({ control, name: 'is_condo' });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Property type" required error={errors.property_type?.message}>
          <Select options={PROPERTY_TYPES} {...register('property_type')} />
        </Field>
        <Field label="Style" required error={errors.style?.message}>
          <Select options={STYLES} {...register('style')} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field
          label="Storeys"
          required
          hint={`${STOREYS_MIN}–${STOREYS_MAX}`}
          error={errors.storeys?.message}
        >
          <Input
            type="number"
            min={STOREYS_MIN}
            max={STOREYS_MAX}
            {...register('storeys', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Ownership type" required error={errors.ownership_type?.message}>
          <Select options={OWNERSHIP_TYPES} {...register('ownership_type')} />
        </Field>
        <Field label="Garage" required error={errors.garage?.message}>
          <Controller
            control={control}
            name="garage"
            render={({ field }) => (
              <RadioGroup
                value={field.value as 'Yes' | 'No' | undefined}
                onChange={field.onChange}
                options={['Yes', 'No'] as const}
              />
            )}
          />
        </Field>
      </div>

      <Field
        label="Is this a condo?"
        hint="Enables condo-specific fields in Step 4 (locker, condo fees, management contact)."
        error={errors.is_condo?.message}
      >
        <Controller
          control={control}
          name="is_condo"
          render={({ field }) => <Toggle value={field.value} onChange={field.onChange} />}
        />
      </Field>

      {isCondo && (
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Building name" error={errors.building_name?.message}>
            <Input {...register('building_name')} placeholder="The Hudson" />
          </Field>
          <Field label="Condo corp number" error={errors.condo_corp_number?.message}>
            <Input {...register('condo_corp_number')} placeholder="TSCC 1234" />
          </Field>
        </div>
      )}
    </div>
  );
}
