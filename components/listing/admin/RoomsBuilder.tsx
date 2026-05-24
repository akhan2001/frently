"use client";

// Dynamic rooms builder. Stored as a jsonb array of RoomEntry on the
// listings row. Each row has level, type, length (ft/in), width (ft/in),
// and an optional features list.
import { ROOM_LEVELS, ROOM_TYPES } from '@/constants/listing';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IconX } from '@/components/icons';
import type { RoomEntry } from '@/types/listing';

export function RoomsBuilder({
  value,
  onChange,
}: {
  value: RoomEntry[];
  onChange: (next: RoomEntry[]) => void;
}) {
  function update(i: number, patch: Partial<RoomEntry>) {
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function add() {
    onChange([...value, { level: 'Main', type: 'Living Room' }]);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-[12.5px] text-muted">
          No rooms yet. Add one for every bedroom and bathroom, plus key living spaces.
        </p>
      )}

      {value.map((room, i) => (
        <div
          key={i}
          className="rounded-xl border border-line bg-white p-4 relative space-y-3"
        >
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove room ${i + 1}`}
            className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-page text-muted hover:text-ink inline-flex items-center justify-center"
          >
            <IconX size={13} color="currentColor" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <Select
                options={ROOM_LEVELS}
                value={room.level}
                onChange={(e) => update(i, { level: e.target.value })}
              />
            </Field>
            <Field label="Type">
              <Select
                options={ROOM_TYPES}
                value={room.type}
                onChange={(e) => update(i, { type: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Length ft">
              <Input
                type="number"
                min={0}
                value={room.length_ft ?? ''}
                onChange={(e) =>
                  update(i, {
                    length_ft: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="in">
              <Input
                type="number"
                min={0}
                max={11}
                value={room.length_in ?? ''}
                onChange={(e) =>
                  update(i, {
                    length_in: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Width ft">
              <Input
                type="number"
                min={0}
                value={room.width_ft ?? ''}
                onChange={(e) =>
                  update(i, {
                    width_ft: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="in">
              <Input
                type="number"
                min={0}
                max={11}
                value={room.width_in ?? ''}
                onChange={(e) =>
                  update(i, {
                    width_in: e.target.value === '' ? undefined : Number(e.target.value),
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
        + Add room
      </button>
    </div>
  );
}
