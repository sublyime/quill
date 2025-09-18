// Storage type definitions and configurations
export type StorageType = 
  | 'POSTGRESQL' 
  | 'MSSQL' 
  | 'AWS_S3' 
  | 'GOOGLE_CLOUD_STORAGE' 
  | 'AZURE_BLOB_STORAGE' 
  | 'LOCAL_FILE_SYSTEM'
  | 'ORACLE_CLOUD';

export interface StorageConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

// This represents a configured storage instance.
export interface StorageConfig {
  id: number;
  name: string;
  storageType: StorageType;
  configuration: any;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  lastTestResult?: string;
}

// This describes the schema for a type of storage provider.
export interface StorageTypeSchema {
  type: StorageType;
  name: string;
  icon: string;
  description: string;
  fields: StorageConfigField[];
}

export const STORAGE_CONFIGS: Record<StorageType, StorageTypeSchema> = {
  POSTGRESQL: {
    type: 'POSTGRESQL',
    name: 'PostgreSQL',
    icon: '🐘',
    description: 'Store data in a PostgreSQL database with full ACID compliance and advanced querying capabilities.',
    fields: [
      {
        name: 'host',
        label: 'Host',
        type: 'text',
        required: true,
        placeholder: 'localhost',
        description: 'PostgreSQL server hostname or IP address'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        defaultValue: 5432,
        description: 'PostgreSQL server port (default: 5432)'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'quill_data',
        description: 'Name of the PostgreSQL database'
      },
      {
        name: 'user',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'postgres',
        description: 'PostgreSQL username'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        description: 'PostgreSQL password'
      }
    ]
  },
  MSSQL: {
    type: 'MSSQL',
    name: 'Microsoft SQL Server',
    icon: '🔷',
    description: 'Store data in Microsoft SQL Server with enterprise-grade features and performance.',
    fields: [
      {
        name: 'host',
        label: 'Host',
        type: 'text',
        required: true,
        placeholder: 'localhost',
        description: 'SQL Server hostname or IP address'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        defaultValue: 1433,
        description: 'SQL Server port (default: 1433)'
      },
      {
        name: 'database',
        label: 'Database Name',
        type: 'text',
        required: true,
        placeholder: 'QuillData',
        description: 'Name of the SQL Server database'
      },
      {
        name: 'user',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'sa',
        description: 'SQL Server username'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        description: 'SQL Server password'
      }
    ]
  },
  AWS_S3: {
    type: 'AWS_S3',
    name: 'Amazon S3',
    icon: '☁️',
    description: 'Store data in Amazon S3 buckets with scalable, secure, and durable cloud storage.',
    fields: [
      {
        name: 'bucketName',
        label: 'Bucket Name',
        type: 'text',
        required: true,
        placeholder: 'my-quill-data-bucket',
        description: 'S3 bucket name for storing data'
      },
      {
        name: 'region',
        label: 'AWS Region',
        type: 'select',
        required: true,
        description: 'AWS region where your S3 bucket is located',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-east-2', label: 'US East (Ohio)' },
          { value: 'us-west-1', label: 'US West (N. California)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'Europe (Ireland)' },
          { value: 'eu-central-1', label: 'Europe (Frankfurt)' }
        ]
      },
      {
        name: 'accessKeyId',
        label: 'Access Key ID',
        type: 'text',
        required: true,
        description: 'AWS Access Key ID for authentication'
      },
      {
        name: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password',
        required: true,
        description: 'AWS Secret Access Key for authentication'
      }
    ]
  },
  GOOGLE_CLOUD_STORAGE: {
    type: 'GOOGLE_CLOUD_STORAGE',
    name: 'Google Cloud Storage',
    icon: '🌐',
    description: 'Store data in Google Cloud Storage buckets with global availability and strong consistency.',
    fields: [
      {
        name: 'bucketName',
        label: 'Bucket Name',
        type: 'text',
        required: true,
        placeholder: 'my-quill-data-bucket',
        description: 'Google Cloud Storage bucket name'
      },
      {
        name: 'projectId',
        label: 'Project ID',
        type: 'text',
        required: true,
        placeholder: 'my-gcp-project',
        description: 'Google Cloud Project ID'
      },
      {
        name: 'serviceAccountKey',
        label: 'Service Account Key',
        type: 'textarea',
        required: true,
        description: 'Service account private key (JSON format)'
      }
    ]
  },
  AZURE_BLOB_STORAGE: {
    type: 'AZURE_BLOB_STORAGE',
    name: 'Azure Blob Storage',
    icon: '⚡',
    description: 'Store data in Microsoft Azure Blob Storage with hot, cool, and archive access tiers.',
    fields: [
      {
        name: 'containerName',
        label: 'Container Name',
        type: 'text',
        required: true,
        placeholder: 'quill-data',
        description: 'Azure Blob Storage container name'
      },
      {
        name: 'connectionString',
        label: 'Connection String',
        type: 'password',
        required: true,
        description: 'Azure Storage Account connection string'
      }
    ]
  },
  LOCAL_FILE_SYSTEM: {
    type: 'LOCAL_FILE_SYSTEM',
    name: 'Local File System',
    icon: '💾',
    description: 'Store data files locally on the server file system.',
    fields: [
      {
        name: 'path',
        label: 'Storage Path',
        type: 'text',
        required: true,
        placeholder: '/var/lib/quill/data',
        description: 'Absolute path to the storage directory'
      },
      {
        name: 'maxFileSize',
        label: 'Max File Size (MB)',
        type: 'number',
        defaultValue: 100,
        description: 'Maximum file size in megabytes'
      }
    ]
  },
  ORACLE_CLOUD: {
    type: 'ORACLE_CLOUD',
    name: 'Oracle Cloud Storage',
    icon: '🔶',
    description: 'Store data in Oracle Cloud Infrastructure Object Storage.',
    fields: [
      {
        name: 'bucketName',
        label: 'Bucket Name',
        type: 'text',
        required: true,
        placeholder: 'quill-data-bucket',
        description: 'Oracle Cloud Storage bucket name'
      },
      {
        name: 'namespace',
        label: 'Namespace',
        type: 'text',
        required: true,
        description: 'Oracle Cloud tenancy namespace'
      },
      {
        name: 'region',
        label: 'Region',
        type: 'text',
        required: true,
        placeholder: 'us-ashburn-1',
        description: 'Oracle Cloud region identifier'
      }
    ]
  }
};
