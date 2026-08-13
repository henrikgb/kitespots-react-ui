/**
 * Weather charts use an ECharts `time` x-axis (not `category`), so hourly near-term data
 * and the sparser 6-hourly tail of the forecast are spaced by actual elapsed time rather
 * than by data-point count - otherwise a 6-hour gap would take up the same width as one
 * hour would, and later days would look squeezed relative to earlier, denser ones. These
 * helpers format the ticks ECharts computes for that axis, and locate real day-boundary
 * timestamps (local midnight) so the chart can draw a separator line exactly there even
 * where no data point exists.
 */

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

/**
 * Formats one x-axis tick. `value` is whatever ECharts hands the axisLabel formatter for a
 * time axis - a timestamp in milliseconds - though a raw ISO string works too since `Date`
 * parses both. Ticks that land exactly on local midnight render as a bold MM.DD.YYYY date
 * line above the time; every other tick renders the time only. Rich-text tags
 * ("{day|...}"/"{time|...}") are expected to be styled via the axisLabel.rich option.
 */
export function formatAxisDateLabel(value: string | number, locale: string): string {
  const date = new Date(value);
  if (!isValidDate(date)) {
    return String(value);
  }

  const time = formatTime(date, locale);
  const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;

  if (!isMidnight) {
    return `{time|${time}}`;
  }

  return `{day|${formatFullDate(date)}}\n{time|${time}}`;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

// Fixed MM.DD.YYYY regardless of locale, per explicit request - not the locale-driven
// month/day order Intl.DateTimeFormat would otherwise produce.
const formatFullDate = (date: Date): string =>
  `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}.${date.getFullYear()}`;

// Always 24-hour, regardless of locale - matches the forecast-app convention (Yr, Windy)
// this audience expects, and keeps axis ticks narrow enough to fit next to each other.
const formatTime = (date: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

/**
 * Local-midnight timestamps (ms) for every day after the first one spanned by `values`,
 * for drawing a day-separator line on the chart. Computed from the calendar date each point
 * falls on, not from the points' own timestamps, so a boundary always lands exactly at
 * midnight - unlike the points themselves, which on the forecast horizon's sparser tail
 * rarely fall exactly at midnight.
 */
export function getDayBoundaryTimestamps(values: string[]): number[] {
  const boundaries: number[] = [];
  let previousDayString: string | undefined;

  for (const value of values) {
    const date = new Date(value);
    if (!isValidDate(date)) {
      continue;
    }
    const dayString = date.toDateString();
    if (previousDayString !== undefined && dayString !== previousDayString) {
      boundaries.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
    }
    previousDayString = dayString;
  }

  return boundaries;
}

/** Full readable date/time for tooltip headers, e.g. "Tue, 11 Aug, 11:00". */
export function formatTooltipDateTime(value: string | number, locale: string): string {
  const date = new Date(value);
  if (!isValidDate(date)) {
    return String(value);
  }
  const weekdayAndDate = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  return `${weekdayAndDate}, ${formatTime(date, locale)}`;
}
