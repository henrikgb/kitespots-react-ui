import React, { useState } from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import {
  WindDirectionConfigEditor,
  WindDirectionRowInput,
  emptyWindDirectionRow,
} from "@/components/admin/WindDirectionConfigEditor";
import {
  createLocation,
  getLocationApiErrorMessage,
  refreshLocations,
  uploadLocationImage,
} from "@/util/axiosRequests/locationAdminApi";

const parseOptionalScore = (value: string): number | undefined => (value.trim() === "" ? undefined : Number(value));

export const AddLocationForm = () => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [beginnerScore, setBeginnerScore] = useState("");
  const [freestyleScore, setFreestyleScore] = useState("");
  const [waveScore, setWaveScore] = useState("");
  const [windRows, setWindRows] = useState<WindDirectionRowInput[]>([emptyWindDirectionRow()]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setLatitude("");
    setLongitude("");
    setBeginnerScore("");
    setFreestyleScore("");
    setWaveScore("");
    setWindRows([emptyWindDirectionRow()]);
    setImageFile(null);
  };

  const validateBeforeSubmit = (): string | null => {
    if (!name.trim()) {
      return t("validationNameRequired");
    }
    if (latitude.trim() === "" || Number.isNaN(Number(latitude))) {
      return t("validationLatitudeRequired");
    }
    if (longitude.trim() === "" || Number.isNaN(Number(longitude))) {
      return t("validationLongitudeRequired");
    }
    if (windRows.length === 0 || windRows.every((row) => !row.category)) {
      return t("validationWindDirectionRequired");
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clientError = validateBeforeSubmit();
    if (clientError) {
      setErrorMessage(clientError);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createLocation({
        name: name.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        beginnerScore: parseOptionalScore(beginnerScore),
        freestyleScore: parseOptionalScore(freestyleScore),
        waveScore: parseOptionalScore(waveScore),
        windDirectionDescriptions: windRows
          .filter((row) => row.category)
          .map((row) => ({
            intervalStart: Number(row.intervalStart),
            intervalStop: Number(row.intervalStop),
            category: row.category,
          })),
      });

      if (imageFile) {
        try {
          await uploadLocationImage(created.id, imageFile);
        } catch (imageError) {
          // The location itself was created successfully - a failed image upload is not
          // fatal, the same as any other location without an image yet (see BeachInfo).
          setErrorMessage(t("locationCreatedImageFailed", { error: getLocationApiErrorMessage(imageError) }));
        }
      }

      await refreshLocations();
      setSuccessMessage(t("locationCreatedSuccessfully", { name: created.name }));
      resetForm();
    } catch (error) {
      setErrorMessage(getLocationApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-webPageBodyBackground p-5">
      <Typography variant="h5">{t("addLocation")}</Typography>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Input
            label={t("locationName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="location-name-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            label={t("latitude")}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            data-testid="location-latitude-input"
          />
        </div>
        <div>
          <Input
            type="number"
            label={t("longitude")}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            data-testid="location-longitude-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            type="number"
            label={t("beginnerScoreLabel")}
            value={beginnerScore}
            onChange={(e) => setBeginnerScore(e.target.value)}
            min={0}
            max={5}
          />
        </div>
        <div>
          <Input
            type="number"
            label={t("freestyleScoreLabel")}
            value={freestyleScore}
            onChange={(e) => setFreestyleScore(e.target.value)}
            min={0}
            max={5}
          />
        </div>
        <div>
          <Input
            type="number"
            label={t("waveScoreLabel")}
            value={waveScore}
            onChange={(e) => setWaveScore(e.target.value)}
            min={0}
            max={5}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="small" className="font-bold">
          {t("representativeImage")}
        </Typography>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          data-testid="location-image-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="small" className="font-bold">
          {t("windDirectionConfiguration")}
        </Typography>
        <WindDirectionConfigEditor rows={windRows} onChange={setWindRows} />
      </div>

      {errorMessage && (
        <Typography variant="small" color="red">
          {errorMessage}
        </Typography>
      )}
      {successMessage && (
        <Typography variant="small" color="green">
          {successMessage}
        </Typography>
      )}

      <Button type="submit" variant="filled" color="blue-gray" className="w-fit" disabled={isSubmitting}>
        {isSubmitting ? t("creating") : t("addLocation")}
      </Button>
    </form>
  );
};
