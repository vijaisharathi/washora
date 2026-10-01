# Integration Incident Runbook: Payment Webhook Failure

## 1. Overview
- **Integration**: Payment Webhook Receiver (`/api/v1/webhooks/payment`)
- **Severity**: P0 / P1
- **Ownership**: Backend Engineering & Platform Operations
- **Affected Workflows**: Asynchronous Payment State Updates, Order Auto-Confirmation, Valet Dispatch

---

## 2. Detection
- **Alert Trigger**: `AlertWebhookFailureRateElevated` (> 1% failures) or `AlertWebhookProcessingLagHigh` (> 120s lag)
- **Telemetry Indicators**:
  - `washora_webhooks_processed_total{status="failed"}` rising
  - High count of bookings stuck in `PENDING_PAYMENT` despite successful customer authorization
  - Unhandled 401 (Invalid Signature) or 400 (Timestamp Expired) in webhook controller logs

---

## 3. Confirmation
1. Query webhook repository for failed records:
   ```sql
   SELECT id, provider, event_id, status, error_message, attempts, created_at 
   FROM webhook_events 
   WHERE status = 'FAILED' AND created_at > NOW() - INTERVAL '1 hour';
   ```
2. Inspect provider dashboard (Stripe/Razorpay Webhooks section) for HTTP 5xx responses or timeout delivery failures.
3. Verify incoming payload headers (`Stripe-Signature` or `X-Razorpay-Signature`).

---

## 4. Containment
1. **Idempotency Defense**: Verify that repeated webhook deliveries from provider retries do not trigger duplicate order confirmation or duplicate wallet credits.
2. **Buffer Queue**: If the internal webhook consumer is under heavy load, queue incoming raw events into Redis/BullMQ immediately with HTTP 200/202 acknowledgment.

---

## 5. Diagnosis
1. **Signature Mismatch**: Verify if `PAYMENT_WEBHOOK_SECRET` was recently rotated or corrupted in environment variables.
2. **Timestamp Replay Violation**: Check if server clock has drifted (`ntpstat` / `chrony`) exceeding the 300-second tolerance window.
3. **Database Contention**: Check for locks or transaction deadlocks during webhook status mutation.

---

## 6. Mitigation
1. If signature secret is invalid, restore the correct secret in environment and restart backend pods gracefully.
2. If clock drift is detected, resync server NTP daemon immediately:
   ```bash
   sudo chronyc makestep
   ```
3. Run the manual webhook retry worker to reprocess `FAILED` records:
   ```bash
   node scripts/reprocess-failed-webhooks.mjs --since 2h
   ```

---

## 7. Recovery
1. Webhooks re-enter the 4-stage state machine: `RECEIVED -> VALIDATED -> PROCESSING -> PROCESSED`.
2. Ensure out-of-order protection blocks regression (e.g. `PENDING` event arriving after `SUCCEEDED`).
3. Reconcile affected booking statuses from `PENDING_PAYMENT` to `CONFIRMED`.

---

## 8. Validation
1. Send a signed test webhook via CLI or provider test panel:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
2. Verify event status transitions cleanly to `PROCESSED`.
3. Confirm zero orphaned payments remain in `PENDING_PAYMENT` beyond 10 minutes.

---

## 9. Escalation
- **Level 1**: Backend On-Call Engineer (Response < 10 mins)
- **Level 2**: Lead Payment Systems Engineer
- **Level 3**: Head of Infrastructure
