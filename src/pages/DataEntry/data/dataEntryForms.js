export const dataEntryForms = [
  {
    id: "service-provider",
    title: "Service Provider Form",

    subtitle:
      "Spatial identification, technical service level, and O&M efficiency",
    detailsTitle: "Service Provider Details",
    detailsSubtitle: "Spatial identification",
    detailFields: [
      "Name",
      "Email",
      "Phone Number",
      "Designation",
      "Name of Service Provider",
      "Province Name",
      "District",
      "Municipality Name",
      "Number of wards covered",
      "GPS Latitude",
      "GPS Longitude",
    ],
    sections: [
      {
        title: "Kpi 1",
        sectionKey: "service_coverage",
        questions: [
          "Does a business plan exist? (Y/N)",
          "Number of households served by the WSUC (specify number)",
          "Total number of households in the service area?",
        ],
      },
      {
        title: "Kpi 2",
        sectionKey: "adequacy",
        questions: [
          "Type of Scheme? (Gravity Flow/Pumping)",
          "Total volume of water billed to residential customers per day?",
          "Total number of population served?",
        ],
      },
      {
        title: "Kpi 3",
        sectionKey: "water_quality",
        questions: [
          "Is there a Lab report? (Y/N)",
          "Water quality test conducted or not? (Y/N)",
          "E coli within limits? (Y/N)",
          "Arsenic within limits? (Y/N)",
          "All 19 parameters tested as specified by NDWQS? (Y/N)",
        ],
      },
      {
        title: "Kpi 4",
        sectionKey: "reliability",
        questions: [
          "Mode of water supply? (Continuous / Intermittent)",
          "Hours of water supply in a day?",
        ],
      },
      {
        title: "Kpi 5",
        sectionKey: "non_revenue_water",
        questions: [
          "Is the logbook maintained for pumping hours? (Y/N)",
          "Is flow measurement done via pump curve? (Y/N)",
          "Is reservoir scale measured? (Y/N)",
          "Are distribution hours measured? (Y/N)",
          "Are there flow meters in transmission and distribution? (Y/N)",
          "Is there a DMA-based network with sensors/software/data logging? (Y/N)",
        ],
      },
      {
        title: "Kpi 6",
        sectionKey: "operating_ratio",
        questions: [
          "Is there an annual audit report?",
          "Total annual operation and maintenance (O&M) costs?",
          "Total annual operating income from the sale of water and other water-related services?",
        ],
      },
      {
        title: "Kpi 7",
        sectionKey: "metering_ratio",
        questions: [
          "Total functional metered connections?",
          "Total number of metered connections?",
        ],
      },
      {
        title: "Kpi 8",
        sectionKey: "grievances_addressal",
        questions: [
          "Is a log book maintained to record consumer complaints and actions taken in response to them?",
          "Grievance addressal mechanism exists? (Y/N)",
        ],
      },
    ],
  },
  {
    id: "service-provider-map",
    title: "Coverage Area Form",

    subtitle: "Spatial identification with coverage area mapping",
    detailsTitle: "Service Provider Details",
    detailsSubtitle: "Spatial identification with map-based coverage area",
    useMapSection: true,
    detailFields: [
      "Name",
      "Email",
      "Phone Number",
      "Designation",
      "Name of Service Provider",
      "Province Name",
      "District",
      "Municipality Name",
      "Coverage Area",
    ],
    sections: [
      {
        title: "Kpi 1",
        sectionKey: "service_coverage",
        questions: [
          "Does a business plan exist? (Y/N)",
          "Number of households served by the WSUC (specify number)",
          "Total number of households in the service area?",
        ],
      },
      {
        title: "Kpi 2",
        sectionKey: "adequacy",
        questions: [
          "Type of Scheme? (Gravity Flow/Pumping)",
          "Total volume of water billed to residential customers per day?",
          "Total number of population served?",
        ],
      },
      {
        title: "Kpi 3",
        sectionKey: "water_quality",
        questions: [
          "Is there a Lab report? (Y/N)",
          "Water quality test conducted or not? (Y/N)",
          "E coli within limits? (Y/N)",
          "Arsenic within limits? (Y/N)",
          "All 19 parameters tested as specified by NDWQS? (Y/N)",
        ],
      },
      {
        title: "Kpi 4",
        sectionKey: "reliability",
        questions: [
          "Mode of water supply? (Continuous / Intermittent)",
          "Hours of water supply in a day?",
        ],
      },
      {
        title: "Kpi 5",
        sectionKey: "non_revenue_water",
        questions: [
          "Is the logbook maintained for pumping hours? (Y/N)",
          "Is flow measurement done via pump curve? (Y/N)",
          "Is reservoir scale measured? (Y/N)",
          "Are distribution hours measured? (Y/N)",
          "Are there flow meters in transmission and distribution? (Y/N)",
          "Is there a DMA-based network with sensors/software/data logging? (Y/N)",
        ],
      },
      {
        title: "Kpi 6",
        sectionKey: "operating_ratio",
        questions: [
          "Is there an annual audit report?",
          "Total annual operation and maintenance (O&M) costs?",
          "Total annual operating income from the sale of water and other water-related services?",
        ],
      },
      {
        title: "Kpi 7",
        sectionKey: "metering_ratio",
        questions: [
          "Total functional metered connections?",
          "Total number of metered connections?",
        ],
      },
      {
        title: "Kpi 8",
        sectionKey: "grievances_addressal",
        questions: [
          "Is a log book maintained to record consumer complaints and actions taken in response to them?",
          "Grievance addressal mechanism exists? (Y/N)",
        ],
      },
    ],
  },
];
