import { cn } from "../../../utils/helpers";

function DataEntryHeader({ forms, activeFormId, onFormChange }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Data Entry Forms
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Primary Data Collection
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-text-secondary">
          Digital version of the primary data collection sample for service
          provider assessment.
        </p>
      </div>

      <div className="inline-flex w-full rounded-lg border border-surface-border bg-white p-1 shadow-sm sm:w-auto">
        {forms.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => onFormChange(form.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition sm:flex-none",
              activeFormId === form.id
                ? "bg-brand-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-surface hover:text-text-primary",
            )}
          >
            {form.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DataEntryHeader;
