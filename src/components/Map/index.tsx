import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon as LeafletPolygon,
  useMap,
} from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import { EditControl } from "react-leaflet-draw";
import { LatLngTuple, Polygon, LatLngLiteral  } from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Position } from "geojson";
import "./styles.css";
import { Button } from "antd";
import { Alert } from 'antd';

const predefinedPolygons: LatLngTuple[][] = [
  [
    [-6.257503240841872, 106.84169232845308],
    [-6.259582895018055, 106.84166550636292],
    [-6.25972153833544, 106.84453010559083],
    [-6.257353932018443, 106.84440135955812],
    [-6.257503240841872, 106.84169232845308],
  ],
  [
    [-6.257252615292518, 106.83978259563446],
    [-6.258313773710384, 106.83988451957704],
    [-6.258201792270513, 106.84109687805177],
    [-6.257257947752267, 106.84122025966646],
    [-6.257252615292518, 106.83978259563446],
  ],
  [
    [-6.258895010322197, 106.83960556983948],
    [-6.260366762520672, 106.8395358324051],
    [-6.260254781520888, 106.84118270874025],
    [-6.25893233742196, 106.84134900569917],
    [-6.258895010322197, 106.83960556983948],
  ],
];

function SearchControl() {
  const map = useMap();

  React.useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      style: "button",
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

const Map: React.FC = () => {
  const [existingPolygons, setExistingPolygons] = useState<
    LatLngTuple[][] | null
  >(null);
  const [createdLayer, setCreatedLayer] = useState<Polygon | null>(null);
  const [isIntersection, setIntersection] = useState(false);

  const handleCreate = (
    e: { layerType: string; layer: Polygon },
    isReset = false
  ) => {
    if (!isReset) {
      setCreatedLayer(e.layer);
      const templatlngs: Position[] = [];
      const latlngs: LatLngLiteral[][] =
        e.layer.getLatLngs() as LatLngLiteral[][];
      latlngs[0].forEach((latlng) => {
        templatlngs.push([latlng?.lat, latlng?.lng]);
      });
      console.log(latlngs, '<<==')
      templatlngs.push(templatlngs[0]);
      setExistingPolygons(predefinedPolygons);
      predefinedPolygons.forEach((polygon) => {
        const predefined = turf.polygon([polygon as Position[]]);
        const latlengSelected = turf.polygon([templatlngs]);
        const intersection = turf.intersect(
          turf.featureCollection([latlengSelected, predefined])
        );
        if (intersection) {
          setIntersection(true);
        }
      });
    } else {
      setExistingPolygons(null);
      e.layer.remove();
      setIntersection(false);
      setCreatedLayer(null);
    }
  };

  const handleReset = () => {
    handleCreate({ layerType: "", layer: createdLayer as Polygon }, true);
  };

  return (
    <>
      {isIntersection && <Alert message="Polygon yang Anda buat tidak dapat beririsan dengan polygon yang sudah ada." type="error" />}
      <MapContainer
        center={[-6.258085, 106.842733]}
        zoom={18}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl />
        <FeatureGroup>
          {!createdLayer && (
            <EditControl
              position="topleft"
              onCreated={handleCreate}
              draw={{
                polygon: true,
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
              }}
            />
          )}
          {existingPolygons && (
            <LeafletPolygon positions={existingPolygons} color="red" />
          )}
        </FeatureGroup>
      </MapContainer>
      {createdLayer && (
        <Button
          type="primary"
          style={{ position: "absolute", bottom: 40, left: 40, zIndex: 400 }}
          onClick={handleReset}
        >
          Reset
        </Button>
      )}
    </>
  );
};

export default Map;
