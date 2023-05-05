import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Icon} from "leaflet";

const MyMap = () => {
    return (
        <MapContainer className={"absolute z-0"} center={[58.80636404000909, 5.724361473212989]}
                      zoom={9} scrollWheelZoom={true} style={{height: "92vh", width: "100vw"}}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[59.02050003940309, 5.592325942611728]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Sandestranden, Randaberg. <br /> Nice on days with onshore wind. <br />
                    Gusty on side shore wind. <br/> Usually flat and no waves.
                </Popup>
            </Marker>
            <Marker position={[58.88531361351894, 5.602662428854268]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Solastranden, Sola. <br /> Nice on days with onshore wind. <br />
                    Gusty on side shore wind. <br/> Usually flat and no waves.
                </Popup>
            </Marker>
            <Marker position={[58.84227538997773, 5.560516132410946]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Hellestøstranden, Sola.
                </Popup>
            </Marker>

            <Marker position={[58.81231852222533, 5.546945324943648]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Selestranda, Klepp. <br /> Good spot for several wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
            <Marker position={[58.80123195118268, 5.5480941336096645]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Borestranden, Klepp. <br /> Good spot for several wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
            <Marker position={[58.740441600947264, 5.512925570900187]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Orrestranda. <br /> Good spot for onshore- <br/> and south wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
            <Marker position={[58.722027, 5.521960]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    X. <br />  Good spot for onshore- <br/> and south wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
            <Marker position={[58.68756890551574, 5.551150818355702]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Refsnesstranden. <br /> Good spot for onshore- <br/> and south wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
            <Marker position={[58.53797648002299, 5.730672797723366]}
                    icon={new Icon({iconUrl: "pin.png", iconSize: [25, 41], iconAnchor: [12, 41]})} >
                <Popup>
                    Brusand strand . <br /> Good spot for onshore- <br/> and south wind directions. <br/> Potentially large waves.
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MyMap;