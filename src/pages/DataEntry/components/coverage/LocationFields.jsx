import React, { useState, useEffect, useRef } from "react";
import { ClipboardList, MapPinned, Loader, PenTool, AlertCircle, CheckCircle, Eye, Edit3, Trash2, X } from "lucide-react";
import Button from "../../../../components/common/Button";
import FormControl, { inputClass } from "../../components/common/FormControl";
import { slugify } from "../../utils/formUtils";
import { fieldTranslations } from "../../utils/translations";
import { calculateCoverageAreaStats } from "../../utils/geoUtils";
import {
  getDistrictOptions,
  getMunicipalityNameOptions,
  getMunicipalityTypeOptions,
  PROVINCES,
} from "../../utils/locationOptions";
import {
  validateLocationFields,
  validateGpsCoordinate,
} from "../../utils/formValidation";
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const prevErrorsRef = useRef({});
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";

  const validateForm = (currentValues) => {
    const errors = {};

    const locationErrors = validateLocationFields(currentValues);
    Object.assign(errors, locationErrors);

    const hasLocationData = Object.keys(locationErrors).length === 0;
    if (hasLocationData && !currentValues[LOCATION_FIELD_KEYS.coverageArea]) {
      errors[LOCATION_FIELD_KEYS.coverageArea] = "Coverage area is required";
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

    setFieldErrors(errors);
    return errors;
  };

  useEffect(() => {
    validateForm(values);
  }, [values]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isDetailsModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailsModalOpen]);

  // Remove real-time validation - validation only happens on form submission
  // This allows users to fill fields at their own pace without blocking errors

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

  if (isDetailsModalOpen) {
    return (
      <>
        {isDetailsModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const stats = calculateCoverageAreaStats(values[LOCATION_FIELD_KEYS.coverageArea]);
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition text-text-secondary z-10"
                    >
                      <X size={20} />
                    </button>

                    <div className="text-center pt-12 px-6">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 ring-4 ring-emerald-200/50">
                          <CheckCircle size={56} className="text-emerald-600" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold text-text-primary mb-2">
                        Coverage Area Saved!
                      </h2>
                      <p className="text-sm text-text-secondary mb-8">
                        Successfully recorded for the selected municipality
                      </p>
                    </div>

                    <div className="px-6 py-6 border-t border-surface-border bg-gray-50">
                      <h3 className="font-semibold text-text-primary mb-4 text-sm flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand-primary" />
                        Location Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">
                            Municipality
                          </span>
                          <span className="text-sm font-medium text-text-primary text-right">
                            {values[LOCATION_FIELD_KEYS.municipalityName] || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">
                            District
                          </span>
                          <span className="text-sm font-medium text-text-primary">
                            {district || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">
                            Province
                          </span>
                          <span className="text-sm font-medium text-text-primary">
                            {province || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6 border-t border-surface-border">
                      <p className="text-xs text-text-secondary mb-4 font-medium">
                        COVERAGE STATISTICS
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 text-center">
                          <p className="text-xs text-text-secondary mb-2">
                            Areas
                          </p>
                          <p className="text-3xl font-bold text-brand-primary">
                            {stats.features}
                          </p>
                        </div>
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 text-center">
                          <p className="text-xs text-text-secondary mb-2">
                            Perimeter
                          </p>
                          <p className="text-2xl font-bold text-brand-primary">
                            {stats.perimeter.toFixed(2)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            km
                          </p>
                        </div>
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 text-center">
                          <p className="text-xs text-text-secondary mb-2">
                            Area
                          </p>
                          <p className="text-2xl font-bold text-brand-primary">
                            {stats.area.toFixed(2)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            km²
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6 border-t border-surface-border bg-gray-50 rounded-b-2xl">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => setIsDetailsModalOpen(false)}
                      >
                        Back to form
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </>
    );
  }

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
            {fields.filter(f => !['Coverage Area', 'Province Name', 'District', 'Municipality Name', 'GPS Latitude', 'GPS Longitude'].includes(f)).map((field) => {
              const key = `spatial.${slugify(field)}`;
              return (
                <label key={key} htmlFor={`coverage-${key}`} className="block group">
                  <span className="text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`coverage-${key}`}
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
            Location & Coverage
          </h3>
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-surface-border bg-white/50 p-5 md:grid-cols-2">
              {fields.map((field) => {
                const key = `spatial.${slugify(field)}`;
                const isLocationField = ['Province Name', 'District', 'Municipality Name'].includes(field);
                const isCoverageAreaField = field.toLowerCase().includes("coverage");
                const isGpsField = field.includes("GPS");

                if (isCoverageAreaField || isGpsField || !isLocationField) {
                  return null;
                }

                return (
                  <label key={key} htmlFor={`coverage-${key}`} className="block group">
                    <span className="text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                      {fieldTranslations[language][field] || field}
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                    <FormControl
                      id={`coverage-${key}`}
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

            {fields.map((field) => {
              const key = `spatial.${slugify(field)}`;
              const isCoverageAreaField = field.toLowerCase().includes("coverage");
              const isGpsLatitudeField = key === LOCATION_FIELD_KEYS.gpsLatitude;
              const isGpsLongitudeField = key === LOCATION_FIELD_KEYS.gpsLongitude;

              if (!isCoverageAreaField && !isGpsLatitudeField && !isGpsLongitudeField) {
                return null;
              }

              if (isGpsLatitudeField) {
                return (
                  <div key={key} className="rounded-xl border border-surface-border bg-white/50 p-5">
                    <label className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-primary" />
                      GPS Coordinates
                      <span className="text-red-500">*</span>
                    </label>
                    {gpsError && (
                      <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {gpsError}
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-2 mb-3">
                      <div>
                        <label htmlFor="coverage-gps-latitude" className="text-xs font-medium text-text-secondary">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="coverage-gps-latitude"
                          type="number"
                          step="0.000001"
                          value={values[LOCATION_FIELD_KEYS.gpsLatitude] || ""}
                          onChange={(e) => handleFieldChange(LOCATION_FIELD_KEYS.gpsLatitude, e.target.value)}
                          className={inputClass}
                          placeholder="e.g., 27.7172"
                        />
                      </div>
                      <div>
                        <label htmlFor="coverage-gps-longitude" className="text-xs font-medium text-text-secondary">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="coverage-gps-longitude"
                          type="number"
                          step="0.000001"
                          value={values[LOCATION_FIELD_KEYS.gpsLongitude] || ""}
                          onChange={(e) => handleFieldChange(LOCATION_FIELD_KEYS.gpsLongitude, e.target.value)}
                          className={inputClass}
                          placeholder="e.g., 85.3240"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
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

              if (isGpsLongitudeField) {
                return null;
              }

              if (isCoverageAreaField) {
                const hasCoverageArea = !!values[LOCATION_FIELD_KEYS.coverageArea];
                return (
                  <div key={key} className="rounded-xl border border-surface-border bg-white/50 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
                      <label className="text-sm font-medium text-text-primary">
                        Coverage Area (Map-based) <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {coverageAreaInfo && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsDetailsModalOpen(true)}
                          className="w-full rounded-lg bg-emerald-50 p-3 border border-emerald-200 flex gap-2 items-center hover:bg-emerald-100 transition cursor-pointer text-left"
                          title="Click to view details"
                        >
                          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                          <p className="text-sm text-emerald-800 flex-1">{coverageAreaInfo}</p>
                        </button>
                        {hasCoverageArea && (
                          <div className="flex gap-2 flex-wrap">
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

              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
