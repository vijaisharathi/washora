import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ALLOWED_EVIDENCE_MIME_TYPES,
  MAX_EVIDENCE_FILE_SIZE,
  SupportErrorCode,
} from '../types/support.types';

export interface StoredEvidenceFile {
  storageKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

@Injectable()
export class EvidenceStorageService {
  /**
   * Validates file upload constraints according to WASHORA security specifications.
   * Restricts to JPEG, PNG, WebP, PDF, MP4 up to 50MB.
   */
  validateEvidenceFile(data: {
    fileName: string;
    mimeType: string;
    fileSize: number;
  }): void {
    if (!data.fileName || data.fileName.trim().length === 0) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_INVALID,
        message: 'A valid file name must be provided.',
      });
    }

    if (!ALLOWED_EVIDENCE_MIME_TYPES.includes(data.mimeType as any)) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_TYPE_NOT_ALLOWED,
        message: `MIME type '${data.mimeType}' is not supported. Allowed formats: image/jpeg, image/png, image/webp, application/pdf, video/mp4.`,
      });
    }

    if (data.fileSize <= 0) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_INVALID,
        message: 'File size must be greater than zero bytes.',
      });
    }

    if (data.fileSize > MAX_EVIDENCE_FILE_SIZE) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_TOO_LARGE,
        message: `File size (${data.fileSize} bytes) exceeds the maximum allowed limit of 50 MB (52,428,800 bytes).`,
      });
    }
  }

  /**
   * Deterministic mock storage key generation without storing raw binary blobs in PostgreSQL.
   */
  storeEvidence(
    organizationId: string,
    disputeId: string,
    file: {
      fileName: string;
      mimeType: string;
      fileSize: number;
    },
  ): StoredEvidenceFile {
    this.validateEvidenceFile(file);

    const fileId = randomUUID();
    const cleanFileName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `disputes/${organizationId}/${disputeId}/${fileId}-${cleanFileName}`;
    const fileUrl = `mock-storage://${storageKey}`;

    return {
      storageKey,
      fileUrl,
      fileName: cleanFileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    };
  }
}
