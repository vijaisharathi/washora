# WASHORA DISASTER RECOVERY RUNBOOK — APPLICATION REBUILD & ROLLBACK
**Document ID**: `RUNBOOK-DR-004`  
**Classification**: Internal Operational Procedure  
**Authoritative Owner**: Backend Owner / Platform Engineer  
**Review Cadence**: Monthly  

---

## 1. Scope & Objective
This runbook defines the procedures for rebuilding the WASHORA application from a clean state (cold disaster recovery), rolling back failed deployments without data corruption, and safely recovering from failed database migrations.

---

## 2. Cold Application Rebuild Procedure
In the event of total server, container, or cloud host failure, the application stack can be deterministically reproduced from source code:

```
[Clean Linux/Container Host]
       ↓
1. Install Runtime & Package Manager (Node.js v20+, npm/pnpm, Git)
       ↓
2. Clone Repository & Checkout Verified Release Tag
       ↓
3. Inject Production Secrets from Secret Vault (.env.production)
       ↓
4. Install Locked Production Dependencies (`npm ci`)
       ↓
5. Generate Database Client (`npx prisma generate`)
       ↓
6. Apply Database Migrations (`npx prisma migrate deploy`)
       ↓
7. Build Production Artifacts (`npm run build`)
       ↓
8. Launch Services & Background Workers (`npm run start:prod`)
       ↓
9. Execute End-to-End Health Check (`curl http://localhost:3000/api/health`)
```

### Deterministic Rebuild Commands:
```bash
git clone https://github.com/vijaisharathi/washora.git washora-app
cd washora-app
git checkout tags/v1.2.0-stable

# Restore secrets from secure vault (AWS Secrets Manager / Vault)
aws secretsmanager get-secret-value --secret-id washora/prod/env --query SecretString --output text > .env

# Install locked dependencies and compile
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

# Start services under systemd or container supervisor
npm run start:prod
```

---

## 3. Failed Deployment Rollback
If a newly deployed release exhibits severe regressions, fatal uncaught errors, or memory leaks:

1. **Traffic Divergence**: Immediately shift ingress traffic back to the previous known-good deployment target or container image tag:
   ```bash
   kubectl rollout undo deployment/washora-backend
   kubectl rollout status deployment/washora-backend
   ```
2. **Backward Compatibility Guarantee**: Code deployments must always be backward compatible with the currently active database schema.
3. **Session State Invariant**: Since JWT tokens and stateless sessions are used, rolling back backend instances causes zero session loss for active users.

---

## 4. Failed Database Migration Recovery

### Golden Rule:
> **NEVER execute `prisma migrate reset` against a staging or production database.** `reset` will permanently DROP all tables and data.

### Resolution Steps When Migration Fails Mid-Execution:
1. **Identify Migration State**:
   ```bash
   npx prisma migrate status
   ```
   Determine which migration script failed and whether it was partially applied.

2. **Diagnose Root Cause**: Inspect migration logs for syntax errors, lock timeouts, or unique constraint violations on existing data.

3. **Choose Recovery Path**:
   - **Path A — Mark as Rolled Back (if schema was not altered)**:
     ```bash
     npx prisma migrate resolve --rolled-back "20260921_add_new_column"
     ```
   - **Path B — Mark as Applied (if manual DDL fix was applied)**:
     ```bash
     npx prisma migrate resolve --applied "20260921_add_new_column"
     ```

---

## 5. Backward-Compatible Migration Strategy (Expand/Contract)
To prevent deployment interruptions and enable zero-downtime rollbacks, all schema changes must follow the **Expand / Contract pattern**:

1. **Phase 1 (Expand)**: Add new nullable columns or tables. Run `npx prisma migrate deploy`. Both old and new application code continue to function.
2. **Phase 2 (Deploy Code)**: Deploy application code that reads from the new column with fallback to the old column, and writes to both (dual-write).
3. **Phase 3 (Backfill Data)**: Background worker backfills historical records to populate the new column.
4. **Phase 4 (Contract)**: After verifying 100% data consistency and deprecating the old code, deploy a final migration to drop the old column/table.
