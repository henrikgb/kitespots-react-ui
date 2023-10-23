// store.ts
import { create } from 'zustand';
import {StaticImageData} from "next/image";
import {beachCoordinates} from "@/assets/beachCoordinates";

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

    setId: (value: number) => void;
    setLatitude: (value: number) => void;
    setLongitude: (value: number) => void;
    setInfo: (value: string) => void;
    setNameId: (value: string) => void;
    setImage: (value: StaticImageData) => void;
    setBeginnerScore: (value: number) => void;
    setFreestyleScore: (value: number) => void;
    setWaveScore: (value: number) => void;
}

const useBeachDescriptionStore = create<beachDescriptionState>((set) => ({
  id: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.id,
  latitude: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.latitude,
  longitude: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.longitude,
  info: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.info,
  nameId: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.nameId,
  image: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.image,
  beginnerScore: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.beginnerScore,
  freestyleScore: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.freestyleScore,
  waveScore: beachCoordinates.find((coordinate) => coordinate.nameId === "sele")?.waveScore,
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
  }
}));

export default useBeachDescriptionStore;
