import { Rss, Server, Cable, Webhook, RadioTower, Usb, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DataSourceType =
  | 'mqtt'
  | 'modbus_tcp'
  | 'modbus_rtu'
  | 'tcp'
  | 'udp'
  | 'serial'
  | 'rest'
  | 'soap'
  | 'iot';

export interface DataSourceField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select';
  placeholder: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface DataSourceConfig {
  value: DataSourceType;
  label: string;
  icon: LucideIcon;
  description: string;
  fields: DataSourceField[];
}

export const DATA_SOURCE_CONFIGS: Record<DataSourceType, DataSourceConfig> = {
  mqtt: {
    value: 'mqtt',
    label: 'MQTT',
    icon: Rss,
    description: 'Connect to MQTT brokers for real-time messaging',
    fields: [
      { name: 'brokerAddress', label: 'Broker Address', type: 'text', placeholder: 'mqtt.example.com', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '1883', required: true, validation: { min: 1, max: 65535 } },
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'sensors/temperature', required: true },
      { name: 'qos', label: 'Quality of Service', type: 'select', placeholder: '0', options: [
        { value: '0', label: '0 - At most once' },
        { value: '1', label: '1 - At least once' },
        { value: '2', label: '2 - Exactly once' }
      ]},
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
      { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Auto-generated if empty' },
    ],
  },
  modbus_tcp: {
    value: 'modbus_tcp',
    label: 'MODBUS (TCP)',
    icon: Server,
    description: 'Connect to MODBUS TCP devices over network',
    fields: [
      { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: '192.168.1.10', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '502', required: true, validation: { min: 1, max: 65535 } },
      { name: 'slaveId', label: 'Slave/Unit ID', type: 'number', placeholder: '1', required: true, validation: { min: 1, max: 255 } },
      { name: 'registerType', label: 'Register Type', type: 'select', placeholder: 'Holding Register', options: [
        { value: 'coil', label: 'Coil (0x)' },
        { value: 'discrete', label: 'Discrete Input (1x)' },
        { value: 'input', label: 'Input Register (3x)' },
        { value: 'holding', label: 'Holding Register (4x)' }
      ]},
      { name: 'startAddress', label: 'Start Address', type: 'number', placeholder: '40001', required: true },
      { name: 'quantity', label: 'Number of Registers', type: 'number', placeholder: '1', required: true, validation: { min: 1, max: 125 } },
      { name: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: '5000', validation: { min: 100, max: 30000 } },
    ],
  },
  modbus_rtu: {
    value: 'modbus_rtu',
    label: 'MODBUS (RTU)',
    icon: SlidersHorizontal,
    description: 'Connect to MODBUS RTU devices via serial communication',
    fields: [
      { name: 'comPort', label: 'COM Port', type: 'text', placeholder: 'COM3', required: true },
      { name: 'baudRate', label: 'Baud Rate', type: 'select', placeholder: '9600', required: true, options: [
        { value: '1200', label: '1200' },
        { value: '2400', label: '2400' },
        { value: '4800', label: '4800' },
        { value: '9600', label: '9600' },
        { value: '19200', label: '19200' },
        { value: '38400', label: '38400' },
        { value: '57600', label: '57600' },
        { value: '115200', label: '115200' }
      ]},
      { name: 'dataBits', label: 'Data Bits', type: 'select', placeholder: '8', options: [
        { value: '7', label: '7' },
        { value: '8', label: '8' }
      ]},
      { name: 'stopBits', label: 'Stop Bits', type: 'select', placeholder: '1', options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' }
      ]},
      { name: 'parity', label: 'Parity', type: 'select', placeholder: 'None', options: [
        { value: 'none', label: 'None' },
        { value: 'even', label: 'Even' },
        { value: 'odd', label: 'Odd' }
      ]},
      { name: 'slaveId', label: 'Slave ID', type: 'number', placeholder: '1', required: true, validation: { min: 1, max: 255 } },
    ],
  },
  tcp: {
    value: 'tcp',
    label: 'TCP',
    icon: Cable,
    description: 'Raw TCP socket connection',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '9999', required: true, validation: { min: 1, max: 65535 } },
      { name: 'timeout', label: 'Connection Timeout (ms)', type: 'number', placeholder: '5000', validation: { min: 100, max: 30000 } },
    ],
  },
  udp: {
    value: 'udp',
    label: 'UDP',
    icon: Cable,
    description: 'UDP socket connection for datagram communication',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '9998', required: true, validation: { min: 1, max: 65535 } },
      { name: 'bufferSize', label: 'Buffer Size (bytes)', type: 'number', placeholder: '1024', validation: { min: 64, max: 65536 } },
    ],
  },
  serial: {
    value: 'serial',
    label: 'SERIAL',
    icon: Usb,
    description: 'Serial port communication (RS232/RS485)',
    fields: [
      { name: 'comPort', label: 'COM Port', type: 'text', placeholder: 'COM3', required: true },
      { name: 'baudRate', label: 'Baud Rate', type: 'select', placeholder: '9600', required: true, options: [
        { value: '300', label: '300' },
        { value: '1200', label: '1200' },
        { value: '2400', label: '2400' },
        { value: '4800', label: '4800' },
        { value: '9600', label: '9600' },
        { value: '19200', label: '19200' },
        { value: '38400', label: '38400' },
        { value: '57600', label: '57600' },
        { value: '115200', label: '115200' }
      ]},
      { name: 'dataBits', label: 'Data Bits', type: 'select', placeholder: '8', options: [
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' }
      ]},
      { name: 'stopBits', label: 'Stop Bits', type: 'select', placeholder: '1', options: [
        { value: '1', label: '1' },
        { value: '1.5', label: '1.5' },
        { value: '2', label: '2' }
      ]},
      { name: 'parity', label: 'Parity', type: 'select', placeholder: 'None', options: [
        { value: 'none', label: 'None' },
        { value: 'even', label: 'Even' },
        { value: 'odd', label: 'Odd' },
        { value: 'mark', label: 'Mark' },
        { value: 'space', label: 'Space' }
      ]},
      { name: 'flowControl', label: 'Flow Control', type: 'select', placeholder: 'None', options: [
        { value: 'none', label: 'None' },
        { value: 'hardware', label: 'Hardware (RTS/CTS)' },
        { value: 'software', label: 'Software (XON/XOFF)' }
      ]},
    ],
  },
  rest: {
    value: 'rest',
    label: 'API (REST)',
    icon: Webhook,
    description: 'HTTP REST API endpoint',
    fields: [
      { name: 'endpointUrl', label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com/data', required: true },
      { name: 'method', label: 'HTTP Method', type: 'select', placeholder: 'GET', options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' }
      ]},
      { name: 'headers', label: 'Headers (JSON)', type: 'text', placeholder: '{"Content-Type": "application/json"}' },
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'your-api-key' },
      { name: 'authType', label: 'Authentication', type: 'select', placeholder: 'None', options: [
        { value: 'none', label: 'None' },
        { value: 'bearer', label: 'Bearer Token' },
        { value: 'basic', label: 'Basic Auth' },
        { value: 'apikey', label: 'API Key' }
      ]},
      { name: 'pollInterval', label: 'Poll Interval (seconds)', type: 'number', placeholder: '60', validation: { min: 1, max: 3600 } },
    ],
  },
  soap: {
    value: 'soap',
    label: 'API (SOAP)',
    icon: Webhook,
    description: 'SOAP web service endpoint',
    fields: [
      { name: 'wsdlUrl', label: 'WSDL URL', type: 'text', placeholder: 'https://api.example.com/service?wsdl', required: true },
      { name: 'operation', label: 'Operation/Method', type: 'text', placeholder: 'GetData', required: true },
      { name: 'namespace', label: 'Namespace', type: 'text', placeholder: 'http://example.com/webservice' },
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
      { name: 'timeout', label: 'Timeout (seconds)', type: 'number', placeholder: '30', validation: { min: 1, max: 300 } },
    ],
  },
  iot: {
    value: 'iot',
    label: 'Generic IoT',
    icon: RadioTower,
    description: 'Generic IoT platform connection',
    fields: [
      { name: 'deviceId', label: 'Device ID', type: 'text', placeholder: 'iot-device-001', required: true },
      { name: 'endpoint', label: 'IoT Platform Endpoint', type: 'text', placeholder: 'iot.cloud.com', required: true },
      { name: 'protocol', label: 'Protocol', type: 'select', placeholder: 'HTTPS', options: [
        { value: 'https', label: 'HTTPS' },
        { value: 'mqtt', label: 'MQTT' },
        { value: 'coap', label: 'CoAP' },
        { value: 'websocket', label: 'WebSocket' }
      ]},
      { name: 'accessKey', label: 'Access Key', type: 'password', placeholder: 'your-access-key', required: true },
      { name: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'your-secret-key' },
      { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
    ],
  },
};
