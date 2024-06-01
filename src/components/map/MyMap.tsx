import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Icon} from "leaflet";
import {BeachCoordinateProp, beachCoordinates} from "@/assets/beachCoordinates";
import React from "react";
import styleClasses from "@/pages/index.module.css";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import pinIcon from "@/assets/icons/pin.png";

const MyMap = () => {
  const { setSelectedLocation } = useMeteomaticsWeatherDataStore();
  const {
    setNameId,
    setImage,
    setBeginnerScore,
    setFreestyleScore,
    setWaveScore,
    setWindDirectionDescriptions} = useBeachDescriptionStore();
  const handleMarkerClick = (beachCoordinate: BeachCoordinateProp) => {
    setNameId(beachCoordinate.nameId);
    setImage(beachCoordinate.image);
    setBeginnerScore(beachCoordinate.beginnerScore);
    setFreestyleScore(beachCoordinate.freestyleScore);
    setWaveScore(beachCoordinate.waveScore);
    setWindDirectionDescriptions(beachCoordinate.windDirectionDescriptions);

    // Make sure the Meteomatics weather data is showing data from the coordinate the user clicks on
    setSelectedLocation(beachCoordinate.nameId);
  }

  const markers = beachCoordinates.map((beachCoordinate) => (
    <Marker
      key={beachCoordinate.id}
      position={[beachCoordinate.latitude, beachCoordinate.longitude]}
      icon={new Icon({
        iconUrl: pinIcon.src,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })}
      eventHandlers={{
        click: () => handleMarkerClick(beachCoordinate),
      }}
    >
      <Popup>{beachCoordinate.nameId.charAt(0).toUpperCase() + beachCoordinate.nameId.slice(1).toLowerCase()}</Popup>
    </Marker>
  ));

  return (
    <div className={`${styleClasses.mapContainer}`}>
      <MapContainer center={[58.80636404000909, 5.724361473212989]}
        zoom={3} scrollWheelZoom={true} style={{height: "100%", width: "100%"}}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>{markers}</MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MyMap;