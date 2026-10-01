# Integration Incident Runbook: Queue & Worker Outage

## 1. Overview
- **Integration**: Background Job & Queue System (BullMQ / Redis infrastructure)
- **Severity**: P1 (High)
- **Ownership**: Platform Infrastructure & Backend Team
- **Affected Workflows**: Async Notification Dispatch, Webhook Processing, Analytics Aggregation, Report Generation

---

## 2. Detection
- **Alert Trigger**: `AlertQueueBacklogCritical` (> 1000 waiting jobs) or `AlertWorkerDeadlock` (0 jobs completed in 10 mins)
- **Telemetry Indicators**:
  - `washora_queue_backlog_depth > 1000`
  - `washora_queue_jobs_failed_total` increasing rapidly
  - Redis memory utilization reaching `maxmemory` limit

---

## 3. Confirmation
1. Verify Redis connectivity and memory usage:
   ```bash
   redis-cli -u "${REDIS_URL}" ping
   redis-cli -u "${REDIS_URL}" info memory
   ```
2. Check BullMQ queue stats:
   ```bash
   node scripts/inspect-queue-health.mjs --queue default
   ```
3. Inspect worker container logs for unhandled exceptions or OOM restarts.

---

## 4. Containment
1. **Pause Low-Priority Queues**: Pause analytics and promotional email queues to dedicate worker CPU and Redis bandwidth to critical booking and payment events.
2. **Scale Worker Replicas**: Scale up worker instances horizontally:
   ```bash
   kubectl scale deployment washora-workers --replicas=8
   ```

---

## 5. Diagnosis
1. Check if a poison-pill job is crashing workers repeatedly without reaching the dead-letter queue.
2. Verify Redis evictions (`evicted_keys > 0` indicates memory exhaustion).
3. Check for external API dependency bottlenecks causing workers to hang on network calls without timeouts.

---

## 6. Mitigation
1. Isolate and quarantine poison-pill jobs into dead-letter queue manually:
   ```bash
   node scripts/quarantine-poison-jobs.mjs --queue default --failed
   ```
2. Increase Redis maxmemory limit or provision larger Redis cluster instance.
3. Enforce strict timeouts (max 10s) on all external operations performed inside background workers.

---

## 7. Recovery
1. Resume paused queues gradually once backlog depth drops below 100.
2. Verify workers process jobs concurrently without CPU starvation.
3. Drain dead-letter queue after bug fix is deployed.

---

## 8. Validation
1. Enqueue test verification job:
   ```bash
   node scripts/enqueue-test-job.mjs --type PING
   ```
2. Confirm job is picked up and completed within 500ms.
3. Verify zero unhandled job rejections.

---

## 9. Escalation
- **Level 1**: Infrastructure On-Call Engineer (Response < 10 mins)
- **Level 2**: Lead Backend Architect
