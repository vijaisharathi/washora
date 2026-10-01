# Integration Incident Runbook: Push Notification Provider Outage

## 1. Overview
- **Integration**: Push Notifications (Firebase Cloud Messaging / Apple APNs)
- **Severity**: P2 (Medium)
- **Ownership**: Mobile Platform & Frontend Engineering
- **Affected Workflows**: Valet Live Tracking, Order Status Popups, Provider Pickup Alerts

---

## 2. Detection
- **Alert Trigger**: `AlertPushDispatchErrorRateHigh` (> 5% failed push attempts)
- **Telemetry Indicators**:
  - `washora_notifications_dispatched_total{channel="PUSH",status="failed"}`
  - High volume of `UNREGISTERED`, `BAD_DEVICE_TOKEN`, or `UNAUTHENTICATED` errors

---

## 3. Confirmation
1. Check Google Firebase Status Dashboard and Apple Developer System Status.
2. Review FCM error logs:
   ```bash
   grep "FCM_ERROR" /var/log/washora/api.log | tail -n 50
   ```
3. Verify FCM service account credentials expiration.

---

## 4. Containment
1. **Fallback to In-App Websockets**: Ensure in-app real-time banners and notifications continue updating via WebSocket gateway.
2. **Invalid Token Cleanup**: Automatically unbind device tokens that return `UNREGISTERED` or `NOT_FOUND` to prevent repetitive failed calls.

---

## 5. Diagnosis
1. Check for expired Apple APNs Push Certificate or revoked Firebase service account key.
2. Verify if client app released a buggy build with corrupted device token registration logic.
3. Check payload size: ensure APNs payload is strictly < 4096 bytes.

---

## 6. Mitigation
1. If credentials expired, upload refreshed service account JSON or renewal cert to secrets manager.
2. Restart notification worker pods to pick up refreshed certificates.
3. If specific device tokens are malformed, filter them in pre-dispatch validation.

---

## 7. Recovery
1. Re-enable push dispatch queue with bounded rate (e.g. 500 notifications/sec).
2. Monitor device delivery receipt metrics.

---

## 8. Validation
1. Send test push notification to diagnostic mobile device.
2. Verify receipt on both iOS and Android platforms within 3 seconds.
3. Confirm clean unregistration of deactivated test tokens.

---

## 9. Escalation
- **Level 1**: Mobile/Backend On-Call Engineer (Response < 30 mins)
- **Level 2**: Lead Frontend/Mobile Architect
