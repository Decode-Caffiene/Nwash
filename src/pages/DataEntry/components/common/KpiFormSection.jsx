import { sectionTranslations, questionTranslations } from "../../utils/translations";
import KpiQuestionCard from "./KpiQuestionCard";

function KpiFormSection({ form, values, onFieldChange, language = "eng" }) {
  return (
    <section className="stat-card">
      <div className="border-b border-surface-border pb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {form.title}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{form.subtitle}</p>
      </div>

      <div className="mt-5 space-y-6">
        {form.sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="rounded-lg bg-surface px-4 py-2 text-sm font-semibold uppercase tracking-wide text-sidebar">
              {sectionTranslations[language][section.title] || section.title}
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              {section.questions.map((question, index) => (
                <KpiQuestionCard
                  key={question}
                  formId={form.id}
                  sectionTitle={section.title}
                  question={question}
                  index={index}
                  values={values}
                  onFieldChange={onFieldChange}
                  isGateKeepingQuestion={index === 0}
                  language={language}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default KpiFormSection;
