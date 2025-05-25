"use client";

import React from 'react';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Button } from '@/components/ui/button';
import { IntegrationCard, type IntegrationStatus } from '@/components/integrations/integration-card';
import { PlusCircle, MessageSquareText, Zap, SlackIcon, Briefcase, Building } from 'lucide-react'; // Example icons

// Define a type for our sample integration data
interface IntegrationData {
  id: string;
  name: string;
  status: IntegrationStatus;
  icon?: React.ElementType; // For Lucide icons as placeholders
  logoUrl?: string; // In case you have actual image URLs
}

// Sample data based on the image
const integrations: IntegrationData[] = [
  {
    id: 'intercom',
    name: 'Intercom',
    status: 'Connected',
    icon: MessageSquareText, // Placeholder icon
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    status: 'Connected',
    icon: Zap, // Placeholder icon (Zendesk logo is a bit like a Z/zap)
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'Connected',
    icon: SlackIcon, // Lucide has a SlackIcon
  },
  {
    id: 'hubspot',
    name: 'Hubspot',
    status: 'Integration issue',
    icon: Briefcase, // Placeholder icon
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    status: 'Paused',
    icon: Building, // Placeholder icon
  },
];

export default function IntegrationsPage() {
  const pageActions = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" /> Create Integration
    </Button>
  );

  return (
    <PageContentLayout title="Integrations" actions={pageActions}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            status={integration.status}
            placeholderIcon={integration.icon ? <integration.icon className="h-5 w-5" /> : undefined}
            logoUrl={integration.logoUrl}
          />
        ))}
      </div>
    </PageContentLayout>
  );
} 