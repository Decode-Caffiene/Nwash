
import { useMemo, useState, useEffect, useRef } from "react";

import { Send, Loader, AlertCircle, CheckCircle } from "lucide-react";

import Button from "../../components/common/Button";
import DataEntryHeader from "./components/common/DataEntryHeader";
import KpiFormSection from "./components/common/KpiFormSection";
import PreviewModal from "./components/common/PreviewModal";
import ServiceProviderSection from "./components/service-provider/ServiceProviderSection";
import CoverageAreaForm from "./components/coverage/CoverageAreaForm";
import { dataEntryForms } from "./data/dataEntryForms";
import { saveServiceProviderForm } from "../../api/serviceProviderApi";

const FIELD_MAP = {
  "Name": "name",
  "Email": "email",
  "Phone Number": "phone",
  "Designation": "designation",

  "Name of Service Provider": "wsucName",

  "Province Name": "province",
  "District": "district",
  "Municipality Name": "municipality",
  "Number of wards covered": "wardsCovered",
  "Coverage Area": "coordinates",
  "GPS Latitude": "latitude",
  "GPS Longitude": "longitude",
};

const SPATIAL_MAP = {
  "name": "name",
  "email": "email",
  "designation": "designation",

  "name-of-service-provider": "wsucName",

  "province-name": "province",
  "district": "district",
  "municipality-name": "municipality",
  "number-of-wards-covered": "wardsCovered",
  "phone-number": "phone",
  "gps-latitude": "latitude",
  "gps-longitude": "longitude",
};

const COVERAGE_AREA_KEY = "spatial.coverage-area-geojson";

const setNested = (obj, path, value) => {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
};

const normalizeSubmitPayload = (formType, values) => {
  const payload = { formType };

  Object.entries(values).forEach(([key, value]) => {
    if (key === "undefined") return;
    if (value === "" || value === null || value === undefined) return;
    if (typeof value === "string" && value === "undefined") return;

    if (key === COVERAGE_AREA_KEY) {
      let geojson = null;

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.type === "FeatureCollection") {
            geojson = parsed;
          }
        } catch {
          // skip invalid coverage area string
        }
      } else if (value && typeof value === "object") {
        geojson = value;
      }

      const geometries = geojson?.features
        ?.map((feature) => feature.geometry)
        .filter(Boolean);

      if (geometries?.length === 1) {
        payload.geometry = {
          type: geometries[0].type,
          coordinates: geometries[0].coordinates,
        };
      } else if (geometries?.length > 1) {
        // Multiple shapes drawn on the map -> combine into one MultiPolygon
        // geometry so the backend's single geometry field can still store it.
        payload.geometry = {
          type: "MultiPolygon",
          coordinates: geometries.flatMap((geometry) =>
            geometry.type === "MultiPolygon"
              ? geometry.coordinates
              : [geometry.coordinates],
          ),
        };
      }
      return;
    }

    // Convert Yes/No to 1/0 for NRW_Score KPI fields that expect numbers
    let normalizedValue = value;
    if (key.startsWith("non_revenue_water.") && key.match(/KPI_\d+$/) && typeof value === "string") {
      if (value === "Yes" || value === "हो") normalizedValue = 1;
      else if (value === "No" || value === "होइन") normalizedValue = 0;
    }

    setNested(payload, key, normalizedValue);
  });

  // Flatten detail fields from formType group to top level
  const formGroup = payload[formType];
  if (formGroup) {
    Object.entries(formGroup).forEach(([fieldName, fieldValue]) => {
      const mappedKey = FIELD_MAP[fieldName] || fieldName;
      payload[mappedKey] = fieldValue;
    });
    delete payload[formType];
  }

  // Flatten spatial fields to top level
  const spatialGroup = payload.spatial;
  if (spatialGroup) {
    Object.entries(spatialGroup).forEach(([fieldName, fieldValue]) => {
      const mappedKey = SPATIAL_MAP[fieldName];
      if (mappedKey === "") return;
      payload[mappedKey || fieldName] = fieldValue;
    });
    delete payload.spatial;
  }

  
  if (!payload.geometry && payload.latitude && payload.longitude) {
    const lat = parseFloat(payload.latitude);
    const lon = parseFloat(payload.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      payload.geometry = { type: "Point", coordinates: [lon, lat] };
    }
  }

  return payload;
};

