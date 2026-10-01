# Integration Incident Runbook: SMS Provider Outage

## 1. Overview
- **Integration**: SMS Provider (Twilio / Gupshup abstraction)
- **Severity**: P1 / P2
- **Ownership**: Platform Operations & Communications Team
- **Affected Workflows**: Mobile Phone OTP Login, Valet Arrival SMS, Critical Delivery Alerts

---

## 2. Detection
- **Alert Trigger**: `AlertSmsDeliveryFailureRate` (> 3% failed SMS over 5 minutes)
- **Telemetry Indicators**:
  - `washora_notifications_dispatched_total{channel="SMS",status="failed"}`
  - Carrier error codes logged: Twilio 30008 (Unknown error), 21614 (Invalid mobile number), 20429 (Too many requests)

---

## 3. Confirmation
1. Verify SMS aggregator status page (e.g. `status.twilio.com`).
2. Test sending outbound SMS via provider CLI:
   ```bash
   twilio api:core:messages:create --to "+919876543210" --from "+1234567890" --body "Test WASHORA ping"
   ```
3. Inspect internal SMS dispatch queue backlog.

---

## 4. Containment
1. **Fallback to WhatsApp / Email**: Route mobile verification codes via WhatsApp Business API or registered Email address.
2. **Rate Limit Throttling**: Enforce client-side rate limits on OTP resend requests (maximum 1 resend per 60 seconds) to prevent carrier throttling.

---

## 5. Diagnosis
1. Inspect carrier error logs:
   - DLT / Regulatory template mismatch (India TRAI regulations).
   - Balance exhaustion on pre-paid SMS account.
   - Provider regional carrier peering failure.

---

## 6. Mitigation
1. Top up account balance if balance depletion is detected.
2. If primary route has carrier outage, failover to secondary SMS gateway (e.g. switch from Twilio to Gupshup/AWS SNS) via config switch.
3. Reprocess queued high-priority OTP messages.

---

## 7. Recovery
1. Re-enable standard SMS dispatch.
2. Verify delivery status callbacks are arriving and updating communication logs to `DELIVERED`.

---

## 8. Validation
1. Trigger live SMS test to internal test phone number.
2. Verify delivery time is < 10 seconds.
3. Confirm delivery receipt acknowledgment from carrier.

---

## 9. Escalation
- **Level 1**: Communications Engineer (Response < 15 mins)
- **Level 2**: Lead Infrastructure Engineer & Aggregator Account Executive
