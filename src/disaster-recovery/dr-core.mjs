/**
 * ============================================================================
 * WASHORA PHASE T4 — DISASTER RECOVERY CORE ENGINE (ESM)
 * ============================================================================
 * Shared runtime engine providing core functionality for:
 * - Storage Backup & Recovery (Asset checksums, multi-tenant isolation, RBAC)
 * - Payment & Financial Reconciliation (Decimal precision, refund boundaries, reward ledgers)
 * - Disaster Recovery Health Monitoring (SLA evaluation, backup age, P0/P1 alerting)
 * ============================================================================
 */

import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';

export class StorageBackupEngine {
  constructor() {
    this.storageRepository = new Map();
    this.seedDefaultStorageObjects();
  }

  seedDefaultStorageObjects() {
    const sampleFiles = [
      { key: 'providers/prv-001/trade_license.pdf', mime: 'application/pdf', private: true, org: 'org-0001' },
      { key: 'disputes/dsp-101/garment_damage_proof.jpg', mime: 'image/jpeg', private: true, org: 'org-0001' },
      { key: 'catalog/services/dry_clean_suit_banner.webp', mime: 'image/webp', private: false, org: 'org-0001' },
      { key: 'reports/financial/export_ledger_2026_q3.csv', mime: 'text/csv', private: true, org: 'org-0002' },
    ];

    sampleFiles.forEach((f, idx) => {
      const buffer = Buffer.from(`Synthetic Storage File Content for ${f.key} - Version 1.0`);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const meta = {
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

  async createStorageBackupSnapshot() {
    const objects = [];
    let totalSize = 0;

    this.storageRepository.forEach((item) => {
      objects.push(item.metadata);
      totalSize += item.metadata.sizeBytes;
    });

    return {
      snapshotId: `str_snap_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      totalObjects: objects.length,
      totalSizeBytes: totalSize,
      objects,
    };
  }

  async restoreStorageFromSnapshot(snapshot, targetOrgId) {
    let restoredCount = 0;
    let corruptCount = 0;

    for (const meta of snapshot.objects) {
      if (targetOrgId && meta.organizationId !== targetOrgId) {
        continue;
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

  verifyAccessControl(key, requesterRole, requesterOrgId) {
    const item = this.storageRepository.get(key);
    if (!item) return false;

    if (!item.metadata.isPrivate) return true;
    if (item.metadata.organizationId !== requesterOrgId) return false;
    if (requesterRole === 'ADMIN' || requesterRole === 'OPERATIONS') return true;
    return false;
  }
}

export class PaymentReconciliationEngine {
  toDecimal(val) {
    if (val instanceof Prisma.Decimal) return val;
    return new Prisma.Decimal(val.toString());
  }

  validateBookingEquation(subtotal, tax, discount, total) {
    const dSubtotal = this.toDecimal(subtotal);
    const dTax = this.toDecimal(tax);
    const dDiscount = this.toDecimal(discount);
    const dTotal = this.toDecimal(total);

    const calculatedTotal = dSubtotal.plus(dTax).minus(dDiscount);
    const discrepancy = calculatedTotal.minus(dTotal).abs();

    return {
      valid: discrepancy.lessThan('0.0001'),
      calculatedTotal,
      discrepancy,
    };
  }

  validateRefundBoundaries(paymentAmount, existingRefunds, newRefundAmount) {
    const dPayment = this.toDecimal(paymentAmount);
    let totalRefunded = new Prisma.Decimal(0);

    for (const r of existingRefunds) {
      if (r.status === 'COMPLETED' || r.status === 'PROCESSED' || r.status === 'PENDING') {
        totalRefunded = totalRefunded.plus(this.toDecimal(r.amount));
      }
    }

    if (newRefundAmount !== undefined) {
      totalRefunded = totalRefunded.plus(this.toDecimal(newRefundAmount));
    }

    const remainingRefundable = dPayment.minus(totalRefunded);

    if (remainingRefundable.isNegative()) {
      return {
        valid: false,
        totalRefunded,
        remainingRefundable,
        error: `Refund total ${totalRefunded.toFixed(2)} exceeds original payment ${dPayment.toFixed(2)}`,
      };
    }

    return {
      valid: true,
      totalRefunded,
      remainingRefundable,
    };
  }

  validateRewardLedger(currentBalance, transactions) {
    const dBalance = this.toDecimal(currentBalance);
    let ledgerSum = new Prisma.Decimal(0);

    for (const tx of transactions) {
      if (tx.type === 'EARNED' || tx.type === 'REFUNDED') {
        ledgerSum = ledgerSum.plus(tx.points);
      } else if (tx.type === 'REDEEMED' || tx.type === 'EXPIRED') {
        ledgerSum = ledgerSum.minus(tx.points);
      }
    }

    const difference = dBalance.minus(ledgerSum).abs();

    return {
      valid: difference.lessThan('0.0001') && !dBalance.isNegative(),
      expectedBalance: ledgerSum,
      difference,
    };
  }

  reconcileInterruptedPayment(params) {
    const dExpected = this.toDecimal(params.expectedAmount);
    const dGateway = this.toDecimal(params.gatewayPaidAmount);

    if (params.currentDbStatus === 'COMPLETED') {
      return {
        targetStatus: 'COMPLETED',
        action: 'NO_OP',
        reason: 'Payment already completed in source of truth',
      };
    }

    if (params.gatewayStatus === 'SUCCESS') {
      if (dGateway.equals(dExpected)) {
        return {
          targetStatus: 'COMPLETED',
          action: 'CONFIRM',
          reason: 'Gateway confirmed valid payment; promoting database record from interrupted state',
        };
      } else {
        return {
          targetStatus: 'PENDING_INVESTIGATION',
          action: 'NO_OP',
          reason: `Gateway amount ${dGateway.toFixed(2)} does not match expected ${dExpected.toFixed(2)}`,
        };
      }
    }

    if (params.gatewayStatus === 'FAILED') {
      return {
        targetStatus: 'FAILED',
        action: 'FAIL',
        reason: 'Gateway reported definitive transaction failure',
      };
    }

    return {
      targetStatus: 'PENDING_INVESTIGATION',
      action: 'RETRY',
      reason: 'Gateway state inconclusive; will query again during next reconciliation cycle',
    };
  }
}

export class DRMonitoringEngine {
  constructor() {
    this.alertsHistory = [];
  }

  evaluateBackupHealth(params) {
    const alerts = [];
    const now = Date.now();

    let ageHours = 9999;
    if (params.lastBackupTimestamp) {
      const backupTime = new Date(params.lastBackupTimestamp).getTime();
      ageHours = Math.max(0, (now - backupTime) / (1000 * 60 * 60));
    }

    if (!params.lastBackupTimestamp || ageHours > 48) {
      alerts.push({
        alertId: `dr_alt_${now}_age_p0`,
        severity: 'P0_CRITICAL',
        source: 'BACKUP_MONITOR',
        title: 'Primary Database Backup Stale (>48h)',
        message: `Database backup is ${ageHours.toFixed(1)} hours old or missing completely. RPO is at severe risk!`,
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Immediately trigger manual backup run and verify PostgreSQL WAL archiver',
      });
    } else if (ageHours > 24) {
      alerts.push({
        alertId: `dr_alt_${now}_age_p1`,
        severity: 'P1_HIGH',
        source: 'BACKUP_MONITOR',
        title: 'Daily Database Backup Delayed (>24h)',
        message: `Database backup age is ${ageHours.toFixed(1)} hours. Standard 24h cadence exceeded.`,
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Check cron daemon and backup runner logs for transient timeout',
      });
    }

    const minExpected = params.expectedMinSizeBytes || 1024;
    if (params.backupSizeBytes <= 0) {
      alerts.push({
        alertId: `dr_alt_${now}_sz_p0`,
        severity: 'P0_CRITICAL',
        source: 'BACKUP_INTEGRITY',
        title: 'Zero-Byte or Empty Database Backup Detected',
        message: 'The latest database snapshot artifact has 0 bytes. Backup process likely aborted mid-dump.',
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Investigate pg_dump process failure, verify disk space on target volume',
      });
    } else if (params.backupSizeBytes < minExpected) {
      alerts.push({
        alertId: `dr_alt_${now}_sz_p1`,
        severity: 'P1_HIGH',
        source: 'BACKUP_INTEGRITY',
        title: 'Abnormally Small Backup File Size',
        message: `Backup size ${params.backupSizeBytes} bytes is below threshold (${minExpected} bytes).`,
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Verify database table row counts and integrity checks',
      });
    }

    let drillStatus = 'NOT_RUN';
    if (params.lastRestoreDrillTimestamp) {
      drillStatus = params.lastRestoreDrillPassed ? 'PASSED' : 'FAILED';
      if (!params.lastRestoreDrillPassed) {
        alerts.push({
          alertId: `dr_alt_${now}_drill_p0`,
          severity: 'P0_CRITICAL',
          source: 'RESTORE_DRILL_ENGINE',
          title: 'Automated Restore Drill Failed Verification',
          message: 'The latest restore test failed schema, data, or financial reconciliation verification.',
          destination: 'PLATFORM_OPS',
          timestamp: new Date().toISOString(),
          actionRequired: 'Review restore logs, inspect foreign key constraints and schema drift',
        });
      }
    } else {
      alerts.push({
        alertId: `dr_alt_${now}_drill_p1`,
        severity: 'P1_HIGH',
        source: 'RESTORE_DRILL_ENGINE',
        title: 'No Recorded Restore Drill on Record',
        message: 'Backup exists but has never been validated against a staging restore drill.',
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Execute isolated restore drill using scripts/db-backup-restore.mjs restore --staging',
      });
    }

    const quotaPercent = params.storageMaxBytes > 0 
      ? Math.round((params.storageUsedBytes / params.storageMaxBytes) * 100) 
      : 0;

    if (quotaPercent >= 90) {
      alerts.push({
        alertId: `dr_alt_${now}_storage_p1`,
        severity: 'P1_HIGH',
        source: 'BACKUP_STORAGE_VAULT',
        title: 'Backup Storage Vault Approaching Capacity (>90%)',
        message: `Storage usage is at ${quotaPercent}%. Future backups will fail if capacity is exhausted.`,
        destination: 'PLATFORM_OPS',
        timestamp: new Date().toISOString(),
        actionRequired: 'Trigger pruneExpiredBackups or expand backup storage volume',
      });
    }

    let healthStatus = 'HEALTHY';
    if (alerts.some(a => a.severity === 'P0_CRITICAL')) {
      healthStatus = 'CRITICAL';
    } else if (alerts.some(a => a.severity === 'P1_HIGH')) {
      healthStatus = 'WARNING';
    }

    this.alertsHistory.push(...alerts);

    return {
      lastBackupTimestamp: params.lastBackupTimestamp,
      backupAgeHours: Number(ageHours.toFixed(1)),
      backupSizeBytes: params.backupSizeBytes,
      lastRestoreDrillTimestamp: params.lastRestoreDrillTimestamp,
      lastRestoreDrillStatus: drillStatus,
      healthStatus,
      storageQuotaUsedPercent: quotaPercent,
      activeAlerts: alerts,
    };
  }

  getAlertHistory() {
    return [...this.alertsHistory];
  }
}
