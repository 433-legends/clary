import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Layers, Slack as SlackIcon, Redo2, Cloud } from 'lucide-react';
import { IntegrationCard, IntegrationStatus } from '@/components/integrations/integration-card';

const integrationsData: Array<{ name: string; status: IntegrationStatus; icon: React.ReactNode }> = [
  {
    name: "Intercom",
    status: "Connected",
    icon: <MessageSquare className="w-5 h-5 text-blue-600" />
  },
  {
    name: "Zendesk",
    status: "Connected",
    icon: <Layers className="w-5 h-5 text-green-700" />
  },
  {
    name: "Slack",
    status: "Connected",
    icon: <SlackIcon className="w-5 h-5" />
  },
  {
    name: "Hubspot",
    status: "Integration issue",
    icon: <Redo2 className="w-5 h-5 text-orange-500 transform scale-x-[-1]" /> // Flipped for resemblance
  },
  {
    name: "Salesforce",
    status: "Paused",
    icon: <Cloud className="w-5 h-5 text-blue-400" />
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl">Integrations</h1>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create integration
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {integrationsData.map((integration) => (
          <IntegrationCard 
            key={integration.name} 
            name={integration.name} 
            status={integration.status} 
            placeholderIcon={integration.icon} 
          />
        ))}
      </div>
    </>
  );
} 