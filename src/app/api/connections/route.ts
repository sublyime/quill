
import { NextResponse } from 'next/server';
import type { Connection } from '@/app/configure/connections-data';

// In-memory store to simulate a database
let connections: Connection[] = [
  {
    id: 'conn_1',
    name: 'Factory Floor Sensor 1',
    sourceType: 'mqtt',
    status: 'online',
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'conn_2',
    name: 'PLC Unit 5',
    sourceType: 'modbus_tcp',
    status: 'online',
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'conn_3',
    name: 'Legacy Serial Device',
    sourceType: 'serial',
    status: 'offline',
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conn_4',
    name: 'Weather API Feed',
    sourceType: 'rest',
    status: 'online',
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'conn_5',
    name: 'Backup TCP Stream',
    sourceType: 'tcp',
    status: 'error',
    lastActivity: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// GET handler to fetch all connections
export async function GET() {
  return NextResponse.json(connections);
}

// POST handler to add a new connection
export async function POST(request: Request) {
  try {
    const newConnection: Connection = await request.json();
    
    // Basic validation
    if (!newConnection.id || !newConnection.name || !newConnection.sourceType) {
        return NextResponse.json({ message: 'Invalid connection data' }, { status: 400 });
    }

    connections.unshift(newConnection); // Add to the beginning of the array
    
    return NextResponse.json(newConnection, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request', error }, { status: 500 });
  }
}
