import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { Check, X } from "lucide-react";

import Button from "../../../../components/common/Button";
import { getWardFeatures } from "../../utils/locationOptions";

const selectedStyle = {
  color: "#047857",
  fillColor: "#10b981",
  fillOpacity: 0.45,
  weight: 2,
};

const defaultStyle = {
  color: "#2563eb",
  fillColor: "#60a5fa",
  fillOpacity: 0.18,
  weight: 1,
};

const wardMarkerIcon = (wardNumber, isSelected) =>
  L.divIcon({
    className: "",
    html: `<div class="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold shadow-md ${
      isSelected
        ? "border-emerald-700 bg-emerald-600 text-white"
        : "border-blue-700 bg-white text-blue-700"
    }">${wardNumber}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const getCoordinatePairs = (coordinates) => {
  if (!Array.isArray(coordinates)) return [];

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    return [coordinates];
  }

  return coordinates.flatMap(getCoordinatePairs);
};

const getFeatureCenter = (feature) => {
  const pairs = getCoordinatePairs(feature.geometry.coordinates);
  const bounds = L.latLngBounds(
    pairs.map(([lng, lat]) => L.latLng(lat, lng)),
  );

  return bounds.getCenter();
};

function FitWardBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    const pairs = features.flatMap((feature) =>
      getCoordinatePairs(feature.geometry.coordinates),
    );

    if (!pairs.length) return;

    const bounds = L.latLngBounds(
      pairs.map(([lng, lat]) => L.latLng(lat, lng)),
    );

    map.fitBounds(bounds, { padding: [24, 24] });
  }, [features, map]);

  return null;
}

function WardTraceModal({
  isOpen,
  province,
  district,
  municipalityName,
  municipalityType,
  initialWards = [],
  onClose,
  onSave,
}) {
  const [selectedWards, setSelectedWards] = useState(initialWards);

  const wardFeatures = useMemo(
    () => getWardFeatures(district, municipalityName, municipalityType),
    [district, municipalityName, municipalityType],
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedWards(initialWards);
    }
  }, [initialWards, isOpen]);

  if (!isOpen) return null;

  const selectedWardSet = new Set(selectedWards);

  const toggleWard = (wardNumber) => {
    setSelectedWards((current) => {
      if (current.includes(wardNumber)) {
        return current.filter((ward) => ward !== wardNumber);
      }

      return [...current, wardNumber].sort((first, second) => first - second);
    });
  };

  const handleSave = () => {
    onSave(selectedWards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-surface-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Trace wards
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {province} / {district} / {municipalityName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-surface"
            aria-label="Close ward trace map"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="h-[68vh] min-h-[420px]">
            {wardFeatures.length ? (
              <MapContainer
                center={[28.3949, 84.124]}
                zoom={7}
                className="h-full w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitWardBounds features={wardFeatures} />
                {wardFeatures.map((feature) => {
                  const wardNumber = Number(feature.properties.NEW_WARD_N);
                  const isSelected = selectedWardSet.has(wardNumber);

                  return (
                    <GeoJSON
                      key={feature.properties.DDGNWW}
                      data={feature}
                      style={isSelected ? selectedStyle : defaultStyle}
                      eventHandlers={{
                        click: () => toggleWard(wardNumber),
                      }}
                    />
                  );
                })}
                {wardFeatures.map((feature) => {
                  const wardNumber = Number(feature.properties.NEW_WARD_N);
                  const isSelected = selectedWardSet.has(wardNumber);

                  return (
                    <Marker
                      key={`marker-${feature.properties.DDGNWW}`}
                      position={getFeatureCenter(feature)}
                      icon={wardMarkerIcon(wardNumber, isSelected)}
                      eventHandlers={{
                        click: () => toggleWard(wardNumber),
                      }}
                    >
                      <Tooltip>Ward {wardNumber}</Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center bg-surface text-sm text-text-secondary">
                No ward geometry found for this municipality.
              </div>
            )}
          </div>

          <aside className="border-t border-surface-border p-4 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-text-primary">
              Selected wards
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedWards.length ? (
                selectedWards.map((ward) => (
                  <button
                    key={ward}
                    type="button"
                    onClick={() => toggleWard(ward)}
                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-brand-light px-2 text-sm font-semibold text-brand-secondary"
                  >
                    {ward}
                  </button>
                ))
              ) : (
                <p className="text-sm text-text-secondary">
                  Click ward markers or ward areas on the map.
                </p>
              )}
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-surface-border p-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!wardFeatures.length}>
            <Check size={16} className="mr-2" />
            Save wards
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WardTraceModal;
