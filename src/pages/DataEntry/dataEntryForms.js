export const dataEntryForms = [
  {
    id: "service-provider",
    title: "Service Provider Form",
    subtitle:
      "Spatial identification, technical service level, and O&M efficiency",
    detailsTitle: "Service Provider Details",
    detailsSubtitle: "Spatial identification",
    detailFields: [
      "Name of Service Provider",
      "WSUC Name",
      "Province Name",
      "District",
      "Municipality Name",
      "Number of wards covered",
    ],
    sections: [
      {
        title: "Service Coverage",
        questions: [
          "Does a business plan exist? (Y/N)",
          "Number of households served by the WSUC (specify number)",
          "Total number of households in the service area?",
        ],
      },
      {
        title: "Adequacy",
        questions: [
          "Total volume of water billed to residential customers?",
          "Total number of population served?",
        ],
      },
      {
        title: "Water Quality",
        questions: [
          "Is there a Lab report? (Y/N)",
          "Water quality test conducted or not? (Y/N)",
          "E coli within limits? (Y/N)",
          "Arsenic within limits? (Y/N)",
          "All 19 parameters tested as specified by NDWQS? (Y/N)",
        ],
      },
      {
        title: "Reliability",
        questions: [
          "Mode of water supply? (Continuous / Intermittent)",
          "Hours of water supply in a day?",
        ],
      },
      {
        title: "Non-Revenue Water",
        questions: [
          "Is the logbook maintained for pumping hours?",
          "Flow measurement via pump curve? (Information about power (HP) and Head)",
          "Reservoir scale measured?",
          "Distribution hours measured?",
          "Are there flow meters in transmission and distribution?",
          "Is there a DMA-based network with sensors/software/data logging?",
        ],
      },
      {
        title: "Operating Ratio",
        questions: [
          "Is there an annual audit report?",
          "Total annual operation and maintenance (O&M) costs?",
          "Total annual operating income from the sale of water and other water-related services?",
        ],
      },
      {
        title: "Metering Ratio",
        questions: [
          "Total functional metered connections?",
          "Total number of metered connections?",
        ],
      },
      {
        title: "Grievances Addressal",
        questions: [
          "Is a log book maintained to record consumer complaints and actions taken in response to them?",
          "Grievance addressal mechanism exists? (Y/N)",
        ],
      },
    ],
  },
];
