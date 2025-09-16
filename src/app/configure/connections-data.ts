
export type Connection = {
  id: string;
  name: string;
  sourceType: 'mqtt' | 'modbus_tcp' | 'modbus_rtu' | 'tcp' | 'udp' | 'serial' | 'rest' | 'soap' | 'iot';
  status: 'online' | 'offline' | 'error';
  lastActivity: string;
};

export const initialConnections: Connection[] = [
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
