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
import PageWrapper from "@/components/PageWrapper";
import { useActiveLanguage } from "@/util/languageControl/useActiveLanguage";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsContent() {
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
            src={shoreBreak}
            alt="shorebreak"
            className="w-full h-full object-cover"
            style={{ height: "100%", width: "100%" }}
          />
        </CardHeader>
        <CardBody className="flex flex-col gap-4 justify-start">
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

          {/* Login/Logout Button */}
          {session ? (
            <>
              <Button
                variant="filled"
                onClick={() => signOut()}
                color="red"
              >
                  Logout
              </Button>
              {/* Conditional rendering for admin content */}
              {session.user && ( // Check if user is admin
                <div className="flex flex-col gap-4 bg-red-300 p-5">
                      This component should only be visible if you are logged in as an admin user.
                </div>
              )}
            </>
          ) : (
            <Button
              variant="filled"
              onClick={() => signIn()}
              color="green"
            >
                Login
            </Button>
          )}
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