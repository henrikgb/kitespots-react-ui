import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import { useLocationsStore } from "@/store/locationsStore";
import { useLocations } from "@/util/axiosRequests/useLocations";
import { KiteSpotLocation } from "@/types/model/Location";
import { deleteLocation, getLocationApiErrorMessage } from "@/util/axiosRequests/locationAdminApi";
import { AddLocationForm } from "@/components/admin/AddLocationForm";
import { PuffDataLoader } from "@/components/common/PuffDataLoader";

export const LocationsAdminPanel = () => {
  const { t } = useTranslation();
  const { locations, isLocationsLoading, locationsError, setLocations } = useLocationsStore();
  const [pendingDelete, setPendingDelete] = useState<KiteSpotLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // The admin panel must be able to load the location list on its own - it isn't guaranteed
  // the user visited the home page (which also calls this) first in the same session.
  useLocations();

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteLocation(pendingDelete.id);
      setLocations(locations.filter((location) => location.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(getLocationApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography variant="h5">{t("existingKiteSpots")}</Typography>

        {isLocationsLoading && (
          <div className="flex justify-center" style={{ height: "20vh" }}>
            <PuffDataLoader />
          </div>
        )}
        {!isLocationsLoading && locationsError && (
          <Typography color="red">{t("failedToLoadLocations")}</Typography>
        )}
        {!isLocationsLoading && !locationsError && locations.length === 0 && (
          <Typography>{t("noKiteSpotsAvailable")}</Typography>
        )}
        {!isLocationsLoading && !locationsError && locations.length > 0 && (
          <ul className="flex flex-col gap-2">
            {locations.map((location) => (
              <li
                key={location.id}
                className="flex flex-row items-center justify-between gap-4 bg-webPageBodyBackground p-3"
              >
                <div>
                  <Typography className="font-bold">{location.name}</Typography>
                  <Typography variant="small">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Typography>
                </div>
                <Button
                  variant="text"
                  color="red"
                  onClick={() => {
                    setDeleteError(null);
                    setPendingDelete(location);
                  }}
                >
                  {t("deleteLocation")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddLocationForm />

      <Dialog open={Boolean(pendingDelete)} handler={() => setPendingDelete(null)}>
        <DialogHeader>{t("confirmDeleteLocationTitle", { name: pendingDelete?.name })}</DialogHeader>
        <DialogBody>
          <Typography>{t("confirmDeleteLocationMessage")}</Typography>
          {deleteError && (
            <Typography color="red" className="mt-2">
              {deleteError}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setPendingDelete(null)} disabled={isDeleting} className="mr-2">
            {t("cancel")}
          </Button>
          <Button variant="filled" color="red" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? t("deleting") : t("deleteLocation")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
