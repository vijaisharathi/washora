# WASHORA DISASTER RECOVERY RUNBOOK — DATABASE RESTORATION
**Document ID**: `RUNBOOK-DR-002`  
**Classification**: Internal Operational Procedure  
**Authoritative Owner**: Platform Engineer / Database Administrator  
**Review Cadence**: Monthly  

---

## 1. Golden Rules of Database Restoration
1. **NEVER overwrite production directly**: Initial restore validation must ALWAYS occur inside an isolated recovery environment or staging database.
2. **Privacy Enforcement**: When restoring production backups into non-production environments (staging, QA, local), PII (names, phone numbers, emails, addresses, government IDs) must be pseudonymized/anonymized automatically.
3. **Multi-Stage Validation**: Restoration is not complete until schema integrity, canonical relationships, and Decimal financial balances are mathematically verified.

---

## 2. Restoration Environments

| Target Environment | Isolation Boundary | Purpose | PII Policy |
|---|---|---|---|
| **Temporary Recovery DB** | Separate VPC / Isolated PostgreSQL instance | Pre-production restore validation & forensic analysis | Strictly Anonymized |
| **Staging Environment** | Dedicated staging database cluster | End-to-end integration and smoke testing | Pseudonymized Synthetic Masks |
| **Production Target** | Production cluster failover | Live disaster recovery disaster failover | Authoritative Unaltered Production State |

---

## 3. Step-by-Step Restoration Procedure

### Step 1: Obtain Verified Backup Artifact
Locate the target backup artifact and verify cryptographic integrity before restoration:
```bash
node scripts/db-backup-restore.mjs verify backups/washora_backup_<TIMESTAMP>_full.json.enc
```
*Abort immediately if SHA-256 digest does not match.*

### Step 2: Restore to Isolated Staging with PII Anonymization
Execute isolated restore with the `--staging` flag:
```bash
node scripts/db-backup-restore.mjs restore backups/washora_backup_<TIMESTAMP>_full.json.enc --staging
```
**Anonymization Rules Applied During Staging Restore**:
- `Customer / User Names` → `Anonymized User <ID>`
- `Phone Numbers` → `+919800000<ID>`
- `Email Addresses` → `anonymized_<ID>@washora-staging.internal`
- `Addresses` → `100 Synthetic Way, Staging Suite, Staging City`
- `Government KYC / Trade License Numbers` → Cryptographic dummy masks

### Step 3: Schema & Relational Integrity Verification
Run the automated schema audit:
```bash
npm run db:integrity:check
```
Verify:
- All 44 Prisma schema tables exist.
- Foreign key constraints are intact.
- Zero orphaned booking items, transactions, or assignments.

### Step 4: Financial & Reward Ledger Audit
Verify financial equations and reward ledger consistency:
```bash
node -e "
  const { PaymentReconciliationService } = require('./src/disaster-recovery/payment-reconciliation.service.js');
  console.log('Validating financial invariants...');
"
```
- Total == Subtotal + Tax - Discount
- Sum(Refunds) <= Original Payment Amount
- Reward Account Balance == Ledger Sum (Credits - Debits)

### Step 5: Application Smoke Test & Production Cutover (If Live DR)
Once staging validation passes with 100% integrity:
1. Put the incoming API gateway into temporary maintenance mode (HTTP 503 with Retry-After: 30).
2. Apply the verified snapshot to the live cluster target.
3. Point application connection pools (`DATABASE_URL`) to the recovered database.
4. Execute application health check:
   ```bash
   curl -f http://localhost:3000/api/health
   ```
5. Re-enable traffic at the API gateway and notify Incident Commander.
