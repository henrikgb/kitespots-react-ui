import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Icon} from "leaflet";
import {beachCoordinates} from "@/assets/beachCoordinates";

const MyMap = () => {

  const markers = beachCoordinates.map((beachCoordinates) => (
    <Marker key={beachCoordinates.id} position={[beachCoordinates.latitude, beachCoordinates.longitude]}
      icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
      <Popup>{beachCoordinates.info}</Popup>
    </Marker>
  ));

  return (
    <MapContainer className={"absolute z-0"} center={[58.80636404000909, 5.724361473212989]}
      zoom={9} scrollWheelZoom={true} style={{height: "92vh", width: "100vw"}}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers}
    </MapContainer>
  );
};

export default MyMap;