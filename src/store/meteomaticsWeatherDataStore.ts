import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  MeteomaticsWeatherData,
  Precipitation,
  WindDirection10ms,
  WindGusts10ms,
  WindSpeed10ms
} from "@/model/MeteomaticsWeatherData";

interface MeteomaticsWeatherDataState {
    meteomaticsData: MeteomaticsWeatherData[];
    selectedLocation: string;
    windSpeed10ms: WindSpeed10ms[] | undefined;
    windDirection10ms: WindDirection10ms[] | undefined;
    windGusts10ms: WindGusts10ms[] | undefined;
    precipitation: Precipitation[] | undefined;

    setMeteomaticsData: (value: MeteomaticsWeatherData[]) => void;
    setSelectedLocation: (locationName: string) => void;
    setWindSpeed10ms: (value: WindSpeed10ms[] | undefined) => void;
    setWindDirection10ms: (value: WindDirection10ms[] | undefined) => void;
    setWindGusts10ms: (value: WindGusts10ms[] | undefined) => void;
    setPrecipitation: (value: Precipitation[] | undefined) => void;
}

export const useMeteomaticsWeatherDataStore = create<MeteomaticsWeatherDataState>()(
  persist(
    (set) => ({
      meteomaticsData: [],
      selectedLocation: "Sele", // set default location
      windSpeed10ms: undefined,
      windDirection10ms: undefined,
      windGusts10ms: undefined,
      precipitation: undefined,
      setMeteomaticsData: (value: MeteomaticsWeatherData[]) => {
        set(() => ({
          meteomaticsData: value,
          // set default values based on "Sele" location
          windSpeed10ms: value.find((data) => data.locationName === "Sele")?.windSpeed10ms,
          windDirection10ms: value.find((data) => data.locationName === "Sele")?.windDirection10ms,
          windGusts10ms: value.find((data) => data.locationName === "Sele")?.windGusts10ms,
          precipitation: value.find((data) => data.locationName === "Sele")?.precipitation,
        }));
      },
      setSelectedLocation: (locationName: string) => {
        set((state) => ({
          selectedLocation: locationName,
          // update values based on selected location
          windSpeed10ms: state.meteomaticsData.find((data) => data.locationName === locationName)?.windSpeed10ms,
          windDirection10ms: state.meteomaticsData.find((data) => data.locationName === locationName)?.windDirection10ms,
          windGusts10ms: state.meteomaticsData.find((data) => data.locationName === locationName)?.windGusts10ms,
          precipitation: state.meteomaticsData.find((data) => data.locationName === locationName)?.precipitation,
        }));
      },
      setWindSpeed10ms: (value: WindSpeed10ms[] | undefined) => {
        set(() => ({
          windSpeed10ms: value,
        }));
      },
      setWindDirection10ms: (value: WindDirection10ms[] | undefined) => {
        set(() => ({
          windDirection10ms: value,
        }));
      },
      setWindGusts10ms: (value: WindGusts10ms[] | undefined) => {
        set(() => ({
          windGusts10ms: value,
        }));
      },
      setPrecipitation: (value: Precipitation[] | undefined) => {
        set(() => ({
          precipitation: value,
        }));
      },
    }),
    {
      name: "meteomatics-weather",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
