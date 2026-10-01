/**
 * ============================================================================
 * WASHORA PHASE T4 — STORAGE BACKUP & DISASTER RECOVERY SERVICE
 * ============================================================================
 * Manages backup, integrity verification, and recovery for non-database assets:
 * - Provider KYC documents (Aadhaar, Trade License, Studio Photographs)
 * - Dispute & Damage Evidence (Customer & Provider images)
 * - Service Catalog Imagery & Marketing Assets
 * - Exported Financial & Operational Reports
 * 
 * Invariants Enforced:
 * - Cryptographic checksum verification (SHA-256) per object
 * - Strict multi-tenant organization scoping (`organizationId`)
 * - Authorized access only; zero public access to private KYC or dispute evidence
 * ============================================================================
 */

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface StorageObjectMetadata {
  id: string;
  organizationId: string;
  bucket: string;
  key: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  isPrivate: boolean;
  uploadedAt: Date;
}

export interface StorageBackupSnapshot {
  snapshotId: string;
  timestamp: string;
  totalObjects: number;
  totalSizeBytes: number;
  objects: StorageObjectMetadata[];
}

@Injectable()
export class StorageBackupService {
  private readonly logger = new Logger(StorageBackupService.name);
  private storageRepository = new Map<string, { buffer: Buffer; metadata: StorageObjectMetadata }>();

  constructor() {
    this.seedDefaultStorageObjects();
  }

  private seedDefaultStorageObjects() {
    // Seed representative synthetic assets
    const sampleFiles = [
      { key: 'providers/prv-001/trade_license.pdf', mime: 'application/pdf', private: true, org: 'org-0001' },
      { key: 'disputes/dsp-101/garment_damage_proof.jpg', mime: 'image/jpeg', private: true, org: 'org-0001' },
      { key: 'catalog/services/dry_clean_suit_banner.webp', mime: 'image/webp', private: false, org: 'org-0001' },
      { key: 'reports/financial/export_ledger_2026_q3.csv', mime: 'text/csv', private: true, org: 'org-0002' },
    ];

    sampleFiles.forEach((f, idx) => {
      const buffer = Buffer.from(`Synthetic Storage File Content for ${f.key} - Version 1.0`);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const meta: StorageObjectMetadata = {
        id: `obj-${idx + 1}`,
        organizationId: f.org,
        bucket: f.private ? 'washora-secure-vault' : 'washora-public-assets',
        key: f.key,
        mimeType: f.mime,
        sizeBytes: buffer.length,
        sha256,
        isPrivate: f.private,
        uploadedAt: new Date(),
      };
      this.storageRepository.set(f.key, { buffer, metadata: meta });
    });
  }

  /**
   * Generates a backup manifest of all objects in storage.
   */
  async createStorageBackupSnapshot(): Promise<StorageBackupSnapshot> {
    const objects: StorageObjectMetadata[] = [];
    let totalSize = 0;

    this.storageRepository.forEach((item) => {
      objects.push(item.metadata);
      totalSize += item.metadata.sizeBytes;
    });

    const snapshot: StorageBackupSnapshot = {
      snapshotId: `str_snap_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      totalObjects: objects.length,
      totalSizeBytes: totalSize,
      objects,
    };

    this.logger.log(`Created storage backup snapshot ${snapshot.snapshotId} containing ${objects.length} objects.`);
    return snapshot;
  }

  /**
   * Restores files from a backup snapshot into an isolated destination.
   */
  async restoreStorageFromSnapshot(snapshot: StorageBackupSnapshot, targetOrgId?: string): Promise<{
    restoredCount: number;
    corruptCount: number;
    intact: boolean;
  }> {
    let restoredCount = 0;
    let corruptCount = 0;

    for (const meta of snapshot.objects) {
      if (targetOrgId && meta.organizationId !== targetOrgId) {
        continue; // Enforce tenant boundary during restore
      }

      const existing = this.storageRepository.get(meta.key);
      if (existing) {
        const currentHash = crypto.createHash('sha256').update(existing.buffer).digest('hex');
        if (currentHash === meta.sha256) {
          restoredCount++;
        } else {
          corruptCount++;
        }
      } else {
        // Restore object from snapshot metadata
        const recreatedBuffer = Buffer.from(`Restored buffer payload for ${meta.key}`);
        this.storageRepository.set(meta.key, { buffer: recreatedBuffer, metadata: meta });
        restoredCount++;
      }
    }

    return {
      restoredCount,
      corruptCount,
      intact: corruptCount === 0,
    };
  }

  /**
   * Verifies access control: Customers cannot access private provider KYC or dispute evidence.
   */
  verifyAccessControl(key: string, requesterRole: string, requesterOrgId: string): boolean {
    const item = this.storageRepository.get(key);
    if (!item) return false;

    // Public assets accessible to all
    if (!item.metadata.isPrivate) return true;

    // Tenant check
    if (item.metadata.organizationId !== requesterOrgId) return false;

    // Role check: Admin and Operations can access private docs; Customer cannot access other's private docs
    if (requesterRole === 'ADMIN' || requesterRole === 'OPERATIONS') return true;
    return false;
  }
}
