import styleClasses from "@/pages/index.module.css";
import {StarRating} from "@/util/StarRating";
import React, {useEffect} from "react";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useTranslation} from 'next-i18next';
import usei18LanguageStore from "@/store/i18languageStore";
import Image from "next/image";

export const BeachInfo = () => {
  const { t, i18n } = useTranslation();
  const {
    image,
    nameId,
    beginnerScore,
    freestyleScore,
    waveScore} = useBeachDescriptionStore();
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  return (
    <div className="flex flex-col gap-4 p-5 w-full">
      <div className="flex justify-center w-full">
        <p className={"flex justify-center font-bold text-3xl w-fit"} style={{borderBottom: "solid black"}}>{nameId ? (nameId?.charAt(0).toUpperCase() + nameId?.slice(1).toLowerCase()) : undefined}</p>
      </div>
      <div className="flex justify-center">
        <ul>
          <li className="flex flex-row gap-2">
            <p>{t("beginner")}:</p>
            <StarRating score={beginnerScore ? beginnerScore : 0} />
          </li>
          <li className="flex flex-row gap-2">
            <p>{t("freestyle")}:</p>
            <StarRating score={freestyleScore ? freestyleScore : 0} />
          </li>
          <li className="flex flex-row gap-2">
            <p>{t("wave")}:</p>
            <StarRating score={waveScore ? waveScore : 0} />
          </li>
        </ul>
      </div>
      <div className={styleClasses.beachInfoContainer}>
        <Image className="flex items-start" src={image ? image : ""} alt="Beach Wind Directions" style={{ width: '34vh' }} />
        <div className={styleClasses.textList}>
          <ul className="flex flex-col justify-center ml-4">
            <li>
              <p>{t("sideOnshore")}</p>
              <span className={styleClasses.square} style={{ backgroundColor: '#00bb00' }}></span>
            </li>
            <li>
              <p>{t("onshore")}</p>
              <span className={styleClasses.square} style={{ backgroundColor: '#008000' }}></span>
            </li>
            <li>
              <p>{t("overLand")}</p>
              <span className={styleClasses.square} style={{ backgroundColor: '#45a3ff' }}></span>
            </li>
            <li>
              <p>{t("sideOffshore")}</p>
              <span className={styleClasses.square} style={{ backgroundColor: '#ffa500' }}></span>
            </li>
            <li>
              <p>{t("offshore")}</p>
              <span className={styleClasses.square} style={{ backgroundColor: '#FD0100' }}></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}