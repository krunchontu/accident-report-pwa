import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChevronLeft, Download, Clock, Share2 } from 'lucide-react';
import { db } from '../../db/database';
import type { Incident } from '../../types/incident';
import { formatDateTime } from '../../utils/dateHelpers';
import { calculateEligibility } from '../../utils/eligibilityScorer';
import { generatePDF } from '../../utils/pdfExport';
import { shareFile } from '../../utils/shareHelper';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) db.incidents.get(id).then(i => setIncident(i || null));
  }, [id]);

  if (!incident) return <div className="p-4 text-center text-gray-500">Loading...</div>;

  const eligResult = calculateEligibility(incident.eligibility);
  const scoreColor = eligResult.score === 'green' ? 'text-success bg-success/10' : eligResult.score === 'amber' ? 'text-warning bg-warning/10' : 'text-danger bg-danger/10';

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      const photos = await db.photos.where('incidentId').equals(incident.id).toArray();
      const photoData = photos.map(p => ({ promptId: p.promptId, thumbnail: p.thumbnail }));
      const blob = await generatePDF(incident, photoData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accident-report-${incident.createdAt.slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    setGenerating(true);
    try {
      const photos = await db.photos.where('incidentId').equals(incident.id).toArray();
      const photoData = photos.map(p => ({ promptId: p.promptId, thumbnail: p.thumbnail }));
      const blob = await generatePDF(incident, photoData);
      const file = new File([blob], `accident-report-${incident.createdAt.slice(0, 10)}.pdf`, { type: 'application/pdf' });
      await shareFile('Accident Report', file);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <button onClick={() => navigate('/records')} className="flex items-center gap-1 text-navy text-sm mb-4">
        <ChevronLeft size={16} /> Back to Records
      </button>

      <h1 className="text-xl font-bold text-navy mb-1">Incident Report</h1>
      <p className="text-sm text-gray-500 mb-4">{formatDateTime(incident.createdAt)}</p>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Scene</h3>
          <div className="text-sm space-y-1">
            <div>{incident.scene.location.address || 'Unknown location'}</div>
            <div className="text-gray-500">Weather: {incident.scene.weather} | Road: {incident.scene.roadCondition}</div>
            {incident.scene.description && <div className="mt-2">{incident.scene.description}</div>}
          </div>
        </div>

        {incident.otherParties.map((p, i) => (
          <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Other Party {i + 1}{p.isForeignVehicle ? ' (Foreign)' : ''}</h3>
            <div className="text-sm space-y-1">
              <div>{p.driverName || 'Unknown'}</div>
              <div className="text-gray-500">{p.vehicleRegistration} — {p.vehicleMakeModel}</div>
            </div>
          </div>
        ))}

        <div className={`rounded-xl p-4 ${scoreColor}`}>
          <h3 className="font-semibold">Eligibility: {eligResult.score.toUpperCase()}</h3>
          <div className="text-sm mt-1">{eligResult.triggeredRules.length} issue(s) flagged</div>
        </div>

        {incident.injuries && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Injuries</h3>
            <div className="text-sm space-y-1">
              <div>Injuries reported: {incident.injuries.anyInjuries ? 'Yes' : 'No'}</div>
              {incident.injuries.ambulanceCalled && <div>Ambulance called</div>}
              {incident.injuries.hospitalName && <div>Hospital: {incident.injuries.hospitalName}</div>}
              <div>Passengers: {incident.injuries.passengerCount}</div>
            </div>
          </div>
        )}

        {incident.witnesses.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Witnesses</h3>
            <div className="text-sm space-y-2">
              {incident.witnesses.map(w => (
                <div key={w.id}>
                  <div className="font-medium">{w.fullName}</div>
                  {w.contactNumber && <div className="text-gray-500">{w.contactNumber}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {incident.sketchDataUrl && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Sketch</h3>
            <img src={incident.sketchDataUrl} alt="Sketch" className="w-full rounded-lg" />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleExportPDF} disabled={generating}
            className="flex-1 py-3 bg-navy text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            <Download size={16} /> {generating ? 'Generating...' : 'Export PDF'}
          </button>
          <button onClick={handleShare} disabled={generating}
            className="flex-1 py-3 bg-navy text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            <Share2 size={16} /> Share
          </button>
          <button onClick={() => navigate(`/deadlines/${incident.id}`)}
            className="flex-1 py-3 bg-warning text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Clock size={16} /> Deadlines
          </button>
        </div>
      </div>
    </div>
  );
}
