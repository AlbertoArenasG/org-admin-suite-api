export interface FileViewDto {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  bucket: string;
  url: string | null;
  uploadedBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
