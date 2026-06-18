import { useState } from "react";
import { ClipboardList, MapPinned, Loader } from "lucide-react";

import Button from "../../../../components/common/Button";
import FormControl, { inputClass } from "../../components/common/FormControl";
import { slugify } from "../../utils/formUtils";
import WardTraceModal from "../../components/common/WardTraceModal";
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
  municipalityType: "spatial.municipality-type",
  municipalityName: "spatial.municipality-name",
  wardsCovered: "spatial.number-of-wards-covered",
  gpsLatitude: "spatial.gps-latitude",
  gpsLongitude: "spatial.gps-longitude",
};

const parseWardValue = (value) =>
  String(value || "")
    .split(",")
    .map((ward) => Number(ward.trim()))
    .filter((ward) => Number.isFinite(ward))
    .sort((first, second) => first - second);

function ServiceProviderSection({
  title = "Form Details",
  subtitle = "Basic information",
  fields,
  values,
  onFieldChange,
  language = "eng",
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";

  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const [isWardTraceOpen, setIsWardTraceOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const captureGPSLocation = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onFieldChange(LOCATION_FIELD_KEYS.gpsLatitude, latitude.toString());
        onFieldChange(LOCATION_FIELD_KEYS.gpsLongitude, longitude.toString());
        setIsGpsLoading(false);
        setGpsError(null);
      },
      (error) => {
        setGpsError(
          error.code === 1
            ? "Permission denied. Please enable location access."
            : "Unable to retrieve location. Please try again.",
        );
        setIsGpsLoading(false);
      },
    );
  };

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
        placeholder: district
          ? "Select municipality type"
          : "Select district first",
        disabled: !district,
      };
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      return {
        options: getMunicipalityNameOptions(district, municipalityType),
        placeholder: district
          ? "Select municipality name"
          : "Select district first",
        disabled: !district,
      };
    }

    return {};
  };

  const canTraceWards = province && district && municipalityName;

  const handleFieldChange = (key, value) => {
    onFieldChange(key, value);

    if (key === LOCATION_FIELD_KEYS.province) {
      onFieldChange(LOCATION_FIELD_KEYS.district, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.district) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityType) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
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
          const isWardsCoveredField = key === LOCATION_FIELD_KEYS.wardsCovered;
          const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
          const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

          if (isWardsCoveredField) {
            return (
              <div key={key} className="block">
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-text-primary"
                >
                  {fieldTranslations[language][field] || field}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id={key}
                    type="text"
                    value={values[key] || ""}
                    onChange={(event) =>
                      handleFieldChange(key, event.target.value)
                    }
                    className={`${inputClass} mt-0`}
                    placeholder="Trace wards from map"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-3"
                    onClick={() => setIsWardTraceOpen(true)}
                    disabled={!canTraceWards}
                  >
                    <MapPinned size={16} className="mr-2" />
                    Trace wards
                  </Button>
                </div>
              </div>
            );
          }

          if (isGpsLatitudeField || isGpsLongitudeField) {
            // Only render latitude field with the button, skip longitude rendering
            if (isGpsLongitudeField) {
              return null;
            }

            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3">
                <label className="text-sm font-medium text-text-primary">
                  GPS Coordinates
                </label>
                {gpsError && (
                  <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
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
                      onChange={(event) =>
                        handleFieldChange(
                          LOCATION_FIELD_KEYS.gpsLatitude,
                          event.target.value,
                        )
                      }
                      className={`${inputClass}`}
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
                      onChange={(event) =>
                        handleFieldChange(
                          LOCATION_FIELD_KEYS.gpsLongitude,
                          event.target.value,
                        )
                      }
                      className={`${inputClass}`}
                      placeholder="e.g., 85.3240"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={captureGPSLocation}
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
      <WardTraceModal
        isOpen={isWardTraceOpen}
        province={province}
        district={district}
        municipalityType={municipalityType}
        municipalityName={municipalityName}
        initialWards={parseWardValue(values[LOCATION_FIELD_KEYS.wardsCovered])}
        onClose={() => setIsWardTraceOpen(false)}
        onSave={(wards) =>
          onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, wards.join(", "))
        }
      />
    </section>
  );
}

export default ServiceProviderSection;
