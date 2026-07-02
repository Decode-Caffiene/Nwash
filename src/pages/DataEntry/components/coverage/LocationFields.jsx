import React from "react";
import { ClipboardList, MapPinned, Loader, PenTool, AlertCircle, CheckCircle, Eye, Edit3, Trash2 } from "lucide-react";
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
import CoverageAreaPreview from "./CoverageAreaPreview";

const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityType: "spatial.municipality-type",
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
    <section className="stat-card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-light to-white px-5 py-4 -mx-5 -mt-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <p className="text-sm text-text-secondary">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => {
          const key = `spatial.${slugify(field)}`;
          const isCoverageAreaField = field.toLowerCase().includes("coverage");
          const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
          const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

          if (isCoverageAreaField) {
            const hasCoverageArea = !!values[LOCATION_FIELD_KEYS.coverageArea];
            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3 rounded-lg border border-surface-border bg-surface/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
                  <label className="text-sm font-medium text-text-primary">
                    Coverage Area (Map-based)
                  </label>
                </div>
                {coverageAreaInfo && (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 flex gap-2 items-center">
                      <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-800 flex-1">{coverageAreaInfo}</p>
                    </div>
                    {hasCoverageArea && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDrawClick();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                          title="View coverage area"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={onDrawClick}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                          title="Edit coverage area"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleFieldChange(key, "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200"
                          title="Delete coverage area"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {hasCoverageArea && (
                  <CoverageAreaPreview
                    geojson={values[LOCATION_FIELD_KEYS.coverageArea]}
                    district={values[LOCATION_FIELD_KEYS.district]}
                    municipalityName={values[LOCATION_FIELD_KEYS.municipalityName]}
                    onEdit={onDrawClick}
                    onClear={() => {
                      handleFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
                    }}
                  />
                )}

                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={onDrawClick}
                  disabled={!canOpenMap}
                >
                  <PenTool size={16} />
                  {canOpenMap
                    ? hasCoverageArea
                      ? "Edit Coverage Area"
                      : "Draw Coverage Area on Map"
                    : "Select municipality first"}
                </Button>
              </div>
            );
          }

          if (isGpsLatitudeField || isGpsLongitudeField) {
            if (isGpsLongitudeField) return null;

            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-brand-primary" />
                  <label className="text-sm font-medium text-text-primary">
                    GPS Coordinates
                  </label>
                </div>
                {gpsError && (
                  <div className="mb-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {gpsError}
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2">
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
                  className="mt-3 w-full border-brand-primary/30 text-brand-primary hover:bg-brand-light hover:border-brand-primary"
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
            <label key={key} htmlFor={key} className="block group">
              <span className="text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
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
