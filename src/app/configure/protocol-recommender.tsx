'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { getProtocolSuggestion } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Get Recommendation'
      )}
    </Button>
  );
}

export function ProtocolRecommender() {
  const [state, formAction] = useActionState(getProtocolSuggestion, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if(state.data){
        formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Protocol Helper</CardTitle>
          <CardDescription>
            Describe your data source in plain English, and our AI will suggest the optimal connection protocol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <Textarea
              name="connectionRequest"
              placeholder="e.g., 'I need to connect to a Siemens S7-1200 PLC on my local network at 192.168.1.10 to read temperature data every second. It's a low-power device.'"
              rows={6}
              className="min-h-[150px]"
            />
             <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Bot className="w-5 h-5"/> AI Recommendation</h3>
        {state.data ? (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-accent" />
                Optimal Protocol: {state.data.optimalProtocol}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sm mb-1">Reasoning:</p>
              <p className="text-muted-foreground text-sm">{state.data.reasoning}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full min-h-[150px] items-center justify-center rounded-lg border border-dashed text-center p-8">
            <p className="text-muted-foreground">Your recommendation will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
