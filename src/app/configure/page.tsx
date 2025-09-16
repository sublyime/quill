import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConnectionForm } from './connection-form';
import { ProtocolRecommender } from './protocol-recommender';
import { SlidersHorizontal, Bot } from 'lucide-react';

export default function ConfigurePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Set up and manage your data source connections.
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="setup">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Connection Setup
          </TabsTrigger>
          <TabsTrigger value="ai-helper">
            <Bot className="mr-2 h-4 w-4" />
            AI Protocol Helper
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <ConnectionForm />
        </TabsContent>
        <TabsContent value="ai-helper" className="mt-6">
          <ProtocolRecommender />
        </TabsContent>
      </Tabs>
    </div>
  );
}
