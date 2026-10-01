# WASHORA INCIDENT RUNBOOK — QUEUE & WORKER FAILURE
**Document ID**: `RUNBOOK-INC-005`  
**Severity**: `P1_HIGH`  
**Authoritative Owner**: Platform Engineer / Backend Owner  

---

## 1. Detection
- Queue depth exceeds 500 pending jobs for > 10 minutes.
- Worker processing rate drops to zero across notifications or dispatch queues.
- Job failure count or Dead Letter Queue (DLQ) count increases rapidly.

## 2. Confirmation
- Check BullMQ dashboard or execute queue status inspection.
- Inspect worker process health: `ps aux | grep worker` or container supervisor.

## 3. Immediate Containment
- Pause non-critical background jobs (e.g. daily analytics aggregation, marketing emails).
- Prioritize dispatch and payment reconciliation queues.

## 4. Diagnosis
- Inspect Redis connection logs: `ECONNREFUSED` or Redis memory saturation.
- Check worker logs for unhandled promise rejections or infinite retry loops.

## 5. Mitigation
- Restart worker daemon processes: `kubectl rollout restart deployment/washora-workers`.
- Scale worker concurrency (e.g. increase replica count from 2 to 6).
- If Redis is saturated: increase maxmemory or prune volatile cache keys.

## 6. Recovery
- Re-queue stuck jobs with exponential backoff and max 5 retry attempts.
- Monitor queue drain rate until depth drops below 50.

## 7. Validation
- Confirm all pending dispatch assignments and customer notifications are processed.
- Verify zero duplicate notifications delivered to customers.

## 8. Communication
- Update Operations dispatch team on backlog clearing progress.

## 9. Post-Incident Review (RCA)
- Implement worker auto-scaling based on queue depth metrics.
