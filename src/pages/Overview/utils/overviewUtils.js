// Groups providers that have both valid OEI and SPI by province.
// Returns data sorted descending by project count, ready for a donut chart.
export function buildProvinceComplianceData(providers) {
  const groups = {};
  for (const p of providers) {
    const si = p.Summary_Index ?? {};
    const oei = Number(si.OEI);
    const spi = Number(si.SPI);
    if (!Number.isFinite(oei) || !Number.isFinite(spi)) continue;

    const province = String(p.Location?.Province_Name ?? "").trim();
    if (!province) continue;

    if (!groups[province]) groups[province] = { oeiSum: 0, spiSum: 0, count: 0 };
    groups[province].oeiSum += oei;
    groups[province].spiSum += spi;
    groups[province].count += 1;
  }

  return Object.entries(groups)
    .map(([province, { oeiSum, spiSum, count }]) => ({
      province,
      projects: count,
      averageOEI: oeiSum / count,
      averageSPI: spiSum / count,
    }))
    .sort((a, b) => b.projects - a.projects);
}

// Groups providers by district+province for the district bar chart.
// Returns { districtData, excludedCount } where excludedCount tracks
// providers that could not be placed into any district.
export function buildDistrictData(providers) {
  const districtMap = {};
  let excludedCount = 0;

  for (const provider of providers) {
    const district =
      provider.Location?.District_Name || provider.District || provider.district || null;
    const province =
      provider.Location?.Province_Name || provider.Province || provider.province || null;

    if (district && province) {
      const key = `${district}-${province}`;
      if (!districtMap[key]) {
        districtMap[key] = { name: district, Province: province, Operators: 0 };
      }
      districtMap[key].Operators += 1;
    } else {
      excludedCount += 1;
    }
  }

  return {
    districtData: Object.values(districtMap).sort((a, b) => b.Operators - a.Operators),
    excludedCount,
  };
}
