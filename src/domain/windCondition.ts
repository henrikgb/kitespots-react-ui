import { WindDirectionDescription } from "@/types/model/Location";

/**
 * The 5 stable wind-condition categories, as stored in locations.json / the Function
 * App's WindDirectionDescription contract (see function-app/Weather/WindDirectionDescription.cs).
 */
export type WindConditionCategory =
  | "sideOnshore"
  | "onshore"
  | "overLand"
  | "sideOffshore"
  | "offshore";

export type WindConditionId =
  | "side-onshore-ideal"
  | "onshore-hard-for-beginners"
  | "over-land-gusty"
  | "side-offshore-dangerous"
  | "offshore-very-dangerous";

export interface WindConditionDefinition {
  category: WindConditionCategory;
  id: WindConditionId;
  label: string;
  /** Canonical legend color for this category - identical across every location in locations.json. */
  colorCode: string;
}

/**
 * Single canonical source for wind-condition ids/labels/colors - components must look
 * categories up here rather than re-declaring the label strings or colors themselves.
 */
export const WIND_CONDITIONS: Record<WindConditionCategory, WindConditionDefinition> = {
  sideOnshore: { category: "sideOnshore", id: "side-onshore-ideal", label: "Side onshore - ideal", colorCode: "#00bb00" },
  onshore: { category: "onshore", id: "onshore-hard-for-beginners", label: "Onshore - hard for beginners", colorCode: "#008000" },
  overLand: { category: "overLand", id: "over-land-gusty", label: "Over land - gusty", colorCode: "#45a3ff" },
  sideOffshore: { category: "sideOffshore", id: "side-offshore-dangerous", label: "Side offshore - dangerous", colorCode: "#ffa500" },
  offshore: { category: "offshore", id: "offshore-very-dangerous", label: "Offshore - very dangerous", colorCode: "#FD0100" },
};

export const WIND_CONDITION_LIST: WindConditionDefinition[] = Object.values(WIND_CONDITIONS);

const isKnownCategory = (category: string): category is WindConditionCategory =>
  Object.prototype.hasOwnProperty.call(WIND_CONDITIONS, category);

/** Canonical kebab-case id for a category, e.g. "sideOnshore" -> "side-onshore-ideal". */
export const getWindConditionId = (category: string): WindConditionId | undefined =>
  isKnownCategory(category) ? WIND_CONDITIONS[category].id : undefined;

/** Canonical English label for a category. Falls back to the raw category for unknown values. */
export const getWindConditionLabel = (category: string): string =>
  isKnownCategory(category) ? WIND_CONDITIONS[category].label : category;

/**
 * Finds which wind-direction interval a direction (in degrees) falls into, and returns the
 * canonical wind-condition info for it plus the location-specific colorCode for that interval.
 */
export const findWindConditionForDirection = (
  directionDeg: number,
  descriptions: WindDirectionDescription[]
): (WindConditionDefinition & { colorCode: string }) | undefined => {
  const match = descriptions.find(
    (d) => directionDeg >= d.intervalStart && directionDeg <= d.intervalStop
  );
  if (!match) {
    return undefined;
  }
  const category = String(match.category);
  if (!isKnownCategory(category)) {
    return undefined;
  }
  return { ...WIND_CONDITIONS[category], colorCode: match.colorCode };
};
