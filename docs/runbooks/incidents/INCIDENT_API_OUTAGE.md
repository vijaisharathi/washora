# WASHORA INCIDENT RUNBOOK — API OUTAGE
**Document ID**: `RUNBOOK-INC-001`  
**Severity**: `P0_CRITICAL` / `P1_HIGH`  
**Authoritative Owner**: Platform Engineer / Backend Owner  

---

## 1. Detection
- Health check probe (`GET /health`) returns non-200 or times out (>5s).
- API Gateway reports 502 Bad Gateway or 504 Gateway Timeout on incoming traffic.
- PagerDuty P0 alert triggered: `API_AVAILABILITY_BREACH`.

## 2. Confirmation
- Execute direct cURL probe: `curl -iv http://localhost:3000/api/v1/health`.
- Inspect ingress controller error logs for upstream connection refused.

## 3. Immediate Containment
- Shift DNS / ingress to Cloudflare static maintenance page (`HTTP 503` with `Retry-After: 30`).
- Prevent cascading timeouts to payment gateways and worker queues.

## 4. Diagnosis
- Check application container status: `docker ps` or `kubectl get pods -l app=washora-api`.
- Inspect latest crash logs: `docker logs washora-api --tail 100`.
- Check CPU, Memory, and Node.js event loop lag.

## 5. Mitigation
- If memory leak or OOM crash: restart container instances with increased heap limit (`--max-old-space-size=4096`).
- If deadlocked: kill stuck worker processes and cycle instances sequentially.

## 6. Recovery
- Re-launch application containers under supervisor.
- Verify liveness endpoint returns `HTTP 200` with valid uptime.
- Gradually restore ingress traffic from maintenance page (10% -> 50% -> 100%).

## 7. Validation
- Verify Customer, Provider, and Admin API login flows.
- Confirm API p95 latency is under 250ms and error rate is below 0.1%.

## 8. Communication
- Post incident notification on status.washora.com within 5 minutes of detection.
- Brief Customer Support leads with estimated time to resolution (ETR).

## 9. Post-Incident Review (RCA)
- Conduct 5-Whys post-mortem within 48 hours.
- File preventative tickets for memory limits, timeout thresholds, and health checks.
