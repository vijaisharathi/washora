# WASHORA DISASTER RECOVERY RUNBOOK — FULL PLATFORM REBUILD & BUSINESS CONTINUITY
**Document ID**: `RUNBOOK-DR-006`  
**Classification**: High-Severity Incident Response & Business Continuity  
**Authoritative Owner**: Disaster Recovery Commander (Operations Lead & Platform Engineer)  
**Review Cadence**: Quarterly  

---

## 1. Incident Severity Classification

| Severity | Definition | Target RTO | Target RPO | Notification SLA |
|---|---|---|---|---|
| **P0 — Catastrophic / Outage** | Complete platform unavailability, primary database loss, or widespread financial data corruption. | **< 30 minutes** | **< 5 minutes** | Immediate (< 5 min) via PagerDuty / SMS to all Incident Leads |
| **P1 — Critical Service Degraded** | Partial service outage (e.g. payment gateway offline, worker queue backlog > 10,000, storage read failures). | **< 1 hour** | **< 15 minutes** | Within 15 minutes |
| **P2 — Major Feature Impaired** | Non-critical functionality degraded (e.g. review submissions failing, push notifications delayed, promo engine offline). | **< 4 hours** | **< 1 hour** | Within 1 hour |
| **P3 — Minor Defect** | Cosmetic UI glitches, non-blocking administrative report timeouts. | **< 24 hours** | **N/A** | Next business day |

---

## 2. Disaster Recovery Command & Ownership Roles

| Role Title | Operational Responsibility | Incident Authority |
|---|---|---|
| **Incident Commander** | Coordinates overall recovery response, communications, and decision-making. | Authorizes failover, maintenance mode, and rollback. |
| **Platform Engineer** | Executes database restoration, infrastructure provisioning, DNS failover, and networking. | Manages cloud infrastructure, compute instances, and database clusters. |
| **Backend Owner** | Rebuilds application containers, handles Prisma migrations, and validates API health. | Authorizes code hotfixes and deployment rollbacks. |
| **Finance Lead** | Audits payment ledgers, refunds, and earnings; authorizes gateway reconciliation. | Approves financial cutover and ledger balance verification. |
| **Security Owner** | Validates secret rotation, KMS access, TLS/SSL certificates, and PII protection. | Halts recovery if security or data leakage is detected. |

---

## 3. End-to-End Full Platform Rebuild Sequence

In the event of total datacenter loss, regional outage, or infrastructure wipe:

### Phase 1: Immediate Containment & Communication (T+0 to T+5m)
1. **Declare P0 Outage**: Incident Commander announces incident on the emergency war room bridge.
2. **Engage Maintenance Ingress**: Point public DNS (`api.washora.com`, `app.washora.com`) to Cloudflare / AWS Route 53 static maintenance page (HTTP 503).
3. **Notify External Stakeholders**: Post status update to status.washora.com and inform customer support leads.

### Phase 2: Core Infrastructure & Secrets Provisioning (T+5m to T+12m)
1. **Provision Infrastructure**: Deploy compute instances and PostgreSQL database using Terraform / CloudFormation templates.
2. **Restore Secrets**: Securely pull environment configuration from encrypted cloud secret vault (AWS Secrets Manager / Vault):
   - Database credentials (`DATABASE_URL`)
   - Backup decryption keys (`WASHORA_BACKUP_KEY`)
   - Gateway webhook secrets
   - JWT private signing keys

### Phase 3: Database & Object Storage Restoration (T+12m to T+20m)
1. **Restore PostgreSQL Database**:
   - Fetch latest encrypted snapshot from offsite vault.
   - Verify SHA-256 integrity digest.
   - Decrypt with AES-256-GCM.
   - Restore canonical schema and data into PostgreSQL.
2. **Execute PITR (if applicable)**: Replay continuous WAL archive up to the latest known-good timestamp.
3. **Restore Object Storage**: Sync latest S3 bucket replica containing KYC documents and dispute proofs.

### Phase 4: Application Stack Rebuild & Service Launch (T+20m to T+25m)
1. **Deploy Backend & Workers**:
   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   npm run start:prod
   ```
2. **Verify Cache Warmup**: Redis cache initializes cleanly; system falls back transparently to PostgreSQL if cache is warming.
3. **Verify Queue Consumer**: BullMQ / worker daemons start processing pending asynchronous tasks.

### Phase 5: Post-Recovery Validation & Reconciliation (T+25m to T+28m)
1. **Run Database Integrity Check**:
   ```bash
   npm run db:integrity:check
   ```
2. **Run Financial Reconciliation**:
   - Verify `Total == Subtotal + Tax - Discounts`.
   - Verify `Refunds <= Payments`.
   - Verify `Reward Account Balance == Transaction Ledger`.
3. **Run Application Smoke Test**: Test Customer login, Booking detail retrieval, and Admin dashboard overview.

### Phase 6: DNS Cutover & Traffic Restoration (T+28m to T+30m)
1. Update DNS routing records in Route 53 to direct traffic from maintenance page to the newly restored cluster.
2. Verify SSL/TLS certificates and automated Let's Encrypt / ACM renewal.
3. Monitor real-time telemetry (latency, error rate, CPU) for 30 minutes.
4. Mark incident resolved on status page.

---

## 4. Post-Incident Review (RCA Protocol)
Within 48 hours of any P0 or P1 incident:
1. Conduct blameless Post-Mortem with all command role owners.
2. Document Root Cause Analysis (RCA) covering timeline, detection delay, recovery duration, and data loss.
3. Create actionable remediation tickets for any identified gap.
