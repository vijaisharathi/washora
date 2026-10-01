# Integration Incident Runbook: Email Provider Outage

## 1. Overview
- **Integration**: Email Service (AWS SES / SendGrid abstraction)
- **Severity**: P1 (High)
- **Ownership**: Platform Operations & Communications Team
- **Affected Workflows**: Account Verification, Password Resets, Order Receipts, Operational Notifications

---

## 2. Detection
- **Alert Trigger**: `AlertEmailBounceRateHigh` (> 5% bounce rate) or `AlertEmailProviderErrors` (> 2% API error rate)
- **Telemetry Indicators**:
  - `washora_notifications_dispatched_total{channel="EMAIL",status="failed"}` rising
  - Spike in customer support tickets regarding missing OTP / verification emails
  - SES reputation dashboard showing bounce rate warnings

---

## 3. Confirmation
1. Verify AWS SES / SendGrid service health dashboard.
2. Check email delivery logs:
   ```bash
   grep "EmailProvider" /var/log/washora/api.log | grep -E "SES_ERROR|BOUNCE|RATE_LIMIT"
   ```
3. Test direct API call to provider using sandbox credentials.

---

## 4. Containment
1. **Fallback Channel Routing**: For critical security emails (password resets, OTP), automatically route fallback messages through SMS or In-App banners.
2. **Halt Bulk Promotional Campaigns**: Immediately pause non-urgent marketing emails to preserve provider reputation and rate-limit quotas for transactional emails.

---

## 5. Diagnosis
1. **Domain Authentication**: Verify that SPF, DKIM, and DMARC records are intact and resolving properly via DNS:
   ```bash
   dig TXT washora.com +short
   dig TXT _dmarc.washora.com +short
   ```
2. **Quota Exhaustion**: Check SES daily sending quota and sending rate per second (`aws ses get-send-quota`).
3. **Blacklisting**: Check whether the sending IP or domain has been flagged on major spam blacklists (Spamhaus, Barracuda).

---

## 6. Mitigation
1. If quota exceeded, request immediate quota increase from AWS Support or switch to secondary SMTP relay.
2. If DNS records dropped, restore authoritative TXT records in Route53 / Cloudflare immediately.
3. Drain dead-letter queue into temporary spool storage until rate limits reset.

---

## 7. Recovery
1. Resume transactional email queue processing with exponential backoff and jitter.
2. Verify delivery rate returns to > 99.5%.
3. Re-enable marketing campaigns at throttled rates.

---

## 8. Validation
1. Dispatch controlled test verification email:
   ```bash
   node scripts/test-email-deliverability.mjs --to ops-test@washora.com
   ```
2. Confirm receipt, inspect email headers for `SPF: PASS`, `DKIM: PASS`, and `DMARC: PASS`.
3. Verify latency from dispatch to mailbox is < 5 seconds.

---

## 9. Escalation
- **Level 1**: Communications On-Call Engineer (Response < 15 mins)
- **Level 2**: Infrastructure Lead & AWS Enterprise Support
