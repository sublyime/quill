
'use server';

import {
  autoProtocolSelection,
  type AutoProtocolSelectionInput,
  type AutoProtocolSelectionOutput,
} from '@/ai/flows/auto-protocol-selection';
import { z } from 'zod';

const ActionInputSchema = z.object({
  connectionRequest: z.string().min(10, 'Please provide more details for a better recommendation.'),
});

export async function getProtocolSuggestion(
  prevState: any,
  formData: FormData
): Promise<{data: AutoProtocolSelectionOutput | null, error: string | null}> {
  const validatedFields = ActionInputSchema.safeParse({
    connectionRequest: formData.get('connectionRequest'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.connectionRequest?.[0] ?? "Invalid input."
    };
  }

  try {
    const result = await autoProtocolSelection(validatedFields.data);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error in getProtocolSuggestion action:', error);
    return { data: null, error: 'An unexpected error occurred. Please try again later.' };
  }
}
