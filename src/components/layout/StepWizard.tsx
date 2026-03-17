import { useEffect, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccidentStore } from '../../store/useAccidentStore';

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
  const location = useLocation();
  const setLastRoute = useAccidentStore(s => s.setLastRoute);

  // Track the last visited route for resume functionality
  useEffect(() => {
    setLastRoute(location.pathname);
  }, [location.pathname, setLastRoute]);

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Exit report?</h3>
            <p className="text-sm text-gray-600">Your progress has been saved. You can resume this report later from the home screen.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium">
                Continue editing
              </button>
              <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-navy text-white text-sm font-medium">
                Exit to home
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => setShowExitConfirm(true)}
            className="ml-auto p-2 -mr-2 rounded-full hover:bg-white/10 active:bg-white/20"
            aria-label="Exit to home"
          >
            <X size={22} />
          </button>
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
