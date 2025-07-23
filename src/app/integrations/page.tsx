"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IntegrationCard } from '@/components/integrations/integration-card';
import { useAnalysis } from '@/context/AnalysisContext';
import { UploadCloud, Slack, Mail, ZoomIn, MessageCircle, Twitter } from 'lucide-react'; // Example icons

export default function IntegrationsPage() {
    const router = useRouter();
    const { analysisData } = useAnalysis();
    const isCsvConnected = !!analysisData?.feedbackFile;

    const handleViewCsv = () => {
        if (isCsvConnected) {
            router.push('/feedback');
        }
    };

    const availableIntegrations = [
        { name: 'Slack', icon: <Slack size={20} /> },
        { name: 'Gmail', icon: <Mail size={20} /> },
        { name: 'Zoom', icon: <ZoomIn size={20} /> },
        { name: 'Reddit', icon: <MessageCircle size={20} /> },
        { name: 'Twitter', icon: <Twitter size={20} /> },
    ];

    return (
        <PageContentLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Connected Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Connected</h2>
                    <div className="space-y-4">
                        <IntegrationCard
                            name="CSV upload"
                            icon={<UploadCloud size={20} />}
                            action={
                                <Button variant="outline" size="sm" onClick={handleViewCsv} disabled={!isCsvConnected}>
                                    View
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Available Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Available</h2>
                    <div className="space-y-4">
                        {availableIntegrations.map((integration) => (
                            <IntegrationCard
                                key={integration.name}
                                name={integration.name}
                                icon={integration.icon}
                                action={<Badge variant="secondary">Coming soon</Badge>}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </PageContentLayout>
    );
} 