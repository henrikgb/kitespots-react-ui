import sandeBeachImage from "@/assets/images/02-Sandeviga-800.png";
import solaBeachImage from "@/assets/images/04-Sola-800.png";
import hellestoeBeachImage from "@/assets/images/05-Hellesto-800.png";
import seleBeachImage from "@/assets/images/06-Sele-North-Bore-800.png";
import boreBeachImage from "@/assets/images/07-South-Bore-800.png";
import orreBeachImage from "@/assets/images/10-Orre-800.png";
import xBeachImage from "@/assets/images/11-X-800.png";
import refsnesBeachImage from "@/assets/images/12-Refsnes-800.png";
import brusandBeachImage from "@/assets/images/13-Brusand-800.png";
import {StaticImageData} from "next/image";

export interface BeachCoordinateProp{
  id: number,
  latitude: number,
  longitude: number,
  info: string,
  nameId: string,
  image: StaticImageData,
  beginnerScore: number,
  freestyleScore: number,
  waveScore: number,
}
export const beachCoordinates: BeachCoordinateProp[] = [
  {
    "id": 1,
    "latitude": 59.02050003940309,
    "longitude": 5.592325942611728,
    "info": "Sandestranden, Randaberg. Nice on days with onshore wind. Gusty on side shore wind. Usually flat and no waves.",
    "nameId": "Sande",
    "image": sandeBeachImage,
    "beginnerScore": 3,
    "freestyleScore": 5,
    "waveScore": 5,
  },
  {
    "id": 2,
    "latitude": 58.88531361351894,
    "longitude": 5.602662428854268,
    "info": "Solastranden, Sola. Nice on days with onshore wind. Gusty on side shore wind. Usually flat and no waves.",
    "nameId": "Sola",
    "image": solaBeachImage,
    "beginnerScore": 5,
    "freestyleScore": 4,
    "waveScore": 3,
  },
  {
    "id": 3,
    "latitude": 58.84227538997773,
    "longitude": 5.560516132410946,
    "info": "Hellestøstranden, Sola.",
    "nameId": "Hellestø",
    "image": hellestoeBeachImage,
    "beginnerScore": 1,
    "freestyleScore": 3,
    "waveScore": 5,
  },
  {
    "id": 4,
    "latitude": 58.81231852222533,
    "longitude": 5.546945324943648,
    "info": "Selestranda, Klepp. Good spot for several wind directions. Potentially large waves.",
    "nameId": "Sele",
    "image": seleBeachImage,
    "beginnerScore": 1,
    "freestyleScore": 3,
    "waveScore": 5,
  },
  {
    "id": 5,
    "latitude": 58.80123195118268,
    "longitude": 5.5480941336096645,
    "info": "Borestranden, Klepp. Good spot for several wind directions. Potentially large waves.",
    "nameId": "Bore",
    "image": boreBeachImage,
    "beginnerScore": 4,
    "freestyleScore": 3,
    "waveScore": 4,
  },
  {
    "id": 6,
    "latitude": 58.740441600947264,
    "longitude": 5.512925570900187,
    "info": "Orrestranda. Good spot for onshore and south wind directions. Potentially large waves.",
    "nameId": "Orre",
    "image": orreBeachImage,
    "beginnerScore": 4,
    "freestyleScore": 3,
    "waveScore": 4,
  },
  {
    "id": 7,
    "latitude": 58.722027,
    "longitude": 5.521960,
    "info": "X. Good spot for onshore and south wind directions. Potentially large waves.",
    "nameId": "X",
    "image": xBeachImage,
    "beginnerScore": 1,
    "freestyleScore": 4,
    "waveScore": 5,
  },
  {
    "id": 8,
    "latitude": 58.68756890551574,
    "longitude": 5.551150818355702,
    "info": "Refsnesstranden. Good spot for onshore and south wind directions. Potentially large waves.",
    "nameId": "Refsnes",
    "image": refsnesBeachImage,
    "beginnerScore": 4,
    "freestyleScore": 5,
    "waveScore": 5,
  },
  {
    "id": 9,
    "latitude": 58.53797648002299,
    "longitude": 5.730672797723366,
    "info": "Brusand strand. Good spot for onshore and south wind directions. Potentially large waves.",
    "nameId": "Brusand",
    "image": brusandBeachImage,
    "beginnerScore": 2,
    "freestyleScore": 3,
    "waveScore": 3,
  }
]