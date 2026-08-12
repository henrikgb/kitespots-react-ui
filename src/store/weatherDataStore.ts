import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { WeatherData, WeatherSeriesPoint } from "@/types/model/WeatherData";

interface WeatherDataState {
    weatherData: WeatherData[];
    selectedLocation: string | undefined;
    windSpeed: WeatherSeriesPoint[] | undefined;
    windDirection: WeatherSeriesPoint[] | undefined;
    windGusts: WeatherSeriesPoint[] | undefined;
    precipitation: WeatherSeriesPoint[] | undefined;
    isWeatherDataLoading: boolean;

    setWeatherData: (value: WeatherData[]) => void;
    setSelectedLocation: (locationId: string) => void;
    setIsWeatherDataLoading: (value: boolean) => void;
}

const seriesForLocation = (weatherData: WeatherData[], locationId: string | undefined) => {
  const location = weatherData.find((data) => data.locationId === locationId);
  return {
    windSpeed: location?.points.map((point) => ({ date: point.time, value: point.windSpeedMs })),
    windDirection: location?.points.map((point) => ({ date: point.time, value: point.windDirectionDeg })),
    windGusts: location?.points.map((point) => ({ date: point.time, value: point.windGustMs })),
    precipitation: location?.points.map((point) => ({ date: point.time, value: point.precipitationMm })),
  };
};

export const useWeatherDataStore = create<WeatherDataState>()(
  persist(
    (set) => ({
      weatherData: [],
      // No default location is assumed here - useLocations sets it to the first loaded
      // location once GET /api/locations resolves, so this store never hardcodes an id.
      selectedLocation: undefined,
      windSpeed: undefined,
      windDirection: undefined,
      windGusts: undefined,
      precipitation: undefined,
      isWeatherDataLoading: true,
      setWeatherData: (value: WeatherData[]) => {
        set((state) => ({
          weatherData: value,
          ...seriesForLocation(value, state.selectedLocation),
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
