import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Clock, Check, ChevronLeft } from 'lucide-react';
import { db } from '../../db/database';
import type { Incident } from '../../types/incident';
import { useCountdown } from '../../hooks/useCountdown';

function DeadlineCard({ incidentTime, deadline, onToggle }: {
  incidentTime: string;
  deadline: { id: string; label: string; description: string; deadlineHours: number; completed: boolean; completedAt: string | null };
  onToggle: () => void;
}) {
  const countdown = useCountdown(incidentTime, deadline.deadlineHours);

  if (deadline.deadlineHours === 0 && deadline.completed) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 opacity-60">
        <div className="flex items-center gap-3">
          <Check size={20} className="text-success" />
          <div className="flex-1">
            <div className="font-medium text-sm line-through">{deadline.label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-4 border-2 ${deadline.completed ? 'border-success/30' : countdown.isOverdue ? 'border-danger' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${deadline.completed ? 'border-success bg-success' : 'border-gray-300'}`}>
          {deadline.completed && <Check size={14} className="text-white" />}
        </button>
        <div className="flex-1">
          <div className={`font-medium text-sm ${deadline.completed ? 'line-through text-gray-400' : ''}`}>{deadline.label}</div>
          <p className="text-xs text-gray-500 mt-0.5">{deadline.description}</p>
          {!deadline.completed && deadline.deadlineHours > 0 && (
            <div className={`text-xs font-semibold mt-1 ${countdown.isOverdue ? 'text-danger' : 'text-navy'}`}>
              <Clock size={10} className="inline mr-1" />{countdown.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeadlineDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (id) db.incidents.get(id).then(i => setIncident(i || null));
  }, [id]);

  if (!incident) return <div className="p-4 text-center text-gray-500">Loading...</div>;

  const toggleDeadline = async (dlId: string) => {
    const dl = incident.deadlines.find(d => d.id === dlId);
    if (!dl) return;
    dl.completed = !dl.completed;
    dl.completedAt = dl.completed ? new Date().toISOString() : null;
    await db.incidents.put(incident);
    setIncident({ ...incident });
  };

  const pending = incident.deadlines.filter(d => !d.completed).sort((a, b) => a.deadlineHours - b.deadlineHours);
  const completed = incident.deadlines.filter(d => d.completed);

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-navy text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-navy mb-1">Deadline Tracker</h1>
      <p className="text-sm text-gray-500 mb-4">Incident: {new Date(incident.createdAt).toLocaleDateString('en-SG')}</p>

      {pending.length > 0 && (
        <div className="space-y-2 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending</h2>
          {pending.map(dl => (
            <DeadlineCard key={dl.id} incidentTime={incident.createdAt} deadline={dl} onToggle={() => toggleDeadline(dl.id)} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Completed</h2>
          {completed.map(dl => (
            <DeadlineCard key={dl.id} incidentTime={incident.createdAt} deadline={dl} onToggle={() => toggleDeadline(dl.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
