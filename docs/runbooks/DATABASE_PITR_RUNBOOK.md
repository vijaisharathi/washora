# WASHORA DISASTER RECOVERY RUNBOOK — POINT-IN-TIME RECOVERY (PITR)
**Document ID**: `RUNBOOK-DR-003`  
**Classification**: Internal Operational Procedure  
**Authoritative Owner**: Database Administrator / Platform Engineer  
**Review Cadence**: Monthly  

---

## 1. Overview & Objective
Point-In-Time Recovery (PITR) enables WASHORA to recover the database to an exact historical timestamp (down to the second), bypassing accidental destructive operations (e.g., accidental table drop, runaway script update, rogue migration, or human error).

### Canonical Scenario
- **10:00:00 UTC**: Last verified full base backup created.
- **10:15:00 UTC**: Accidental destructive transaction executed (e.g. `DELETE FROM "Booking"` without WHERE clause).
- **10:20:00 UTC**: Incident detected by operations.
- **Recovery Target**: **10:14:59 UTC** (exactly 1 second prior to the destructive event).

---

## 2. Infrastructure Requirements for Production PITR
1. **WAL Archiving**: PostgreSQL `wal_level = replica` or `logical`, `archive_mode = on`, `archive_command = 'test ! -f /mnt/wal_archive/%f && cp %p /mnt/wal_archive/%f'` (or AWS S3 `wal-g`/`pgBackRest`).
2. **Continuous Archival**: WAL segments must be continuously shipped to isolated cloud object storage every 5 minutes or 16MB.
3. **Base Backup**: Daily base backup taken with `pg_basebackup` or WASHORA snapshot engine.

---

## 3. PITR Execution Sequence

### Step 1: Identify Incident Timeline & Target Timestamp
Inspect PostgreSQL transaction logs or audit logs to identify the exact commit timestamp of the destructive transaction:
```sql
SELECT * FROM "AuditLog" 
WHERE "action" LIKE '%DELETE%' OR "action" LIKE '%DROP%' 
ORDER BY "createdAt" DESC LIMIT 5;
```
Determine `RECOVERY_TARGET_TIME` (e.g., `2026-09-21T10:14:59Z`).

### Step 2: Provision Isolated Recovery Instance
Never perform PITR on the live corrupted volume. Launch a standby recovery instance with the base backup mounted.

### Step 3: Execute PITR Engine Replay
Use the WASHORA PITR engine to replay WAL events from base backup up to the target timestamp:
```bash
node scripts/db-backup-restore.mjs pitr backups/washora_backup_base.json.enc --target-time="2026-09-21T10:14:59Z"
```
**Engine Actions**:
1. Decrypts and unpacks base backup state at `10:00:00Z`.
2. Scans WAL archive for committed transactions between `10:00:00Z` and `10:14:59Z`.
3. Replays valid transactions sequentially.
4. Halts replay immediately before the corrupt transaction at `10:15:00Z`.

### Step 4: Validate Data State Post-PITR
Run data integrity and financial consistency verification:
```bash
npm run db:integrity:check
```
Verify that:
- Rows deleted after `10:15:00Z` are preserved in their `10:14:59Z` state.
- Foreign key references remain 100% consistent.
- Financial ledgers balance with zero orphan records.

### Step 5: Promote Recovery Instance to Primary
1. Set recovery instance `target_timeline = 'latest'` (creates a new timeline fork).
2. Point application connection string `DATABASE_URL` to the promoted recovery instance.
3. Resume normal operations.
