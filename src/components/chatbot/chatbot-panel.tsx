"use client";

import { useChat } from '@ai-sdk/react';
import { useContext } from 'react';
import { AnalysisContext } from '@/context/AnalysisContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, X } from 'lucide-react';
import { useChatbot } from './chatbot-provider';
import { cn } from '@/lib/utils';
import {
  Sidebar as BaseSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function ChatbotPanel() {
  const { isOpen, toggle } = useChatbot();
  const analysisContext = useContext(AnalysisContext);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  if (!analysisContext) {
    return null;
  }

  const { analysisData } = analysisContext;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-background border-l transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "w-full max-w-md"
      )}
    >
      <BaseSidebar
        side="right"
        className="h-full w-full p-0 border-none shadow-none bg-transparent flex flex-col"
      >
        <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map(m => (
                  <div key={m.id} className="whitespace-pre-wrap">
                    <span className="font-bold">
                      {m.role === 'user' ? 'You: ' : 'Clary: '}
                    </span>
                    {m.content}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p>Ask a question to get started!</p>
                  <p className="text-sm mt-2">e.g., "What are the top things my users are saying?"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <form
            onSubmit={(e) => handleSubmit(e, {
              body: {
                data: analysisContext.analysisData?.feedbacks
              }
            })}
            className="flex items-center space-x-2"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={!analysisData}
            />
            <Button type="submit" disabled={!analysisData}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </SidebarFooter>
      </BaseSidebar>
    </div>
  );
} 