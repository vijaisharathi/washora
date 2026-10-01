# WASHORA INCIDENT RUNBOOK — WEBHOOK FAILURE
**Document ID**: `RUNBOOK-INC-004`  
**Severity**: `P1_HIGH`  
**Authoritative Owner**: Backend Owner / Integrations Engineer  

---

## 1. Detection
- Webhook failure alert triggered: 5xx responses on `/api/v1/webhooks` endpoint.
- Webhook signature verification failure rate exceeds 10%.
- Webhook processing delay exceeds 300 seconds.

## 2. Confirmation
- Review webhook intake logs in `WebhookService`.
- Verify incoming payload HMAC header `x-webhook-signature` presence and validity.

## 3. Immediate Containment
- Ingest raw webhook payloads into persistent dead-letter queue (DLQ) with HTTP 200 acknowledgment to prevent gateway backoff.
- Prevent duplicate event processing by enforcing idempotent keys `(provider, eventId)`.

## 4. Diagnosis
- Inspect if gateway rotated webhook signing secret without application update.
- Check timestamp skew between gateway clock and server NTP clock.

## 5. Mitigation
- If secret mismatch: update `PAYMENT_WEBHOOK_SECRET` environment variable and reload configuration.
- If timestamp expired: temporarily adjust tolerance window from 300s to 600s.

## 6. Recovery
- Replay queued webhook events from DLQ in strict sequential order.
- Verify status transitions from `PROCESSING` to `PROCESSED`.

## 7. Validation
- Run reconciliation check: confirm booking payment status matches gateway event states.

## 8. Communication
- Alert Finance Ops and Operations leads.

## 9. Post-Incident Review (RCA)
- Implement automated webhook secret rotation coordination and clock drift alerting.
