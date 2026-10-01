# Incident Response Runbook: Compromised Package & Malicious Dependency

## 1. Threat Definition & Scope
- **Threat Scenario**: Malicious dependency injection, hijacked maintainer account, typosquatting package, malicious install script (`postinstall`), or supply chain tampering.
- **Classification**: **P0 EMERGENCY (Critical Threat to Infrastructure & Customer Data)**.

---

## 2. Phase 1: Containment & Isolation (< 15 Minutes)
1. **Freeze All Deployments**:
   - Immediately cancel in-flight CI/CD pipelines in GitHub Actions.
   - Lock deployment branches (`main`, `production`).
2. **Isolate Affected Production Instances**:
   - Sever external egress network traffic from application pods if exfiltration is suspected.
   - Rotate database credentials (`DATABASE_URL`, `DIRECT_DATABASE_URL`), Redis auth tokens, and encryption keys.
3. **Preserve Forensic Evidence**:
   - Capture running container memory snapshot and local package cache:
   ```bash
   docker commit <affected-container-id> forensic-washapp:evidence
   ```

---

## 3. Phase 2: Identification & Eradication
1. **Audit Dependency Origin & Integrity**:
   - Check `package-lock.json` for unexpected registry URLs or hash mismatches:
   ```bash
   node -e "import('./src/supply-chain/supply-chain-core.mjs').then(m => console.log(new m.LockfileIntegrityEngine().validateIntegrity()))"
   ```
2. **Eradicate Malicious Dependency**:
   - Completely remove the compromised package from `package.json`.
   - Remove cached node_modules and npm cache:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   ```
3. **Re-generate Clean Lockfile**:
   - Install strictly using trusted registry:
   ```bash
   npm install --registry=https://registry.npmjs.org/
   ```

---

## 4. Phase 3: Credential Revocation & Key Rotation
Rotate all credentials that were active while the compromised code was present:
1. `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
2. `ENCRYPTION_KEY` (trigger dual-decrypt/re-encrypt migration)
3. Payment gateway API keys (Stripe, Razorpay)
4. S3 Object Storage access keys and presigned token signing secrets
5. SMS/Email notification provider credentials (Twilio, SendGrid)

---

## 5. Phase 4: Clean Rebuild & Verification
1. Rebuild base Docker images from official `node:20-alpine` without local cache:
   ```bash
   docker build --no-cache -t washora-app:clean .
   ```
2. Run full secret and integrity scan:
   ```bash
   npm run t8:test
   ```
3. Re-deploy verified artifact to production.
4. Notify legal, security, and affected tenants per data privacy regulations.
