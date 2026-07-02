import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAnalyticsPointData,
  categorizeProviders,
  extractPopulationValue,
  filterAnalyticsProviders,
} from "./zoneAnalytics.js";

test("buildAnalyticsPointData preserves real OEI and SPI values", () => {
  const result = buildAnalyticsPointData({
    WSUC_Name: "Test WSUC",
    Summary_Index: { OEI: 40.7, SPI: 75 },
  });

  assert.deepEqual(result, {
    WSUC_Name: "Test WSUC",
    Summary_Index: { OEI: 40.7, SPI: 75 },
    x: 40.7,
    y: 75,
  });
});

test("buildAnalyticsPointData clamps values to the chart range", () => {
  const result = buildAnalyticsPointData({
    Summary_Index: { OEI: 150, SPI: -12 },
  });

  assert.equal(result.x, 100);
  assert.equal(result.y, 0);
});
test("extractPopulationValue uses direct population data when available", () => {
  const result = extractPopulationValue({
    Population_Served: 12500,
  });

  assert.equal(result, 12500);
});

test("extractPopulationValue falls back to a household-based estimate", () => {
  const result = extractPopulationValue({
    households_served: 240,
  });

  assert.equal(result, 1200);
});

test("categorizeProviders follows the chart's quadrant boundaries", () => {
  const result = categorizeProviders([
    { x: 10, y: 10 },
    { x: 25, y: 35 },
    { x: 35, y: 25 },
    { x: 45, y: 55 },
    { x: 55, y: 40 },
    { x: 60, y: 60 },
  ]);

  assert.equal(result.VERY_POOR.length, 1);
  assert.equal(result.POOR.length, 2);
  assert.equal(result.INACTIVE.length, 1);
  assert.equal(result.ACTIVE.length, 1);
  assert.equal(result.IMPROVING.length, 1);
});

test("categorizeProviders separates sub-categories within improving zone", () => {
  const result = categorizeProviders([
    { x: 60, y: 60 }, // IMPROVING (50-70 range)
    { x: 75, y: 80 }, // IMPROVED (70+)
    { x: 85, y: 82 }, // JUST EFFICIENT (80+)
    { x: 92, y: 95 }, // MODERATELY EFFICIENT (90+)
    { x: 97, y: 98 }, // HIGHLY EFFICIENT (95+)
  ]);

  assert.equal(result.IMPROVING.length, 1);
  assert.equal(result.IMPROVED.length, 1);
  assert.equal(result.JUST_EFFICIENT.length, 1);
  assert.equal(result.MODERATELY_EFFICIENT.length, 1);
  assert.equal(result.HIGHLY_EFFICIENT.length, 1);
});

test("POOR boundary does not overlap with INACTIVE at y=50", () => {
  // Point exactly at y=50 with x in [0,50] should go to INACTIVE, not POOR
  const result = categorizeProviders([{ x: 25, y: 50 }]);

  assert.equal(result.POOR.length, 0);
  assert.equal(result.INACTIVE.length, 1);
});

test("POOR boundary does not overlap with ACTIVE at x=50", () => {
  // Point exactly at x=50 with y in [0,50] should go to ACTIVE, not POOR
  const result = categorizeProviders([{ x: 50, y: 25 }]);

  assert.equal(result.POOR.length, 0);
  assert.equal(result.ACTIVE.length, 1);
});

test("filterAnalyticsProviders only includes providers with both OEI and SPI", () => {
  const providers = [
    {
      WSUC_Name: "With Both",
      Summary_Index: { OEI: 40, SPI: 60 },
      Location: { Province_Name: "Bagmati" },
    },
    {
      WSUC_Name: "Missing SPI",
      Summary_Index: { OEI: 40, SPI: null },
      Location: { Province_Name: "Bagmati" },
    },
    { WSUC_Name: "Different Province", Location: { Province_Name: "Koshi" } },
  ];

  const result = filterAnalyticsProviders(providers, "", {
    province: "Bagmati",
    district: "",
    municipality: "",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].WSUC_Name, "With Both");
});
