import {StaticImageData} from "next/image";
import KitespotsLogo from "@/assets/images/KitespotsLogoIconLarge.png";
import GithubLogo from "@/assets/images/github.png";
import MeteomaticsLogo from "@/assets/images/meteomatics.png";
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
    imgHeight: undefined,
    imgWidth: undefined,
    imgMaxHeight: undefined,
    imgMaxWidth: undefined,
    link: undefined,
  },
  {
    text: "aboutTheProject",
    imageSrc: GithubLogo,
    imgHeight: undefined,
    imgWidth: undefined,
    imgMaxHeight: 200,
    imgMaxWidth: undefined,
    link: "https://github.com/henrikgb/kitespots-react-ui",
  },
  {
    text: "aboutMeteomaticsWeatherAPI",
    imageSrc: MeteomaticsLogo,
    imgHeight: undefined,
    imgWidth: undefined,
    imgMaxHeight: undefined,
    imgMaxWidth: 300,
    link: "https://www.meteomatics.com/en/weather-api/?msclkid=85e0b029dcb111d13bc7d5e280cfcaa6&utm_source=bing&utm_medium=cpc&utm_campaign=Weather%20API%20(englisch%20ausser%20USA)&utm_term=meteomatics&utm_content=Weather%20Api",
  },
  {
    text: "aboutStavangerKiteclub",
    imageSrc: StavangerKiteklubbLogo,
    imgHeight: 200,
    imgWidth: undefined,
    imgMaxHeight: undefined,
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