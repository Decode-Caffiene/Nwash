import {
  questionTranslations,
  fieldTranslations,
} from "../../utils/translations";
import FormControl, { inputClass } from "./FormControl";
import { slugify } from "../../utils/formUtils";

const YES_NO_OPTIONS_ENG = ["Yes", "No"];
const YES_NO_OPTIONS_NEP = ["हो", "होइन"];

function KpiQuestionCard({
  formId,
  sectionTitle,
  question,
  index,
  values,
  onFieldChange,
  isGateKeepingQuestion,
  language = "eng",
}) {
  const key = `${formId}.${slugify(sectionTitle)}.${slugify(question)}`;
  const descriptionKey = `${key}.description`;
  const remarksKey = `${key}.remarks`;
  const normalizedQuestion = question.toLowerCase();
  const isCoverageAreaForm = formId === "service-provider-map";
  const isBusinessPlanQuestion =
    normalizedQuestion.includes("business plan") &&
    normalizedQuestion.includes("exist");
  const usesFileSource =
    normalizedQuestion.includes("report") ||
    normalizedQuestion.includes("logbook") ||
    normalizedQuestion.includes("log book") ||
    (isCoverageAreaForm && isBusinessPlanQuestion);
  const showSourceExplanation = isGateKeepingQuestion || usesFileSource;

  // Detect if this is a yes/no question
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
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <label htmlFor={key} className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {isGateKeepingQuestion
            ? language === "nep"
              ? `गेट कीपिङ प्रश्न ${index + 1}`
              : `Gate Keeping Question ${index + 1}`
            : language === "nep"
              ? `Question ${index+1}`
              : `Question ${index+1}`}
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
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onFieldChange(descriptionKey, file || "");
                }}
                className="mt-2 block w-full rounded-md border border-surface-border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-light file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-secondary hover:file:bg-brand-lighter"
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
          />
        </label>
      </div>
    </div>
  );
}

export default KpiQuestionCard;
