import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  const systemPrompt = `You are an assistant for a platform called Clary.
  You are a friendly and helpful assistant that helps users understand their customer feedback.
  You are given a list of customer feedback.
  Each feedback has a 'sentiment', 'summary', and 'original_feedback' field.
  The 'sentiment' is either 'positive', 'negative', or 'neutral'.
  The 'summary' is a short summary of the feedback.
  The 'original_feedback' is the original feedback from the customer.

  Here is the customer feedback data:
  ${JSON.stringify(data, null, 2)}

  Based on the user's question, provide a helpful and friendly response.
  Answer the question based on the provided customer feedback data.
  Keep your answers concise and to the point.
  If you don't know the answer, say that you don't know.
  `;

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
} 