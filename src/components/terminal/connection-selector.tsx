'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Connection {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type: string;
}

interface ConnectionSelectorProps {
  onSelect: (connectionId: string) => void;
  selectedId?: string;
}

export function ConnectionSelector({ onSelect, selectedId }: ConnectionSelectorProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch active connections
    const fetchConnections = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/connections');
        if (!response.ok) throw new Error('Failed to fetch connections');
        const data = await response.json();
        setConnections(data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading connections...</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {connections.map((connection) => (
          <Button
            key={connection.id}
            variant={selectedId === connection.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelect(connection.id)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{connection.name}</span>
              <Badge variant={connection.status === 'active' ? "default" : "secondary"}>
                {connection.status}
              </Badge>
            </div>
          </Button>
        ))}

        {connections.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            No active connections found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}