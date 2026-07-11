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

    if (!hasGpsLat) {
      errors[LOCATION_FIELD_KEYS.gpsLatitude] = "Latitude is required";
    } else {
      const latError = validateGpsCoordinate(hasGpsLat, "Latitude");
      if (latError) errors[LOCATION_FIELD_KEYS.gpsLatitude] = latError;
    }

    if (!hasGpsLon) {
      errors[LOCATION_FIELD_KEYS.gpsLongitude] = "Longitude is required";
    } else {
      const lonError = validateGpsCoordinate(hasGpsLon, "Longitude");
      if (lonError) errors[LOCATION_FIELD_KEYS.gpsLongitude] = lonError;
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

  const shouldShowError = (key) => {
    if (!fieldErrors[key]) return false;
    const value = values[key];
    const locationKeys = [
      LOCATION_FIELD_KEYS.province,
      LOCATION_FIELD_KEYS.district,
      LOCATION_FIELD_KEYS.municipalityType,
      LOCATION_FIELD_KEYS.municipalityName,
    ];
    if (key === "spatial.email" || key === "spatial.phone-number" || locationKeys.includes(key)) {
      return value && value.trim() !== "";
    }
    return true;
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="rounded-lg sm:rounded-xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-brand-primary/10 shadow-sm">
            <ClipboardList size={20} className="text-brand-primary sm:block hidden" />
            <ClipboardList size={18} className="text-brand-primary sm:hidden" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">{title}</h2>
            <p className="mt-1 text-xs sm:text-sm text-text-secondary">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-primary">
            <div className="h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
            <span>Contact Information</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 rounded-lg sm:rounded-xl border border-surface-border bg-white/50 p-3 sm:p-5 grid-cols-1 sm:grid-cols-2">
            {fields.filter(f => !['Province Name', 'District', 'Municipality Name', 'Number of wards covered', 'GPS Latitude', 'GPS Longitude'].includes(f)).map((field) => {
              const key = `spatial.${slugify(field)}`;
              return (
                <label key={key} htmlFor={`provider-${key}`} className="block group">
                  <span className="text-xs sm:text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`provider-${key}`}
                    label={fieldTranslations[language][field] || field}
                    value={values[key] || ""}
                    onChange={(value) => handleFieldChange(key, value)}
                    required={key === "spatial.email"}
                    error={shouldShowError(key) ? fieldErrors[key] : null}
                    {...getLocationControlProps(key)}
                  />
                  {shouldShowError(key) && fieldErrors[key] && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-primary">
            <div className="h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
            <span>Location</span>
          </h3>
          <div className="grid gap-3 sm:gap-4 rounded-lg sm:rounded-xl border border-surface-border bg-white/50 p-3 sm:p-5 grid-cols-1 sm:grid-cols-2">
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
                  <div key={key} className="sm:col-span-2">
                    <label htmlFor={key} className="text-xs sm:text-sm font-medium text-text-primary">
                      {fieldTranslations[language][field] || field}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2 flex flex-col sm:flex-row gap-2">
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
                        className="shrink-0 w-full sm:w-auto px-3 sm:px-4 text-xs sm:text-sm"
                        onClick={() => setIsWardTraceOpen(true)}
                        disabled={!canTraceWards}
                      >
                        <MapPinned size={14} className="sm:mr-2 mr-1" />
                        <span className="hidden sm:inline">Trace wards</span>
                        <span className="sm:hidden">Trace</span>
                      </Button>
                    </div>
                    {fieldErrors[key] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>
                    )}
                  </div>
                );
              }

              if (isGpsLatitudeField) {
                return (
                  <div key={key} className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                      GPS Coordinates
                    </label>
                    {gpsError && (
                      <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2 sm:p-3 text-xs sm:text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{gpsError}</span>
                      </div>
                    )}
                    <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2">
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
                        {fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude] && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors[LOCATION_FIELD_KEYS.gpsLatitude]}</p>
                        )}
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
                        {fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude] && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors[LOCATION_FIELD_KEYS.gpsLongitude]}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full text-xs sm:text-sm"
                      onClick={captureGPSLocation}
                      disabled={isGpsLoading}
                    >
                      {isGpsLoading ? (
                        <>
                          <Loader size={14} className="sm:mr-2 mr-1 animate-spin" />
                          <span className="hidden sm:inline">Capturing Location...</span>
                          <span className="sm:hidden">Capturing...</span>
                        </>
                      ) : (
                        <>
                          <MapPinned size={14} className="sm:mr-2 mr-1" />
                          <span className="hidden sm:inline">Use Current Location</span>
                          <span className="sm:hidden">Current Location</span>
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
                  <span className="text-xs sm:text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`provider-${key}`}
                    label={fieldTranslations[language][field] || field}
                    value={values[key] || ""}
                    onChange={(value) => handleFieldChange(key, value)}
                    required={key === "spatial.email"}
                    error={shouldShowError(key) ? fieldErrors[key] : null}
                    {...getLocationControlProps(key)}
                  />
                  {shouldShowError(key) && fieldErrors[key] && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>
                  )}
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
