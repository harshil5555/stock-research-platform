import { useCallback, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUploadAttachment } from '@/hooks/useSources';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  sourceId: string;
}

export default function FileUpload({ sourceId }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const upload = useUploadAttachment();

  const validateAndSetFile = useCallback((file: globalThis.File) => {
    if (file.size > MAX_FILE_SIZE) {
      useUIStore.getState().addToast({ type: 'error', message: 'File exceeds 10MB limit' });
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, [validateAndSetFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    upload.mutate({ sourceId, file: selectedFile }, {
      onSuccess: () => setSelectedFile(null),
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)]'
        )}
      >
        <Upload size={24} className="mx-auto mb-2 text-[var(--text-secondary)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          Drag & drop a file or{' '}
          <label className="text-[var(--accent)] cursor-pointer hover:underline">
            browse
            <input type="file" className="hidden" onChange={handleFileSelect} />
          </label>
        </p>
      </div>
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-[var(--hover)] rounded-xl">
          <File size={16} className="text-[var(--text-secondary)] shrink-0" />
          <span className="text-sm text-[var(--text-primary)] truncate flex-1">
            {selectedFile.name}
          </span>
          <button onClick={() => setSelectedFile(null)} className="text-[var(--text-secondary)] hover:text-[var(--color-sell)]">
            <X size={14} />
          </button>
          <Button size="sm" onClick={handleUpload} loading={upload.isPending}>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}
