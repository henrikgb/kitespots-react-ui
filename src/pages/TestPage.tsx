import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Card, CardBody, CardHeader, IconButton, Typography} from "@material-tailwind/react";
import Image from "next/image";
import sunsetImage from "@/assets/images/beachSunset.jpg";
import {Trans, useTranslation} from "next-i18next";
import PageWrapper from "@/components/PageWrapper";
import React, {useEffect} from "react";
import usei18LanguageStore from "@/store/i18languageStore";
import {KiteSpotsMap} from "@/components/map/KiteSpotsMap";

export default function TestPage() {
  const email = "henrik.busengdal@kitespots.no";
  const { t, i18n } = useTranslation();
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

 
  return(
    <PageWrapper>
      <Card className="mt-6 w-full bg-webPageContainerBody">
        <CardHeader
          color="blue-gray"
          className="flex h-full justify-center items-center"
          style={{ height: 300 }}
        >
          <KiteSpotsMap />
        </CardHeader>
        <CardBody className="flex justify-start">
          <div className="h-full">
            <div className="flex gap-4">
              <IconButton>
                <i className="fas fa-heart" />
              </IconButton>
              <IconButton variant="gradient">
                <i className="fas fa-heart" />
              </IconButton>
              <IconButton variant="outlined">
                <i className="fas fa-heart" />
              </IconButton>
              <IconButton variant="text">
                <i className="fas fa-heart" />
              </IconButton>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageWrapper>
  )
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