'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks, UploadCloud, ChevronRight, Package, Users, Link as LinkIcon, FileCheck2, Loader2, Slack } from 'lucide-react'; // Using Link from lucide-react
import { useAnalysis } from '@/context/AnalysisContext';
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
    const [error, setError] = useState<string | null>(null);
    const { setAnalysisData, setIsLoading, isLoading } = useAnalysis();

    const handleFileAccepted = (file: File) => {
        setUploadedFile(file);
        setError(null);
    };

    const handleNext = async () => {
      console.log("handleNext function triggered");
      if (!uploadedFile) {
        return;
      }
      
      setAnalysisData(null);
      setIsLoading(true);
      setError(null);
      
      toast.info("Analyzing your feedback...", {
        description: "This may take a few minutes. You can continue working and check the dashboard later.",
        duration: 8000, 
      });
      onNext();

      const formData = new FormData();
      formData.append('file', uploadedFile);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback/csv_upload`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error("Analysis Failed", {
            description: result.error || 'Something went wrong during the analysis.',
          });
          setError(result.error || 'Something went wrong');
          setIsLoading(false); 
          return;
        }

        const mapSentiment = (score: number): 'positive' | 'negative' | 'neutral' => {
          if (score > 5) return 'positive';
          if (score < 5) return 'negative';
          return 'neutral';
        };

        const analysisDataObject = {
          totalRows: result.length,
          analyzedRows: result.length,
          feedbackColumn: 'feedback_text',
          aiAnalysis: result.map((item: any) => ({
            feedback: item.Input,
            themes: item.Themes || [],
            sentiment: mapSentiment(item.Sentiment),
            is_problem: item.Is_Problem || false,
            is_suggestion: item.Is_Suggestion || false,
          })),
          summary: {},
          feedbacks: result.map((item: any) => ({
            original_feedback: item.Input
          })),
        };

        setAnalysisData(analysisDataObject);
        
        toast.success("Analysis Complete!", {
          description: "Your dashboard is now ready.",
        });

      } catch (err: any) {
        toast.error("Analysis Failed", {
          description: err.message || 'An unexpected network error occurred.',
        });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import feedback</CardTitle>
        <CardDescription>Bring in your feedback for us to analyze and connect to features and issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleNext} disabled={!uploadedFile || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Analyzing...' : 'Next'} &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
} 