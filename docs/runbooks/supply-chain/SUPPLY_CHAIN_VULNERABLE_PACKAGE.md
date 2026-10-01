# Incident Response Runbook: Vulnerable Dependency Remediation

## 1. Trigger & Classification
- **Trigger**: Automated security alert, CVE publication, or audit notification indicating a vulnerability in a direct or transitive dependency.
- **Severity Matrix**:
  - **P0**: Active zero-day with known in-the-wild exploit against reachable production endpoints.
  - **P1**: High/Critical severity vulnerability in production runtime package with potential exploit path.
  - **P2**: Medium/Low severity vulnerability, or flaw in build-time / dev-only tooling.
  - **P3**: Informational advisory or flaw in unused code path.

---

## 2. Immediate Triage (< 30 Minutes)
1. **Identify Package & Reachability**:
   ```bash
   npm ls <vulnerable-package-name>
   ```
2. **Determine Exposure**:
   - Is the package imported in `src/` (backend runtime) or `pages/` (client bundle)?
   - Is it strictly in `devDependencies` (e.g., eslint, typescript, ts-node)?
   - Can untrusted user input reach the vulnerable function call?
3. **Check Upstream Fix**:
   - Verify official vendor patch or CVE mitigation advisories.

---

## 3. Safe Remediation Workflow (No Blind Upgrades)
1. **Targeted Patching**:
   - Do NOT run `npm update` or `upgrade-all`.
   - Update only the affected package in `package.json` to the minimum safe patched version:
   ```bash
   npm install <package-name>@<safe-version> --save-exact
   ```
2. **Verify Lockfile Determinism**:
   ```bash
   git diff package-lock.json
   ```
   Confirm only the target package and its necessary sub-dependencies were updated.
3. **Execute Full Local Regression**:
   ```bash
   npm run typecheck
   npm run lint
   npm run db:test
   npm run backend:test
   npm run integration:test
   npm run t1:test
   npm run t8:test
   ```

---

## 4. Staging Promotion & Validation
1. Deploy to staging environment via standard CI/CD workflow (`.github/workflows/production-pipeline.yml`).
2. Run end-to-end smoke verification:
   ```bash
   npm run c5:test
   ```
3. Monitor application error rates and memory metrics in Datadog/Grafana for 15 minutes.

---

## 5. Production Rollout & Rollback Criteria
- Promote to production using zero-downtime rolling update.
- **Rollback Criteria**: If error rate increases by > 0.5% or latency increases by > 20%, immediately trigger automated rollback:
  ```bash
  git revert HEAD
  git push origin production
  ```
- Post-incident: File post-mortem and update `docs/WASHORA_T8_SUPPLY_CHAIN_REPORT.md`.
