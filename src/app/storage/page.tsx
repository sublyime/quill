
import { StorageForm } from './storage-form';

export default function StoragePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Storage Configuration</h1>
        <p className="text-muted-foreground">
          Choose and configure your desired storage solution.
        </p>
      </div>
      <StorageForm />
    </div>
  );
}
