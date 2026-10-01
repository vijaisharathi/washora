# WASHORA INCIDENT RUNBOOK — SECURITY INCIDENT
**Document ID**: `RUNBOOK-INC-011`  
**Severity**: `P0_CRITICAL` / `P1_HIGH`  
**Authoritative Owner**: Security Owner / Platform Engineer  

---

## 1. Detection
- Sudden surge in login failures (>50 in 15 minutes) or brute-force attack detected.
- Unauthorized cross-tenant data access attempts (IDOR) or permission bypasses logged.
- Webhook signature verification failures from untrusted IP addresses.

## 2. Confirmation
- Query `SecurityMonitorEngine.getSecuritySummary()`.
- Inspect WAF logs and Cloudflare threat score distributions.

## 3. Immediate Containment
- Block offending IP addresses or CIDR blocks at Cloudflare WAF / AWS WAF.
- Revoke compromised API keys or user session tokens immediately.
- Enforce mandatory CAPTCHA on login and registration endpoints.

## 4. Diagnosis
- Identify compromised user accounts or leaked credentials.
- Verify if any unauthorized data exfiltration occurred via audit logs (`AuditLog` table).

## 5. Mitigation
- Force password resets for targeted accounts.
- Rotate compromised JWT secret or webhook HMAC secrets if compromised.

## 6. Recovery
- Ensure unauthorized access vectors are patched and verified with automated security tests.
- Re-enable standard authentication flow.

## 7. Validation
- Run T1 security audit master suite: `npm run t1:test`.
- Confirm 100% security tests pass.

## 8. Communication
- Notify Legal, Executive Leadership, and affected users in compliance with data privacy regulations.

## 9. Post-Incident Review (RCA)
- Conduct forensic post-mortem and publish security advisory.
