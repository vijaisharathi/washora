# Integration Incident Runbook: DNS Resolution Failure

## 1. Overview
- **Integration**: Domain Name System (AWS Route53 / Cloudflare DNS)
- **Severity**: P0 (Critical - Platform Inaccessible)
- **Ownership**: Network & Cloud Infrastructure Team
- **Affected Workflows**: All Web/Mobile Traffic, Inbound Webhooks, Outbound API Integrations

---

## 2. Detection
- **Alert Trigger**: `AlertDnsResolutionFailure` (Synthetic edge ping failure across > 3 regions)
- **Telemetry Indicators**:
  - Global synthetic monitoring probes reporting `NXDOMAIN`, `SERVFAIL`, or `ETIMEDOUT` for `washora.com` / `api.washora.com`
  - Inbound traffic dropping to zero abruptly across all load balancers

---

## 3. Confirmation
1. Test DNS resolution from multiple external recursive resolvers:
   ```bash
   dig @8.8.8.8 api.washora.com +trace
   dig @1.1.1.1 api.washora.com +trace
   ```
2. Verify authoritative nameserver delegation at domain registrar (e.g. ICANN WHOIS records).

---

## 4. Containment
1. Check if registrar domain renewal lapsed or credit card expired.
2. If primary DNS provider (e.g. Route53) is experiencing a global outage, switch NS records at registrar to secondary DNS provider (e.g. Cloudflare).

---

## 5. Diagnosis
1. Check Route53 / Cloudflare audit logs for accidental record deletion or zone file corruption.
2. Check DNSSEC validation: expired RRSIG records cause modern resolvers to return `SERVFAIL`.
3. Check DDoS attack mitigation status on Cloudflare.

---

## 6. Mitigation
1. If DNSSEC signature expired, disable DNSSEC temporarily at registrar to restore immediate resolution.
2. If records were accidentally altered, restore zone file from git-managed Terraform repository:
   ```bash
   cd terraform/dns && terraform apply -auto-approve
   ```
3. Set TTL to 300 seconds during incident resolution to accelerate propagation.

---

## 7. Recovery
1. Verify authoritative nameservers return valid `A` and `CNAME` records globally.
2. Monitor propagation using global DNS checker tools.

---

## 8. Validation
1. Execute DNS verification script:
   ```bash
   node scripts/verify-dns-records.mjs --domains washora.com api.washora.com
   ```
2. Confirm HTTP 200 responses from all regional ingress endpoints.

---

## 9. Escalation
- **Level 1**: Lead Network Infrastructure Engineer (Response < 5 mins)
- **Level 2**: VP of Engineering & Domain Registrar Priority Support
