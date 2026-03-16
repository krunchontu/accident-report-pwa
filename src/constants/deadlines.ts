export const DEADLINES = [
  { id: "ambulance", label: "Call ambulance (if injuries)", deadlineHours: 0, description: "Call 995 immediately if anyone is injured" },
  { id: "police", label: "Call police (if required)", deadlineHours: 0, description: "Call 999 if injuries, hit-and-run, foreign vehicle, govt property, pedestrian/cyclist" },
  { id: "sas_filing", label: "File Singapore Accident Statement (SAS)", deadlineHours: 24, description: "File online at GIA portal (www.gia.org.sg) or via insurer's app" },
  { id: "police_report", label: "Lodge Traffic Police report", deadlineHours: 24, description: "Required if injuries, hit-and-run, drunk driving, govt property damage" },
  { id: "insurer_notify", label: "Notify your insurance company", deadlineHours: 24, description: "Call your insurer's 24-hour claims hotline" },
  { id: "medical_checkup", label: "Medical check-up", deadlineHours: 72, description: "See a doctor even if pain seems minor — no medical record = no injury claim" },
  { id: "workshop_visit", label: "Visit insurer-approved workshop", deadlineHours: 72, description: "Get damage assessed by approved surveyor/workshop" },
  { id: "full_submission", label: "Submit all documents to insurer", deadlineHours: 720, description: "Photos, SAS, police report, medical reports — check your policy for exact deadline" },
] as const;
