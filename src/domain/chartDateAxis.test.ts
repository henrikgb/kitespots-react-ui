import { describe, expect, it } from "vitest";
import { formatAxisDateLabel, formatTooltipDateTime, getDayBoundaryTimestamps } from "@/domain/chartDateAxis";

// Expected strings are derived the same way the code under test derives them, rather than
// hardcoded, so these tests pass regardless of the machine's local timezone.
const timeOf = (value: string | number) =>
  new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
const fullDateOf = (value: string | number) => {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}.${d.getFullYear()}`;
};
const isLocalMidnight = (value: string | number) => {
  const d = new Date(value);
  return d.getHours() === 0 && d.getMinutes() === 0;
};

describe("formatAxisDateLabel", () => {
  it("shows the bold MM.DD.YYYY date line for a point that lands on local midnight", () => {
    // Constructed from local midnight directly (rather than a UTC literal) so the
    // assertion holds regardless of the machine's timezone offset.
    const midnight = new Date(2026, 7, 13, 0, 0, 0).getTime();
    expect(formatAxisDateLabel(midnight, "en")).toBe(`{day|${fullDateOf(midnight)}}\n{time|${timeOf(midnight)}}`);
  });

  it("accepts a raw ISO string too, not just a numeric timestamp", () => {
    const midnight = new Date(2026, 7, 13, 0, 0, 0).toISOString();
    expect(formatAxisDateLabel(midnight, "en")).toBe(`{day|${fullDateOf(midnight)}}\n{time|${timeOf(midnight)}}`);
  });

  it("shows only the time for a point that is not exactly midnight", () => {
    const value = "2026-08-11T11:00:00Z";
    // Guard: this fixture must actually not land on local midnight for the assertion below
    // to mean anything - if it ever does on some exotic timezone, the test would be vacuous.
    expect(isLocalMidnight(value)).toBe(false);
    expect(formatAxisDateLabel(value, "en")).toBe(`{time|${timeOf(value)}}`);
  });

  it("falls back to the raw value for an unparsable date", () => {
    expect(formatAxisDateLabel("not-a-date", "en")).toBe("not-a-date");
  });
});

describe("getDayBoundaryTimestamps", () => {
  it("returns one local-midnight timestamp per day change, not the points themselves", () => {
    const values = [
      "2026-08-11T11:00:00Z",
      "2026-08-11T18:00:00Z",
      "2026-08-12T06:00:00Z",
      "2026-08-12T12:00:00Z",
      "2026-08-13T06:00:00Z",
    ];
    const boundaries = getDayBoundaryTimestamps(values);

    expect(boundaries).toHaveLength(2);
    // Every returned timestamp must itself be exactly local midnight.
    for (const boundary of boundaries) {
      expect(isLocalMidnight(boundary)).toBe(true);
    }
    // None of them can equal any of the original (non-midnight) point timestamps -
    // the whole point is that these are computed, not looked up.
    for (const value of values) {
      expect(boundaries).not.toContain(new Date(value).getTime());
    }
  });

  it("places the boundary at the day's actual midnight, not at whichever point crosses into it", () => {
    const values = ["2026-08-15T10:00:00Z", "2026-08-15T18:00:00Z", "2026-08-16T02:00:00Z"];
    const boundaries = getDayBoundaryTimestamps(values);
    expect(boundaries).toHaveLength(1);
    expect(isLocalMidnight(boundaries[0])).toBe(true);
    // Guard: this fixture is only a meaningful check if the day-crossing point itself
    // isn't already local midnight - true for all but one exotic UTC+6 offset.
    if (!isLocalMidnight(values[2])) {
      expect(boundaries[0]).not.toBe(new Date(values[2]).getTime());
    }
  });

  it("returns nothing for a series that never crosses a local day boundary", () => {
    const values = ["2026-08-11T10:00:00Z", "2026-08-11T11:00:00Z", "2026-08-11T12:00:00Z"];
    expect(getDayBoundaryTimestamps(values)).toEqual([]);
  });

  it("ignores unparsable entries instead of throwing", () => {
    expect(getDayBoundaryTimestamps(["not-a-date", "2026-08-11T10:00:00Z"])).toEqual([]);
  });
});

describe("formatTooltipDateTime", () => {
  it("includes the formatted time", () => {
    expect(formatTooltipDateTime("2026-08-11T11:00:00Z", "en")).toContain(timeOf("2026-08-11T11:00:00Z"));
  });

  it("accepts a numeric timestamp too", () => {
    const ts = new Date("2026-08-11T11:00:00Z").getTime();
    expect(formatTooltipDateTime(ts, "en")).toContain(timeOf(ts));
  });

  it("falls back to the raw value for an unparsable date", () => {
    expect(formatTooltipDateTime("not-a-date", "en")).toBe("not-a-date");
  });
});
