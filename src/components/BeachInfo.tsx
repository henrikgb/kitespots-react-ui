import styleClasses from "@/pages/index.module.css";
import {StarRating} from "@/util/StarRating";
import React from "react";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useTranslation} from 'next-i18next';

export const BeachInfo = () => {
  const { t } = useTranslation();
  const {
    nameId,
    beginnerScore,
    freestyleScore,
    waveScore} = useBeachDescriptionStore();
  return (
    <div className="p-5 flex flex-col gap-12 justify-center">
      <p className={"font-bold text-3xl"}>{nameId ? (nameId?.charAt(0).toUpperCase() + nameId?.slice(1).toLowerCase()) : undefined}</p>
      <div className={styleClasses.textList}>
        <ul className="flex flex-col justify-center ">
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
      <div>
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
    </div>
  )
}