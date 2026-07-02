export function getProviderSearchText(provider = {}) {
  const location = provider.Location || provider.location || {};

  const values = [
    provider?.Name ||
      provider?.Operator_Name ||
      provider?.operator_name ||
      provider?.operator ||
      provider?.title,

    location?.District_Name || provider?.District || provider?.district,
    location?.Province_Name || provider?.Province || provider?.province,

    provider?.Location_Name || provider?.location_name,
  ];

  return values.filter(Boolean).join(" ").toLowerCase().trim();
}

export function normalizeQuery(q) {
  return String(q || "")
    .toLowerCase()
    .trim();
}
