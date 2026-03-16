import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';
import { calculateEligibility } from '../../utils/eligibilityScorer';
import { ELIGIBILITY_RULES } from '../../constants/eligibilityRules';
import type { EligibilityCheck as EligibilityCheckType } from '../../types/eligibility';

interface Question {
  field: keyof EligibilityCheckType;
  question: string;
  category: string;
  invertDisplay?: boolean;
}

const QUESTIONS: Question[] = [
  { field: 'hasValidLicence', question: 'Do you have a valid driving licence?', category: 'Licensing' },
  { field: 'correctLicenceClass', question: 'Is your licence class correct for this vehicle?', category: 'Licensing' },
  { field: 'licenceExpired', question: 'Is your licence expired?', category: 'Licensing', invertDisplay: true },
  { field: 'onSuspension', question: 'Are you currently on licence suspension?', category: 'Licensing', invertDisplay: true },
  { field: 'spectaclesWorn', question: 'Spectacles condition met? (if applicable)', category: 'Licensing' },
  { field: 'underAlcohol', question: 'Were you under the influence of alcohol?', category: 'Driver Fitness', invertDisplay: true },
  { field: 'underDrugs', question: 'Were you under the influence of drugs?', category: 'Driver Fitness', invertDisplay: true },
  { field: 'usingPhone', question: 'Were you using your mobile phone?', category: 'Driver Fitness', invertDisplay: true },
  { field: 'fatigued', question: 'Were you fatigued or drowsy?', category: 'Driver Fitness', invertDisplay: true },
  { field: 'undeclaredMedical', question: 'Do you have undeclared medical conditions?', category: 'Driver Fitness', invertDisplay: true },
  { field: 'isOwner', question: 'Are you the vehicle owner?', category: 'Ownership' },
  { field: 'ownerConsent', question: "Do you have the owner's consent to drive?", category: 'Ownership' },
  { field: 'hasInsurance', question: 'Does the vehicle have valid insurance?', category: 'Insurance' },
  { field: 'insuranceExpired', question: 'Is your insurance expired?', category: 'Insurance', invertDisplay: true },
  { field: 'isNamedDriver', question: 'Are you a named driver on the policy?', category: 'Insurance' },
  { field: 'meetsAgeRequirement', question: 'Do you meet the policy age requirement?', category: 'Insurance' },
  { field: 'meetsExperienceRequirement', question: 'Do you meet the minimum driving experience?', category: 'Insurance' },
  { field: 'roadTaxValid', question: 'Is the road tax current?', category: 'Vehicle Compliance' },
  { field: 'inspectionPassed', question: 'Has the vehicle passed inspection?', category: 'Vehicle Compliance' },
  { field: 'unauthorisedMods', question: 'Are there undeclared modifications?', category: 'Vehicle Compliance', invertDisplay: true },
  { field: 'tyresLegal', question: 'Are tyres in legal condition?', category: 'Vehicle Compliance' },
  { field: 'correctUsage', question: 'Is the vehicle used for its insured purpose?', category: 'Usage' },
  { field: 'doingRideHailing', question: 'Were you doing ride-hailing?', category: 'Usage', invertDisplay: true },
  { field: 'doingDelivery', question: 'Were you doing commercial delivery?', category: 'Usage', invertDisplay: true },
  { field: 'exceedingCapacity', question: 'Were you exceeding passenger capacity?', category: 'Usage', invertDisplay: true },
  { field: 'illegallyParked', question: 'Were you illegally parked?', category: 'Usage', invertDisplay: true },
];

export function EligibilityCheck() {
  const navigate = useNavigate();
  const { currentIncident, updateEligibility } = useAccidentStore();
  const [showResult, setShowResult] = useState(false);

  if (!currentIncident) { navigate('/'); return null; }

  const elig = currentIncident.eligibility;
  const result = calculateEligibility(elig);

  const getTriggeredRule = (field: keyof EligibilityCheckType) => {
    return ELIGIBILITY_RULES.find(r => r.field === field && elig[field] === r.failValue);
  };

  const ynClass = (val: boolean | null, target: boolean) =>
    `flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-center ${
      val === target
        ? target ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white'
        : 'border-gray-200 bg-white'
    }`;

  if (showResult) {
    const ScoreIcon = result.score === 'green' ? ShieldCheck : result.score === 'amber' ? ShieldAlert : ShieldX;
    const scoreColor = result.score === 'green' ? 'text-success' : result.score === 'amber' ? 'text-warning' : 'text-danger';
    const scoreBg = result.score === 'green' ? 'bg-success/10' : result.score === 'amber' ? 'bg-warning/10' : 'bg-danger/10';

    return (
      <StepWizard currentStep={4} totalSteps={8} stepLabel="Eligibility Result" onNext={() => navigate('/accident/witnesses')} onBack={() => setShowResult(false)}>
        <div className="space-y-4">
          <div className={`${scoreBg} rounded-2xl p-6 text-center`}>
            <ScoreIcon size={48} className={`${scoreColor} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${scoreColor} uppercase`}>{result.score}</div>
            <p className="text-sm text-gray-600 mt-2">
              {result.score === 'green' && 'No red flags detected. Your claim should proceed normally.'}
              {result.score === 'amber' && 'Some factors may affect your claim or increase your excess.'}
              {result.score === 'red' && 'Critical issues detected that will likely result in claim denial.'}
            </p>
          </div>

          {result.triggeredRules.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Flagged Items</h3>
              {result.triggeredRules.map((rule, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${rule.severity === 'red' ? 'border-danger bg-danger/5' : 'border-warning bg-warning/5'}`}>
                  <div className="text-xs font-medium text-gray-500">{rule.category}</div>
                  <div className="text-sm font-medium mt-0.5">{rule.consequence}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-100 rounded-xl p-3 text-xs text-gray-500 text-center">
            This is a self-assessment only. Consult your insurer for definitive advice.
          </div>
        </div>
      </StepWizard>
    );
  }

  const categories = [...new Set(QUESTIONS.map(q => q.category))];

  return (
    <StepWizard currentStep={4} totalSteps={8} stepLabel="Claim Eligibility Check" onNext={() => setShowResult(true)}>
      <div className="space-y-6">
        <p className="text-sm text-gray-600">Answer these questions to check if your claim may be affected.</p>
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat}</h3>
            <div className="space-y-3">
              {QUESTIONS.filter(q => q.category === cat).map(q => {
                const triggered = getTriggeredRule(q.field);
                return (
                  <div key={q.field} className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium mb-3">{q.question}</p>
                    <div className="flex gap-2">
                      <button onClick={() => updateEligibility({ [q.field]: true })} className={ynClass(elig[q.field] as boolean | null, true)}>Yes</button>
                      <button onClick={() => updateEligibility({ [q.field]: false })} className={ynClass(elig[q.field] as boolean | null, false)}>No</button>
                      <button onClick={() => updateEligibility({ [q.field]: null })}
                        className={`px-3 py-3 rounded-xl text-xs font-medium border-2 transition-colors ${elig[q.field] === null ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-white text-gray-400'}`}>N/A</button>
                    </div>
                    {triggered && (
                      <div className={`mt-2 p-2 rounded-lg text-xs font-medium ${triggered.severity === 'red' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                        <AlertTriangle size={12} className="inline mr-1" />{triggered.consequence}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </StepWizard>
  );
}
