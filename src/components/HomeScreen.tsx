import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, Clock, ShieldAlert } from 'lucide-react';
import { useIncidentStore } from '../store/useIncidentStore';
import { useProfileStore } from '../store/useProfileStore';
import { useAccidentStore } from '../store/useAccidentStore';
import { differenceInDays, parseISO } from 'date-fns';
import { calculateEligibility } from '../utils/eligibilityScorer';
import type { ReporterSnapshot } from '../types/incident';
import type { UserProfile, VehicleProfile, InsuranceProfile } from '../types/profile';

function buildReporterSnapshot(
  profile: UserProfile | null,
  vehicle: VehicleProfile | null,
  insurance: InsuranceProfile | null,
): ReporterSnapshot | undefined {
  if (!profile) return undefined;
  return {
    fullName: profile.fullName,
    nricFin: profile.nricFin,
    contactNumber: profile.contactNumber,
    email: profile.email,
    address: profile.address,
    licenceNumber: profile.licenceNumber,
    licenceClass: profile.licenceClass,
    licenceExpiryDate: profile.licenceExpiryDate,
    vehicleRegistration: vehicle?.registrationNumber ?? '',
    vehicleMakeModel: vehicle ? `${vehicle.make} ${vehicle.model}`.trim() : '',
    vehicleColour: vehicle?.colour ?? '',
    vehicleYear: vehicle?.year ?? 0,
    ownership: vehicle?.ownership ?? '',
    insurerName: insurance?.insurerName ?? '',
    policyNumber: insurance?.policyNumber ?? '',
    policyType: insurance?.policyType ?? '',
    policyExpiry: insurance?.policyExpiry ?? '',
    claimsHotline: insurance?.claimsHotline ?? '',
    ncdPercentage: insurance?.ncdPercentage ?? 0,
    workshopType: insurance?.workshopType ?? '',
  };
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { incidents } = useIncidentStore();
  const { profile, vehicle, insurance } = useProfileStore();
  const { startNewIncident, loadIncident } = useAccidentStore();

  const inProgressIncident = incidents.find(i => i.status === 'in_progress');
  const completedIncidents = incidents.filter(i => i.status === 'completed');

  // Memoize eligibility scores to avoid recalculating on every render
  const eligibilityScores = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateEligibility>>();
    for (const inc of completedIncidents) {
      map.set(inc.id, calculateEligibility(inc.eligibility));
    }
    return map;
  }, [completedIncidents]);

  const insuranceExpiringSoon = insurance?.policyExpiry
    ? differenceInDays(parseISO(insurance.policyExpiry), new Date()) <= 30 &&
      differenceInDays(parseISO(insurance.policyExpiry), new Date()) >= 0
    : false;

  const profileIncomplete = !profile?.fullName || !profile?.nricFin || !profile?.contactNumber;

  const { lastRoute } = useAccidentStore();

  const resumeIncident = async () => {
    if (inProgressIncident) {
      await loadIncident(inProgressIncident.id);
      navigate(lastRoute || '/accident/triage');
    }
  };

  const handleStartAccident = async () => {
    if (inProgressIncident) {
      await resumeIncident();
      return;
    }
    const reporter = buildReporterSnapshot(profile, vehicle, insurance);
    await startNewIncident(reporter);
    navigate('/accident/triage');
  };

  const handleWitnessReport = async () => {
    const reporter = buildReporterSnapshot(profile, vehicle, insurance);
    await startNewIncident(reporter);
    navigate('/witness');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-navy">SG Accident Kaki</h1>
        <p className="text-sm text-gray-500 mt-1">Your roadside accident companion</p>
      </div>

      {/* In-progress banner */}
      {inProgressIncident && (
        <button
          onClick={resumeIncident}
          className="w-full bg-warning/10 border-2 border-warning rounded-xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <Clock className="text-warning shrink-0" size={24} />
            <div>
              <div className="font-semibold text-warning">Incident in progress</div>
              <div className="text-sm text-gray-600">Tap to continue documenting</div>
            </div>
          </div>
        </button>
      )}

      {/* Big red button */}
      <button
        onClick={handleStartAccident}
        className="w-full min-h-[40vh] bg-danger hover:bg-danger-light active:scale-[0.98] text-white rounded-2xl p-8 shadow-lg transition-all"
      >
        <AlertTriangle size={48} className="mx-auto mb-3" />
        <div className="text-xl font-bold">
          {inProgressIncident ? 'Continue Documenting' : "I've Been in an Accident"}
        </div>
        <div className="text-sm opacity-80 mt-2">Tap to start documenting</div>
      </button>

      {/* Witness button */}
      <button
        onClick={handleWitnessReport}
        className="w-full bg-white border-2 border-navy text-navy rounded-xl p-4 font-semibold flex items-center justify-center gap-2"
      >
        <Eye size={20} />
        I'm a Witness / Passenger
      </button>

      {/* Warnings */}
      {insuranceExpiringSoon && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-warning shrink-0 mt-0.5" size={20} />
          <div>
            <div className="font-medium text-warning">Insurance expiring soon</div>
            <div className="text-sm text-gray-600">Your policy expires within 30 days. Renew it now.</div>
          </div>
        </div>
      )}

      {profileIncomplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <button onClick={() => navigate('/details')} className="underline font-medium">
            Complete your profile
          </button>{' '}
          to save time during an accident.
        </div>
      )}

      {/* Recent incidents */}
      {completedIncidents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Incidents</h2>
          <div className="space-y-2">
            {completedIncidents.slice(0, 3).map(incident => (
              <button
                key={incident.id}
                onClick={() => navigate(`/records/${incident.id}`)}
                className="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{incident.scene.location.address || 'Unknown location'}</div>
                  {(() => {
                    const elig = eligibilityScores.get(incident.id);
                    if (!elig) return null;
                    const color = elig.score === 'green' ? 'text-success bg-success/10' : elig.score === 'amber' ? 'text-warning bg-warning/10' : 'text-danger bg-danger/10';
                    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{elig.score.toUpperCase()}</span>;
                  })()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(incident.createdAt).toLocaleDateString('en-SG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
