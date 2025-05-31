"use client";

import React from 'react';
import {
  Sidebar as BaseSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useChatbot } from "./chatbot-provider";
import { Button } from "@/components/ui/button";
import { XIcon, SendHorizonalIcon, SparklesIcon } from 'lucide-react'; // Added SparklesIcon, SendHorizonalIcon might be SendHorizontal
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"; // Textarea not found, using Input for now
import { cn } from "@/lib/utils";

export function ChatbotPanel() {
  const { isOpen, toggle } = useChatbot();

  // if (!isOpen) { // We will use CSS to hide/show based on translate
  //   return null;
  // }
  
  return (
    <div 
        className={cn(
            "fixed inset-y-0 right-0 z-50 flex flex-col bg-background border-l transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full",
            "w-80 md:w-96 shadow-xl" // Added shadow-xl for better visual separation
        )}
    >
      <BaseSidebar
        side="right"
        variant="sidebar" // Changed to sidebar to use full height and less opinionated styling from our BaseSidebar
        className="h-full w-full p-0 border-none shadow-none bg-transparent flex flex-col" 
        data-state={isOpen ? "expanded" : "collapsed"}
      >
        <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full">
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close AI Assistant</span>
          </Button>
        </SidebarHeader>
        <SidebarContent className="p-4 flex-1 overflow-y-auto">
          {/* Placeholder for chat messages */}
          <div className="space-y-4 flex flex-col">
            <div className="flex justify-start w-full">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
                Hello! How can I help you with your product insights today?
              </div>
            </div>
            <div className="flex justify-end w-full">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                Can you summarize the top 3 negative themes from last week?
              </div>
            </div>
            {/* Add more messages here */}
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Ask AI Assistant..." 
              className="flex-1"
            />
            <Button variant="default" size="icon">
              <SendHorizonalIcon className="h-5 w-5" /> 
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </SidebarFooter>
      </BaseSidebar>
    </div>
  );
} 