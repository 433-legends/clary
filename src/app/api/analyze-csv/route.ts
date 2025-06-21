import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import OpenAI from 'openai';

// Make sure to set the OPENAI_API_KEY environment variable in your .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Heuristic to find the most likely feedback column
const findFeedbackColumn = (headers: string[]): string | null => {
    const commonFeedbackHeaders = ['feedback', 'comment', 'text', 'review', 'suggestion', 'description'];
    for (const header of headers) {
        if (commonFeedbackHeaders.includes(header.toLowerCase())) {
            return header;
        }
    }
    // If no common header is found, return the first column name, or null if no headers.
    return headers.length > 0 ? headers[0] : null; 
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Invalid file type. Please upload a CSV.' }, { status: 400 });
    }

    const fileContent = await file.text();

    const parsedCsv = await new Promise<{ data: any[], meta: Papa.ParseMeta }>((resolve, reject) => {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (error: Error) => reject(error),
        });
    });

    const { data, meta } = parsedCsv;
    const headers = meta.fields || [];

    if (data.length === 0) {
        return NextResponse.json({ error: 'CSV file is empty or could not be parsed.' }, { status: 400 });
    }

    // --- AI Analysis Part ---
    const feedbackColumn = findFeedbackColumn(headers);
    if (!feedbackColumn) {
        return NextResponse.json({ error: 'Could not determine the feedback column in the CSV.' }, { status: 400 });
    }

    // Process all rows from the CSV
    const dataToAnalyze = data;
    const feedbackItems = dataToAnalyze.map((row: any) => row[feedbackColumn]).filter(Boolean);

    if (feedbackItems.length === 0) {
        return NextResponse.json({ error: 'No feedback text found in the selected column.' }, { status: 400 });
    }

    const BATCH_SIZE = 100; // Process 100 entries at a time
    let allAnalyses: any[] = [];

    for (let i = 0; i < feedbackItems.length; i += BATCH_SIZE) {
        const batch = feedbackItems.slice(i, i + BATCH_SIZE);

        const prompt = `
            You are an AI assistant specialized in analyzing customer-submitted feedback.
            Analyze the following ${batch.length} feedback entries.
            For each piece of feedback, provide the following analysis in a JSON object:
            1.  "feedback": The original, verbatim feedback text.
            2.  "themes": An array of 1-4 keywords or short phrases that summarize the main topics.
            3.  "sentiment": A string that is either "positive", "negative", or "neutral".
            4.  "is_problem": A boolean (true/false). Set to true if the feedback primarily describes a bug, error, or point of friction.
            5.  "is_suggestion": A boolean (true/false). Set to true if the feedback primarily proposes a new feature, an improvement, or an idea.

            Return a single JSON object with a single key "analysis", which is an array of these objects.
            Do not include any explanations or introductory text outside of the JSON object.

            Feedback entries to analyze:
            ${JSON.stringify(batch)}
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-1106', // Optimized for JSON mode
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.2,
            });
            
            const aiResponse = completion.choices[0].message.content;
            
            if (!aiResponse) {
                // If one batch fails, we can choose to stop or continue. Stopping is safer for now.
                return NextResponse.json({ error: `AI analysis failed to produce a result for a batch starting at index ${i}.` }, { status: 500 });
            }
        
            const analysisResult = JSON.parse(aiResponse);
            if (analysisResult.analysis && Array.isArray(analysisResult.analysis)) {
                allAnalyses = allAnalyses.concat(analysisResult.analysis);
            }

        } catch (error) {
            console.error(`Error processing batch starting at index ${i}:`, error);
            // Let frontend know which batch failed
            return NextResponse.json({ error: `An error occurred while processing the batch starting at index ${i}.` }, { status: 500 });
        }
    }

    const analysisSummary = {
        totalRows: data.length,
        analyzedRows: allAnalyses.length,
        feedbackColumn: feedbackColumn,
        aiAnalysis: allAnalyses,
    };

    return NextResponse.json({ message: 'CSV analyzed successfully', analysis: analysisSummary });

  } catch (error) {
    console.error('Error processing file upload:', error);
    if (error instanceof OpenAI.APIError) {
        return NextResponse.json({ error: `OpenAI API Error: ${error.message}` }, { status: error.status || 500 });
    }
    if (error instanceof Error && error.message.includes('parse')) {
        return NextResponse.json({ error: 'Failed to parse CSV file.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 