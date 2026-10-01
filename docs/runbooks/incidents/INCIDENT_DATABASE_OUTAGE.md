# WASHORA INCIDENT RUNBOOK — DATABASE OUTAGE
**Document ID**: `RUNBOOK-INC-002`  
**Severity**: `P0_CRITICAL`  
**Authoritative Owner**: Database Administrator / Platform Engineer  

---

## 1. Detection
- Health check probe (`GET /health/readiness`) returns 503 Service Unavailable: `PostgreSQL connection unavailable`.
- Backend logs show widespread `P1001: Can't reach database server` or connection pool exhaustion errors.
- Database CPU reaches 100% or connection count reaches maximum limit.

## 2. Confirmation
- Connect via psql: `psql "$DATABASE_URL" -c "SELECT 1;"`.
- Check connection count: `SELECT count(*) FROM pg_stat_activity;`.

## 3. Immediate Containment
- Place API in read-only / maintenance mode to halt incoming database transaction floods.
- Throttle background workers (drain BullMQ dispatch and notification queues).

## 4. Diagnosis
- Check for long-running unindexed queries:
  ```sql
  SELECT pid, now() - query_start AS duration, query 
  FROM pg_stat_activity 
  WHERE state != 'idle' ORDER BY duration DESC LIMIT 5;
  ```
- Check disk space on database mount (`df -h`).

## 5. Mitigation
- Terminate blocking queries: `SELECT pg_terminate_backend(pid);`.
- If connection pool exhausted: increase pool size or restart PgBouncer / database instance.
- If storage full: expand EBS volume or drop obsolete WAL archives.

## 6. Recovery
- Ensure PostgreSQL service is healthy: `systemctl status postgresql` or AWS RDS status `Available`.
- Test connectivity from backend container.
- Resume background workers and remove maintenance mode.

## 7. Validation
- Run relational database integrity check: `npm run db:integrity:check`.
- Confirm 0 slow queries and pool utilization < 50%.

## 8. Communication
- Alert all role owners (Platform, Backend, Security, Finance).
- Publish customer-facing status update: "Database maintenance in progress."

## 9. Post-Incident Review (RCA)
- Analyze slow query logs and add missing database indexes.
- Adjust PgBouncer idle timeouts and max client connection caps.
