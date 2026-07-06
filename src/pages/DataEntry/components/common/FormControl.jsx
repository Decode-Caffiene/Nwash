import { AlertCircle } from "lucide-react";
import { getFieldType } from "../../utils/formUtils";

const inputClass =
  "mt-2 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-light hover:border-surface-border/80";

const errorInputClass =
  "mt-2 w-full rounded-lg border border-red-300 bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 hover:border-red-300";

function FormControl({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  required = false,
  type: overrideType,
  error,
}) {
  const type = overrideType || getFieldType(label);
  const currentInputClass = error ? errorInputClass : inputClass;

  if (options) {
    return (
      <>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={currentInputClass}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && (
          <div id={`${id}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </>
    );
  }

  if (type === "yesNo") {
    return (
      <>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={currentInputClass}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">Select response</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {error && (
          <div id={`${id}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </>
    );
  }

  if (type === "supplyMode") {
    return (
      <>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={currentInputClass}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">Select mode</option>
          <option value="Continuous">Continuous</option>
          <option value="Intermittent">Intermittent</option>
        </select>
        {error && (
          <div id={`${id}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </>
    );
  }

  if (type === "hoursOfWaterSupply") {
    return (
      <>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={currentInputClass}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">Select hours</option>
          {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        {error && (
          <div id={`${id}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <input
        id={id}
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={currentInputClass}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <div id={`${id}-error`} className="mt-1 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </>
  );
}

export { inputClass };
export default FormControl;
