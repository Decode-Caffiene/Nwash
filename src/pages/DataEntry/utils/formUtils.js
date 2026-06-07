export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getFieldType = (label) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("continuous / intermittent")) {
    return "supplyMode";
  }

  if (normalized.includes("email")) {
    return "email";
  }

  if (normalized.includes("phone")) {
    return "tel";
  }

  if (normalized.includes("date")) {
    return "date";
  }

  if (
    normalized.includes("(y/n)") ||
    normalized.startsWith("is ") ||
    normalized.startsWith("does ") ||
    normalized.startsWith("are ")
  ) {
    return "yesNo";
  }

  if (
    normalized.includes("hours of water supply in a day") ||
    normalized === "hours of water supply in a day?" ||
    normalized === "hours of water supply in a day" ||
    (normalized.includes("hours") && normalized.includes("water supply"))
  ) {
    return "hoursOfWaterSupply";
  }

  if (
    normalized.includes("number") ||
    normalized.includes("total") ||
    normalized.includes("hours") ||
    normalized.includes("costs") ||
    normalized.includes("income") ||
    normalized.includes("volume") ||
    normalized.includes("amount") ||
    normalized.includes("population")
  ) {
    return "number";
  }

  return "text";
};
