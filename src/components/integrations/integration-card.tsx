import React from 'react';
import Image from 'next/image'; // For placeholder logos
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type IntegrationStatus = "Connected" | "Integration issue" | "Paused";

interface IntegrationCardProps {
  name: string;
  logoUrl?: string; // URL for the actual logo
  placeholderIcon?: React.ReactNode; // For lucide icons as placeholders
  status: IntegrationStatus;
}

const statusColors: Record<IntegrationStatus, string> = {
  "Connected": "bg-green-500",
  "Integration issue": "bg-red-500",
  "Paused": "bg-orange-400",
};

export function IntegrationCard({ name, logoUrl, placeholderIcon, status }: IntegrationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <Image src={logoUrl} alt={`${name} logo`} width={32} height={32} className="rounded-md" />
          ) : placeholderIcon ? (
            <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md">
              {placeholderIcon}
            </div>
          ) : (
            <div className="w-8 h-8 bg-muted rounded-md" /> // Fallback empty square
          )}
          <span className="font-medium text-sm md:text-base">{name}</span>
        </div>
        <Badge variant="outline" className="text-xs px-2 py-0.5 border-transparent">
          <span className={`mr-1.5 h-2 w-2 rounded-full ${statusColors[status]}`} />
          {status}
        </Badge>
      </CardContent>
    </Card>
  );
} 