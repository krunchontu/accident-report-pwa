import type { EligibilityCheck, EligibilityScore, EligibilityRule } from '../types/eligibility';
import { ELIGIBILITY_RULES } from '../constants/eligibilityRules';

export interface EligibilityResult {
  score: EligibilityScore;
  triggeredRules: EligibilityRule[];
  redCount: number;
  amberCount: number;
}

export function calculateEligibility(check: EligibilityCheck): EligibilityResult {
  const triggeredRules: EligibilityRule[] = [];

  for (const rule of ELIGIBILITY_RULES) {
    const value = check[rule.field];
    if (value === null || value === undefined) continue;
    if (value === rule.failValue) {
      triggeredRules.push(rule);
    }
  }

  const redCount = triggeredRules.filter(r => r.severity === 'red').length;
  const amberCount = triggeredRules.filter(r => r.severity === 'amber').length;

  let score: EligibilityScore = 'green';
  if (redCount > 0) score = 'red';
  else if (amberCount > 0) score = 'amber';

  return { score, triggeredRules, redCount, amberCount };
}
