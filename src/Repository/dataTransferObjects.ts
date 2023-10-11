// src/Repository/dataTransferObjects.ts

export interface HourlyForecastDTO {
    time: string;
    windSpeed: number;
    windDirection: number;
    rainProbability: number;
}

export interface DailyForecastDTO {
    time: string;
    windSpeed: number;
    windDirection: number;
    rainProbability: number;
}

export interface WeatherDataDTO {
    hourly: HourlyForecastDTO[];
    daily: DailyForecastDTO[];
}