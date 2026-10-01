# WASHORA INCIDENT RUNBOOK — HIGH LATENCY
**Document ID**: `RUNBOOK-INC-010`  
**Severity**: `P2_MEDIUM`  
**Authoritative Owner**: Performance Engineer / Backend Owner  

---

## 1. Detection
- API p95 latency exceeds 500ms or p99 latency exceeds 1500ms over a 5-minute window.
- SLI alert triggered: `LATENCY_SLO_BUDGET_CONSUMPTION`.

## 2. Confirmation
- Check latency histograms via `TelemetryEngine.getMetricsSummary()`.
- Inspect distributed trace spans for bottleneck services.

## 3. Immediate Containment
- Enable aggressive Redis query caching on read-heavy routes.
- Shed non-critical load if concurrency is near saturation.

## 4. Diagnosis
- Inspect slow queries in `DatabaseMonitorEngine.slowQueries`.
- Check Node.js event loop lag and GC pause times.

## 5. Mitigation
- Optimize database execution plans or add missing indexes.
- Increase database connection pool size if queuing is observed.

## 6. Recovery
- Confirm p95 latency normalizes below 250ms.

## 7. Validation
- Run benchmark test to verify sustained response times under peak concurrency.

## 8. Communication
- Update Engineering status board.

## 9. Post-Incident Review (RCA)
- Review database query profiling and implement query coalescing.
