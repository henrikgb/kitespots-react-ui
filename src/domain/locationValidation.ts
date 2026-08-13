import { WindDirectionDescription } from "@/types/model/Location";
import { WIND_CONDITIONS, WindConditionCategory } from "@/domain/windCondition";

export const MAX_LOCATION_NAME_LENGTH = 100;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Allowed upload MIME types, mapped to the file extension used for the stored blob. */
export const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export interface NewLocationInput {
  name: unknown;
  latitude: unknown;
  longitude: unknown;
  beginnerScore?: unknown;
  freestyleScore?: unknown;
  waveScore?: unknown;
  windDirectionDescriptions: unknown;
}

export interface ValidatedNewLocation {
  name: string;
  latitude: number;
  longitude: number;
  beginnerScore: number;
  freestyleScore: number;
  waveScore: number;
  windDirectionDescriptions: WindDirectionDescription[];
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  data?: T;
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const isKnownWindConditionCategory = (category: unknown): category is WindConditionCategory =>
  typeof category === "string" && Object.prototype.hasOwnProperty.call(WIND_CONDITIONS, category);

const validateScore = (value: unknown, fieldLabel: string, errors: string[]): number => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }
  if (!isFiniteNumber(value) || value < 0 || value > 5) {
    errors.push(`${fieldLabel} must be a number between 0 and 5.`);
    return 0;
  }
  return value;
};

/**
 * Validates a list of wind-direction interval/category rows. colorCode is never trusted from
 * the caller - it's always re-derived from the canonical WIND_CONDITIONS mapping for the
 * validated category, so the persisted colorCode can never drift from the single source of
 * truth established in Phase 5.
 */
export const validateWindDirectionDescriptions = (
  value: unknown
): { errors: string[]; data: WindDirectionDescription[] } => {
  const errors: string[] = [];

  if (!Array.isArray(value) || value.length === 0) {
    errors.push("At least one wind direction classification is required.");
    return { errors, data: [] };
  }

  const data: WindDirectionDescription[] = [];

  value.forEach((entry, index) => {
    const d = (entry ?? {}) as Partial<WindDirectionDescription>;
    const prefix = `Wind direction entry ${index + 1}`;

    if (!isFiniteNumber(d.intervalStart) || d.intervalStart < 0 || d.intervalStart > 360) {
      errors.push(`${prefix}: start degree must be a number between 0 and 360.`);
      return;
    }
    if (!isFiniteNumber(d.intervalStop) || d.intervalStop < 0 || d.intervalStop > 360) {
      errors.push(`${prefix}: end degree must be a number between 0 and 360.`);
      return;
    }
    if (d.intervalStart >= d.intervalStop) {
      errors.push(`${prefix}: start degree must be less than end degree.`);
      return;
    }
    if (!isKnownWindConditionCategory(d.category)) {
      errors.push(`${prefix}: "${String(d.category)}" is not a valid wind direction classification.`);
      return;
    }

    data.push({
      intervalStart: d.intervalStart,
      intervalStop: d.intervalStop,
      category: d.category,
      colorCode: WIND_CONDITIONS[d.category].colorCode,
    });
  });

  return { errors, data };
};

/**
 * Validates a new-location submission. Authoritative - must be called server-side even though
 * the same checks may also run client-side for immediate form feedback; never trust the client.
 */
export const validateNewLocationInput = (input: NewLocationInput): ValidationResult<ValidatedNewLocation> => {
  const errors: string[] = [];

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) {
    errors.push("Name is required.");
  } else if (name.length > MAX_LOCATION_NAME_LENGTH) {
    errors.push(`Name must be ${MAX_LOCATION_NAME_LENGTH} characters or fewer.`);
  }

  if (!isFiniteNumber(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    errors.push("Latitude must be a number between -90 and 90.");
  }

  if (!isFiniteNumber(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    errors.push("Longitude must be a number between -180 and 180.");
  }

  const { errors: windErrors, data: windDirectionDescriptions } = validateWindDirectionDescriptions(
    input.windDirectionDescriptions
  );
  errors.push(...windErrors);

  const beginnerScore = validateScore(input.beginnerScore, "Beginner score", errors);
  const freestyleScore = validateScore(input.freestyleScore, "Freestyle score", errors);
  const waveScore = validateScore(input.waveScore, "Wave score", errors);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name,
      latitude: input.latitude as number,
      longitude: input.longitude as number,
      beginnerScore,
      freestyleScore,
      waveScore,
      windDirectionDescriptions,
    },
  };
};

/** Validates an uploaded image's declared content type and size. Never trusts a client filename. */
export const validateImageUpload = (contentType: string | undefined, sizeBytes: number | undefined): string[] => {
  const errors: string[] = [];

  if (!contentType || !Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_MIME_TYPES, contentType)) {
    errors.push(
      `Image type "${contentType ?? "unknown"}" is not supported. Allowed types: ${Object.keys(ALLOWED_IMAGE_MIME_TYPES).join(", ")}.`
    );
  }

  if (sizeBytes === undefined || sizeBytes <= 0) {
    errors.push("Image file is empty.");
  } else if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    errors.push(`Image must be ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`);
  }

  return errors;
};

export const getImageExtensionForMimeType = (contentType: string): string | undefined =>
  ALLOWED_IMAGE_MIME_TYPES[contentType];

// Unicode combining diacritical marks block (U+0300-U+036F), written via RegExp(string) with
// \u escapes rather than a literal character-class range, to avoid embedding literal combining
// characters directly in this source file.
const DIACRITICAL_MARKS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

const slugify = (name: string): string => {
  const withoutDiacritics = name.normalize("NFD").replace(DIACRITICAL_MARKS_PATTERN, "");
  return withoutDiacritics.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Generates a stable, blob/URL-safe location id from a name, matching the existing
 * lowercase-no-separator convention already used throughout locations.json (e.g. "Sande" ->
 * "sande", "San Juan Playa" -> "sanjuanplaya"). Always derived server-side - a client-supplied
 * id is never trusted as authoritative. Case-insensitive collisions get a numeric suffix.
 */
export const generateLocationId = (name: string, existingIds: string[]): string => {
  const base = slugify(name) || "location";
  const existing = new Set(existingIds.map((id) => id.toLowerCase()));

  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
};

export const isDuplicateLocationName = (name: string, existingNames: string[]): boolean => {
  const normalized = name.trim().toLowerCase();
  return existingNames.some((existingName) => existingName.trim().toLowerCase() === normalized);
};

// Matches exactly what generateLocationId can produce: lowercase alphanumeric segments joined
// by single hyphens (e.g. "sande", "newspot-2"). Client-supplied location ids (URL path params
// on the delete/attach-image routes) are re-validated against this before being used to build a
// Blob Storage blob name (see LocationsService.deleteLocation / attachLocationImage) - defense
// in depth so a "/", "..", or other unexpected character in an id can never end up inside a blob
// path, even if it somehow existed in locations.json (e.g. a hand-edited/corrupted document).
const LOCATION_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isValidLocationId = (id: string): boolean => LOCATION_ID_PATTERN.test(id);
