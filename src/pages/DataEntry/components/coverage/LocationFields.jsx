import React from "react";
import { ClipboardList, MapPinned, Loader, PenTool, AlertCircle, CheckCircle } from "lucide-react";
import Button from "../../../../components/common/Button";
import FormControl, { inputClass } from "../../components/common/FormControl";
import { slugify } from "../../utils/formUtils";
import { fieldTranslations } from "../../utils/translations";
import {
  getDistrictOptions,
  getMunicipalityNameOptions,
  getMunicipalityTypeOptions,
  PROVINCES,
} from "../../utils/locationOptions";

const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityName: "spatial.municipality-name",
  coverageArea: "spatial.coverage-area-geojson",
  gpsLatitude: "spatial.gps-latitude",
  gpsLongitude: "spatial.gps-longitude",
};

export default function LocationFields({
  title,
  subtitle,
  fields,
  values,
  onFieldChange,
  language,
  canOpenMap,
  coverageAreaInfo,
  onDrawClick,
  isGpsLoading,
  gpsError,
  onCaptureGPS,
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";

  const getLocationControlProps = (key) => {
    if (key === LOCATION_FIELD_KEYS.province) {
      return {
        options: PROVINCES,
        placeholder: "Select province",
      };
    }

    if (key === LOCATION_FIELD_KEYS.district) {
      return {
        options: getDistrictOptions(province),
        placeholder: province ? "Select district" : "Select province first",
        disabled: !province,
      };
    }

    if (key === LOCATION_FIELD_KEYS.municipalityType) {
      return {
        options: getMunicipalityTypeOptions(district),
        placeholder: district ? "Select municipality type" : "Select district first",
        disabled: !district,
      };
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      return {
        options: getMunicipalityNameOptions(district, municipalityType),
        placeholder: district ? "Select municipality name" : "Select district first",
        disabled: !district,
      };
    }

    return {};
  };

  const handleFieldChange = (key, value) => {
    onFieldChange(key, value);

    if (key === LOCATION_FIELD_KEYS.province) {
      onFieldChange(LOCATION_FIELD_KEYS.district, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
    }

    if (key === LOCATION_FIELD_KEYS.district) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityType) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
    }
  };

  return (
    <section className="stat-card">
      <div className="flex items-center gap-3 border-b border-surface-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-secondary">
          <ClipboardList size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => {
          const key = `spatial.${slugify(field)}`;
          const isCoverageAreaField = field.toLowerCase().includes("coverage");
          const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
          const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

          if (isCoverageAreaField) {
            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3">
                <label className="text-sm font-medium text-text-primary">
                  Coverage Area (Map-based)
                </label>
                {coverageAreaInfo && (
                  <div className="mt-2 rounded bg-emerald-50 p-3 border border-emerald-200 flex gap-2">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800">{coverageAreaInfo}</p>
                  </div>
                )}
                <Button
                  type="button"
                  className="mt-3 w-full gap-2"
                  onClick={onDrawClick}
                  disabled={!canOpenMap}
                >
                  <PenTool size={16} />
                  {canOpenMap ? "Draw Coverage Area on Map" : "Select municipality first"}
                </Button>
              </div>
            );
          }

          if (isGpsLatitudeField || isGpsLongitudeField) {
            if (isGpsLongitudeField) return null;

            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3">
                <label className="text-sm font-medium text-text-primary">
                  GPS Coordinates
                </label>
                {gpsError && (
                  <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600 flex gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {gpsError}
                  </div>
                )}
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor={LOCATION_FIELD_KEYS.gpsLatitude}
                      className="text-xs font-medium text-text-secondary"
                    >
                      Latitude
                    </label>
                    <input
                      id={LOCATION_FIELD_KEYS.gpsLatitude}
                      type="number"
                      step="0.000001"
                      value={values[LOCATION_FIELD_KEYS.gpsLatitude] || ""}
                      onChange={(e) =>
                        handleFieldChange(LOCATION_FIELD_KEYS.gpsLatitude, e.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g., 27.7172"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={LOCATION_FIELD_KEYS.gpsLongitude}
                      className="text-xs font-medium text-text-secondary"
                    >
                      Longitude
                    </label>
                    <input
                      id={LOCATION_FIELD_KEYS.gpsLongitude}
                      type="number"
                      step="0.000001"
                      value={values[LOCATION_FIELD_KEYS.gpsLongitude] || ""}
                      onChange={(e) =>
                        handleFieldChange(LOCATION_FIELD_KEYS.gpsLongitude, e.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g., 85.3240"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={onCaptureGPS}
                  disabled={isGpsLoading}
                >
                  {isGpsLoading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Capturing Location...
                    </>
                  ) : (
                    <>
                      <MapPinned size={16} className="mr-2" />
                      Use Current Location
                    </>
                  )}
                </Button>
              </div>
            );
          }

          return (
            <label key={key} htmlFor={key} className="block">
              <span className="text-sm font-medium text-text-primary">
                {fieldTranslations[language][field] || field}
              </span>
              <FormControl
                id={key}
                label={fieldTranslations[language][field] || field}
                value={values[key] || ""}
                onChange={(value) => handleFieldChange(key, value)}
                required={key === "spatial.email"}
                {...getLocationControlProps(key)}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
