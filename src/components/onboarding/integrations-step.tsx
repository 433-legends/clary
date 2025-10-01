'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
import { ListChecks, UploadCloud, ChevronRight, Package, Users, Link as LinkIcon, FileCheck2, Loader2, Slack } from 'lucide-react';
import { useAnalysis, AnalysisData } from '@/context/AnalysisContext';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock integration data - replace with actual data or API call later
const integrations = [
  { name: 'Slack', description: 'Continuously sync customer conversations, details, feedback, and requests.', icon: <Slack size={24} className="text-blue-500" /> },
  { name: 'Upload CSV', description: 'Drop a CSV to upload or click to select from your desktop.', icon: <UploadCloud size={24} className="text-gray-500" /> },
];

interface CsvUploaderProps {
  onFileAccepted: (file: File) => void;
}

function CsvUploader({ onFileAccepted }: CsvUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileAccepted(file);
      console.log('Accepted file:', file.name, file.size);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
      }`}
    >
      <input {...getInputProps()} />
      {uploadedFile ? (
        <>
          <FileCheck2 className="w-12 h-12 text-green-500 mb-2" />
          <p className="text-sm font-semibold text-green-600">File Ready!</p>
          <p className="text-xs text-muted-foreground">{uploadedFile.name}</p>
        </>
      ) : (
        <>
          <UploadCloud className="w-12 h-12 text-muted-foreground mb-2" />
          {isDragActive ? (
            <p className="text-sm font-semibold">Drop the file here ...</p>
          ) : (
            <p className="text-sm text-center">Drag 'n' drop a CSV file here, or click to select a file</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Maximum file size 10MB</p>
        </>
      )}
    </div>
  );
}

interface IntegrationsStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function IntegrationsStep({ onNext, onBack }: IntegrationsStepProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [feedbackColumn, setFeedbackColumn] = useState('');
    const { setAnalysisData, setIsLoading, isLoading, setIsThemeLoading, isThemeLoading } = useAnalysis();

    const handleFileAccepted = async (file: File) => {
        setUploadedFile(file);
        setColumns([]);
        setFeedbackColumn('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/columns`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to get columns');
            }

            const data = await response.json();
            setColumns(data.columns || []);
            if (data.columns && data.columns.length > 0) {
              // Try to auto-select a common feedback column name
              const commonNames = ['feedback', 'review', 'comment', 'feedback_text'];
              const foundName = data.columns.find((c: string) => commonNames.includes(c.toLowerCase()));
              if (foundName) {
                setFeedbackColumn(foundName);
              }
            }

        } catch (error) {
            toast.error("Could not read columns from CSV", {
                description: (error as Error).message,
            });
        }
    };

    const handleNext = async () => {
      if (!uploadedFile) {
        toast.error("Please upload a file first.");
        return;
      }
      if (!feedbackColumn.trim()) {
        toast.error("Please specify the feedback column name.");
        return;
      }

      setIsLoading(true);
      setIsThemeLoading(true);
      setAnalysisData(() => null);

      // Immediately navigate the user to the next step (dashboard)
      onNext(); 

      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const sentimentApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/csv_upload?feedback_column=${encodeURIComponent(feedbackColumn)}&filter_feedback=false`;
      const themesApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/categories/csv_upload?feedback_column=${encodeURIComponent(feedbackColumn)}`;


      toast.info("Analyzing Feedback...", {
        description: "This may take a moment. You can navigate the app while we work.",
      });

      // --- SENTIMENT ANALYSIS CALL ---
      fetch(sentimentApiUrl, {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.detail || 'Sentiment analysis failed'); });
        }
        return response.json();
      })
      .then(result => {
        const sentimentAnalysisResult = result.flat();
        setAnalysisData({
          sentiments: sentimentAnalysisResult,
          feedbackFile: uploadedFile,
        });
        toast.success("Sentiment analysis complete!");
      })
      .catch(err => {
        toast.error("Sentiment Analysis Failed", { description: err.message });
      })
      .finally(() => {
        setIsLoading(false);
      });

      // --- THEME/CATEGORY ANALYSIS CALL ---
      fetch(themesApiUrl, {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.detail || 'Theme analysis failed'); });
        }
        return response.json();
      })
      .then(result => {
        setAnalysisData({ themes: result });
        toast.success("Theme analysis complete!");
      })
      .catch(err => {
        toast.error("Theme Analysis Failed", { description: err.message });
      })
      .finally(() => {
        setIsThemeLoading(false);
      });
    };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import feedback</CardTitle>
        <CardDescription>Bring in your feedback for us to analyze and connect to features and issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CsvUploader onFileAccepted={handleFileAccepted} />

        {columns.length > 0 && (
            <div className="space-y-2">
                <Label htmlFor="feedback-column">Select Feedback Column</Label>
                <Select value={feedbackColumn} onValueChange={setFeedbackColumn}>
                    <SelectTrigger id="feedback-column">
                        <SelectValue placeholder="Choose the column with feedback..." />
                    </SelectTrigger>
                    <SelectContent>
                        {columns.map((col) => (
                            <SelectItem key={col} value={col}>
                                {col}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {onBack ? (
          <Button variant="outline" onClick={onBack} disabled={isLoading}>&larr; Back</Button>
        ) : <div />}
        <div className="flex gap-2">
            <Button variant="outline" onClick={onNext}>Skip</Button>
            <Button onClick={handleNext} disabled={!uploadedFile || isLoading || isThemeLoading || !feedbackColumn.trim()}>
                {(isLoading || isThemeLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next &rarr;
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 