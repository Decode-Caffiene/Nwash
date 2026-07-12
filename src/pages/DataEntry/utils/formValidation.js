export const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityType: "spatial.municipality-type",
  municipalityName: "spatial.municipality-name",
  wardsCovered: "spatial.number-of-wards-covered",
  gpsLatitude: "spatial.gps-latitude",
  gpsLongitude: "spatial.gps-longitude",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]*$/;
const nepalPhoneRegex = /^(97|98)\d{8}$/;

export const validateEmail = (email) => {
  if (!email) return null;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  if (!phoneRegex.test(phone)) return "Invalid phone number format";
  
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length !== 10) {
    return "Phone number must be exactly 10 digits";
  }
  
  if (!nepalPhoneRegex.test(digitsOnly)) {
    return "Phone number must start with 97 or 98 (Nepal format)";
  }
  
  return null;
};

export const validateGpsCoordinate = (value, type) => {
  if (!value) return `${type} is required`;
  const num = parseFloat(value);
  if (isNaN(num)) return `${type} must be a valid number`;
  if (type === "Latitude" && (num < -90 || num > 90)) {
    return "Latitude must be between -90 and 90";
  }
  if (type === "Longitude" && (num < -180 || num > 180)) {
    return "Longitude must be between -180 and 180";
  }
  return null;
};

export const validateLocationFields = (values) => {
  const errors = {};

  if (!values[LOCATION_FIELD_KEYS.province]) {
    errors[LOCATION_FIELD_KEYS.province] = "Province is required";
  }

  if (!values[LOCATION_FIELD_KEYS.district]) {
    errors[LOCATION_FIELD_KEYS.district] = "District is required";
  }

  if (!values[LOCATION_FIELD_KEYS.municipalityType]) {
    errors[LOCATION_FIELD_KEYS.municipalityType] = "Municipality type is required";
  }

  if (!values[LOCATION_FIELD_KEYS.municipalityName]) {
    errors[LOCATION_FIELD_KEYS.municipalityName] = "Municipality name is required";
  }

  return errors;
};

export const validateWardsCovered = (wardsCovered) => {
  if (!wardsCovered) return "Ward numbers are required";

  const wards = String(wardsCovered || "")
    .split(",")
    .map((w) => Number(w.trim()))
    .filter((w) => Number.isFinite(w));

  if (wards.length === 0) {
    return "Please select at least one ward";
  }

  return null;
};

export const validateServiceProviderForm = (values, fields) => {
  const errors = {};

  // Validate location fields
  const locationErrors = validateLocationFields(values);
  Object.assign(errors, locationErrors);

  // Validate wards covered if any location field is filled
  const hasLocationData = Object.keys(locationErrors).length === 0;
  if (hasLocationData && !values[LOCATION_FIELD_KEYS.wardsCovered]) {
    errors[LOCATION_FIELD_KEYS.wardsCovered] = "Ward numbers are required";
  }

  // Validate GPS coordinates if either is filled
  const hasGpsLat = values[LOCATION_FIELD_KEYS.gpsLatitude];
  const hasGpsLon = values[LOCATION_FIELD_KEYS.gpsLongitude];

  if (hasGpsLat || hasGpsLon) {
    if (!hasGpsLat) {
      errors[LOCATION_FIELD_KEYS.gpsLatitude] = "Latitude is required when providing GPS coordinates";
    } else {
      const latError = validateGpsCoordinate(hasGpsLat, "Latitude");
      if (latError) errors[LOCATION_FIELD_KEYS.gpsLatitude] = latError;
    }

    if (!hasGpsLon) {
      errors[LOCATION_FIELD_KEYS.gpsLongitude] = "Longitude is required when providing GPS coordinates";
    } else {
      const lonError = validateGpsCoordinate(hasGpsLon, "Longitude");
      if (lonError) errors[LOCATION_FIELD_KEYS.gpsLongitude] = lonError;
    }
  }

  // Validate other fields based on field type (only format validation)
  fields.forEach((field) => {
    const key = `spatial.${field.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

    if (key === "spatial.email") {
      const emailError = validateEmail(values[key]);
      if (emailError) errors[key] = emailError;
    }

    if (key === "spatial.phone-number") {
      const phoneError = validatePhone(values[key]);
      if (phoneError) errors[key] = phoneError;
    }
  });

  return errors;
};
