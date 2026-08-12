import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Icon} from "leaflet";
import React from "react";
import styleClasses from "@/pages/index.module.css";
import {useWeatherDataStore} from "@/store/weatherDataStore";
import {useLocationsStore} from "@/store/locationsStore";
import {KiteSpotLocation} from "@/types/model/Location";
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import pinIcon from "@/assets/icons/pin.png";
import {PuffDataLoader} from "@/components/common/PuffDataLoader";
import {useTranslation} from "next-i18next";

const MyMap = () => {
  const { t } = useTranslation();
  const { setSelectedLocation } = useWeatherDataStore();
  const { locations, isLocationsLoading, locationsError } = useLocationsStore();

  const handleMarkerClick = (location: KiteSpotLocation) => {
    setSelectedLocation(location.id);
  }

  const markers = locations.map((location) => (
    <Marker
      key={location.id}
      position={[location.latitude, location.longitude]}
      icon={new Icon({
        iconUrl: pinIcon.src,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })}
      eventHandlers={{
        click: () => handleMarkerClick(location),
      }}
    >
      <Popup>{location.name}</Popup>
    </Marker>
  ));

  return (
    <div className={`${styleClasses.mapContainer}`}>
      {isLocationsLoading && (
        <div className="h-full w-full flex items-center justify-center">
          <PuffDataLoader />
        </div>
      )}
      {!isLocationsLoading && locationsError && (
        <div className="h-full w-full flex items-center justify-center">
          <p>{t("failedToLoadLocations")}</p>
        </div>
      )}
      {!isLocationsLoading && !locationsError && locations.length === 0 && (
        <div className="h-full w-full flex items-center justify-center">
          <p>{t("noKiteSpotsAvailable")}</p>
        </div>
      )}
      {!isLocationsLoading && !locationsError && locations.length > 0 && (
        <MapContainer center={[58.80636404000909, 5.724361473212989]}
          zoom={3} scrollWheelZoom={true} style={{height: "100%", width: "100%"}}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>{markers}</MarkerClusterGroup>
        </MapContainer>
      )}
    </div>
  );
};

export default MyMap;
