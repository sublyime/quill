export interface Connection {
  id: string;
  name: string;
  sourceType: string;
  config: string; // JSON string
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'CONNECTING';
  createdAt: string;
  lastConnected?: string;
  lastError?: string;
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
