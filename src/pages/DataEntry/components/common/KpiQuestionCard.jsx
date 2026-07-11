import { useEffect } from "react";
import {
  questionTranslations,
  fieldTranslations,
} from "../../utils/translations";
import FormControl, { inputClass } from "./FormControl";

const YES_NO_OPTIONS_ENG = ["Yes", "No"];
const YES_NO_OPTIONS_NEP = ["हो", "होइन"];

// Upload field names expected by the backend (multer upload.fields config),
// matched against the question text.
const DOCUMENT_FIELDS = [
  { keyword: "business plan", name: "Business_Plan" },
  { keyword: "lab report", name: "Lab_Report" },
  { keyword: "pumping hours", name: "Logbook_For_Pumping_Hours" },
  { keyword: "audit report", name: "Annual_Audit_Report" },
  { keyword: "consumer complaint", name: "Logbook_For_Consumer_complaint" },
];

function KpiQuestionCard({
  formId,
  sectionTitle,
  sectionKey,
  question,
  index,
  values,
  onFieldChange,
  isGateKeepingQuestion,
  language = "eng",
}) {
  const kpiIndex = `KPI_${index + 1}`;
  const key = `${sectionKey}.${kpiIndex}`;
  const remarksKey = `${sectionKey}.KPI_${index + 1}_Remark`;
  const normalizedQuestion = question.toLowerCase();

  const documentFieldName =
    DOCUMENT_FIELDS.find(({ keyword }) => normalizedQuestion.includes(keyword))
      ?.name || null;
  const usesFileSource = Boolean(documentFieldName);
  const descriptionKey = documentFieldName || "documents";
  const currentAnswer = values[key];
  const isNoAnswer = currentAnswer === "No" || currentAnswer === "होइन";
  const showSourceExplanation = (isGateKeepingQuestion || usesFileSource) && !isNoAnswer;

  // Clear file when answer changes to "No"
  useEffect(() => {
    if (isNoAnswer && usesFileSource && values[descriptionKey]) {
      onFieldChange(descriptionKey, "");
    }
  }, [isNoAnswer, usesFileSource, descriptionKey, onFieldChange]);

  // Detect if this is a yes/no question
  const isNumberInput =
    sectionKey === "non_revenue_water" && (index === 1 || index === 2);

  const isYesNoQuestion =
    question.includes("(Y/N)") ||
    question.includes("(Yes/No)") ||
    question.includes("exist?") ||
    question.includes("report?") ||
    question.includes("conducted") ||
    question.includes("within limits?") ||
    question.includes("tested") ||
    question.includes("maintained") ||
    question.includes("exists?") ||
    question.includes("mechanism");

  // Get yes/no options based on language
  const yesNoOptions =
    language === "nep" ? YES_NO_OPTIONS_NEP : YES_NO_OPTIONS_ENG;

  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm ${
        isGateKeepingQuestion
          ? "border-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]"
          : "border-surface-border"
      }`}
    >
      {isGateKeepingQuestion && (
        <div className="-mx-4 -mt-4 mb-3 rounded-t-lg bg-gradient-to-r from-amber-50 to-white px-4 py-2 border-b border-amber-100">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Gate Keeping Question
          </span>
        </div>
      )}

      <label htmlFor={key} className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {isGateKeepingQuestion
            ? language === "nep"
              ? `गेट कीपिङ प्रश्न ${index + 1}`
              : `Question ${index + 1}`
            : language === "nep"
              ? `प्रश्न ${index + 1}`
              : `Question ${index + 1}`}
        </span>
        <span className="mt-1 block text-sm font-medium text-text-primary">
          {questionTranslations[language][question] || question}
        </span>
        <FormControl
          id={key}
          label={questionTranslations[language][question] || question}
          value={values[key] || ""}
          onChange={(value) => onFieldChange(key, value)}
          {...(isYesNoQuestion && {
            options: yesNoOptions,
            placeholder:
              language === "nep" ? "छनोट गरनुहोस्" : "Select Yes or No",
          })}
          type={isNumberInput ? "number" : undefined}
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {showSourceExplanation && (
          <label htmlFor={descriptionKey} className="block">
            <span className="text-xs font-medium text-text-secondary">
              {fieldTranslations[language]["Source / explanation"] ||
                "Source / explanation"}
            </span>
            {usesFileSource ? (
              <input
                id={descriptionKey}
                type="file"
                name={descriptionKey}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onFieldChange(descriptionKey, file || "");
                }}
                className="mt-2 block w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-light"
              />
            ) : (
              <textarea
                id={descriptionKey}
                rows={2}
                value={values[descriptionKey] || ""}
                onChange={(event) =>
                  onFieldChange(descriptionKey, event.target.value)
                }
                className={inputClass}
                placeholder="Enter source or explanation..."
              />
            )}
          </label>
        )}

        <label htmlFor={remarksKey} className="block">
          <span className="text-xs font-medium text-text-secondary">
            {fieldTranslations[language]["Remarks"] || "Remarks"}
          </span>
          <textarea
            id={remarksKey}
            rows={2}
            value={values[remarksKey] || ""}
            onChange={(event) => onFieldChange(remarksKey, event.target.value)}
            className={inputClass}
            placeholder="Enter remarks..."
          />
        </label>
      </div>
    </div>
  );
}

export default KpiQuestionCard;
