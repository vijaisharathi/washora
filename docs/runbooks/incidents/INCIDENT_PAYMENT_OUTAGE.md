# WASHORA INCIDENT RUNBOOK — PAYMENT OUTAGE
**Document ID**: `RUNBOOK-INC-003`  
**Severity**: `P0_CRITICAL`  
**Authoritative Owner**: Finance Lead / Backend Owner  

---

## 1. Detection
- Payment success rate drops below 80% over a 5-minute rolling window.
- Sudden spike in payment gateway timeout responses (>5% of attempts).
- Webhook intake failure rate spikes above threshold.

## 2. Confirmation
- Check payment gateway status page (Razorpay / Stripe status).
- Review `/api/v1/health/readiness` payment provider response.
- Execute simulated test payment with mock credentials in staging.

## 3. Immediate Containment
- Enable gateway circuit breaker to prevent customer checkout attempts from hanging.
- Display in-app banner: "Card payments currently undergoing maintenance; cash-on-delivery available."
- Do NOT mark pending payments as permanently failed.

## 4. Diagnosis
- Inspect gateway HTTP response codes: 504 Gateway Timeout, 401 Unauthorized (expired credentials), or 429 Rate Limited.
- Verify TLS certificate validity for payment gateway endpoints.

## 5. Mitigation
- If primary gateway is down: failover to secondary payment gateway provider via ConfigService.
- If rate-limited: switch to backup API key pair.

## 6. Recovery
- Reconcile in-flight payments using `PaymentReconciliationService.reconcileInterruptedPayment`.
- Confirm customer payments that succeeded externally are promoted to `COMPLETED`.
- Close circuit breaker and re-enable checkout flow.

## 7. Validation
- Verify zero double-charges and zero double-refunds in financial ledger.
- Execute single-item end-to-end checkout test.

## 8. Communication
- Notify Finance Ops, Customer Support, and affected customers via SMS/email.

## 9. Post-Incident Review (RCA)
- Reconcile all transaction logs against gateway bank settlement reports.
