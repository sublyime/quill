
import { HardDrive, Cloud, Server as ServerIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Custom simple icons for cloud providers
const AwsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.28 10.704c.17-2.03 1.94-3.6 4.09-3.52 1.63.06 3.02.9 3.68 2.27.35-.1.71-.16 1.08-.16 2.37 0 4.3 1.93 4.3 4.3 0 .2-.02.4-.05.59.85.2 1.48.97 1.48 1.91 0 1.09-.89 1.98-1.98 1.98H7.92c-1.89 0-3.42-1.53-3.42-3.42 0-1.74 1.3-3.17 2.97-3.38.12-.02.2-.13.19-.25a.31.31 0 01-.08-.24z" fill="#FF9900"/>
  </svg>
);

const GoogleCloudIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.18,16.63A8.8,8.8,0,0,1,10.33,18a9,9,0,1,1,8.37-6.24,1,1,0,0,1-2,0,7,7,0,1,0-6.37,4.74,6.54,6.54,0,0,0,3.85-1.12Z" fill="#4285F4"/>
  <path d="M19.33,11.75h-7a1,1,0,0,1,0-2h7a1,1,0,0,1,0,2Z" fill="#4285F4"/>
  <path d="M15.83,15.25h-7a1,1,0,0,1,0-2h7a1,1,0,0,1,0,2Z" fill="#4285F4"/>
  </svg>
);

const AzureIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.45 2.45L6.6 6.56l7.98 7.98 5.86-4.1-8-8zM4.14 8l5.85 13.55L20 9.87 14.13 4 4.14 8z" fill="#0078D4"/>
  </svg>
);

const OracleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.28 15.96A4.5 4.5 0 0012 17.5c2.49 0 4.5-2.01 4.5-4.5S14.49 8.5 12 8.5a4.5 4.5 0 00-3.72 1.54l1.24 1.24A2.5 2.5 0 0112 9.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5a2.5 2.5 0 01-2.02-1.04l-1.7 1.5z" fill="#F80000"/>
  </svg>
);

const PostgresIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V6h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" fill="#336791"/>
  </svg>
);


export type StorageType =
  | 'postgresql'
  | 'aws_s3'
  | 'google_cloud_storage'
  | 'azure_blob_storage'
  | 'oracle_cloud'
  | 'local';

interface StorageField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password';
  placeholder: string;
}

interface StorageConfig {
  value: StorageType;
  label: string;
  icon: LucideIcon | React.FC;
  category: 'Cloud' | 'Local Database';
  fields: StorageField[];
}

export const STORAGE_CONFIGS: Record<StorageType, StorageConfig> = {
  // Cloud
  aws_s3: {
    value: 'aws_s3',
    label: 'AWS S3',
    icon: AwsIcon,
    category: 'Cloud',
    fields: [
      { name: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-data-bucket' },
      { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
      { name: 'accessKeyId', label: 'Access Key ID', type: 'password', placeholder: 'Your AWS Access Key ID' },
      { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Your AWS Secret Access Key' },
    ],
  },
  google_cloud_storage: {
    value: 'google_cloud_storage',
    label: 'Google Cloud Storage',
    icon: GoogleCloudIcon,
    category: 'Cloud',
    fields: [
      { name: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-gcs-bucket' },
      { name: 'projectId', label: 'Project ID', type: 'text', placeholder: 'gcp-project-id' },
      { name: 'privateKey', label: 'Service Account Key (JSON)', type: 'password', placeholder: 'Paste your JSON key here' },
    ],
  },
  azure_blob_storage: {
    value: 'azure_blob_storage',
    label: 'Azure Blob Storage',
    icon: AzureIcon,
    category: 'Cloud',
    fields: [
      { name: 'containerName', label: 'Container Name', type: 'text', placeholder: 'my-blob-container' },
      { name: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'Your Azure Storage connection string' },
    ],
  },
  oracle_cloud: {
    value: 'oracle_cloud',
    label: 'Oracle Cloud',
    icon: OracleIcon,
    category: 'Cloud',
    fields: [
      { name: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-oci-bucket' },
      { name: 'namespace', label: 'Namespace', type: 'text', placeholder: 'oci-namespace' },
      { name: 'region', label: 'Region', type: 'text', placeholder: 'us-ashburn-1' },
      { name: 'tenancyId', label: 'Tenancy OCID', type: 'password', placeholder: 'Your Tenancy OCID' },
      { name: 'userId', label: 'User OCID', type: 'password', placeholder: 'Your User OCID' },
      { name: 'fingerprint', label: 'Fingerprint', type: 'password', placeholder: 'Your API Key Fingerprint' },
      { name: 'privateKey', label: 'Private Key (PEM)', type: 'password', placeholder: 'Paste your PEM private key here' },
    ],
  },
  // Local DB
  postgresql: {
    value: 'postgresql',
    label: 'PostgreSQL',
    icon: PostgresIcon,
    category: 'Local Database',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '5432' },
      { name: 'database', label: 'Database Name', type: 'text', placeholder: 'mydatabase' },
      { name: 'user', label: 'User', type: 'text', placeholder: 'postgres' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'your-password' },
    ],
  },
  local: {
    value: 'local',
    label: 'Local File System',
    icon: HardDrive,
    category: 'Local Database',
    fields: [
      { name: 'path', label: 'Storage Path', type: 'text', placeholder: '/path/to/your/storage/directory' },
    ],
  },
};
