export interface Connection {
  id: number;
  name: string;
  sourceType: string;
  config: string; // JSON string
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'TESTING' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastConnected?: string;
  lastError?: string;
  configuration?: string;
}

export interface ParsedConnectionConfig {
  [key: string]: string | number;
}

export function parseConnectionConfig(config: string): ParsedConnectionConfig {
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
}
