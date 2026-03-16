import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useProfileStore } from './store/useProfileStore';
import { useIncidentStore } from './store/useIncidentStore';
import { AppShell } from './components/layout/AppShell';
import { SetupWizard } from './components/setup/SetupWizard';
import { HomeScreen } from './components/HomeScreen';
import { TriageScreen } from './components/accident/TriageScreen';
import { EmergencyFlow } from './components/accident/EmergencyFlow';
import { SceneDetails } from './components/accident/SceneDetails';
import { PersonalDetails } from './components/setup/PersonalDetails';
import { DosAndDonts } from './components/reference/DosAndDonts';
import { EmergencyNumbers } from './components/reference/EmergencyNumbers';

// Lazy-load heavier components
const PhotoCapture = lazy(() => import('./components/accident/PhotoCapture').then(m => ({ default: m.PhotoCapture })));
const OtherPartyDetails = lazy(() => import('./components/accident/OtherPartyDetails').then(m => ({ default: m.OtherPartyDetails })));
const EligibilityCheck = lazy(() => import('./components/accident/EligibilityCheck').then(m => ({ default: m.EligibilityCheck })));
const WitnessForm = lazy(() => import('./components/accident/WitnessForm').then(m => ({ default: m.WitnessForm })));
const AccidentSketch = lazy(() => import('./components/accident/AccidentSketch').then(m => ({ default: m.AccidentSketch })));
const InjuryPassengers = lazy(() => import('./components/accident/InjuryPassengers').then(m => ({ default: m.InjuryPassengers })));
const Summary = lazy(() => import('./components/accident/Summary').then(m => ({ default: m.Summary })));
const WitnessReportFlow = lazy(() => import('./components/accident/WitnessReportFlow').then(m => ({ default: m.WitnessReportFlow })));
const DeadlineDashboard = lazy(() => import('./components/tracker/DeadlineDashboard').then(m => ({ default: m.DeadlineDashboard })));
const IncidentList = lazy(() => import('./components/records/IncidentList').then(m => ({ default: m.IncidentList })));
const IncidentDetail = lazy(() => import('./components/records/IncidentDetail').then(m => ({ default: m.IncidentDetail })));

function Loading() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  );
}

export default function App() {
  const { loaded, loadProfile, setupComplete } = useProfileStore();
  const { loadIncidents } = useIncidentStore();

  useEffect(() => {
    loadProfile();
    loadIncidents();
  }, [loadProfile, loadIncidents]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-2">SG Accident Kaki</div>
          <div className="text-sm opacity-70">Loading...</div>
        </div>
      </div>
    );
  }

  if (!setupComplete) {
    return <SetupWizard />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/records" element={<IncidentList />} />
          <Route path="/records/:id" element={<IncidentDetail />} />
          <Route path="/details" element={<PersonalDetails />} />
          <Route path="/reference" element={<DosAndDonts />} />
          <Route path="/emergency-numbers" element={<EmergencyNumbers />} />
          <Route path="/deadlines/:id" element={<DeadlineDashboard />} />
        </Route>
        <Route path="/accident/triage" element={<TriageScreen />} />
        <Route path="/accident/emergency" element={<EmergencyFlow />} />
        <Route path="/accident/scene" element={<SceneDetails />} />
        <Route path="/accident/photos" element={<PhotoCapture />} />
        <Route path="/accident/other-party" element={<OtherPartyDetails />} />
        <Route path="/accident/eligibility" element={<EligibilityCheck />} />
        <Route path="/accident/witnesses" element={<WitnessForm />} />
        <Route path="/accident/sketch" element={<AccidentSketch />} />
        <Route path="/accident/injuries" element={<InjuryPassengers />} />
        <Route path="/accident/summary" element={<Summary />} />
        <Route path="/witness" element={<WitnessReportFlow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
