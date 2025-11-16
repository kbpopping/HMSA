import { ReactNode } from 'react';

type OnboardingStepProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function OnboardingStep({ title, description, children }: OnboardingStepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-subtle-light dark:text-subtle-dark">
            {description}
          </p>
        )}
      </div>
      
      {/* Step Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

