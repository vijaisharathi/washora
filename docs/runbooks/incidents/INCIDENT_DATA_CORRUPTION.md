# WASHORA INCIDENT RUNBOOK — DATA CORRUPTION
**Document ID**: `RUNBOOK-INC-012`  
**Severity**: `P0_CRITICAL`  
**Authoritative Owner**: Database Administrator / Finance Lead  

---

## 1. Detection
- Relational integrity check (`npm run db:integrity:check`) reports broken foreign keys or orphaned records.
- Financial reconciliation audit (`PaymentReconciliationService`) detects decimal balance equation violations (`Subtotal + Tax - Discount != Total`).
- Negative reward points or refund cap violations detected.

## 2. Confirmation
- Run detailed database audit script.
- Isolate affected rows and identify earliest corruption timestamp.

## 3. Immediate Containment
- Freeze financial operations and migrations immediately.
- Prevent further propagation by placing booking and payment endpoints into read-only mode.

## 4. Diagnosis
- Inspect recent transactions, background jobs, or migrations executed prior to corruption.
- Correlate with application release logs.

## 5. Mitigation
- If corruption is localized: apply surgical idempotent data repair script within an interactive transaction.
- If corruption is widespread: execute Point-in-Time Recovery (PITR) to 1 second before the corrupting event (`RUNBOOK-DR-003`).

## 6. Recovery
- Restore consistent relational state.
- Run complete reconciliation check across bookings, payments, and reward accounts.

## 7. Validation
- Verify 0 invariant violations and 0 orphaned records.
- Confirm all 10 checks in `npm run db:integrity:check` pass.

## 8. Communication
- Notify Finance, Executive Leadership, and affected accounts with transparent ledger correction statements.

## 9. Post-Incident Review (RCA)
- Conduct 5-Whys review and enforce database-level CHECK constraints.