function DataEntryPage() {
  const formRef = useRef(null);
  const [activeFormId, setActiveFormId] = useState(dataEntryForms[0].id);
  const [formValues, setFormValues] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [language, setLanguage] = useState("eng");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [submitMessage, setSubmitMessage] = useState("");

  const activeForm = useMemo(
    () =>
      dataEntryForms.find((form) => form.id === activeFormId) ||
      dataEntryForms[0],
    [activeFormId],
  );

  const currentValues = formValues[activeForm.id] || {};

  const updateField = (key, value) => {
    setFormValues((current) => ({
      ...current,
      [activeForm.id]: {
        ...current[activeForm.id],
        [key]: value,
      },
    }));
    // Clear success or error messages when user starts editing
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const backendFormType = activeForm.id;
      const payload = normalizeSubmitPayload(backendFormType, currentValues);
      console.log("=== FORM PAYLOAD (normalized object) ===", JSON.stringify(payload, null, 2));

      const response = await saveServiceProviderForm(payload, currentValues);

      setSubmitStatus("success");
      setSubmitMessage(
        response?.message || "Form submitted successfully!"
      );

      // Reset form after success
      setTimeout(() => {
        setFormValues({});
        if (formRef.current) {
          formRef.current.reset();
        }
        setSubmitStatus(null);
        setSubmitMessage("");
      }, 2000);
    } catch (error) {
      console.error("=== FORM SUBMIT ERROR ===", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      setSubmitStatus("error");
      setSubmitMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit form. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Clear messages when switching forms
  useEffect(() => {
    setSubmitStatus(null);
    setSubmitMessage("");
  }, [activeForm.id]);

  // Clear messages on page load
  useEffect(() => {
    setSubmitStatus(null);
    setSubmitMessage("");
  }, []);

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleDrawStart = () => {
    setSubmitStatus(null);
    setSubmitMessage("");
  };

  return (
    <div className="space-y-6">
      <DataEntryHeader
        forms={dataEntryForms}
        activeFormId={activeForm.id}
        onFormChange={setActiveFormId}
        language={language}
        setLanguage={setLanguage}
      />

      {submitStatus && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            submitStatus === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {submitStatus === "success" ? (
            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div>
            <p
              className={`font-semibold ${
                submitStatus === "success"
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}
            >
              {submitStatus === "success" ? "Success" : "Error"}
            </p>
            <p
              className={`text-sm mt-1 ${
                submitStatus === "success"
                  ? "text-emerald-800"
                  : "text-red-800"
              }`}
            >
              {submitMessage}
            </p>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
        {activeForm.useMapSection ? (
          <CoverageAreaForm
            title={activeForm.detailsTitle}
            subtitle={activeForm.detailsSubtitle}
            fields={activeForm.detailFields}
            values={currentValues}
            onFieldChange={updateField}
            language={language}
            onDrawStart={handleDrawStart}
          />

        ) : (
          <ServiceProviderSection
            title={activeForm.detailsTitle}
            subtitle={activeForm.detailsSubtitle}
            fields={activeForm.detailFields}
            values={currentValues}
            onFieldChange={updateField}
            language={language}
          />
        )}

        <KpiFormSection
          form={activeForm}
          values={currentValues}
          onFieldChange={updateField}
          language={language}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            type="button"
            onClick={openPreview}
            disabled={submitting}
          >
            Preview
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Form
              </>
            )}
          </Button>
        </div>
      </form>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formTitle={activeForm.title}
        values={currentValues}
      />
    </div>
  );
}

export default DataEntryPage;
