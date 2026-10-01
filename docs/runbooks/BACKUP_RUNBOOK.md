# WASHORA DISASTER RECOVERY RUNBOOK — BACKUP OPERATIONS
**Document ID**: `RUNBOOK-DR-001`  
**Classification**: Internal Operational Procedure  
**Authoritative Owner**: Platform Engineer / Database Administrator  
**Review Cadence**: Monthly  

---

## 1. Scope & Objective
This runbook governs the creation, encryption, integrity verification, and lifecycle retention of automated and manual database backups for the WASHORA multi-tenant marketplace platform.

---

## 2. Backup Architecture & Cadence

| Tier | Asset | Cadence | RPO Target | Retention Policy | Storage Domain |
|---|---|---|---|---|---|
| **Tier 1** | PostgreSQL Database (Relational Schema & Canonical Records) | Automated Full: Daily at 02:00 UTC<br>Incremental WAL: Continuous (5-minute archival) | **< 5 minutes** | 7 Daily, 4 Weekly, 12 Monthly | Isolated S3 Glacier / Off-site Object Vault |
| **Tier 1** | Transaction & Financial Ledgers | Real-time WAL + Hourly Snapshot | **< 1 minute** | 7 Years (Financial Compliance) | Immutable WORM Storage |
| **Tier 2** | Non-Database Object Storage (KYC Docs, Dispute Proofs, Catalog) | Daily Incremental Sync at 03:00 UTC | **< 24 hours** | Versioned (90-day lifecycle) | Replicated Multi-Region Cloud Storage |
| **Tier 3** | Ephemeral Cache & Redis Session State | No Snapshot (Rebuildable from DB) | **N/A** | Volatile | In-memory with fallback to Postgres |

---

## 3. Cryptographic Standards & Key Management
- **Encryption Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data).
- **Key Derivation**: 256-bit cryptographically secure pseudorandom key managed via Cloud KMS / HashiCorp Vault.
- **Integrity Digest**: SHA-256 cryptographic digest computed on unencrypted payload and verified post-decryption.
- **Secrets Rule**: Encryption keys are NEVER stored in source code or within the backup artifact itself. Keys are supplied dynamically via environment variable `WASHORA_BACKUP_KEY` or KMS envelope encryption.

---

## 4. Execution Procedures

### 4.1 Automated Daily Full Backup
Triggered via cron daemon or Kubernetes CronJob:
```bash
# Automated scheduled execution with AES-256-GCM encryption
WASHORA_BACKUP_KEY="$VAULT_DR_KEY" node scripts/db-backup-restore.mjs backup --encrypt
```

Output Artifact:
`backups/washora_backup_<TIMESTAMP>_full.json.enc`
Accompanied by metadata checksum and header tags.

### 4.2 Manual Pre-Deployment Snapshot
Mandatory before any major production deployment or database migration:
```bash
node scripts/db-backup-restore.mjs backup --encrypt
```

### 4.3 Automated Retention & Pruning
Runs automatically after backup creation or via nightly maintenance job:
```bash
node scripts/db-backup-restore.mjs prune
```
Rules Enforced:
- Backups < 7 days: Keep all daily snapshots.
- Backups 7–30 days: Retain 1 snapshot per week.
- Backups > 30 days and <= 365 days: Retain 1 snapshot per month.
- Expired snapshots beyond 365 days are securely wiped unless flagged for legal hold.

---

## 5. Backup Verification Check
Every backup is cryptographically verified immediately following creation:
```bash
node scripts/db-backup-restore.mjs verify backups/washora_backup_<TIMESTAMP>_full.json.enc
```
Checks Performed:
1. File exists and size > 1 KB (Zero-byte detection).
2. AES-256-GCM auth tag authentication succeeds.
3. Computed SHA-256 digest exactly matches payload header.
4. Schema version compatibility check.

---

## 6. Failure Modes & Incident Escalation
If a backup run fails, generates a 0-byte file, or fails checksum validation:
1. **Severity**: `P1_HIGH` (if daily), `P0_CRITICAL` (if age > 48h or pre-deployment).
2. **Alert Destination**: Platform Ops on-call pager.
3. **Containment**: Halt any pending schema migrations or deployments.
4. **Remediation**:
   - Inspect PostgreSQL disk space (`df -h`).
   - Inspect database lock contention (`pg_stat_activity`).
   - Re-run backup manually with verbose logging.
