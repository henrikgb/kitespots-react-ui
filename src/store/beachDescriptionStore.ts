// store.ts
import { create } from 'zustand';
import {StaticImageData} from "next/image";
import {beachCoordinates, WindDirectionDescriptions} from "@/assets/beachCoordinates";

// Define the state's shape
interface beachDescriptionState {
    id: number | undefined,
    latitude: number | undefined,
    longitude: number | undefined,
    info: string | undefined,
    nameId: string | undefined,
    image: StaticImageData | undefined,
    beginnerScore: number | undefined,
    freestyleScore: number | undefined,
    waveScore: number | undefined,
    windDirectionDescriptions: WindDirectionDescriptions[] | undefined,

    setId: (value: number) => void;
    setLatitude: (value: number) => void;
    setLongitude: (value: number) => void;
    setInfo: (value: string) => void;
    setNameId: (value: string) => void;
    setImage: (value: StaticImageData) => void;
    setBeginnerScore: (value: number) => void;
    setFreestyleScore: (value: number) => void;
    setWaveScore: (value: number) => void;
    setWindDirectionDescriptions: (value: WindDirectionDescriptions[]) => void;
}

const defaultBeachCoordinate = beachCoordinates.find((coordinate) => coordinate.nameId === "SELE"); // Choose the default coordinate

const useBeachDescriptionStore = create<beachDescriptionState>((set) => ({
  id: defaultBeachCoordinate?.id || undefined,
  latitude: defaultBeachCoordinate?.latitude || undefined,
  longitude: defaultBeachCoordinate?.longitude || undefined,
  info: defaultBeachCoordinate?.info || undefined,
  nameId: defaultBeachCoordinate?.nameId || undefined,
  image: defaultBeachCoordinate?.image || undefined,
  beginnerScore: defaultBeachCoordinate?.beginnerScore || undefined,
  freestyleScore: defaultBeachCoordinate?.freestyleScore || undefined,
  waveScore: defaultBeachCoordinate?.waveScore || undefined,
  windDirectionDescriptions: defaultBeachCoordinate?.windDirectionDescriptions || undefined,
  setId: (updateId?: number) => {
    set(()=> ({
      id: updateId
    }))
  },
  setLatitude: (updateLatitude?: number) => {
    set(()=> ({
      latitude: updateLatitude
    }))
  },
  setLongitude: (updateLongitude?: number) => {
    set(()=> ({
      longitude: updateLongitude
    }))
  },
  setInfo: (updateInfo?: string) => {
    set(()=> ({
      info: updateInfo
    }))
  },
  setNameId: (updateNameId?: string) => {
    set(()=> ({
      nameId: updateNameId
    }))
  },
  setImage: (updateImage?: StaticImageData) => {
    set(()=> ({
      image: updateImage
    }))
  },
  setBeginnerScore: (updateBeginnerScore?: number) => {
    set(()=> ({
      beginnerScore: updateBeginnerScore
    }))
  },
  setFreestyleScore: (updateFreestyleScore?: number) => {
    set(()=> ({
      freestyleScore: updateFreestyleScore
    }))
  },
  setWaveScore: (updateWaveScore?: number) => {
    set(()=> ({
      waveScore: updateWaveScore
    }))
  },
  setWindDirectionDescriptions: (updateWindDirectionDescriptions?: WindDirectionDescriptions[]) => {
    set(()=> ({
      windDirectionDescriptions: updateWindDirectionDescriptions
    }))
  },
}));

export default useBeachDescriptionStore;
