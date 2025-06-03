'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks, UploadCloud, ChevronRight, Package, Users, Link as LinkIcon } from 'lucide-react'; // Using Link from lucide-react

// Mock integration data - replace with actual data or API call later
const integrations = [
  { name: 'Gong', description: 'Continuously sync customer conversations, details, feedback, and requests.', icon: <Package size={24} className="text-blue-500" /> },
  { name: 'Zoom', description: 'Continuously sync customer conversations, details, feedback, and requests.', icon: <Users size={24} className="text-sky-500" /> },
  { name: 'Zoom Revenue Accelerator', description: 'Continuously sync customer conversations, details, feedback, and requests.', icon: <ListChecks size={24} className="text-indigo-500" /> }, 
  { name: 'Clari', description: 'Continuously sync customer conversations, details, feedback, and requests.', icon: <LinkIcon size={24} className="text-rose-500" /> }, // Using LinkIcon alias
  { name: 'Productboard', description: 'Import feedback by uploading a CSV export.', icon: <ChevronRight size={24} className="text-orange-500" /> }, // Placeholder icon
  { name: 'Upload CSV', description: 'Drop a CSV to upload or click to select from your desktop.', icon: <UploadCloud size={24} className="text-gray-500" /> },
];

interface IntegrationsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function IntegrationsStep({ onNext, onBack }: IntegrationsStepProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import feedback</CardTitle>
        <CardDescription>Bring in your feedback for us to analyze and connect to features and issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => (
          <div 
            key={integration.name} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {integration.icon}
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">+ Connect</Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <Button onClick={onNext}>Skip &rarr;</Button> {/* Or Next */}
      </CardFooter>
    </Card>
  );
} 