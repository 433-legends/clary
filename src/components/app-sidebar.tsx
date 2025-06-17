"use client"

import * as React from "react"
import {
  AudioWaveform, // Keep for TeamSwitcher example if we restore it briefly
  BookOpen,
  Bot, 
  Command, // Keep for TeamSwitcher
  Frame, // For NavProjects example
  GalleryVerticalEnd, // For TeamSwitcher example
  LayoutDashboard, // Your icon
  Link2,           // Your icon
  Map,             // For NavProjects example
  PieChart,        // For NavProjects example
  Settings2,
  Shapes,          // Your icon
  SquareTerminal, 
  Zap,
  Settings,
  File,
  Users,
  Calendar
} from "lucide-react"
import { Logo } from "@/components/icons/logo"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects" // Will be removed later if not needed
import { NavUser } from "@/components/nav-user"       // Will be removed later if not needed
import { TeamSwitcher } from "@/components/team-switcher" // Will be removed later if not needed
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Modified data: navMain now has your items. Other sections are placeholders for now.
const data = {
  user: {
    name: "Your Name", // Placeholder
    email: "you@example.com", // Placeholder
    avatar: "/avatars/placeholder.jpg", // Placeholder
  },
  teams: [
    {
      name: "Clarities App", // Simplified TeamSwitcher for now
      logo: Logo, // Use the new Logo component
      plan: "Insights",
    },
  ],
  // YOUR NAVIGATION ITEMS for NavMain
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true, // Example: make Dashboard active by default
      // No sub-items for a flat list
    },
    {
      title: "Insights",
      url: "/insights", // Ensure this path exists
      icon: Zap,
    },
    {
      title: "Themes",
      url: "/themes", // Changed from /#themes
      icon: Shapes,
    },
    {
      title: "Integrations",
      url: "/integrations", // Changed from /#integrations
      icon: Link2,
    },
  ],
  // NavProjects data - can be removed if NavProjects component is removed
  projects: [
    {
      name: "Sample Project 1",
      url: "#",
      icon: Frame,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    // sidebar-07 uses collapsible="icon" by default in its own app-sidebar.tsx
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* For now, let's keep TeamSwitcher to maintain structure, can be removed later */}
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> Temporarily comment out if not immediately needed */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
