import React from 'react';

// This layout is now minimal as the main structure (Sidebar, GlobalHeader)
// is handled by the root layout (src/app/layout.tsx).
export default function DashboardPagesLayout({ // Renamed for clarity
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // Simply pass children through
} 