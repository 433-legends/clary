'use client';

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the analysis data you expect
// This should match the structure returned by your /api/analyze-csv endpoint
interface AnalysisResult {
  feedback: string;
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  is_problem?: boolean;
  is_suggestion?: boolean;
}

interface Feedback {
  original_feedback: string;
}

interface AnalysisData {
  totalRows: number;
  analyzedRows: number;
  feedbackColumn: string;
  aiAnalysis: AnalysisResult[];
  summary: any; // Consider defining a more specific type
  feedbacks: Feedback[];
  themes: Theme[];
}

interface Theme {
  Label: string;
  FeedbackTexts: string[];
}

// Define the context shape
interface AnalysisContextType {
  analysisData: AnalysisData | null;
  setAnalysisData: Dispatch<SetStateAction<AnalysisData | null>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Create the context with a default value
export const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Create a provider component
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value = { analysisData, setAnalysisData, isLoading, setIsLoading };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}; 