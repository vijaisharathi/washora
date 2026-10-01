# WASHORA INCIDENT RUNBOOK — HIGH ERROR RATE
**Document ID**: `RUNBOOK-INC-009`  
**Severity**: `P1_HIGH`  
**Authoritative Owner**: Platform Engineer / Backend Owner  

---

## 1. Detection
- 5xx error rate exceeds 1% of total requests over a 5-minute window.
- Telemetry alert: `HTTP_SERVER_ERROR_RATE_ELEVATED`.

## 2. Confirmation
- Inspect `TelemetryEngine.getTopFailingEndpoints()`.
- Filter logs by `level = ERROR` and `statusCode >= 500`.

## 3. Immediate Containment
- Enable route-specific rate-limiting if failure is driven by malicious or rogue traffic.
- Degrade non-essential features gracefully (e.g. return cached catalog if dynamic search fails).

## 4. Diagnosis
- Identify whether errors are isolated to one route (e.g. `/api/v1/booking`) or widespread.
- Check upstream dependencies (database, Redis, third-party APIs).

## 5. Mitigation
- Apply hotfix if bug is identified.
- Restart impaired pods or scale replica set.

## 6. Recovery
- Monitor rolling error rate until it drops below 0.05%.

## 7. Validation
- Run end-to-end smoke test across Customer, Provider, and Admin routes.

## 8. Communication
- Post update on internal engineering Slack channel.

## 9. Post-Incident Review (RCA)
- Conduct 5-Whys review and harden error boundaries.
