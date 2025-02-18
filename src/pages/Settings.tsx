import React from 'react';
import { useTranslation } from 'react-i18next';
import usei18LanguageStore from "@/store/i18languageStore";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import shoreBreak from "@/assets/images/shoreBreak.jpg";
import Image from "next/image";
import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import PageWrapper from "@/components/common/PageWrapper";
import { useActiveLanguage } from "@/util/languageControl/useActiveLanguage";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Settings() {
  const {
    t,
    i18n,
  } = useTranslation();
  const {activeLanguage, setActiveLanguage} = usei18LanguageStore();

  useActiveLanguage();

  const updateLanguage = async (activeLanguage: "en" | "nb") => {
    await i18n.changeLanguage(activeLanguage);
    setActiveLanguage(activeLanguage);
  };

  const { data: session, status } = useSession();

  // Wait for session loading to avoid hydration issues
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <PageWrapper>
      <Card className="mt-6 w-full bg-webPageContainerBody">
        <CardHeader
          color="blue-gray"
          className="flex h-full justify-center items-center"
          style={{ height: 300 }}
        >
          <Image
            className="w-full h-full object-cover"
            src={shoreBreak}
            alt="shorebreak"
            width={1334}
            height={1000}
            priority
            style={{ height: "100%", width: "100%" }}
          />
        </CardHeader>
        <CardBody className="flex flex-col gap-8 justify-start">
          <div className="flex flex-col gap-4">
            <Typography variant="h4">
              {t("changeLanguage")}
            </Typography>
            <div className="flex flex-row gap-4">
              <Button
                variant="filled"
                placeholder=""
                onClick={() => updateLanguage("en")}
                color={activeLanguage === "en" ? "blue-gray" : "white"}
              >
                {t("english")}
              </Button>
              <Button
                variant="filled"
                placeholder=""
                onClick={() => updateLanguage("nb")}
                color={activeLanguage === "nb" ? "blue-gray" : "white"}
              >
                {t("norwegian")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Typography variant="h4">
              {t("updateKiteSpotLocations")}
            </Typography>
            <div>
              {session ? (
                <div className="flex flex-col gap-4">
                  <Button
                    className="w-fit"
                    variant="filled"
                    onClick={() => signOut()}
                    color="white"
                  >
                    {t("logout")}
                  </Button>
                  {session.user && (
                    <div className="flex flex-col gap-4 bg-webPageBodyBackground p-5">
                      {t("contentOnlyVisibleForAdmin")}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="filled"
                  onClick={() => signIn()}
                  color="blue-gray"
                >
                  {t("login")}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
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