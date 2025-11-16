import { ReactNode } from 'react';
import clsx from 'clsx';

type OnboardingWizardProps = {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  children: ReactNode;
  nextLabel?: string;
  previousLabel?: string;
  showSkip?: boolean;
  skipLabel?: string;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  isLoading?: boolean;
};

export default function OnboardingWizard({
  currentStep,
  totalSteps,
  stepTitles,
  onNext,
  onPrevious,
  onSkip,
  children,
  nextLabel = 'Continue',
  previousLabel = 'Back',
  showSkip = false,
  skipLabel = 'Skip',
  nextDisabled = false,
  previousDisabled = false,
  isLoading = false,
}: OnboardingWizardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-3xl">
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-subtle-light dark:text-subtle-dark">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="h-2 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={clsx(
                    'flex flex-col items-center flex-1',
                    index + 1 === currentStep ? 'opacity-100' : 'opacity-40'
                  )}
                >
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors',
                      index + 1 < currentStep
                        ? 'bg-primary text-white'
                        : index + 1 === currentStep
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-background-light dark:bg-background-dark text-subtle-light dark:text-subtle-dark'
                    )}
                  >
                    {index + 1 < currentStep ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        check
                      </span>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-center hidden sm:block text-foreground-light dark:text-foreground-dark">
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="mb-8">
            {children}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {currentStep > 1 && onPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={previousDisabled || isLoading}
                  className="px-6 h-12 border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-lg font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>{previousLabel}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {showSkip && onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={isLoading}
                  className="text-sm text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {skipLabel}
                </button>
              )}
              
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={nextDisabled || isLoading}
                  className="px-6 h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>{nextLabel}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

