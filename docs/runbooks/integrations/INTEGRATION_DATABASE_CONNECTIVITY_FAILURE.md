# Integration Incident Runbook: PostgreSQL Database Connectivity Failure

## 1. Overview
- **Integration**: Relational Database (PostgreSQL 17 via Prisma ORM)
- **Severity**: P0 (Critical - Platform Blocker)
- **Ownership**: Database Administration & Platform Engineering
- **Affected Workflows**: All Platform Workflows (Authentication, Bookings, Payments, Catalogs, Admin)

---

## 2. Detection
- **Alert Trigger**: `AlertDatabaseDown` or `AlertConnectionPoolExhausted` (> 95% active connections)
- **Telemetry Indicators**:
  - `/health/readiness` endpoint returning HTTP 503 with `"checks": {"database": "disconnected"}`
  - Prisma error codes: `P1001` (Can't reach database server), `P2024` (Timed out fetching a connection from pool)
  - API error rate spiking to 100% with 500 Internal Server Errors

---

## 3. Confirmation
1. Verify PostgreSQL host status from cloud console (AWS RDS, Neon, or container host).
2. Attempt direct connection from application container:
   ```bash
   pg_isready -d "${DATABASE_URL}" -t 5
   ```
3. Inspect database CPU, memory, and IOPS metrics.

---

## 4. Containment
1. **Activate Circuit Breaker**: Prevent incoming web traffic from overwhelming the struggling database cluster.
2. **Reject Non-Critical Traffic**: Temporarily reject non-essential endpoints (reports, analytics export) at API gateway / reverse proxy level.
3. **Terminate Idle Connections**: Kill lingering idle connections from orphaned client processes:
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'idle in transaction' AND state_change < NOW() - INTERVAL '5 minutes';
   ```

---

## 5. Diagnosis
1. Check connection pool saturation vs PostgreSQL `max_connections`.
2. Check for long-running unindexed queries holding exclusive table locks.
3. Check disk space: PostgreSQL auto-halts if disk storage reaches 100%.

---

## 6. Mitigation
1. If primary instance has experienced hardware failure, initiate automated RDS multi-AZ failover to replica:
   ```bash
   aws rds reboot-db-instance --db-instance-identifier washora-prod-db --force-failover
   ```
2. If connection exhaustion is due to traffic spike, restart PgBouncer / connection pooler to flush stale handles.
3. If disk is full, expand EBS storage volume immediately via cloud console.

---

## 7. Recovery
1. Verify database readiness probe returns healthy (`SELECT 1` succeeds in < 5ms).
2. Restart backend pods gracefully in rolling fashion to establish clean connection pool handles.
3. Verify Prisma query execution times stabilize.

---

## 8. Validation
1. Query database health probe:
   ```bash
   curl -s http://localhost:4000/api/v1/health/readiness | jq .
   ```
2. Confirm status is `"ok"` and `"checks": {"database": "connected"}`.
3. Verify zero P1001 / P2024 errors in the last 10 minutes.

---

## 9. Escalation
- **Level 1**: Lead Database Administrator & Infrastructure On-Call (Response < 5 mins)
- **Level 2**: Chief Technology Officer & Head of Engineering
