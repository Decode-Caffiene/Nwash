import { useState, useEffect, useRef } from "react";
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
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";

  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const [isWardTraceOpen, setIsWardTraceOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const prevErrorsRef = useRef({});

  const validateForm = (currentValues) => {
    const errors = {};

    const locationErrors = validateLocationFields(currentValues);
    Object.assign(errors, locationErrors);

    const hasLocationData = Object.keys(locationErrors).length === 0;
    if (hasLocationData && !currentValues[LOCATION_FIELD_KEYS.wardsCovered]) {
      errors[LOCATION_FIELD_KEYS.wardsCovered] = "Ward numbers are required";
    }

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
    return errors;
  };

  useEffect(() => {
    validateForm(values);
  }, [values]);

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
    <section className="space-y-6">
      <div className="rounded-xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 shadow-sm">
            <ClipboardList size={24} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <div className="h-1 w-1 rounded-full bg-brand-primary" />
            Contact Information
          </h3>
          <div className="grid gap-4 rounded-xl border border-surface-border bg-white/50 p-5 md:grid-cols-2">
            {fields.filter(f => !['Province Name', 'District', 'Municipality Name', 'Number of wards covered', 'GPS Latitude', 'GPS Longitude'].includes(f)).map((field) => {
              const key = `spatial.${slugify(field)}`;
              return (
                <label key={key} htmlFor={`provider-${key}`} className="block group">
                  <span className="text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`provider-${key}`}
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
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <div className="h-1 w-1 rounded-full bg-brand-primary" />
            Location
          </h3>
          <div className="grid gap-4 rounded-xl border border-surface-border bg-white/50 p-5 md:grid-cols-2">
            {fields.map((field) => {
              const key = `spatial.${slugify(field)}`;
              const isWardsCoveredField = key === LOCATION_FIELD_KEYS.wardsCovered;
              const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
              const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

              if (!isWardsCoveredField && !isGpsLatitudeField && !isGpsLongitudeField &&
                  !['Province Name', 'District', 'Municipality Name', 'Number of wards covered', 'GPS Latitude', 'GPS Longitude'].includes(field)) {
                return null;
              }

              if (isWardsCoveredField) {
                return (
                  <div key={key} className="md:col-span-2">
                    <label htmlFor={key} className="text-sm font-medium text-text-primary">
                      {fieldTranslations[language][field] || field}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id={key}
                        type="text"
                        value={values[key] || ""}
                        onChange={(event) => handleFieldChange(key, event.target.value)}
                        className={`${inputClass} mt-0 flex-1`}
                        placeholder="Trace wards from map"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0 px-4"
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

              if (isGpsLatitudeField) {
                return (
                  <div key={key} className="md:col-span-2">
                    <label className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-primary" />
                      GPS Coordinates
                    </label>
                    {gpsError && (
                      <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {gpsError}
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label htmlFor="provider-gps-latitude" className="text-xs font-medium text-text-secondary">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="provider-gps-latitude"
                          type="number"
                          step="0.000001"
                          value={values[LOCATION_FIELD_KEYS.gpsLatitude] || ""}
                          onChange={(event) => handleFieldChange(LOCATION_FIELD_KEYS.gpsLatitude, event.target.value)}
                          className={inputClass}
                          placeholder="e.g., 27.7172"
                        />
                      </div>
                      <div>
                        <label htmlFor="provider-gps-longitude" className="text-xs font-medium text-text-secondary">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="provider-gps-longitude"
                          type="number"
                          step="0.000001"
                          value={values[LOCATION_FIELD_KEYS.gpsLongitude] || ""}
                          onChange={(event) => handleFieldChange(LOCATION_FIELD_KEYS.gpsLongitude, event.target.value)}
                          className={inputClass}
                          placeholder="e.g., 85.3240"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full"
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

              if (isGpsLongitudeField) {
                return null;
              }

              return (
                <label key={key} htmlFor={`provider-${key}`} className="block group">
                  <span className="text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`provider-${key}`}
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
        </div>
      </div>

      <WardTraceModal
        isOpen={isWardTraceOpen}
        province={province}
        district={district}
        municipalityType={municipalityType}
        municipalityName={municipalityName}
        initialWards={parseWardValue(values[LOCATION_FIELD_KEYS.wardsCovered])}
        onClose={() => setIsWardTraceOpen(false)}
        onSave={(wards) => onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, wards.join(", "))}
      />
    </section>
  );
}

export default ServiceProviderSection;
