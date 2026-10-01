# Integration Incident Runbook: SSL / TLS Certificate Failure

## 1. Overview
- **Integration**: HTTPS / TLS Certificates (AWS ACM / Let's Encrypt / Certbot)
- **Severity**: P0 (Critical - Security Interstitial Displayed to Users)
- **Ownership**: Security & Cloud Infrastructure Team
- **Affected Workflows**: All Client Browser Sessions, Mobile App HTTPS Connections, Inbound Webhooks

---

## 2. Detection
- **Alert Trigger**: `AlertSslCertExpiringSoon` (< 14 days) or `AlertSslHandshakeFailureRateHigh` (> 1%)
- **Telemetry Indicators**:
  - Browser security interstitial (`ERR_CERT_COMMON_NAME_INVALID` or `ERR_CERT_DATE_INVALID`)
  - Webhook delivery failures from payment providers with `SSL_ERROR_EXPIRED_CERT`
  - CloudWatch / Load Balancer 4xx/5xx SSL negotiation error spikes

---

## 3. Confirmation
1. Verify certificate validity, expiry date, and SAN (Subject Alternative Names) using OpenSSL:
   ```bash
   openssl s_client -connect api.washora.com:443 -servername api.washora.com -showcerts </dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer
   ```
2. Check automated renewal bot status (Certbot, AWS ACM renewal validation).

---

## 4. Containment
1. If certificate has expired, issue an emergency replacement certificate via AWS ACM or Cloudflare Universal SSL immediately (takes < 5 minutes).
2. Attach valid fallback wildcard certificate (`*.washora.com`) to ingress load balancer.

---

## 5. Diagnosis
1. Check why automated renewal failed:
   - ACME HTTP-01 challenge blocked by reverse proxy routing or firewall rule.
   - ACME DNS-01 challenge failed due to IAM permission revocation in DNS provider.
   - Certificate issuer rate limits exceeded.

---

## 6. Mitigation
1. For ACM: Verify DNS validation CNAME records exist in Route53 / Cloudflare.
2. For Let's Encrypt / Certbot: Trigger manual renewal with DNS challenge:
   ```bash
   certbot renew --force-renewal --preferred-challenges dns
   ```
3. Reload ingress / Nginx proxy configuration to load renewed certificate without dropping active TCP connections:
   ```bash
   nginx -s reload
   ```

---

## 7. Recovery
1. Verify all ingress endpoints serve the newly issued certificate with > 60 days validity.
2. Ensure intermediate CA bundle is properly chained to avoid mobile client untrusted root errors.

---

## 8. Validation
1. Verify TLS handshake across supported versions:
   ```bash
   openssl s_client -tls1_3 -connect api.washora.com:443 </dev/null
   openssl s_client -tls1_2 -connect api.washora.com:443 </dev/null
   ```
2. Confirm SSL Labs grade A+ rating (TLS 1.2 / 1.3 only, HSTS enabled, valid chain).

---

## 9. Escalation
- **Level 1**: Security & Cloud Engineer (Response < 10 mins)
- **Level 2**: Lead Security Architect & VP of Infrastructure
