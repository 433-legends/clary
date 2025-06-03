'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyDetailsFormProps {
  onNext: () => void;
}

export function CompanyDetailsForm({ onNext }: CompanyDetailsFormProps) {
  // For now, we won't handle form state, just the layout and Next button
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Describe your company</CardTitle>
        <CardDescription>Help us understand what you do.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" placeholder="Your company name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Company Website</Label>
          <Input id="companyWebsite" placeholder="https://companyurl.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyDescription">Company Description</Label>
          <Textarea
            id="companyDescription"
            placeholder="We'll try to get some basic description from your URL, you can easily edit and change..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Input id="businessType" placeholder="Select or type tag... e.g., SaaS, E-commerce" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onNext}>Next &rarr;</Button>
      </CardFooter>
    </Card>
  );
} 