import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Connect Your First Tool</CardTitle>
          <CardDescription>
            Let's get started by connecting a platform to pull feedback from.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="feedback-source">Feedback Source</Label>
            <Select>
              <SelectTrigger id="feedback-source">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zendesk">Zendesk</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="gong">Gong</SelectItem>
                <SelectItem value="intercom">Intercom</SelectItem>
                {/* Add more platforms as needed */}
              </SelectContent>
            </Select>
          </div>
          {/* Placeholder for API key input or OAuth button depending on the platform */}
          <p className="text-sm text-muted-foreground">
            You'll be guided through the authentication process for the selected platform.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          {/* Link to the root dashboard page */}
          <Link href="/">
            <Button>Connect and Go to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 