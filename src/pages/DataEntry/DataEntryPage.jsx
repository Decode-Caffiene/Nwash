import { useMemo, useState } from "react";
import { Send } from "lucide-react";

import Button from "../../components/common/Button";
import DataEntryHeader from "./components/DataEntryHeader";
import KpiFormSection from "./components/KpiFormSection";
import PreviewModal from "./components/PreviewModal";
import ServiceProviderSection from "./components/ServiceProviderSection";
import { dataEntryForms } from "./dataEntryForms";

function DataEntryPage() {
  const [activeFormId, setActiveFormId] = useState(dataEntryForms[0].id);
  const [formValues, setFormValues] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      formType: activeForm.id,
      ...currentValues,
    };

    console.log("Data entry form submitted", payload);
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
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <ServiceProviderSection
          title={activeForm.detailsTitle}
          subtitle={activeForm.detailsSubtitle}
          fields={activeForm.detailFields}
          values={currentValues}
          onFieldChange={updateField}
        />

        <KpiFormSection
          form={activeForm}
          values={currentValues}
          onFieldChange={updateField}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={openPreview}>
            Preview
          </Button>

          <Button type="submit">
            <Send size={16} className="mr-2" />
            Submit Form
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
