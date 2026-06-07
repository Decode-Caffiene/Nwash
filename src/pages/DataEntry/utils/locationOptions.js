import wardsGeojson from "../../../data/nepal_wards.min.geojson?raw";

const wards = JSON.parse(wardsGeojson);

export const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const DISTRICTS_BY_PROVINCE = {
  Koshi: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terathum",
    "Udayapur",
  ],
  Madhesh: [
    "Bara",
    "Dhanusa",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  Bagmati: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchowk",
  ],
  Gandaki: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manag",
    "Mustang",
    "Myagdi",
    "Parbat",
    "Syangja",
    "Tanahun",
  ],
  Lumbini: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Gulmi",
    "Kapilbastu",
    "Nawalparasi",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rukum",
    "Rupandehi",
  ],
  Karnali: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
  ],
  Sudurpashchim: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};

const VALID_MUNICIPALITY_TYPES = new Set([
  "Gaunpalika",
  "Mahanagarpalika",
  "Nagarpalika",
  "Upamahanagarpalika",
]);

const normalizeMunicipalityType = (type) => {
  const normalized = String(type || "").trim().toLowerCase();

  if (normalized === "maha nagarpalika") {
    return "Mahanagarpalika";
  }

  if (normalized === "gaupaika") {
    return "Gaunpalika";
  }

  return String(type || "").trim();
};

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((first, second) =>
    first.localeCompare(second),
  );

const municipalityRecords = wards.features
  .map(({ properties }) => ({
    district: toTitleCase(properties.DISTRICT),
    name: properties.GaPa_NaPa,
    type: normalizeMunicipalityType(properties.Type_GN),
  }))
  .filter(
    ({ district, name, type }) =>
      district && name && VALID_MUNICIPALITY_TYPES.has(type),
  );

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const getDistrictOptions = (province) =>
  province ? DISTRICTS_BY_PROVINCE[province] || [] : [];

export const getMunicipalityTypeOptions = (district) =>
  uniqueSorted(
    municipalityRecords
      .filter((municipality) => municipality.district === district)
      .map((municipality) => municipality.type),
  );

export const getMunicipalityNameOptions = (district, municipalityType) =>
  uniqueSorted(
    municipalityRecords
      .filter(
        (municipality) =>
          municipality.district === district &&
          (!municipalityType || municipality.type === municipalityType),
      )
      .map((municipality) => municipality.name),
  );

export const getWardFeatures = (district, municipalityName, municipalityType) =>
  wards.features.filter(({ properties }) => {
    const wardDistrict = toTitleCase(properties.DISTRICT);
    const wardType = normalizeMunicipalityType(properties.Type_GN);

    return (
      wardDistrict === district &&
      properties.GaPa_NaPa === municipalityName &&
      (!municipalityType || wardType === municipalityType)
    );
  });

export const getProvinceAndDistrictByMunicipality = (municipalityName) => {
  const record = municipalityRecords.find((m) => m.name === municipalityName);
  if (!record) return { province: null, district: null };

  const district = record.district;
  const province = Object.entries(DISTRICTS_BY_PROVINCE).find(([_, districts]) =>
    districts.includes(district)
  )?.[0] || null;

  return { province, district };
};
