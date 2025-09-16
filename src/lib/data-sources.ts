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

interface DataSourceField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password';
  placeholder: string;
}

interface DataSourceConfig {
  value: DataSourceType;
  label: string;
  icon: LucideIcon;
  fields: DataSourceField[];
}

export const DATA_SOURCE_CONFIGS: Record<DataSourceType, DataSourceConfig> = {
  mqtt: {
    value: 'mqtt',
    label: 'MQTT',
    icon: Rss,
    fields: [
      { name: 'brokerAddress', label: 'Broker Address', type: 'text', placeholder: 'mqtt.example.com' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '1883' },
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'sensors/temperature' },
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Optional' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Optional' },
    ],
  },
  modbus_tcp: {
    value: 'modbus_tcp',
    label: 'MODBUS (TCP)',
    icon: Server,
    fields: [
      { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: '192.168.1.10' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '502' },
      { name: 'slaveId', label: 'Slave ID', type: 'number', placeholder: '1' },
      { name: 'registerAddress', label: 'Register Address', type: 'number', placeholder: '40001' },
    ],
  },
   modbus_rtu: {
    value: 'modbus_rtu',
    label: 'MODBUS (RTU)',
    icon: SlidersHorizontal,
    fields: [
        { name: 'comPort', label: 'COM Port', type: 'text', placeholder: 'COM3' },
        { name: 'baudRate', label: 'Baud Rate', type: 'number', placeholder: '9600' },
        { name: 'slaveId', label: 'Slave ID', type: 'number', placeholder: '1' },
    ]
   },
  tcp: {
    value: 'tcp',
    label: 'TCP',
    icon: Cable,
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '9999' },
    ],
  },
  udp: {
    value: 'udp',
    label: 'UDP',
    icon: Cable,
    fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '9998' },
    ],
  },
  serial: {
    value: 'serial',
    label: 'SERIAL',
    icon: Usb,
    fields: [
      { name: 'comPort', label: 'COM Port', type: 'text', placeholder: 'COM3' },
      { name: 'baudRate', label: 'Baud Rate', type: 'number', placeholder: '9600' },
      { name: 'dataBits', label: 'Data Bits', type: 'number', placeholder: '8' },
      { name: 'stopBits', label: 'Stop Bits', type: 'number', placeholder: '1' },
    ],
  },
  rest: {
    value: 'rest',
    label: 'API (REST)',
    icon: Webhook,
    fields: [
      { name: 'endpointUrl', label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com/data' },
      { name: 'method', label: 'HTTP Method', type: 'text', placeholder: 'GET' },
      { name: 'apiKey', label: 'API Key (Optional)', type: 'password', placeholder: 'your-api-key' },
    ],
  },
  soap: {
    value: 'soap',
    label: 'API (SOAP)',
    icon: Webhook,
    fields: [
        { name: 'wsdlUrl', label: 'WSDL URL', type: 'text', placeholder: 'https://api.example.com/service?wsdl' },
        { name: 'operation', label: 'Operation', type: 'text', placeholder: 'GetData' },
    ],
  },
  iot: {
    value: 'iot',
    label: 'Generic IoT',
    icon: RadioTower,
    fields: [
        { name: 'deviceId', label: 'Device ID', type: 'text', placeholder: 'iot-device-001' },
        { name: 'endpoint', label: 'Endpoint', type: 'text', placeholder: 'iot.cloud.com' },
        { name: 'accessKey', label: 'Access Key', type: 'password', placeholder: 'your-access-key' },
    ],
  },
};
