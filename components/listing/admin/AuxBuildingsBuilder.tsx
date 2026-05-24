"use client";

// Dynamic auxiliary buildings list. Stored as jsonb on the listing.
import { AUX_BUILDING_TYPES, WINTERIZED_OPTIONS } from '@/constants/listing';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IconX } from '@/components/icons';
import type { AuxiliaryBuilding } from '@/types/listing';

export function AuxBuildingsBuilder({
  value,
  onChange,
}: {
  value: AuxiliaryBuilding[];
  onChange: (next: AuxiliaryBuilding[]) => void;
}) {
  function update(i: number, patch: Partial<AuxiliaryBuilding>) {
    onChange(value.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }
  function add() {
    onChange([...value, { type: 'Shed' }]);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-[12.5px] text-muted">No auxiliary buildings on this property.</p>
      )}

      {value.map((b, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-4 relative space-y-3">
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove building ${i + 1}`}
            className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-page text-muted hover:text-ink inline-flex items-center justify-center"
          >
            <IconX size={13} color="currentColor" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                options={AUX_BUILDING_TYPES}
                value={b.type}
                onChange={(e) => update(i, { type: e.target.value })}
              />
            </Field>
            <Field label="Winterized">
              <Select
                options={WINTERIZED_OPTIONS}
                value={b.winterized ?? ''}
                onChange={(e) =>
                  update(i, { winterized: e.target.value as AuxiliaryBuilding['winterized'] })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Beds">
              <Input
                type="number"
                min={0}
                value={b.beds ?? ''}
                onChange={(e) =>
                  update(i, { beds: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Baths">
              <Input
                type="number"
                min={0}
                value={b.baths ?? ''}
                onChange={(e) =>
                  update(i, { baths: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Kitchens">
              <Input
                type="number"
                min={0}
                value={b.kitchens ?? ''}
                onChange={(e) =>
                  update(i, {
                    kitchens: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition"
      >
        + Add building
      </button>
    </div>
  );
}
