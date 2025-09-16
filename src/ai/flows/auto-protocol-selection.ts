'use server';

/**
 * @fileOverview A flow that automatically selects the optimal network protocols for data ingestion using generative AI.
 *
 * - autoProtocolSelection - A function that handles the protocol selection process.
 * - AutoProtocolSelectionInput - The input type for the autoProtocolSelection function.
 * - AutoProtocolSelectionOutput - The return type for the autoProtocolSelection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoProtocolSelectionInputSchema = z.object({
  connectionRequest: z
    .string()
    .describe("A string containing the details of the connection request, including data source type and connection properties."),
});
export type AutoProtocolSelectionInput = z.infer<typeof AutoProtocolSelectionInputSchema>;

const AutoProtocolSelectionOutputSchema = z.object({
  optimalProtocol: z
    .string()
    .describe("The optimal network protocol selected for the data source, such as MQTT, MODBUS, TCP, UDP, SERIAL, API (SOAP or REST)."),
  reasoning: z.string().describe("The reasoning behind the protocol selection."),
});
export type AutoProtocolSelectionOutput = z.infer<typeof AutoProtocolSelectionOutputSchema>;

export async function autoProtocolSelection(input: AutoProtocolSelectionInput): Promise<AutoProtocolSelectionOutput> {
  return autoProtocolSelectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoProtocolSelectionPrompt',
  input: {schema: AutoProtocolSelectionInputSchema},
  output: {schema: AutoProtocolSelectionOutputSchema},
  prompt: `You are an expert in network protocols and data ingestion.
  Based on the following connection request details, determine the optimal network protocol for real-time data ingestion.
  Consider factors such as data source type, connection properties, and the need for efficiency and reliability.

  Connection Request Details: {{{connectionRequest}}}

  Provide the optimal protocol and a brief explanation of your reasoning.

  Optimal Protocol: {{optimalProtocol}}
  Reasoning: {{reasoning}}`,
});

const autoProtocolSelectionFlow = ai.defineFlow(
  {
    name: 'autoProtocolSelectionFlow',
    inputSchema: AutoProtocolSelectionInputSchema,
    outputSchema: AutoProtocolSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
