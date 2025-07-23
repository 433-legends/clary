import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface IntegrationCardProps {
  name: string;
  icon: React.ReactNode;
  action: React.ReactNode;
}

export function IntegrationCard({ name, icon, action }: IntegrationCardProps) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md">
            {icon}
          </div>
          <span className="font-medium text-sm">{name}</span>
        </div>
        <div>
            {action}
        </div>
      </CardContent>
    </Card>
  );
} 