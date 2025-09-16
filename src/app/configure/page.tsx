
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConnectionForm } from './connection-form';
import { ProtocolRecommender } from './protocol-recommender';
import { ConnectionsList } from './connections-list';
import { SlidersHorizontal, Bot, List } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="setup">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Connection Setup
          </TabsTrigger>
          <TabsTrigger value="connections">
            <List className="mr-2 h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="ai-helper">
            <Bot className="mr-2 h-4 w-4" />
            AI Protocol Helper
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <ConnectionForm />
        </TabsContent>
        <TabsContent value="connections" className="mt-6">
          <ConnectionsList />
        </TabsContent>
        <TabsContent value="ai-helper" className="mt-6">
          <ProtocolRecommender />
        </TabsContent>
      </Tabs>
    </div>
  );
}
