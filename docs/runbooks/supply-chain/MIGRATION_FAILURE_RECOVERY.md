# Operational Runbook: Database Migration Failure & Safe Recovery

## 1. Migration Failure Scenarios
- **Lock Timeout**: Long transaction exceeded `statement_timeout` (30s) or `lock_timeout` during index creation or table alter.
- **Syntax / Constraint Violation**: Unexpected NULL values or foreign key constraint violation on existing dataset.
- **Network Disconnect**: Database connection dropped mid-migration.
- **Application Crash**: Deployment killed during `prisma migrate deploy`.

---

## 2. Emergency Assessment (< 5 Minutes)
1. **Inspect Migration Status**:
   ```bash
   npx prisma migrate status
   ```
2. **Determine Failed Migration State**:
   - Query `_prisma_migrations` table directly:
   ```sql
   SELECT id, migration_name, started_at, finished_at, applied_steps_count, rolled_back_at 
   FROM _prisma_migrations 
   ORDER BY started_at DESC LIMIT 5;
   ```
3. **DO NOT Run `migrate dev` or `migrate reset` in Production!**

---

## 3. Recovery Procedures

### Scenario A: Migration Failed Prior to Any Schema Changes
If the migration errored before committing any DDL (clean rollback within transactional migration):
1. Mark the failed migration as rolled back in Prisma migration table:
   ```bash
   npx prisma migrate resolve --rolled-back <failed-migration-name>
   ```
2. Fix the underlying DDL script in local development.
3. Commit corrected migration and re-deploy.

### Scenario B: Partial Schema Mutation (Non-Transactional DDL)
If PostgreSQL executed partial DDL before failing:
1. Compare live database schema against migration SQL:
   ```bash
   node scripts/db-integrity-check.mjs
   ```
2. Identify applied tables, columns, or indexes.
3. Write a corrective idempotent migration script to complete or safely revert the partial state.
4. If schema is corrupted, execute Point-In-Time-Recovery (PITR) using verified pre-migration backup:
   ```bash
   npm run db:restore:verify
   ```

### Scenario C: Expand/Contract Migration Reversion
If an application version is incompatible with a newly deployed column:
1. Keep the expanded column in place (zero-downtime safety).
2. Revert the application deployment to the previous Docker image digest.
3. The previous application ignores the new column; operations continue seamlessly without data loss.

---

## 4. Verification Checklist Before Resuming Production
- [ ] `npx prisma migrate status` outputs `Database schema is up to date`.
- [ ] Financial balance check: Sum of credits equals sum of debits across `financial_transactions`.
- [ ] Tenant boundaries verified: Zero cross-tenant record leakage.
- [ ] Application health check `/health` returns `200 OK`.
- [ ] Smoke test passes:
  ```bash
  npm run c5:test
  ```
