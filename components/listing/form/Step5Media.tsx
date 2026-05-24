"use client";

// Step 5 — Description + Photos.
// Photos upload to the `frently-listing-photos` Supabase bucket at
// path {user_id}/{listing_id}/{filename}. Public URLs are pushed into the
// form's photo_urls array, which the parent persists via updateListing().
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  DESCRIPTION_MAX_CHARS,
  DESCRIPTION_MIN_CHARS,
  PHOTOS_MAX,
  PHOTO_ACCEPTED_TYPES,
  PHOTO_MAX_BYTES,
} from '@/constants/listing';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { IconX } from '@/components/icons';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { ListingUpdate } from '@/types/listing';

const BUCKET = 'frently-listing-photos';

export function Step5Media({ listingId }: { listingId: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ListingUpdate>();
  const remarks = useWatch({ control, name: 'public_remarks' }) ?? '';

  return (
    <div className="space-y-5">
      <Field
        label="Property description"
        required
        hint={
          <>
            Include key features, recent upgrades, proximity to transit/schools/amenities, and
            anything that makes this property stand out. ({DESCRIPTION_MIN_CHARS}+ characters,
            shown on MLS and Frently.)
          </>
        }
        error={errors.public_remarks?.message}
      >
        <Textarea
          {...register('public_remarks')}
          maxLength={DESCRIPTION_MAX_CHARS}
          placeholder="Bright south-facing 2BR with floor-to-ceiling windows, hardwood throughout…"
        />
        <div className="mt-1 text-right text-[11px] text-muted">
          {remarks.length}/{DESCRIPTION_MAX_CHARS}
        </div>
      </Field>

      <Field
        label="Photos"
        required
        hint={`JPG or PNG, up to 10MB each. Max ${PHOTOS_MAX}.`}
        error={errors.photo_urls?.message as string | undefined}
      >
        <Controller
          control={control}
          name="photo_urls"
          defaultValue={[]}
          render={({ field }) => (
            <PhotoUploader
              listingId={listingId}
              value={(field.value as string[] | undefined) ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </Field>
    </div>
  );
}

function PhotoUploader({
  listingId,
  value,
  onChange,
}: {
  listingId: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploadError('You must be logged in to upload.');
      return;
    }

    setUploading(true);
    const accepted: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (value.length + accepted.length >= PHOTOS_MAX) {
          setUploadError(`Max ${PHOTOS_MAX} photos.`);
          break;
        }
        if (!(PHOTO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
          setUploadError(`${file.name}: only JPG or PNG.`);
          continue;
        }
        if (file.size > PHOTO_MAX_BYTES) {
          setUploadError(`${file.name}: over 10MB.`);
          continue;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${user.id}/${listingId}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (upErr) {
          setUploadError(upErr.message);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        accepted.push(data.publicUrl);
      }
      if (accepted.length > 0) onChange([...value, ...accepted]);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  const atLimit = value.length >= PHOTOS_MAX;

  return (
    <div className="space-y-3">
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed cursor-pointer transition px-6 py-8 text-center',
          atLimit
            ? 'border-line bg-page cursor-not-allowed'
            : 'border-line bg-white hover:border-forest',
        )}
      >
        <input
          type="file"
          accept={PHOTO_ACCEPTED_TYPES.join(',')}
          multiple
          disabled={atLimit || uploading}
          onChange={(e) => onPick(e.target.files)}
          className="sr-only"
        />
        <span className="text-[14px] font-medium text-ink">
          {atLimit
            ? `Photo limit reached (${PHOTOS_MAX})`
            : uploading
              ? 'Uploading…'
              : 'Click to add photos'}
        </span>
        <span className="text-[12px] text-muted mt-1">
          {value.length}/{PHOTOS_MAX} added
        </span>
      </label>

      {uploadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
        >
          {uploadError}
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-line bg-page"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 border border-line flex items-center justify-center text-ink hover:bg-white"
              >
                <IconX size={12} color="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
