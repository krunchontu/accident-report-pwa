import { jsPDF } from 'jspdf';
import type { Incident } from '../types/incident';
import { calculateEligibility } from './eligibilityScorer';
import { formatDateTime } from './dateHelpers';

export async function generatePDF(incident: Incident, photos: { promptId: string; thumbnail: string }[]): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  const addText = (text: string, size: number = 10, bold: boolean = false) => {
    doc.setFontSize(size);
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    if (y + lines.length * (size * 0.4) > 280) { doc.addPage(); y = 15; }
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4) + 2;
  };

  const addSection = (title: string) => {
    y += 3;
    if (y > 270) { doc.addPage(); y = 15; }
    doc.setDrawColor(27, 42, 74);
    doc.setFillColor(27, 42, 74);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, y);
    doc.setTextColor(0, 0, 0);
    y += 7;
  };

  // Header
  doc.setFillColor(27, 42, 74);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SG Accident Kaki — Incident Report', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, margin, 19);
  doc.setTextColor(0, 0, 0);
  y = 32;

  // Incident info
  addText(`Incident ID: ${incident.id}`, 8);
  addText(`Date/Time: ${formatDateTime(incident.createdAt)}`, 10, true);
  addText(`Status: ${incident.status.toUpperCase()}`, 10);

  // Scene Details
  addSection('Scene Details');
  addText(`Location: ${incident.scene.location.address || 'N/A'}`);
  addText(`Road: ${incident.scene.location.roadName || 'N/A'}`);
  if (incident.scene.location.latitude) {
    addText(`GPS: ${incident.scene.location.latitude.toFixed(6)}, ${incident.scene.location.longitude.toFixed(6)}`);
  }
  addText(`Weather: ${incident.scene.weather}`);
  addText(`Road Condition: ${incident.scene.roadCondition}`);
  addText(`Traffic: ${incident.scene.trafficCondition}`);
  addText(`Speed Limit: ${incident.scene.speedLimit || 'N/A'} km/h`);
  if (incident.scene.description) {
    addText(`Description: ${incident.scene.description}`);
  }

  // Photos
  if (photos.length > 0) {
    addSection('Photo Evidence');
    addText(`${photos.length} photos captured`);
    let photoX = margin;
    let photoY = y;
    for (const photo of photos.slice(0, 12)) {
      try {
        if (photoY + 30 > 275) { doc.addPage(); photoY = 15; photoX = margin; }
        doc.addImage(photo.thumbnail, 'JPEG', photoX, photoY, 25, 20);
        photoX += 28;
        if (photoX + 25 > pageWidth - margin) {
          photoX = margin;
          photoY += 23;
        }
      } catch { /* skip failed images */ }
    }
    y = photoY + 25;
  }

  // Reporter Details
  if (incident.reporter) {
    addSection('Your Details (Reporting Driver)');
    addText(`Name: ${incident.reporter.fullName || 'N/A'}`);
    addText(`NRIC/FIN: ${incident.reporter.nricFin || 'N/A'}`);
    addText(`Contact: ${incident.reporter.contactNumber || 'N/A'}`);
    addText(`Email: ${incident.reporter.email || 'N/A'}`);
    addText(`Address: ${incident.reporter.address || 'N/A'}`);
    addText(`Licence: ${incident.reporter.licenceNumber || 'N/A'} (Class ${incident.reporter.licenceClass || 'N/A'})`);
    addText(`Licence Expiry: ${incident.reporter.licenceExpiryDate || 'N/A'}`);
    addText(`Vehicle: ${incident.reporter.vehicleRegistration || 'N/A'} — ${incident.reporter.vehicleMakeModel || 'N/A'}`);
    addText(`Colour: ${incident.reporter.vehicleColour || 'N/A'} | Year: ${incident.reporter.vehicleYear || 'N/A'}`);
    addText(`Insurer: ${incident.reporter.insurerName || 'N/A'} — Policy: ${incident.reporter.policyNumber || 'N/A'}`);
    addText(`Policy Type: ${incident.reporter.policyType || 'N/A'} | Expiry: ${incident.reporter.policyExpiry || 'N/A'}`);
    addText(`NCD: ${incident.reporter.ncdPercentage}%`);
    addText(`Claims Hotline: ${incident.reporter.claimsHotline || 'N/A'}`);
  }

  // Other Parties
  for (let i = 0; i < incident.otherParties.length; i++) {
    const party = incident.otherParties[i];
    addSection(`Other Party ${i + 1}${party.isForeignVehicle ? ' (Foreign)' : ''}`);
    addText(`Name: ${party.driverName || 'N/A'}`);
    addText(`ID: ${party.idNumber || 'N/A'}`);
    addText(`Contact: ${party.contactNumber || 'N/A'}`);
    addText(`Vehicle: ${party.vehicleRegistration || 'N/A'} — ${party.vehicleMakeModel || 'N/A'}`);
    addText(`Insurer: ${party.insurerName || 'N/A'} — Policy: ${party.policyNumber || 'N/A'}`);
    addText(`Damage: ${party.visibleDamage || 'N/A'}`);
    if (party.isForeignVehicle && party.foreign) {
      addText(`Nationality: ${party.foreign.nationality}`);
      addText(`Country of Registration: ${party.foreign.countryOfRegistration}`);
      addText(`SG Insurance: ${party.foreign.hasSGInsuranceCover === true ? 'Yes' : party.foreign.hasSGInsuranceCover === false ? 'No' : 'Unknown'}`);
    }
  }

  // Eligibility
  const eligResult = calculateEligibility(incident.eligibility);
  addSection('Claim Eligibility Self-Check');
  addText(`Result: ${eligResult.score.toUpperCase()}`, 12, true);
  if (eligResult.triggeredRules.length > 0) {
    for (const rule of eligResult.triggeredRules) {
      addText(`[${rule.severity.toUpperCase()}] ${rule.consequence}`, 9);
    }
  }
  addText('(Self-assessment only — consult your insurer)', 8);

  // Witnesses
  if (incident.witnesses.length > 0) {
    addSection('Witnesses');
    for (const w of incident.witnesses) {
      addText(`${w.fullName} — ${w.contactNumber}`);
      if (w.statement) addText(`  Statement: ${w.statement}`, 9);
    }
  }

  // Sketch
  if (incident.sketchDataUrl) {
    addSection('Accident Sketch');
    if (y + 60 > 275) { doc.addPage(); y = 15; }
    try {
      doc.addImage(incident.sketchDataUrl, 'PNG', margin, y, pageWidth - margin * 2, 55);
      y += 58;
    } catch { addText('(Sketch could not be embedded)'); }
  }

  // Injuries
  addSection('Injuries & Passengers');
  addText(`Injuries reported: ${incident.injuries.anyInjuries ? 'Yes' : 'No'}`);
  if (incident.injuries.anyInjuries) {
    addText(`Ambulance called: ${incident.injuries.ambulanceCalled ? 'Yes' : 'No'}`);
    addText(`Hospital: ${incident.injuries.hospitalName || 'N/A'}`);
  }
  addText(`Seatbelts worn: ${incident.injuries.allSeatbeltsWorn ? 'Yes' : 'No'}`);
  if (incident.injuries.passengers.length > 0) {
    addText(`Passengers: ${incident.injuries.passengers.length}`);
    for (const p of incident.injuries.passengers) {
      addText(`  ${p.name} — ${p.injured ? 'Injured: ' + p.injuryDescription : 'Not injured'}`);
    }
  }

  // Signatures
  if (incident.driverSignature || incident.otherPartySignature) {
    addSection('Signatures');
    if (incident.driverSignature) {
      addText('Driver Signature:');
      try { doc.addImage(incident.driverSignature, 'PNG', margin, y, 60, 25); y += 28; } catch {}
    }
    if (incident.otherPartySignature) {
      addText('Other Party Signature:');
      try { doc.addImage(incident.otherPartySignature, 'PNG', margin, y, 60, 25); y += 28; } catch {}
    }
  }

  // Deadlines
  addSection('Deadline Tracking');
  for (const dl of incident.deadlines) {
    const status = dl.completed ? `DONE (${dl.completedAt ? formatDateTime(dl.completedAt) : ''})` : 'PENDING';
    addText(`${dl.label}: ${status}`, 9);
  }

  // Footer
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by SG Accident Kaki. This report is for reference only and does not constitute legal advice.', margin, 285);

  return doc.output('blob');
}
