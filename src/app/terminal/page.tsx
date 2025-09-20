'use client';

import { useState } from 'react';
import { Terminal } from '@/components/terminal/terminal';
import { ConnectionSelector } from '@/components/terminal/connection-selector';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function TerminalPage() {
  const [selectedConnection, setSelectedConnection] = useState<string>();

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] py-6">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="h-full border rounded-lg">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium">Active Connections</h3>
            </div>
            <ConnectionSelector
              onSelect={setSelectedConnection}
              selectedId={selectedConnection}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={80}>
          <div className="h-full border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-black text-green-500">
              <h3 className="text-sm font-medium">
                Terminal {selectedConnection ? `- ${selectedConnection}` : ''}
              </h3>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <Terminal connectionId={selectedConnection} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}