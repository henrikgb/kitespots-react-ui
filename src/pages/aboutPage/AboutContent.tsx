import {Trans, useTranslation} from 'next-i18next'
import React from "react";
import {Card, CardBody, CardHeader, Carousel, IconButton} from "@material-tailwind/react";
import {TextBox} from "@/components/TextBox";
import githubLogo from "@/assets/images/github.png";
import kitespotsLogo from "@/assets/images/KitespotsLogoIconLarge.png";
import StavangerKiteklubbLogo from "@/assets/images/stavangerKiteklubb.svg";
import meteomaticsLogo from "@/assets/images/meteomatics.png";
import seleBeach from "@/assets/images/06-Sele-North-Bore-800.png";
import Image from "next/image";
import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import PageWrapper from "@/components/PageWrapper";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";

export default function AboutContent() {
  const { t} = useTranslation();
  const kitespotsGithubRepo =
        "https://github.com/henrikgb/kitespots-react-ui";
  const linkMeteomatics =
        "https://www.meteomatics.com/en/weather-api/?msclkid=85e0b029dcb111d13bc7d5e280cfcaa6&utm_source=bing&utm_medium=cpc&utm_campaign=Weather%20API%20(englisch%20ausser%20USA)&utm_term=meteomatics&utm_content=Weather%20Api";
  const linkStavangerKiteklubb = "https://www.stavangerkiteklubb.com/";

  useActiveLanguage();

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
        <Card className="mt-6 w-full h-full bg-webPageContainerBody">
          <CardHeader
            color="blue-gray"
            className="flex h-full justify-center items-center"
            style={{ height: 300 }}
          >
            <Image
              src={kitespotsLogo}
              alt="kitespots-logo"
            />
          </CardHeader>
          <CardBody className="flex h-[250px] justify-center">
            <TextBox>
              <div className="text-start">
                <p>{t("aboutPageTextSection2")}</p>
              </div>
            </TextBox>
          </CardBody>
        </Card>
        <Card className="mt-6 w-full h-full bg-webPageContainerBody">
          <CardHeader
            color="blue-gray"
            className="flex h-full justify-center items-center"
            style={{ height: 300 }}
          >
            <a
              href={`${kitespotsGithubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={githubLogo}
                alt="github-logo"
                style={{ maxHeight: 200 }}
              ></Image>
            </a>
          </CardHeader>
          <CardBody className="flex h-[250px] justify-center">
            <TextBox>
              <Trans i18nKey="aboutPageTextSection1">
                <a
                  href={`${kitespotsGithubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold text-black`}
                ></a>
              </Trans>
            </TextBox>
          </CardBody>
        </Card>
        <Card className="mt-6 w-full h-full bg-webPageContainerBody">
          <CardHeader
            color="blue-gray"
            className="flex h-full justify-center items-center"
            style={{ height: 300 }}
          >
            <a
              href={`${linkMeteomatics}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={meteomaticsLogo}
                alt="meteomatics-logo"
                style={{ maxWidth: 300 }}
              />
            </a>
          </CardHeader>
          <CardBody className="flex h-[250px] justify-center">
            <TextBox>
              <Trans i18nKey="aboutPageTextSection3">
                <a
                  href={`${linkMeteomatics}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold text-black`}
                ></a>
              </Trans>
            </TextBox>
          </CardBody>
        </Card>
        <Card className="mt-6 w-full h-full bg-webPageContainerBody">
          <CardHeader
            color="blue-gray"
            className="flex h-full justify-center items-center"
            style={{ height: 300 }}
          >
            <a
              href={`${linkStavangerKiteklubb}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={StavangerKiteklubbLogo}
                alt="Stavanger kiteklubb logo"
                style={{ height: 200 }}
              ></Image>
            </a>
          </CardHeader>
          <CardBody className="flex h-[250px] justify-center">
            <TextBox>
              <Trans i18nKey="aboutPageTextSection4">
                <a
                  href={`${linkStavangerKiteklubb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold text-black`}
                ></a>
              </Trans>
            </TextBox>
          </CardBody>
        </Card>
        <Card className="mt-6 w-full h-full bg-webPageContainerBody">
          <CardHeader
            color="blue-gray"
            className="flex h-full justify-center items-center"
            style={{ height: 300 }}
          >
            <Image src={seleBeach} alt="sele beach" style={{ height: 220, width: 220 }}></Image>
          </CardHeader>
          <CardBody className="flex h-[250px] justify-center">
            <TextBox>
              <p>{t("aboutPageTextSection5")}</p>
            </TextBox>
          </CardBody>
        </Card>
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

