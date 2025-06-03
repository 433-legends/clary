'use client';

import React, { useState } from 'react';
import { CompanyDetailsForm } from '@/components/onboarding/company-details-form';
import { IntegrationsStep } from '@/components/onboarding/integrations-step';
import { InviteTeamForm } from '@/components/onboarding/invite-team-form';
import { useRouter } from 'next/navigation';

// Placeholder for a simple header/logo for onboarding
const OnboardingHeader = () => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="flex items-center gap-2">
        {/* Replace with your actual logo component or SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
        <span className="font-semibold text-lg">Insights.app Onboarding</span>
      </div>
    </header>
  );
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding and redirect to dashboard
      router.push('/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyDetailsForm onNext={nextStep} />;
      case 2:
        return <IntegrationsStep onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <InviteTeamForm onNext={nextStep} onBack={prevStep} />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingHeader />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
            <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
                {/* Optional: Add a progress bar here */}
            </div>
            {renderStep()}
        </div>
      </div>
    </div>
  );
} 