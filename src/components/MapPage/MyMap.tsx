import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Icon} from "leaflet";
import {BeachCoordinateProp, beachCoordinates} from "@/assets/beachCoordinates";
import React from "react";
import styleClasses from "@/pages/index.module.css";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";

const MyMap = () => {
  const {
    setNameId,
    setImage,
    setBeginnerScore,
    setFreestyleScore,
    setWaveScore} = useBeachDescriptionStore();
  const handleMarkerClick = (beachCoordinate: BeachCoordinateProp) => {
    setNameId(beachCoordinate.nameId);
    setImage(beachCoordinate.image);
    setBeginnerScore(beachCoordinate.beginnerScore);
    setFreestyleScore(beachCoordinate.freestyleScore);
    setWaveScore(beachCoordinate.waveScore);
  }

  const markers = beachCoordinates.map((beachCoordinate) => (
    <Marker
      key={beachCoordinate.id}
      position={[beachCoordinate.latitude, beachCoordinate.longitude]}
      icon={new Icon({
        iconUrl: "pin.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })}
      eventHandlers={{
        click: () => handleMarkerClick(beachCoordinate),
      }}
    >
      <Popup>{beachCoordinate.info}</Popup>
    </Marker>
  ));

  return (
    <div className={`${styleClasses.mapContainer}`}>
      <MapContainer center={[58.80636404000909, 5.724361473212989]}
        zoom={9} scrollWheelZoom={true} style={{height: "100%", width: "100%"}}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
    </div>
  );
};

export default MyMap;