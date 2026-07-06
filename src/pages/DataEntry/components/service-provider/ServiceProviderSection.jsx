import { useState, useEffect } from "react";
import { ClipboardList, MapPinned, Loader, AlertCircle } from "lucide-react";

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
import {
  LOCATION_FIELD_KEYS,
  validateLocationFields,
  validateGpsCoordinate,
  validateEmail,
  validatePhone,
} from "../../utils/formValidation";

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
  onValidationChange,
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";

  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const [isWardTraceOpen, setIsWardTraceOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = (currentValues) => {
    const errors = {};

    // Validate location fields
    const locationErrors = validateLocationFields(currentValues);
    Object.assign(errors, locationErrors);

    // Validate wards covered if location fields are filled
    const hasLocationData = Object.keys(locationErrors).length === 0;
    if (hasLocationData && !currentValues[LOCATION_FIELD_KEYS.wardsCovered]) {
      errors[LOCATION_FIELD_KEYS.wardsCovered] = "Ward numbers are required";
    }

    // Validate GPS coordinates
    const hasGpsLat = currentValues[LOCATION_FIELD_KEYS.gpsLatitude];
    const hasGpsLon = currentValues[LOCATION_FIELD_KEYS.gpsLongitude];

    if (hasGpsLat || hasGpsLon) {
      if (!hasGpsLat) {
        errors[LOCATION_FIELD_KEYS.gpsLatitude] = "Latitude is required when providing GPS coordinates";
      } else {
        const latError = validateGpsCoordinate(hasGpsLat, "Latitude");
        if (latError) errors[LOCATION_FIELD_KEYS.gpsLatitude] = latError;
      }

      if (!hasGpsLon) {
        errors[LOCATION_FIELD_KEYS.gpsLongitude] = "Longitude is required when providing GPS coordinates";
      } else {
        const lonError = validateGpsCoordinate(hasGpsLon, "Longitude");
        if (lonError) errors[LOCATION_FIELD_KEYS.gpsLongitude] = lonError;
      }
    }

    // Validate other fields
    fields.forEach((field) => {
      const key = `spatial.${slugify(field)}`;

      if (key === "spatial.email") {
        const emailError = validateEmail(currentValues[key]);
        if (emailError) errors[key] = emailError;
      }

      if (key === "spatial.phone-number") {
        const phoneError = validatePhone(currentValues[key]);
        if (phoneError) errors[key] = phoneError;
      }
    });

    setFieldErrors(errors);
    onValidationChange?.(Object.keys(errors).length === 0, errors);
    return errors;
  };

  useEffect(() => {
    validateForm(values);
  }, [values, fields]);

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
          const isWardsCoveredField = key === LOCATION_FIELD_KEYS.wardsCovered;
          const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
          const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

          if (isWardsCoveredField) {
            return (
              <div key={key} className="block md:col-span-2 xl:col-span-3">
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-text-primary"
                >
                  {fieldTranslations[language][field] || field}
                </label>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <input
                      id={key}
                      type="text"
                      value={values[key] || ""}
                      onChange={(event) =>
                        handleFieldChange(key, event.target.value)
                      }
                      className={`${
                        fieldErrors[key]
                          ? "border-red-300 bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 hover:border-red-300 mt-0 w-full rounded-lg border"
                          : `${inputClass} mt-0`
                      }`}
                      placeholder="Trace wards from map"
                      aria-invalid={!!fieldErrors[key]}
                      aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
                    />
                    {fieldErrors[key] && (
                      <div id={`${key}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {fieldErrors[key]}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-4 border-brand-primary/30 text-brand-primary hover:bg-brand-light hover:border-brand-primary"
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
            if (isGpsLongitudeField) {
              return null;
            }

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
                      onChange={(event) =>
                        handleFieldChange(
                          LOCATION_FIELD_KEYS.gpsLatitude,
                          event.target.value,
                        )
                      }
                      className={
                        fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude]
                          ? "mt-2 w-full rounded-lg border border-red-300 bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 hover:border-red-300"
                          : inputClass
                      }
                      placeholder="e.g., 27.7172"
                      aria-invalid={!!fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude]}
                      aria-describedby={
                        fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude]
                          ? `${LOCATION_FIELD_KEYS.gpsLatitude}-error`
                          : undefined
                      }
                    />
                    {fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude] && (
                      <div
                        id={`${LOCATION_FIELD_KEYS.gpsLatitude}-error`}
                        className="mt-1 flex items-center gap-2 text-sm text-red-600"
                      >
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude]}
                      </div>
                    )}
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
                      className={
                        fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude]
                          ? "mt-2 w-full rounded-lg border border-red-300 bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 hover:border-red-300"
                          : inputClass
                      }
                      placeholder="e.g., 85.3240"
                      aria-invalid={!!fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude]}
                      aria-describedby={
                        fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude]
                          ? `${LOCATION_FIELD_KEYS.gpsLongitude}-error`
                          : undefined
                      }
                    />
                    {fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude] && (
                      <div
                        id={`${LOCATION_FIELD_KEYS.gpsLongitude}-error`}
                        className="mt-1 flex items-center gap-2 text-sm text-red-600"
                      >
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude]}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full border-brand-primary/30 text-brand-primary hover:bg-brand-light hover:border-brand-primary"
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
            <label key={key} htmlFor={key} className="block group">
              <span
                className={`text-sm font-medium transition-colors ${
                  fieldErrors[key]
                    ? "text-red-600"
                    : "text-text-primary group-focus-within:text-brand-primary"
                }`}
              >
                {fieldTranslations[language][field] || field}
              </span>
              <FormControl
                id={key}
                label={fieldTranslations[language][field] || field}
                value={values[key] || ""}
                onChange={(value) => handleFieldChange(key, value)}
                required={key === "spatial.email"}
                error={fieldErrors[key]}
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
