import { getFieldType } from "./formUtils";

const inputClass =
  "mt-2 w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-light";

function FormControl({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
}) {
  const type = getFieldType(label);

  if (options) {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (type === "yesNo") {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        disabled={disabled}
      >
        <option value="">Select response</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    );
  }

  if (type === "supplyMode") {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        disabled={disabled}
      >
        <option value="">Select mode</option>
        <option value="Continuous">Continuous</option>
        <option value="Intermittent">Intermittent</option>
      </select>
    );
  }

  if (type === "hoursOfWaterSupply") {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
        disabled={disabled}
      >
        <option value="">Select hours</option>
        {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={id}
      type={type}
      min={type === "number" ? "0" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
      disabled={disabled}
    />
  );
}

export { inputClass };
export default FormControl;
