export const PHOTO_PROMPTS = [
  { id: "scene_wide_1", label: "Wide-angle: Full scene (front)", description: "Stand back and capture the entire accident scene from the front", required: true, category: "scene" },
  { id: "scene_wide_2", label: "Wide-angle: Full scene (rear)", description: "Capture the scene from the opposite direction", required: true, category: "scene" },
  { id: "scene_wide_3", label: "Wide-angle: Full scene (left)", description: "Capture from the left side", required: true, category: "scene" },
  { id: "scene_wide_4", label: "Wide-angle: Full scene (right)", description: "Capture from the right side", required: true, category: "scene" },
  { id: "your_damage_1", label: "YOUR vehicle: Main damage area", description: "Close-up of the primary damage to your vehicle", required: true, category: "your_vehicle" },
  { id: "your_damage_2", label: "YOUR vehicle: Additional damage", description: "Any secondary damage (scratches, dents elsewhere)", required: false, category: "your_vehicle" },
  { id: "your_plate", label: "YOUR vehicle: Registration plate", description: "Clear photo of your plate number", required: true, category: "your_vehicle" },
  { id: "other_damage_1", label: "OTHER vehicle: Main damage area", description: "Close-up of primary damage to the other vehicle", required: true, category: "other_vehicle" },
  { id: "other_damage_2", label: "OTHER vehicle: Additional damage", description: "Secondary damage on the other vehicle", required: false, category: "other_vehicle" },
  { id: "other_plate", label: "OTHER vehicle: Registration plate", description: "Clear photo of their plate number", required: true, category: "other_vehicle" },
  { id: "other_licence", label: "Other driver's driving licence", description: "Photograph front AND back of their licence", required: true, category: "other_party_docs" },
  { id: "other_insurance", label: "Other driver's insurance cert", description: "Insurance certificate or cover note", required: true, category: "other_party_docs" },
  { id: "road_markings", label: "Road markings and signs", description: "Traffic lights, lane markings, signs at the scene", required: true, category: "scene" },
  { id: "skid_marks", label: "Skid marks / debris / fluid", description: "Any marks on the road from the accident", required: false, category: "scene" },
  { id: "vehicle_positions", label: "Both vehicles' final positions", description: "Show where both vehicles ended up after impact", required: true, category: "scene" },
  { id: "dashcam", label: "Dashcam footage screenshot", description: "If you have a dashcam, photograph the relevant playback", required: false, category: "evidence" },
  { id: "injuries", label: "Visible injuries (with consent)", description: "Only with the injured person's permission", required: false, category: "injuries" },
  { id: "your_licence", label: "YOUR driving licence", description: "For your own records", required: false, category: "your_docs" },
  { id: "your_insurance", label: "YOUR insurance certificate", description: "For your own records", required: false, category: "your_docs" },
  { id: "road_tax", label: "Road tax disc / LTA inspection sticker", description: "Your vehicle's road tax and inspection status", required: false, category: "your_docs" },
] as const;

export type PhotoPromptId = typeof PHOTO_PROMPTS[number]['id'];
