'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IntegrationsStep } from '@/components/onboarding/integrations-step';

export default function OnboardingPage() {
  const router = useRouter();

    // The 'onNext' prop is required by the component, 
    // so we provide a function to navigate to the dashboard on completion.
    const handleOnboardingComplete = () => {
      router.push('/dashboard');
  };

  return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <IntegrationsStep onNext={handleOnboardingComplete} />
      </div>
    </div>
  );
} 