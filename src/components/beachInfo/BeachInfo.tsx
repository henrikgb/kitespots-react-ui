import styleClasses from "@/pages/index.module.css";
import {StarRating} from "@/util/StarRating";
import React from "react";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useTranslation} from 'next-i18next';
import Image from "next/image";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";

export const BeachInfo = () => {
  const { t} = useTranslation();
  const {
    image,
    beginnerScore,
    freestyleScore,
    waveScore} = useBeachDescriptionStore();

  useActiveLanguage();

  return (
    <div className="flex flex-row gap-4 w-full h-full justify-center items-center flex-wrap">
      <div className="flex justify-center items-center">
        <ul>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("beginner")}:</p>
            <StarRating score={beginnerScore ? beginnerScore : 0} />
          </li>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("freestyle")}:</p>
            <StarRating score={freestyleScore ? freestyleScore : 0} />
          </li>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("wave")}:</p>
            <StarRating score={waveScore ? waveScore : 0} />
          </li>
        </ul>
      </div>
      <Image className="flex items-start" src={image ? image : ""} alt="Beach Wind Directions" style={{ width: '34vh' }} />
      <div className={styleClasses.textList}>
        <ul className="flex flex-col justify-center ml-4">
          <li>
            <p style={{fontSize: 12}}>{t("sideOnshore")}</p>
            <span className={styleClasses.square} style={{ backgroundColor: '#00bb00', blockSize: 12 }}></span>
          </li>
          <li>
            <p style={{fontSize: 12}}>{t("onshore")}</p>
            <span className={styleClasses.square} style={{ backgroundColor: '#008000', blockSize: 12  }}></span>
          </li>
          <li>
            <p style={{fontSize: 12}}>{t("overLand")}</p>
            <span className={styleClasses.square} style={{ backgroundColor: '#45a3ff', blockSize: 12  }}></span>
          </li>
          <li>
            <p style={{fontSize: 12}}>{t("sideOffshore")}</p>
            <span className={styleClasses.square} style={{ backgroundColor: '#ffa500', blockSize: 12  }}></span>
          </li>
          <li>
            <p style={{fontSize: 12}}>{t("offshore")}</p>
            <span className={styleClasses.square} style={{ backgroundColor: '#FD0100', blockSize: 12  }}></span>
          </li>
        </ul>
      </div>
    </div>
  )
}