
export type Connection = {
  id: string;
  name: string;
  sourceType: 'mqtt' | 'modbus_tcp' | 'modbus_rtu' | 'tcp' | 'udp' | 'serial' | 'rest' | 'soap' | 'iot';
  status: 'online' | 'offline' | 'error';
  lastActivity: string;
};
