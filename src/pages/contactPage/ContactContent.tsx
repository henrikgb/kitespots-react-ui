import React, {useEffect} from 'react';
import {Trans, useTranslation} from 'next-i18next'
import usei18LanguageStore from "@/store/i18languageStore";
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import sunsetImage from "@/assets/images/beachSunset.jpg";
import Image from "next/image";
import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import PageWrapper from "@/components/PageWrapper";

export default function ContactContent() {
  const email = "henrik.busengdal@kitespots.no";
  const { t, i18n } = useTranslation();
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  return (
    <PageWrapper>
      <Card className="mt-6 w-full bg-webPageContainerBody">
        <CardHeader
          color="blue-gray"
          className="flex h-full justify-center items-center"
          style={{ height: 300 }}
        >
          <Image
            src={sunsetImage}
            alt="sunset"
            className="w-full h-full object-cover"
            style={{ height: "100%", width: "100%" }}
          />
        </CardHeader>
        <CardBody className="flex justify-start">
          <div>
            <Typography variant="h4">{t("contactInfoHeader")}</Typography>
            <div className="mb-4">
              <Trans
                i18nKey="contactInfoMessagePart1"
                components={{ br: <br /> }}
              ></Trans>
            </div>
            <Trans i18nKey="contactInfoEmail" values={{ email }}>
              <a href={`mailto:${email}`} className={`font-bold text-black`}></a>
            </Trans>
            <br />
            <p>{t("contactInfoMessagePart2")}</p>
          </div>
        </CardBody>
      </Card>
    </PageWrapper>
  );
};

// Add getStaticProps at the bottom of your pages/index.tsx file
export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context;
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'home'])), // 'en' is the default locale
    },
  };
}