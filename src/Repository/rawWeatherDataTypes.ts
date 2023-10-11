// src/Repository/rawWeatherDataTypes.ts

export interface RawHourlyData {
    dt: number;
    wind_speed: number;
    wind_deg: number;
    pop: number;
}

export interface RawDailyData {
    dt: number;
    wind_speed: number;
    wind_deg: number;
    pop: number;
}

export interface RawWeatherData {
    hourly: RawHourlyData[];
    daily: RawDailyData[];
}