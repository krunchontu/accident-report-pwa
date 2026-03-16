import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, Mail, MessageCircle } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { SignaturePad } from './SignaturePad';
import { useAccidentStore } from '../../store/useAccidentStore';
import { useIncidentStore } from '../../store/useIncidentStore';
import { calculateEligibility } from '../../utils/eligibilityScorer';
import { generatePDF } from '../../utils/pdfExport';
import { shareViaWhatsApp, shareViaEmail } from '../../utils/shareHelper';
import { formatDateTime } from '../../utils/dateHelpers';
import { db } from '../../db/database';

export function Summary() {
  const navigate = useNavigate();
  const { currentIncident, setDriverSignature, setOtherPartySignature, completeIncident } = useAccidentStore();
  const { loadIncidents } = useIncidentStore();
  const [generating, setGenerating] = useState(false);

  if (!currentIncident) { navigate('/'); return null; }

  const incident = currentIncident;
  const eligResult = calculateEligibility(incident.eligibility);
  const scoreColor = eligResult.score === 'green' ? 'text-success bg-success/10' : eligResult.score === 'amber' ? 'text-warning bg-warning/10' : 'text-danger bg-danger/10';

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const photos = await db.photos.where('incidentId').equals(incident.id).toArray();
      const photoData = photos.map(p => ({ promptId: p.promptId, thumbnail: p.thumbnail }));
      const blob = await generatePDF(incident, photoData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accident-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (method: 'whatsapp' | 'email') => {
    const text = `SG Accident Kaki Report\nDate: ${formatDateTime(incident.createdAt)}\nLocation: ${incident.scene.location.address || 'Unknown'}`;
    if (method === 'whatsapp') await shareViaWhatsApp(text);
    else await shareViaEmail('Accident Report', text);
  };

  const handleDone = async () => {
    await completeIncident();
    await loadIncidents();
    navigate('/');
  };

  return (
    <StepWizard currentStep={8} totalSteps={8} stepLabel="Summary & Sign-off" showNext={false}>
      <div className="space-y-6">
        {/* Summary sections */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
          <h3 className="font-semibold text-navy">Incident Details</h3>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Date:</span> {formatDateTime(incident.createdAt)}</div>
            <div><span className="text-gray-500">Location:</span> {incident.scene.location.address || 'Unknown'}</div>
            <div><span className="text-gray-500">Weather:</span> {incident.scene.weather}</div>
            <div><span className="text-gray-500">Road:</span> {incident.scene.roadCondition}</div>
            {incident.scene.description && <div><span className="text-gray-500">Description:</span> {incident.scene.description}</div>}
          </div>
        </div>

        {/* Other parties */}
        {incident.otherParties.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <h3 className="font-semibold text-navy">Other Parties ({incident.otherParties.length})</h3>
            {incident.otherParties.map((p, i) => (
              <div key={p.id} className="text-sm">
                <div className="font-medium">{p.driverName || `Party ${i + 1}`} {p.isForeignVehicle && '(Foreign)'}</div>
                <div className="text-gray-500">{p.vehicleRegistration} — {p.vehicleMakeModel}</div>
              </div>
            ))}
          </div>
        )}

        {/* Eligibility */}
        <div className={`rounded-xl p-4 ${scoreColor}`}>
          <h3 className="font-semibold">Eligibility: {eligResult.score.toUpperCase()}</h3>
          {eligResult.triggeredRules.length > 0 && (
            <div className="text-sm mt-1">{eligResult.triggeredRules.length} issue(s) flagged</div>
          )}
        </div>

        {/* Sketch preview */}
        {incident.sketchDataUrl && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-navy mb-2">Sketch</h3>
            <img src={incident.sketchDataUrl} alt="Accident sketch" className="w-full rounded-lg" />
          </div>
        )}

        {/* Witnesses */}
        {incident.witnesses.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-navy">Witnesses ({incident.witnesses.length})</h3>
            {incident.witnesses.map(w => (
              <div key={w.id} className="text-sm mt-1">{w.fullName} — {w.contactNumber}</div>
            ))}
          </div>
        )}

        {/* Signatures */}
        <div className="space-y-4">
          <SignaturePad label="Your Signature" value={incident.driverSignature} onChange={sig => setDriverSignature(sig || '')} />
          <SignaturePad label="Other Party's Signature (Optional)" value={incident.otherPartySignature} onChange={sig => setOtherPartySignature(sig || '')} />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button onClick={handleGeneratePDF} disabled={generating}
            className="w-full py-4 bg-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <Download size={18} /> {generating ? 'Generating PDF...' : 'Save & Generate PDF'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleShare('whatsapp')}
              className="py-3 bg-success text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button onClick={() => handleShare('email')}
              className="py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
              <Mail size={16} /> Email
            </button>
          </div>

          <button onClick={handleDone}
            className="w-full py-4 bg-success text-white rounded-xl font-semibold flex items-center justify-center gap-2">
            <Check size={18} /> Done — Complete Incident
          </button>
        </div>
      </div>
    </StepWizard>
  );
}
