/**
 * Provider-independent weather contract. This is the exact shape stored at
 * weather/{locationId}.json in Blob Storage by the Function App - no provider-specific
 * (Yr/Meteomatics) field ever appears here.
 */
export interface WeatherData {
  locationId: string;
  generatedAt: string;
  points: WeatherPoint[];
}

export interface WeatherPoint {
  time: string;
  windSpeedMs: number;
  windDirectionDeg: number;
  /** Null once the forecast horizon moves past the short-range window (~2.3 days). */
  windGustMs: number | null;
  /** Null only for the trailing boundary timestamp of the forecast horizon. */
  precipitationMm: number | null;
}

/** A single {date, value} series point, as consumed by the ECharts-based charts. */
export interface WeatherSeriesPoint {
  date: string;
  value: number | null;
}
