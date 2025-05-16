"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"; // For potential future actions
import { Search as SearchIcon } from "lucide-react";
import { InsightItemCard, InsightPriority } from '@/components/insights/insight-item-card';

const sampleInsights = [
  {
    title: "Dashboard Performance Issues",
    description: "32% increase in complaints about dashboard loading times over the past 2 weeks.",
    mentions: 18,
    generatedTime: "2 hours ago",
    confidence: 85,
    priority: "Critical" as InsightPriority,
  },
  {
    title: "Export Feature Requests",
    description: "Multiple enterprise customers have requested CSV and PDF export options for reports.",
    mentions: 28,
    generatedTime: "5 hours ago",
    confidence: 70,
    priority: "High Priority" as InsightPriority,
  },
  {
    title: "Mobile App Positive Feedback",
    description: "The recent mobile app update has received overwhelmingly positive feedback, with a 92% satisfaction rate.",
    mentions: 38,
    generatedTime: "1 day ago",
    confidence: 92,
    priority: "Positive" as InsightPriority,
  },
  {
    title: "API Documentation Gaps",
    description: "Developers report several key endpoints are missing from the current API documentation, hindering integration efforts.",
    mentions: 12,
    generatedTime: "3 days ago",
    confidence: 60,
    priority: "High Priority" as InsightPriority,
  },
  {
    title: "Onboarding Flow Drop-offs",
    description: "User analytics show a 15% drop-off rate at step 3 of the new user onboarding process. Users cite unclear instructions.",
    mentions: 22,
    generatedTime: "6 hours ago",
    confidence: 78,
    priority: "Critical" as InsightPriority,
  },
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Generated Insights</h1>
        <p className="text-muted-foreground">
          Browse all AI-generated insights from your feedback data
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search insights..." 
            className="pl-10 w-full md:w-[300px] lg:w-[400px]"
          />
        </div>
        <div className="flex gap-4">
          <Select defaultValue="all-categories">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="ux-ui">UX/UI</SelectItem>
              <SelectItem value="bugs">Bugs</SelectItem>
              <SelectItem value="feature-requests">Feature Requests</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="most-recent">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest-confidence">Highest Confidence</SelectItem>
              <SelectItem value="critical-priority">Critical Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insights List */}
      <div className="flex flex-col gap-4 mt-4">
        {sampleInsights.map((insight, index) => (
          <InsightItemCard
            key={index} // Using index as key for simplicity with sample data
            title={insight.title}
            description={insight.description}
            mentions={insight.mentions}
            generatedTime={insight.generatedTime}
            confidence={insight.confidence}
            priority={insight.priority}
            onViewClick={() => alert(`Viewing insight: ${insight.title}`)} // Placeholder action
          />
        ))}
      </div>
    </div>
  );
} 