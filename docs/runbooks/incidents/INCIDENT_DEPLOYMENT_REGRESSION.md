# WASHORA INCIDENT RUNBOOK — DEPLOYMENT REGRESSION
**Document ID**: `RUNBOOK-INC-008`  
**Severity**: `P1_HIGH`  
**Authoritative Owner**: Release Engineer / Backend Owner  

---

## 1. Detection
- Error rate increases by > 2% immediately following a new release deployment.
- Uncaught exceptions or 500 errors appear on previously healthy endpoints.
- Incident start timestamp correlates within 15 minutes of deployment event.

## 2. Confirmation
- Check `DeploymentMonitorEngine.correlateIncidentWithRelease`.
- Review release changelog and diff against previous stable git SHA.

## 3. Immediate Containment
- Freeze further deployments across all environments.
- Prepare instant rollback to previous container image tag.

## 4. Diagnosis
- Inspect application error stack traces captured in `StructuredLoggerService`.
- Verify if regression is due to code bug, missing environment variable, or schema incompatibility.

## 5. Mitigation
- Execute immediate deployment rollback:
  ```bash
  kubectl rollout undo deployment/washora-backend
  kubectl rollout status deployment/washora-backend
  ```

## 6. Recovery
- Confirm traffic is routed back to previous stable release containers.
- Re-verify database backward compatibility.

## 7. Validation
- Confirm error rate drops back to baseline (< 0.1%).
- Verify core customer and provider workflows complete successfully.

## 8. Communication
- Inform Product, Engineering, and QA leads that release was rolled back.

## 9. Post-Incident Review (RCA)
- Add automated regression test to CI/CD pipeline targeting the specific failure.
