import { useState } from "react";
import { ClipboardList, MapPinned } from "lucide-react";

import Button from "../../../components/common/Button";
import FormControl, { inputClass } from "./FormControl";
import { slugify } from "./formUtils";
import WardTraceModal from "./WardTraceModal";
import {
  getDistrictOptions,
  getMunicipalityNameOptions,
  getMunicipalityTypeOptions,
  PROVINCES,
} from "../locationOptions";

const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityType: "spatial.municipality-type",
  municipalityName: "spatial.municipality-name",
  wardsCovered: "spatial.number-of-wards-covered",
};

const parseWardValue = (value) =>
  String(value || "")
    .split(",")
    .map((ward) => Number(ward.trim()))
    .filter((ward) => Number.isFinite(ward))
    .sort((first, second) => first - second);

function ServiceProviderSection({
  title = "Form Details",
  subtitle = "Basic information",
  fields,
  values,
  onFieldChange,
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const [isWardTraceOpen, setIsWardTraceOpen] = useState(false);

  const getLocationControlProps = (key) => {
    if (key === LOCATION_FIELD_KEYS.province) {
      return {
        options: PROVINCES,
        placeholder: "Select province",
      };
    }

    if (key === LOCATION_FIELD_KEYS.district) {
      return {
        options: getDistrictOptions(province),
        placeholder: province ? "Select district" : "Select province first",
        disabled: !province,
      };
    }

    if (key === LOCATION_FIELD_KEYS.municipalityType) {
      return {
        options: getMunicipalityTypeOptions(district),
        placeholder: district
          ? "Select municipality type"
          : "Select district first",
        disabled: !district,
      };
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      return {
        options: getMunicipalityNameOptions(district, municipalityType),
        placeholder: district
          ? "Select municipality name"
          : "Select district first",
        disabled: !district,
      };
    }

    return {};
  };

  const canTraceWards = province && district && municipalityName;

  const handleFieldChange = (key, value) => {
    onFieldChange(key, value);

    if (key === LOCATION_FIELD_KEYS.province) {
      onFieldChange(LOCATION_FIELD_KEYS.district, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.district) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityType, "");
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityType) {
      onFieldChange(LOCATION_FIELD_KEYS.municipalityName, "");
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }

    if (key === LOCATION_FIELD_KEYS.municipalityName) {
      onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, "");
    }
  };

  return (
    <section className="stat-card">
      <div className="flex items-center gap-3 border-b border-surface-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-secondary">
          <ClipboardList size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => {
          const key = `spatial.${slugify(field)}`;
          const isWardsCoveredField = key === LOCATION_FIELD_KEYS.wardsCovered;

          if (isWardsCoveredField) {
            return (
              <div key={key} className="block">
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-text-primary"
                >
                  {field}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id={key}
                    type="text"
                    value={values[key] || ""}
                    onChange={(event) =>
                      handleFieldChange(key, event.target.value)
                    }
                    className={`${inputClass} mt-0`}
                    placeholder="Trace wards from map"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-3"
                    onClick={() => setIsWardTraceOpen(true)}
                    disabled={!canTraceWards}
                  >
                    <MapPinned size={16} className="mr-2" />
                    Trace wards
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <label key={key} htmlFor={key} className="block">
              <span className="text-sm font-medium text-text-primary">
                {field}
              </span>
              <FormControl
                id={key}
                label={field}
                value={values[key] || ""}
                onChange={(value) => handleFieldChange(key, value)}
                {...getLocationControlProps(key)}
              />
            </label>
          );
        })}
      </div>
      <WardTraceModal
        isOpen={isWardTraceOpen}
        province={province}
        district={district}
        municipalityType={municipalityType}
        municipalityName={municipalityName}
        initialWards={parseWardValue(values[LOCATION_FIELD_KEYS.wardsCovered])}
        onClose={() => setIsWardTraceOpen(false)}
        onSave={(wards) =>
          onFieldChange(LOCATION_FIELD_KEYS.wardsCovered, wards.join(", "))
        }
      />
    </section>
  );
}

export default ServiceProviderSection;
