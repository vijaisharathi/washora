# WASHORA INCIDENT RUNBOOK — AUTHENTICATION OUTAGE
**Document ID**: `RUNBOOK-INC-007`  
**Severity**: `P0_CRITICAL`  
**Authoritative Owner**: Security Owner / Backend Owner  

---

## 1. Detection
- Sudden spike in 401 Unauthorized errors across all authenticated routes.
- Login failure rate exceeds 20% or token refresh failure rate exceeds 50%.
- Users experiencing unexpected logout across active sessions.

## 2. Confirmation
- Attempt login with known test credentials.
- Inspect JWT token verification logs for `JsonWebTokenError` or algorithm rejection.

## 3. Immediate Containment
- Isolate affected auth nodes if rolling restart or deployment is underway.
- Temporarily extend access token expiration from 15m to 60m to prevent mass refresh failures while diagnosing.

## 4. Diagnosis
- Inspect `JWT_SECRET` configuration: was it modified or unset?
- Check Redis or database session store for connectivity or dropped session tables.

## 5. Mitigation
- If secret was corrupted: restore authoritative `JWT_SECRET` from cloud secret manager.
- If refresh token rotation lock triggered false positives: restart auth worker with cleared lock cache.

## 6. Recovery
- Deploy verified configuration.
- Trigger controlled session refresh or notify users to re-authenticate.

## 7. Validation
- Test Customer, Provider, Delivery Partner, and Admin authentication lifecycles.
- Verify refresh token rotation and revocation on logout.

## 8. Communication
- Notify Customer Support and post notice on status page.

## 9. Post-Incident Review (RCA)
- Review secret deployment pipelines and enforce immutable secret versioning.
