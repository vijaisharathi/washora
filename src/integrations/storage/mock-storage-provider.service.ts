import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  DeleteResult,
  DownloadResult,
  IStorageProvider,
  UploadFileParams,
  UploadResult,
} from './storage-provider.interface';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

@Injectable()
export class MockStorageProviderService implements IStorageProvider {
  private readonly logger = new Logger(MockStorageProviderService.name);
  private readonly storage = new Map<string, { buffer: Buffer; mimeType: string; uploadedAt: Date }>();
  private readonly bucketName = 'washora-mock-storage-bucket';

  private validateKey(fileKey: string): void {
    if (!fileKey || fileKey.includes('..') || fileKey.startsWith('/') || fileKey.includes('\\')) {
      throw new BadRequestException('Invalid file key: Path traversal attempt detected');
    }
  }

  async uploadFile(params: UploadFileParams): Promise<UploadResult> {
    this.validateKey(params.fileKey);

    if (!ALLOWED_MIME_TYPES.has(params.mimeType)) {
      throw new BadRequestException(`Unsupported MIME type: ${params.mimeType}. Allowed types: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`);
    }

    if (params.sizeBytes > MAX_FILE_SIZE_BYTES || params.buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File size exceeds 50MB limit (${params.sizeBytes} bytes)`);
    }

    this.storage.set(params.fileKey, {
      buffer: params.buffer,
      mimeType: params.mimeType,
      uploadedAt: new Date(),
    });

    const eTag = crypto.createHash('md5').update(params.buffer).digest('hex');
    const url = `https://storage.washora.internal/${this.bucketName}/${params.fileKey}`;

    this.logger.log(`[MockStorage] Uploaded ${params.fileKey} (${params.sizeBytes} bytes, ${params.mimeType})`);

    return {
      fileKey: params.fileKey,
      bucket: this.bucketName,
      url,
      sizeBytes: params.sizeBytes,
      mimeType: params.mimeType,
      eTag,
      uploadedAt: new Date(),
    };
  }

  async downloadFile(fileKey: string): Promise<DownloadResult> {
    this.validateKey(fileKey);
    const item = this.storage.get(fileKey);
    if (!item) {
      throw new NotFoundException(`File ${fileKey} not found in storage bucket`);
    }

    return {
      fileKey,
      buffer: item.buffer,
      mimeType: item.mimeType,
      sizeBytes: item.buffer.length,
    };
  }

  async deleteFile(fileKey: string): Promise<DeleteResult> {
    this.validateKey(fileKey);
    const deleted = this.storage.delete(fileKey);
    this.logger.log(`[MockStorage] Deleted file ${fileKey}: ${deleted}`);

    return {
      fileKey,
      success: deleted,
      deletedAt: new Date(),
    };
  }

  async getSignedUrl(fileKey: string, expiresInSeconds: number = 900): Promise<string> {
    this.validateKey(fileKey);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto.randomBytes(16).toString('hex');
    return `https://storage.washora.internal/${this.bucketName}/${fileKey}?token=${token}&expires=${expiresAt}`;
  }
}
