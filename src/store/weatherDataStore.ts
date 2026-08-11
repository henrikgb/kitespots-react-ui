import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { WeatherData, WeatherSeriesPoint } from "@/types/model/WeatherData";

interface WeatherDataState {
    weatherData: WeatherData[];
    selectedLocation: string;
    windSpeed: WeatherSeriesPoint[] | undefined;
    windDirection: WeatherSeriesPoint[] | undefined;
    windGusts: WeatherSeriesPoint[] | undefined;
    precipitation: WeatherSeriesPoint[] | undefined;
    isWeatherDataLoading: boolean;

    setWeatherData: (value: WeatherData[]) => void;
    setSelectedLocation: (locationId: string) => void;
    setIsWeatherDataLoading: (value: boolean) => void;
}

const seriesForLocation = (weatherData: WeatherData[], locationId: string) => {
  const location = weatherData.find((data) => data.locationId === locationId);
  return {
    windSpeed: location?.points.map((point) => ({ date: point.time, value: point.windSpeedMs })),
    windDirection: location?.points.map((point) => ({ date: point.time, value: point.windDirectionDeg })),
    windGusts: location?.points.map((point) => ({ date: point.time, value: point.windGustMs })),
    precipitation: location?.points.map((point) => ({ date: point.time, value: point.precipitationMm })),
  };
};

// Default location is Sele ("sele"), matching the lowercase locationId used across the
// weather blob contract - kept in sync with beachCoordinates' "SELE" via nameId.toLowerCase().
const DEFAULT_LOCATION_ID = "sele";

export const useWeatherDataStore = create<WeatherDataState>()(
  persist(
    (set) => ({
      weatherData: [],
      selectedLocation: DEFAULT_LOCATION_ID,
      windSpeed: undefined,
      windDirection: undefined,
      windGusts: undefined,
      precipitation: undefined,
      isWeatherDataLoading: true,
      setWeatherData: (value: WeatherData[]) => {
        set(() => ({
          weatherData: value,
          ...seriesForLocation(value, DEFAULT_LOCATION_ID),
        }));
      },
      setSelectedLocation: (locationId: string) => {
        set((state) => ({
          selectedLocation: locationId,
          ...seriesForLocation(state.weatherData, locationId),
        }));
      },
      setIsWeatherDataLoading: (value: boolean) => {
        set(() => ({
          isWeatherDataLoading: value
        }))
      }
    }),
    {
      name: "weather-data",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
