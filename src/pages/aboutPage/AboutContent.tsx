import {Trans, useTranslation} from 'next-i18next'
import React from "react";
import {Card, CardBody, CardHeader, Carousel, IconButton} from "@material-tailwind/react";
import {TextBox} from "@/components/TextBox";
import Image, {StaticImageData} from "next/image";
import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import PageWrapper from "@/components/PageWrapper";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";
import KitespotsLogo from "@/assets/images/KitespotsLogoIconLarge.png";
import GithubLogo from "@/assets/images/github.png";
import MeteomaticsLogo from "@/assets/images/meteomatics.png";
import StavangerKiteklubbLogo from "@/assets/images/stavangerKiteklubb.svg";
import SeleBeach from "@/assets/images/06-Sele-North-Bore-800.png";

export default function AboutContent() {
  const { t} = useTranslation();

  useActiveLanguage();

  interface AboutContent{
    text: string;
    imageSrc: StaticImageData;
    imgHeight: number | undefined;
    imgWidth: number | undefined;
    imgMaxHeight: number | undefined;
    imgMaxWidth: number | undefined;
    link: string | undefined;
  }

  const aboutContentList: AboutContent[] = [
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

  return (
    <PageWrapper>
      <Carousel
        className="rounded-xl h-fit"
        prevArrow={({ handlePrev }) => (
          <IconButton
            variant="text"
            color="white"
            size="lg"
            onClick={handlePrev}
            className="!absolute top-2/4 left-4 -translate-y-2/4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </IconButton>
        )}
        nextArrow={({ handleNext }) => (
          <IconButton
            variant="text"
            color="white"
            size="lg"
            onClick={handleNext}
            className="!absolute top-2/4 !right-4 -translate-y-2/4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </IconButton>
        )}
      >
        {aboutContentList.map((content) => (
          <Card key={content.text} className="mt-6 w-full h-full bg-webPageContainerBody">
            <CardHeader
              color="blue-gray"
              className="flex h-full justify-center items-center"
              style={{ height: 300 }}
            >
              {!content.link ? (
                <Image
                  src={content.imageSrc}
                  alt="aboutImage"
                  style={{height: content.imgHeight, width: content.imgWidth, maxHeight: content.imgMaxHeight}}
                />
              ): (
                <a
                  href={`${content.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={content.imageSrc}
                    alt="aboutImage"
                    style={{height: content.imgHeight, width: content.imgWidth, maxHeight: content.imgMaxHeight, maxWidth: content.imgMaxWidth}}
                  />
                </a>
              )}
            </CardHeader>
            <CardBody className="flex h-[250px] justify-center">
              <TextBox>
                {!content.link ? (
                  <div className="text-start">
                    <p>{t(content.text)}</p>
                  </div>
                ) : (
                  <Trans i18nKey={content.text}>
                    <a
                      href={`${content.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold text-black`}
                    ></a>
                  </Trans>
                )}
              </TextBox>
            </CardBody>
          </Card>
        ))}
      </Carousel>
    </PageWrapper>
  );
}

// Add getStaticProps at the bottom of your pages/index.tsx file
export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context;
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'home'])), // 'en' is the default locale
    },
  };
}

