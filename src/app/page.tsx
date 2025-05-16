import React from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { InfoCard, BarChartItem } from '@/components/dashboard/info-card';

// Sample data for the charts
const sampleChartData: BarChartItem[] = [
  { label: "Dashboard performance", value: 90 },
  { label: "Export feature investigation", value: 75 },
  { label: "Mobile app crash", value: 60 },
  { label: "Sound", value: 45 },
  { label: "Camera", value: 30 },
  { label: "Dark mode", value: 55 },
  { label: "Privacy", value: 80 },
  { label: "Automation", value: 20 },
  { label: "Risk", value: 70 },
];

// Function to get a slice of sample data or vary it for different cards
const getCardData = (title: string): BarChartItem[] => {
  // Simple variation: take different slices or shuffle for variety
  if (title.includes("channels")) return sampleChartData.slice(0, 6).map(item => ({...item, value: Math.random() * 80 + 20}));
  if (title.includes("negative")) return sampleChartData.slice(2, 7).map(item => ({...item, value: Math.random() * 70 + 10}));
  if (title.includes("improvements")) return sampleChartData.slice(1, 6).map(item => ({...item, value: Math.random() * 90 + 10}));
  if (title.includes("time")) return sampleChartData.slice(0, 4).map(item => ({...item, label: `Week ${sampleChartData.indexOf(item) + 1}` , value: Math.random() * 100}));
  return sampleChartData.slice(0, Math.floor(Math.random() * 5) + 5); // Default: random number of items
};

export default function HomePage() {
  const cardTitles = [
    "Top 10 themes",
    "Top feedback channels",
    "Top 10 negative feedbacks",
    "Top 10 suggested improvements",
    "Feedback over time",
    "Top 10 anomalies"
  ];

  return (
    <>
      {/* Page-specific header content */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Generate report
        </Button>
      </div>

      {/* Dashboard cards grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {cardTitles.map(title => (
          <InfoCard key={title} title={title} chartData={getCardData(title)} />
        ))}
      </div>
    </>
  );
}
