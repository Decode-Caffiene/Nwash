import { sectionTranslations, questionTranslations } from "../../utils/translations";
import KpiQuestionCard from "./KpiQuestionCard";

function KpiFormSection({ form, values, onFieldChange, language = "eng" }) {
  return (
    <section className="stat-card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-light/50 to-white px-5 py-4 -mx-5 -mt-5 border-b border-surface-border">
        <h2 className="text-lg font-semibold text-text-primary">
          {form.title}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{form.subtitle}</p>
      </div>

      <div className="mt-6 space-y-6">
        {form.sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-brand-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                {sectionTranslations[language][section.title] || section.title}
              </h3>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {section.questions.map((question, index) => (
                <KpiQuestionCard
                  key={question}
                  formId={form.id}
                  sectionTitle={section.title}
                  sectionKey={section.sectionKey}
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
