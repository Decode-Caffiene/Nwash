import React from "react";
import { X } from "lucide-react";
import Button from "../common/Button";
import FormControl from "../../pages/DataEntry/components/common/FormControl";
import {
  PROVINCES,
  getDistrictOptions,
  getMunicipalityNameOptions,
} from "../../pages/DataEntry/utils/locationOptions";

export default function AnalyticsModal({
  isOpen,
  onClose,
  draftFilters,
  setDraftFilters,
  applyFilters,
  clearFilters,
}) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    if (key === "province") {
      // Clear dependent fields when province changes
      setDraftFilters((prev) => ({
        ...prev,
        province: value,
        district: "",
        municipality: "",
      }));
    } else if (key === "district") {
      // Clear municipality when district changes
      setDraftFilters((prev) => ({
        ...prev,
        district: value,
        municipality: "",
      }));
    } else {
      setDraftFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const districtOptions = getDistrictOptions(draftFilters.province);
  const municipalityOptions = getMunicipalityNameOptions(
    draftFilters.district,
    ""
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
              Location Filter
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Filter Providers
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Province */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700 block mb-1.5">
              Province
            </span>
            <FormControl
              id="province"
              label="Province"
              options={PROVINCES}
              value={draftFilters.province}
              onChange={(value) => handleChange("province", value)}
              placeholder="Select province"
            />
          </label>

          {/* District */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700 block mb-1.5">
              District
            </span>
            <FormControl
              id="district"
              label="District"
              options={districtOptions}
              value={draftFilters.district}
              onChange={(value) => handleChange("district", value)}
              placeholder={
                draftFilters.province
                  ? "Select district"
                  : "Select province first"
              }
              disabled={!draftFilters.province}
            />
          </label>

          {/* Municipality */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700 block mb-1.5">
              Municipality
            </span>
            <FormControl
              id="municipality"
              label="Municipality"
              options={municipalityOptions}
              value={draftFilters.municipality}
              onChange={(value) => handleChange("municipality", value)}
              placeholder={
                draftFilters.district
                  ? "Select municipality"
                  : "Select district first"
              }
              disabled={!draftFilters.district}
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}