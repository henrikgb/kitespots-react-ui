import {StaticImageData} from "next/image";
import KitespotsLogo from "@/assets/images/KitespotsLogoIconLarge.png";
import GithubLogo from "@/assets/images/github.png";
import MetLogo from "@/assets/images/met-api.jpg";
import StavangerKiteklubbLogo from "@/assets/images/stavangerKiteklubb.svg";
import SeleBeach from "@/assets/images/06-Sele-North-Bore-800.png";

interface AboutContent{
    text: string;
    imageSrc: StaticImageData;
    imgHeight: number | undefined;
    imgWidth: number | undefined;
    imgMaxHeight: number | undefined;
    imgMaxWidth: number | undefined;
    link: string | undefined;
}

export const aboutContentList: AboutContent[] = [
  {
    text: "aboutKiteSpots",
    imageSrc: KitespotsLogo,
    imgHeight: 200,
    imgWidth: 200,
    imgMaxHeight: undefined,
    imgMaxWidth: undefined,
    link: undefined,
  },
  {
    text: "aboutTheProject",
    imageSrc: GithubLogo,
    imgHeight: 166,
    imgWidth: 295,
    imgMaxHeight: 200,
    imgMaxWidth: undefined,
    link: "https://github.com/henrikgb/kitespots-react-ui",
  },
  {
    text: "aboutWeatherAPI",
    imageSrc: MetLogo,
    imgHeight: 150,
    imgWidth: 300,
    imgMaxHeight: undefined,
    imgMaxWidth: 300,
    link: "https://api.met.no/weatherapi/locationforecast/2.0/documentation",
  },
  {
    text: "aboutStavangerKiteclub",
    imageSrc: StavangerKiteklubbLogo,
    imgHeight: 200,
    imgWidth: 333,
    imgMaxHeight: 200,
    imgMaxWidth: undefined,
    link: "https://www.stavangerkiteklubb.com/",
  },
  {
    text: "aboutFinalGreetingToUsers",
    imageSrc: SeleBeach,
    imgHeight: 220,
    imgWidth: 220,
    imgMaxHeight: undefined,
    imgMaxWidth: undefined,
    link: undefined,
  },
];