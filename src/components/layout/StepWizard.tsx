import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showNext?: boolean;
}

export function StepWizard({
  currentStep, totalSteps, stepLabel, children,
  onBack, onNext, nextLabel = 'Next', nextDisabled = false, showNext = true,
}: StepWizardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white px-4 pt-3 pb-4 safe-area-top">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack || (() => navigate(-1))}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm opacity-80">Step {currentStep} of {totalSteps}</span>
        </div>
        <h1 className="text-lg font-semibold">{stepLabel}</h1>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>

      {/* Bottom action */}
      {showNext && onNext && (
        <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="w-full py-4 bg-navy text-white rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-navy-light transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
