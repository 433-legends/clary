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

    // Limit to the first 100 rows for the purpose of this onboarding analysis
    const dataToAnalyze = data.slice(0, 100);
    const feedbackItems = dataToAnalyze.map((row: any) => row[feedbackColumn]).filter(Boolean);

    if (feedbackItems.length === 0) {
        return NextResponse.json({ error: 'No feedback text found in the selected column.' }, { status: 400 });
    }

    const prompt = `
        You are an AI assistant specialized in analyzing customer feedback.
        Analyze the following ${feedbackItems.length} feedback entries.
        For each piece of feedback, identify the main themes (e.g., "UI/UX", "Bug", "Feature Request", "Pricing").
        Also determine the sentiment (positive, negative, neutral) for each.
        
        Return a JSON object with a single key "analysis" which is an array of objects.
        Each object in the array should correspond to a feedback entry and have the following structure:
        { "feedback": "the original feedback text", "themes": ["theme1", "theme2"], "sentiment": "positive/negative/neutral" }

        Do not include any explanations or introductory text outside of the JSON object.
        The entire response should be a single valid JSON object.

        Feedback entries to analyze:
        ${JSON.stringify(feedbackItems)}
    `;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106', // Optimized for JSON mode
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
        return NextResponse.json({ error: 'AI analysis failed to produce a result.' }, { status: 500 });
    }

    const analysisResult = JSON.parse(aiResponse);

    const analysisSummary = {
        totalRows: data.length,
        analyzedRows: feedbackItems.length,
        feedbackColumn: feedbackColumn,
        aiAnalysis: analysisResult.analysis,
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