import styleClasses from "@/pages/index.module.css";
import {StarRating} from "@/util/StarRating";
import React, {useState} from "react";
import {useSelectedLocation} from "@/store/useSelectedLocation";
import {useLocationsStore} from "@/store/locationsStore";
import {useTranslation} from 'next-i18next';
import Image from "next/image";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";
import {PuffDataLoader} from "@/components/common/PuffDataLoader";
import {WIND_CONDITION_LIST} from "@/domain/windCondition";

export const BeachInfo = () => {
  const { t } = useTranslation();
  const location = useSelectedLocation();
  const { isLocationsLoading, locationsError } = useLocationsStore();
  const [imageFailed, setImageFailed] = useState(false);

  useActiveLanguage();

  if (isLocationsLoading) {
    return (
      <div className="w-full flex justify-center" style={{ height: "40vh" }}>
        <PuffDataLoader />
      </div>
    );
  }

  if (locationsError) {
    return <p>{t("failedToLoadLocations")}</p>;
  }

  if (!location) {
    return <p>{t("noKiteSpotsAvailable")}</p>;
  }

  return (
    <div className="flex flex-row gap-4 w-full h-full justify-center items-center flex-wrap">
      <div className="flex justify-center items-center">
        <ul>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("beginner")}:</p>
            <StarRating score={location.beginnerScore} />
          </li>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("freestyle")}:</p>
            <StarRating score={location.freestyleScore} />
          </li>
          <li className="flex flex-row items-center gap-2">
            <p style={{fontSize: 12, marginBottom: 0}}>{t("wave")}:</p>
            <StarRating score={location.waveScore} />
          </li>
        </ul>
      </div>
      {!imageFailed ? (
        <Image
          className="flex items-start"
          src={location.imageUrl}
          alt={location.name}
          width={200}
          height={200}
          priority
          style={{ width: '34vh' }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center text-center"
          style={{ width: '34vh', height: '34vh', border: '1px dashed #999' }}
        >
          <p style={{fontSize: 12}}>{t("imageNotAvailableYet")}</p>
        </div>
      )}
      <div className={styleClasses.textList}>
        <ul className="flex flex-col justify-center ml-4">
          {WIND_CONDITION_LIST.map((condition) => (
            <li key={condition.id}>
              <p style={{fontSize: 12}}>{t(condition.id)}</p>
              <span className={styleClasses.square} style={{ backgroundColor: condition.colorCode, blockSize: 12 }}></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
