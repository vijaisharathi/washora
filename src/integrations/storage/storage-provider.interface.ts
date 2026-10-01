export interface UploadFileParams {
  fileKey: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  fileKey: string;
  bucket: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  eTag?: string;
  uploadedAt: Date;
}

export interface DownloadResult {
  fileKey: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

export interface DeleteResult {
  fileKey: string;
  success: boolean;
  deletedAt: Date;
}

export interface IStorageProvider {
  uploadFile(params: UploadFileParams): Promise<UploadResult>;
  downloadFile(fileKey: string): Promise<DownloadResult>;
  deleteFile(fileKey: string): Promise<DeleteResult>;
  getSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
}
