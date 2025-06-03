'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XIcon, PlusCircleIcon } from 'lucide-react';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"; // If using Select for roles

interface TeamInvite {
  id: string;
  email: string;
  role: string; // e.g., 'Member', 'Admin'
}

interface InviteTeamFormProps {
  onNext: () => void; // This will be the "Finish" action
  onBack: () => void;
}

export function InviteTeamForm({ onNext, onBack }: InviteTeamFormProps) {
  const [invites, setInvites] = useState<TeamInvite[]>([
    { id: crypto.randomUUID(), email: '', role: 'Member' },
  ]);

  const handleAddInvite = () => {
    setInvites([...invites, { id: crypto.randomUUID(), email: '', role: 'Member' }]);
  };

  const handleRemoveInvite = (id: string) => {
    setInvites(invites.filter(invite => invite.id !== id));
  };

  // const handleInputChange = (id: string, field: keyof Omit<TeamInvite, 'id'>, value: string) => {
  //   setInvites(invites.map(invite => invite.id === id ? { ...invite, [field]: value } : invite));
  // };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Why should you have all the fun?</CardTitle>
        <CardDescription>Share Insights.app with your favorite co-workers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {invites.map((invite, index) => (
          <div key={invite.id} className="flex items-end gap-3">
            <div className="flex-grow space-y-2">
              <Label htmlFor={`email-${invite.id}`}>Email</Label>
              <Input 
                id={`email-${invite.id}`} 
                type="email" 
                placeholder="coworker@example.com" 
                // value={invite.email} 
                // onChange={(e) => handleInputChange(invite.id, 'email', e.target.value)}
              />
            </div>
            <div className="space-y-2 w-40">
              <Label htmlFor={`role-${invite.id}`}>Role</Label>
              {/* Placeholder for Role Select - Using an Input for now */}
              <Input 
                id={`role-${invite.id}`} 
                placeholder="Member" 
                // value={invite.role} 
                // onChange={(e) => handleInputChange(invite.id, 'role', e.target.value)}
              /> 
              {/* <Select defaultValue="Member">
                <SelectTrigger id={`role-${invite.id}"`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            {invites.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.id)} className="text-muted-foreground hover:text-destructive">
                <XIcon size={18} />
                <span className="sr-only">Remove invite</span>
              </Button>
            )}
          </div>
        ))}
        <div>
          <Button variant="outline" onClick={handleAddInvite} className="w-full sm:w-auto">
            <PlusCircleIcon size={16} className="mr-2" /> Add another
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <Button onClick={onNext}>Finish Setup &rarr;</Button>
      </CardFooter>
    </Card>
  );
} 