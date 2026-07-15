import { useMemo } from "react";
import { Loader, Send } from "lucide-react";

import Modal from "../../../../components/common/Modal";
import Button from "../../../../components/common/Button";
import { formatNumber } from "../../../../utils/formatNumber";
import { slugify } from "../../utils/formUtils";
import {
  fieldTranslations,
  sectionTranslations,
  questionTranslations,
} from "../../utils/translations";
import { calculateCoverageAreaStats } from "../../utils/geoUtils";

const CONTACT_FIELDS = ["Name", "Email", "Phone Number", "Designation"];
const LOCATION_FIELDS = [
  "Name of Service Provider",
  "Province Name",
  "District",
  "Municipality Name",
];

function formatValue(value) {
  if (value instanceof File) return value.name;
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function buildDetailItems(form, values, language) {
  const fields = form.detailFields || [];
  const contact = [];
  const location = [];

  fields.forEach((field) => {
    const isCoverageField = field.toLowerCase().includes("coverage");
    const key = isCoverageField
      ? "spatial.coverage-area-geojson"
      : `spatial.${slugify(field)}`;
    const value = values[key];
    const label = fieldTranslations[language]?.[field] || field;

    if (isCoverageField) {
      const stats = calculateCoverageAreaStats(value);
      if (stats.features > 0) {
        location.push({
          key,
          label,
          value: `${stats.features} shape(s) drawn — ${stats.area.toFixed(2)} km²`,
        });
      }
      return;
    }

    if (!hasValue(value)) return;

    const item = { key, label, value: formatValue(value) };
    if (CONTACT_FIELDS.includes(field)) contact.push(item);
    else if (LOCATION_FIELDS.includes(field)) location.push(item);
  });

  return { contact, location };
}

function buildKpiSections(form, values, language) {
  return form.sections
    .map((section) => {
      const items = section.questions
        .map((question, index) => {
          const key = `${section.sectionKey}.KPI_${index + 1}`;
          const remarksKey = `${section.sectionKey}.KPI_${index + 1}_Remark`;
          const answer = values[key];
          const remark = values[remarksKey];

          if (!hasValue(answer) && !hasValue(remark)) return null;

          return {
            key,
            question: questionTranslations[language]?.[question] || question,
            answer: hasValue(answer) ? formatValue(answer) : null,
            remark: hasValue(remark) ? formatValue(remark) : null,
            remarksKey,
          };
        })
        .filter(Boolean);

      if (items.length === 0) return null;

      return {
        title: sectionTranslations[language]?.[section.title] || section.title,
        items,
      };
    })
    .filter(Boolean);
}

function buildOtherItems(values, shownKeys) {
  return Object.entries(values)
    .filter(([key, value]) => hasValue(value) && !shownKeys.has(key))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value: formatValue(value) }));
}

function DetailGroup({ title, items }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
        {title}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-surface-border bg-surface p-3"
          >
            <div className="text-xs font-medium text-text-secondary">
              {item.label}
            </div>
            <div className="text-sm font-medium text-text-primary">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewModal({
  isOpen,
  onClose,
  form,
  values,
  onConfirm,
  submitting = false,
  language = "eng",
}) {
  const { contact, location } = useMemo(
    () => buildDetailItems(form, values, language),
    [form, values, language],
  );
  const kpiSections = useMemo(
    () => buildKpiSections(form, values, language),
    [form, values, language],
  );
  const otherItems = useMemo(() => {
    const shownKeys = new Set([
      ...contact.map((item) => item.key),
      ...location.map((item) => item.key),
      ...kpiSections.flatMap((section) =>
        section.items.flatMap((item) => [item.key, item.remarksKey]),
      ),
    ]);
    return buildOtherItems(values, shownKeys);
  }, [values, contact, location, kpiSections]);

  const isEmpty =
    contact.length === 0 &&
    location.length === 0 &&
    kpiSections.length === 0 &&
    otherItems.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${form.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Edit
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Confirm & Submit
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {isEmpty ? (
          <p className="text-sm text-text-secondary">No data entered yet.</p>
        ) : (
          <>
            <DetailGroup
              title="Contact Information of Focal Person"
              items={contact}
            />
            <DetailGroup title="Location & Coverage" items={location} />

            {kpiSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-lg border border-surface-border bg-surface p-3"
                    >
                      <div className="text-xs font-medium text-text-secondary">
                        {item.question}
                      </div>
                      {item.answer && (
                        <div className="text-sm font-medium text-text-primary">
                          {item.answer}
                        </div>
                      )}
                      {item.remark && (
                        <div className="mt-1 text-xs text-text-secondary">
                          Remark: {item.remark}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <DetailGroup title="Additional Details" items={otherItems.map((item) => ({ key: item.key, label: item.key, value: item.value }))} />
          </>
        )}
      </div>
    </Modal>
  );
}

export default PreviewModal;
