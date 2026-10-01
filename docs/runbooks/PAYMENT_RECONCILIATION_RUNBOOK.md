# WASHORA DISASTER RECOVERY RUNBOOK — PAYMENT & FINANCIAL RECONCILIATION
**Document ID**: `RUNBOOK-DR-005`  
**Classification**: Financial Operations & Incident Response  
**Authoritative Owner**: Finance Lead / Platform Engineer  
**Review Cadence**: Monthly  

---

## 1. Scope & Invariants
Financial state is the most sensitive data in WASHORA. In the event of network partition, gateway outage, webhook delay, or database restoration, financial records must be audited and reconciled with mathematical rigor:
1. **Mathematical Invariant**: `Subtotal + Tax - Discounts == Total Amount` using strict Decimal arithmetic.
2. **Refund Cap Invariant**: `Sum(All Completed Refunds for a Payment) <= Original Paid Amount`. Zero over-refunds permitted.
3. **Reward Ledger Invariant**: `RewardAccount.balance == Sum(EARNED points) - Sum(REDEEMED points)`. Zero negative balance permitted.
4. **Idempotency Invariant**: Never create duplicate payments, transactions, or refunds during recovery.

---

## 2. Failure Scenarios & Recovery Procedures

### Scenario 2.1: Payment Initiated → App Crash / Network Cut → Provider Succeeded → Delayed Webhook
**Risk**: If the customer was charged by Razorpay/Stripe, but the app crashed before recording success, marking the payment `FAILED` would cause double-charging when the customer retries.
**Recovery Procedure**:
1. When recovering from outage, scan for payments in `INITIATED` or `PENDING` state older than 5 minutes.
2. Query the payment gateway API (`GET /v1/payments/{gatewayRef}`) to obtain authoritative gateway status.
3. If gateway reports `SUCCESS`:
   - Promote database Payment status to `COMPLETED`.
   - Record payment timestamp and transaction ledger entry.
   - Promote Booking status to `CONFIRMED`.
4. If gateway reports `FAILED` or expired:
   - Mark payment `FAILED` with specific gateway error code.
5. If gateway status is indeterminate:
   - Mark payment `PENDING_INVESTIGATION` and alert Finance Ops.

### Scenario 2.2: Delayed or Missed Webhook Delivery
**Risk**: Webhook delivery delayed by hours due to gateway backpressure or cloud network issues.
**Recovery Procedure**:
1. The webhook intake handler verifies HMAC-SHA256 signature and timestamp tolerance window (within 300s).
2. Uses the idempotent key `(provider, eventId)` to deduplicate already-processed events.
3. If the event was already processed, respond HTTP 200 immediately without reprocessing.
4. If the event is new, process state transition in an interactive database transaction.

### Scenario 2.3: Refund Interrupted by Gateway Outage
**Risk**: Admin triggered refund, database record created, but gateway timed out. Operator might click "Retry Refund" and trigger duplicate payouts.
**Recovery Procedure**:
1. Check existing refund record status before calling gateway refund API.
2. Check gateway refund status using the unique idempotency key: `rfnd_rec_{bookingId}_{refundId}`.
3. Ensure total refunds never exceed the original charge before executing any adjustment.

---

## 3. Automated Post-Disaster Financial Audit Script
Following any database restore or failover, execute the financial reconciliation audit:
```bash
node -e "
  const { PaymentReconciliationService } = require('./src/disaster-recovery/payment-reconciliation.service.js');
  const service = new PaymentReconciliationService();
  // Runs Decimal invariant checks across all payments, refunds, and reward ledgers
"
```

### Violation Handling:
- Any discrepancy > `0.0001` halts automated cutover and generates a `P0_CRITICAL` alert to Finance Ops.
- Manual intervention is logged in the `AuditLog` table with administrative justification.
