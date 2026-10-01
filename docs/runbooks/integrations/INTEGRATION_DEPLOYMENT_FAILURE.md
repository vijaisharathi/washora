# Integration Incident Runbook: CI/CD & Deployment Failure

## 1. Overview
- **Integration**: CI/CD Deployment Pipeline & Container Orchestration (GitHub Actions / ECS / K8s)
- **Severity**: P0 / P1
- **Ownership**: Release Engineering & DevOps Team
- **Affected Workflows**: Software Releases, Hotfix Deployments, Zero-Downtime Prisma Migrations

---

## 2. Detection
- **Alert Trigger**: `AlertDeploymentFailed` or `AlertPostReleaseErrorRateSpike` (> 1% 5xx errors within 10 mins of release)
- **Telemetry Indicators**:
  - GitHub Actions pipeline step failed (`quality_and_security`, `test_suites`, or `build_artifacts`)
  - Container health checks failing on newly deployed pods (CrashLoopBackOff)
  - Post-release correlation showing immediate spike in application exceptions

---

## 3. Confirmation
1. Check GitHub Actions workflow run logs for exit code and failure step.
2. Inspect container orchestrator deployment status:
   ```bash
   kubectl rollout status deployment/washora-api
   ```
3. Check application logs on newly booted containers for uncaught boot errors.

---

## 4. Containment
1. **Halt Deployment**: Immediately cancel ongoing rolling updates to prevent bad version from propagating to 100% of pods.
2. **Preserve Database State**: Do NOT run `prisma migrate reset` or destructive schema alterations. Verify backward-compatibility of any applied migrations.

---

## 5. Diagnosis
1. **Build / Typecheck Failure**: Check if unverified code merged into production branch.
2. **Missing Production Env Vars**: Check if a new feature requires an environment variable that was not configured in AWS Secrets Manager / Vault.
3. **Database Migration Deadlock**: Check if `prisma migrate deploy` is blocked by an exclusive table lock.

---

## 6. Mitigation
1. **Automated Rollback**: Execute rapid rollback to previous known-good release tag:
   ```bash
   kubectl rollout undo deployment/washora-api
   ```
   Or trigger rollback workflow in GitHub Actions:
   ```bash
   gh workflow run rollback.yml -f release_tag=v1.0.4-stable
   ```
2. Verify traffic shifts back to the stable replica set.

---

## 7. Recovery
1. Re-verify `/health` and `/health/readiness` on all running containers.
2. Confirm error rates return to pre-release baseline (< 0.05%).
3. Quarantine the failing commit and require full CI rerun with hotfix before redeployment.

---

## 8. Validation
1. Execute post-rollback smoke test:
   ```bash
   node scripts/production-smoke-test.mjs --target https://api.washora.com
   ```
2. Verify all core user flows (Login, Booking, Payment, History) execute successfully.
3. Confirm zero crash restarts on stable containers.

---

## 9. Escalation
- **Level 1**: Release Engineer On-Call (Response < 5 mins)
- **Level 2**: Lead DevOps Architect & Tech Lead of Deploying Squad
