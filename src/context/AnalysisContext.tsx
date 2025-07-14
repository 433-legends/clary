'use client';

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Represents a single item from the detailed analysis endpoint
export interface SentimentAnalysisItem {
  Input: string;
  Sentiment: number;
  Explanation: string;
  Category: 'PRAISE' | 'REQUESTS' | 'PROBLEMS' | 'UNCATEGORIZED';
}

// Represents a theme from the category/theme endpoint
export interface Theme {
  Label: string;
  FeedbackTexts: string[];
}

// This is the main data structure held in the context
export interface AnalysisData {
  sentiments: SentimentAnalysisItem[];
  themes?: Theme[]; // Themes are optional and loaded separately
  feedbackFile: File; // Store the file reference for lazy loading themes
}

// Context shape
interface AnalysisContextType {
  analysisData: AnalysisData | null;
  setAnalysisData: (data: Partial<AnalysisData> | ((prev: AnalysisData | null) => AnalysisData | null)) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isThemeLoading: boolean;
  setIsThemeLoading: (loading: boolean) => void;
}

// Create the context with a default value
export const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Create a provider component
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isThemeLoading, setIsThemeLoading] = useState<boolean>(false);

  const handleSetAnalysisData = (data: Partial<AnalysisData> | ((prev: AnalysisData | null) => AnalysisData | null)) => {
    if (typeof data === 'function') {
      setAnalysisData(data);
    } else {
      setAnalysisData(prev => ({
        ...prev,
        ...data,
        sentiments: data.sentiments ?? prev?.sentiments,
        themes: data.themes ?? prev?.themes,
        feedbackFile: data.feedbackFile ?? prev?.feedbackFile,
      } as AnalysisData));
    }
  };

  const value = {
    analysisData,
    setAnalysisData: handleSetAnalysisData,
    isLoading,
    setIsLoading,
    isThemeLoading,
    setIsThemeLoading,
  };

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