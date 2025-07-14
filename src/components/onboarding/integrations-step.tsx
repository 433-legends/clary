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
    const [feedbackColumn, setFeedbackColumn] = useState('feedback_text');
    const { setAnalysisData, setIsLoading, isLoading, setIsThemeLoading, isThemeLoading } = useAnalysis();

    const handleFileAccepted = (file: File) => {
        setUploadedFile(file);
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
        <div className="space-y-2">
            <Label htmlFor="feedback-column">Feedback Column Name</Label>
            <Input 
                id="feedback-column"
                placeholder="e.g., 'review', 'comment', 'feedback_text'"
                value={feedbackColumn}
                onChange={(e) => setFeedbackColumn(e.target.value)}
            />
        </div>
        <CsvUploader onFileAccepted={handleFileAccepted} />
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or connect Slack
                </span>
            </div>
        </div>
        {integrations.filter(i => i.name === 'Slack').map((integration) => (
          <div 
            key={integration.name} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {integration.icon}
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack} disabled={isLoading}>&larr; Back</Button>
        )}
        {!onBack && <div />}
        <Button onClick={handleNext} disabled={!uploadedFile || isLoading || isThemeLoading || !feedbackColumn.trim()}>
            {(isLoading || isThemeLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Next &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
} 