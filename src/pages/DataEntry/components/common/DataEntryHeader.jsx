import { cn } from "../../../../utils/helpers";
import waterBg from "../../../../assets/water.jpeg";

function DataEntryHeader({ forms, activeFormId, onFormChange, language, setLanguage }) {
  const toggleLanguage = () => {
    setLanguage(language === "eng" ? "nep" : "eng");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
      <div className="bg-surface p-4 sm:p-6">
        <img
          src={waterBg}
          alt=""
          className="h-48 w-full rounded-lg object-cover sm:h-64"
        />
      </div>

      <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Data Entry Forms
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">
            {language === "eng" ? "Primary Data Collection" : "प्राथमिक डेटा संग्रह"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-text-secondary">
            {language === "eng"
              ? "Digital version of the primary data collection sample for service provider assessment."
              : "सेवा प्रदायक मूल्यांकनको लागि प्राथमिक डेटा संग्रहको नमूनाको डिजिटल संस्करण।"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="inline-flex rounded-lg border border-surface-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition",
                language === "eng"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary",
              )}
            >
              ENG
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition",
                language === "nep"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary",
              )}
            >
              NEP
            </button>
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
      </div>
    </div>
  );
}

export default DataEntryHeader;
