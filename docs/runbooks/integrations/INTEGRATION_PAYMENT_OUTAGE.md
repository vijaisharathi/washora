# Integration Incident Runbook: Payment Provider Outage

## 1. Overview
- **Integration**: Payment Provider (Stripe / Razorpay abstraction)
- **Severity**: P0 (Critical)
- **Ownership**: Finance Operations & Platform Engineering
- **Affected Workflows**: Customer Checkout, Booking Payment Initiation, Refund Processing, Payout Settlements

---

## 2. Detection
- **Alert Trigger**: `AlertPaymentFailureRateHigh` (Failure rate > 5% over 5 minutes) or `AlertPaymentGateway5xx`
- **Telemetry Indicators**:
  - `washora_payment_requests_total{status="failed"} / washora_payment_requests_total > 0.05`
  - Circuit Breaker transitions from `CLOSED` to `OPEN` for `PaymentGateway`
  - Customer reports of checkout timeouts or failed intent creation

---

## 3. Confirmation
1. Check gateway status pages (e.g. `status.stripe.com` or `status.razorpay.com`).
2. Verify API latency and HTTP error responses from server logs:
   ```bash
   grep "PaymentGateway" /var/log/washora/api.log | grep -E "500|502|503|504|ETIMEDOUT"
   ```
3. Test direct gateway connectivity from backend host:
   ```bash
   curl -I --max-time 5 https://api.stripe.com/v1/healthcheck
   ```

---

## 4. Containment
1. **Engage Circuit Breaker**: Ensure the circuit breaker is in `OPEN` state to fast-fail subsequent requests and prevent customer charges from hanging.
2. **Graceful UI Communication**: Trigger front-end banner: *"Card payments are temporarily experiencing elevated delays. Cash-on-Delivery (COD) or wallet options remain available."*
3. **Queue In-Flight Retries**: Prevent aggressive duplicate payment retries that could result in double authorization.

---

## 5. Diagnosis
1. Inspect response bodies and error codes returned by the gateway (`rate_limit_exceeded`, `gateway_timeout`, `card_declined_system_error`).
2. Verify SSL/TLS connectivity and API credentials validity.
3. Check whether failure is localized to specific banks, card networks (Visa/Mastercard), or whole gateway infrastructure.

---

## 6. Mitigation
1. If secondary gateway is configured, toggle provider routing via feature flag or environment variable:
   ```bash
   export PAYMENT_PROVIDER=razorpay # or stripe
   ```
2. For bookings pending payment, extend the payment completion window from 15 minutes to 60 minutes so orders are not prematurely cancelled.
3. Enable COD / Pay-on-Delivery as fallback for eligible services.

---

## 7. Recovery
1. Monitor provider status until resolution is confirmed.
2. Allow Circuit Breaker to transition from `OPEN` to `HALF_OPEN` by probing with controlled test transactions.
3. Once 2 consecutive test transactions succeed, transition Circuit Breaker to `CLOSED`.
4. Re-enable standard checkout flows and remove customer-facing warning banners.

---

## 8. Validation
1. Execute payment smoke test using safe sandbox or micro-transaction.
2. Verify ledger transaction records:
   - Ensure no double debits occurred during the outage.
   - Reconcile pending intents against provider transaction logs.
3. Confirm failure rate drops below 0.1% over a 15-minute window.

---

## 9. Escalation
- **Level 1**: On-Call Backend Engineer (Immediate response within 5 mins)
- **Level 2**: Lead Platform Architect & Payment Gateway Account Manager
- **Level 3**: Head of Engineering & Chief Operating Officer
