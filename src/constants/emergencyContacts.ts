export const EMERGENCY_CONTACTS = [
  { label: "Police", number: "999", type: "call" as const },
  { label: "Ambulance / SCDF", number: "995", type: "call" as const },
  { label: "Non-emergency Police", number: "18002550000", displayNumber: "1800-255-0000", type: "call" as const },
  { label: "Traffic Police e-Services", url: "https://www.police.gov.sg", type: "link" as const },
  { label: "SAS Portal (GIA)", url: "https://www.gia.org.sg", type: "link" as const },
  { label: "LTA / OneMotoring", url: "https://www.onemotoring.lta.gov.sg", type: "link" as const },
  { label: "Motor Claims Framework", url: "https://www.gia.org.sg", type: "link" as const },
  { label: "FIDReC (insurance disputes)", url: "https://www.fidrec.com.sg", number: "63278878", type: "both" as const },
  { label: "MIB Singapore (uninsured claims)", url: "https://www.mib.com.sg", type: "link" as const },
  { label: "Malaysian MIB (MMIB)", url: "https://www.mib.org.my", type: "link" as const },
] as const;
