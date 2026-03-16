import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useIncidentStore } from '../../store/useIncidentStore';
import { formatDateTime } from '../../utils/dateHelpers';
import { calculateEligibility } from '../../utils/eligibilityScorer';

export function IncidentList() {
  const navigate = useNavigate();
  const { incidents, deleteIncident } = useIncidentStore();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this incident? This cannot be undone.')) {
      await deleteIncident(id);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-navy mb-4">My Records</h1>

      {incidents.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No incidents recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(incident => {
            const eligResult = calculateEligibility(incident.eligibility);
            const scoreColor = eligResult.score === 'green' ? 'bg-success' : eligResult.score === 'amber' ? 'bg-warning' : 'bg-danger';
            return (
              <button key={incident.id} onClick={() => navigate(`/records/${incident.id}`)}
                className="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{incident.scene.location.address || incident.scene.location.roadName || 'Unknown location'}</span>
                    {incident.status === 'in_progress' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium whitespace-nowrap">In Progress</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{formatDateTime(incident.createdAt)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${scoreColor}`} />
                    <span className="text-xs text-gray-500">{incident.otherParties[0]?.driverName || 'No other party'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={(e) => handleDelete(e, incident.id)} className="p-2 text-gray-400 hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
