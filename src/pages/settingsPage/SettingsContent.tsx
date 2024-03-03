import React, { useEffect } from 'react';
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

export const SettingsContent= () => {
  const {
    t,
    i18n,
  } = useTranslation();
  const {activeLanguage, norwegianButtonColor, englishButtonColor, setNorwegianButtonColor, setEnglishButtonColor, setActiveLanguage} = usei18LanguageStore();

  useEffect(() => {
    if (i18n.language === "nb") {
      setNorwegianButtonColor("blue-gray");
      setEnglishButtonColor("white");
    } else {
      setNorwegianButtonColor("white");
      setEnglishButtonColor("blue-gray");
    }
  }, [i18n, activeLanguage, englishButtonColor, norwegianButtonColor, setNorwegianButtonColor, setEnglishButtonColor]);

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  const updateLanguage = async (activeLanguage: "en" | "nb") => {
    await i18n.changeLanguage(activeLanguage);
    setActiveLanguage(activeLanguage);
  };

  return (
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
            color={englishButtonColor}
          >
            {t("english")}
          </Button>
          <Button
            variant="filled"
            placeholder=""
            onClick={() => updateLanguage("nb")}
            color={norwegianButtonColor}
          >
            {t("norwegian")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
