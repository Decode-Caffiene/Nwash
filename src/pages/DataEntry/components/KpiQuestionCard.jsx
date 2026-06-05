import FormControl, { inputClass } from "./FormControl";
import { slugify } from "./formUtils";

function KpiQuestionCard({
  formId,
  sectionTitle,
  question,
  index,
  values,
  onFieldChange,
  isGateKeepingQuestion,
}) {
  const key = `${formId}.${slugify(sectionTitle)}.${slugify(question)}`;
  const descriptionKey = `${key}.description`;
  const remarksKey = `${key}.remarks`;

  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <label htmlFor={key} className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {isGateKeepingQuestion
            ? `Gate Keeping Question ${index + 1}`
            : `KPI ${index + 1}`}
        </span>
        <span className="mt-1 block text-sm font-medium text-text-primary">
          {question}
        </span>
        <FormControl
          id={key}
          label={question}
          value={values[key] || ""}
          onChange={(value) => onFieldChange(key, value)}
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label htmlFor={descriptionKey} className="block">
          <span className="text-xs font-medium text-text-secondary">
            Source / explanation
          </span>
          <input
            id={descriptionKey}
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFieldChange(descriptionKey, file);
              }
            }}
            className="mt-2 block w-full rounded-md border border-surface-border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-light file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-secondary hover:file:bg-brand-lighter"
          />
        </label>

        <label htmlFor={remarksKey} className="block">
          <span className="text-xs font-medium text-text-secondary">
            Remarks
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
