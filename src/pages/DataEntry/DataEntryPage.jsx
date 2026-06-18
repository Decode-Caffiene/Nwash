import { useMemo, useState } from "react";
import { Send, Loader, AlertCircle, CheckCircle } from "lucide-react";

import Button from "../../components/common/Button";
import DataEntryHeader from "./components/common/DataEntryHeader";
import KpiFormSection from "./components/common/KpiFormSection";
import PreviewModal from "./components/common/PreviewModal";
import ServiceProviderSection from "./components/service-provider/ServiceProviderSection";
import CoverageAreaForm from "./components/coverage/CoverageAreaForm";
import { dataEntryForms } from "./data/dataEntryForms";
import { saveServiceProviderForm } from "../../api/serviceProviderApi";

const COVERAGE_AREA_KEY = "spatial.coverage-area-geojson";

const normalizeSubmitPayload = (formType, values) => {
  const payload = {
    formType,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (key === "undefined") return;

    if (key === COVERAGE_AREA_KEY && typeof value === "string") {
      try {
        payload[key] = JSON.parse(value);
      } catch {
        payload[key] = value;
      }
      return;
    }

    payload[key] = value;
  });

  return payload;
};

function DataEntryPage() {
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const backendFormType = activeForm.useMapSection
        ? "service-provider"
        : activeForm.id;
      const payload = normalizeSubmitPayload(backendFormType, currentValues);

      const response = await saveServiceProviderForm(payload);

      setSubmitStatus("success");
      setSubmitMessage(
        response?.message || "Form submitted successfully!"
      );

      // Reset form after success
      setTimeout(() => {
        setFormValues({});
        setSubmitStatus(null);
        setSubmitMessage("");
      }, 2000);
    } catch (error) {
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

  const openPreview = () => {
    setIsPreviewOpen(true);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeForm.useMapSection ? (
          <CoverageAreaForm
            title={activeForm.detailsTitle}
            subtitle={activeForm.detailsSubtitle}
            fields={activeForm.detailFields}
            values={currentValues}
            onFieldChange={updateField}
            language={language}
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
