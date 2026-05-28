export function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return Number(value).toLocaleString("en-NP");
}

export default formatNumber;
