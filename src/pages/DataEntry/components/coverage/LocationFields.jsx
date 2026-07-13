import React, { useState, useEffect, useRef } from "react";
import { ClipboardList, PenTool, AlertCircle, CheckCircle, Eye, Edit3, Trash2, X } from "lucide-react";
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
import { validateLocationFields, validateEmail, validatePhone } from "../../utils/formValidation";
import CoverageAreaPreview from "./CoverageAreaPreview";

const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityType: "spatial.municipality-type",
  municipalityName: "spatial.municipality-name",
  coverageArea: "spatial.coverage-area-geojson",
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

    // Validate email and phone fields
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

  if (isDetailsModalOpen) {
    return (
      <>
        {isDetailsModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-md my-4 sm:my-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const stats = calculateCoverageAreaStats(values[LOCATION_FIELD_KEYS.coverageArea]);
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-text-secondary z-10"
                    >
                      <X size={18} className="sm:hidden" />
                      <X size={20} className="hidden sm:block" />
                    </button>

                    <div className="text-center pt-8 sm:pt-12 px-4 sm:px-6">
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-5 ring-4 ring-emerald-200/50">
                          <CheckCircle size={40} className="text-emerald-600 sm:hidden" />
                          <CheckCircle size={56} className="text-emerald-600 hidden sm:block" />
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                        Coverage Area Saved!
                      </h2>
                      <p className="text-xs sm:text-sm text-text-secondary mb-6 sm:mb-8">
                        Successfully recorded for the selected municipality
                      </p>
                    </div>

                    <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-surface-border bg-gray-50">
                      <h3 className="font-semibold text-text-primary mb-3 sm:mb-4 text-xs sm:text-sm flex items-center gap-2">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                        Location Details
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-text-secondary">
                            Municipality
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-text-primary text-right">
                            {values[LOCATION_FIELD_KEYS.municipalityName] || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-text-secondary">
                            District
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-text-primary">
                            {district || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-text-secondary">
                            Province
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-text-primary">
                            {province || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-surface-border">
                      <p className="text-xs text-text-secondary mb-3 sm:mb-4 font-medium">
                        COVERAGE STATISTICS
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-2 sm:p-4 text-center">
                          <p className="text-xs text-text-secondary mb-1 sm:mb-2">
                            Areas
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-brand-primary">
                            {stats.features}
                          </p>
                        </div>
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-2 sm:p-4 text-center">
                          <p className="text-xs text-text-secondary mb-1 sm:mb-2">
                            Perimeter
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-brand-primary">
                            {stats.perimeter.toFixed(2)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            km
                          </p>
                        </div>
                        <div className="rounded-lg border border-brand-primary/10 bg-gradient-to-br from-blue-50 to-blue-50/50 p-2 sm:p-4 text-center">
                          <p className="text-xs text-text-secondary mb-1 sm:mb-2">
                            Area
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-brand-primary">
                            {stats.area.toFixed(2)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            km²
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-surface-border bg-gray-50 rounded-b-lg sm:rounded-b-2xl">
                      <Button
                        type="button"
                        className="w-full text-xs sm:text-sm"
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
            {fields.filter(f => !['Coverage Area', 'Province Name', 'District', 'Municipality Name', 'GPS Latitude', 'GPS Longitude'].includes(f)).map((field) => {
              const key = `spatial.${slugify(field)}`;
              return (
                <label key={key} htmlFor={`coverage-${key}`} className="block group">
                  <span className="text-xs sm:text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                    {fieldTranslations[language][field] || field}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <FormControl
                    id={`coverage-${key}`}
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
            <span>Location & Coverage</span>
          </h3>
          <div className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 rounded-lg sm:rounded-xl border border-surface-border bg-white/50 p-3 sm:p-5 grid-cols-1 sm:grid-cols-2">
              {fields.map((field) => {
                const key = `spatial.${slugify(field)}`;
                const isLocationField = ['Province Name', 'District', 'Municipality Name'].includes(field);
                const isCoverageAreaField = field.toLowerCase().includes("coverage");

                if (isCoverageAreaField || !isLocationField) {
                  return null;
                }

                return (
                  <label key={key} htmlFor={`coverage-${key}`} className="block group">
                    <span className="text-xs sm:text-sm font-medium text-text-primary group-focus-within:text-brand-primary transition-colors">
                      {fieldTranslations[language][field] || field}
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                    <FormControl
                      id={`coverage-${key}`}
                      label={fieldTranslations[language][field] || field}
                      value={values[key] || ""}
                      onChange={(value) => handleFieldChange(key, value)}
                      required={key === "spatial.email"}
                      error={fieldErrors[key]}
                      {...getLocationControlProps(key)}
                    />
                    {fieldErrors[key] && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>
                    )}
                  </label>
                );
              })}
            </div>

            {fields.map((field) => {
              const key = `spatial.${slugify(field)}`;
              const isCoverageAreaField = field.toLowerCase().includes("coverage");

              if (!isCoverageAreaField) {
                return null;
              }

              if (isCoverageAreaField) {
                const hasCoverageArea = !!values[LOCATION_FIELD_KEYS.coverageArea];
                return (
                  <div key={key} className="rounded-lg sm:rounded-xl border border-surface-border bg-white/50 p-3 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-primary" />
                      <label className="text-xs sm:text-sm font-medium text-text-primary">
                        Coverage Area (Map-based) <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {coverageAreaInfo && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsDetailsModalOpen(true)}
                          className="w-full rounded-lg bg-emerald-50 p-2 sm:p-3 border border-emerald-200 flex gap-2 items-center hover:bg-emerald-100 transition cursor-pointer text-left"
                          title="Click to view details"
                        >
                          <CheckCircle size={14} className="text-emerald-600 flex-shrink-0 sm:hidden" />
                          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 hidden sm:block" />
                          <p className="text-xs sm:text-sm text-emerald-800 flex-1">{coverageAreaInfo}</p>
                        </button>
                        {hasCoverageArea && (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                onDrawClick();
                              }}
                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                              title="View coverage area"
                            >
                              <Eye size={12} className="sm:hidden" />
                              <Eye size={14} className="hidden sm:block" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              type="button"
                              onClick={onDrawClick}
                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                              title="Edit coverage area"
                            >
                              <Edit3 size={12} className="sm:hidden" />
                              <Edit3 size={14} className="hidden sm:block" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleFieldChange(LOCATION_FIELD_KEYS.coverageArea, "");
                              }}
                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200"
                              title="Delete coverage area"
                            >
                              <Trash2 size={12} className="sm:hidden" />
                              <Trash2 size={14} className="hidden sm:block" />
                              <span className="hidden sm:inline">Delete</span>
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
                      className="w-full gap-1 sm:gap-2 text-xs sm:text-sm"
                      onClick={onDrawClick}
                      disabled={!canOpenMap}
                    >
                      <PenTool size={14} className="sm:hidden" />
                      <PenTool size={16} className="hidden sm:block" />
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
