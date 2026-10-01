# WASHORA Production — Pre-Launch Technical Risk Register
**Document ID**: REG-PROD-T12-RISKS-01  
**Classification**: CONFIDENTIAL — PRODUCTION LAUNCH RECORD  
**Release Version**: v1.0.0-prod  
**Execution Timestamp**: 2026-09-21  
**Risk Management Framework**: ISO 27005 / NIST SP 800-30 Evidence-Based Risk Assessment  

---

## 1. TECHNICAL RISK REGISTER

| Risk ID | Risk Description | Probability | Impact | Current Engineering Control | Residual Risk | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **RSK-01** | Upstream SMS / WhatsApp Gateway Latency Spike (Twilio / Gupshup) | Moderate | Low | Asynchronous background BullMQ queue processing with exponential retry backoff (3 attempts). | Transient delay in SMS pickup notifications during regional telco congestion; in-app notification acts as immediate primary fallback. | Infrastructure Lead | **ACCEPTED** |
| **RSK-02** | Payment Aggregator Regional Outage (Stripe / Razorpay) | Low | High | Circuit breaker patterns implemented in T6; fallback payment method prompt presented to customer; automated webhook retry tolerance. | Client must retry payment with alternative payment method (e.g. UPI vs Card) if primary gateway experiences API degradation. | Financial Lead | **ACCEPTED** |
| **RSK-03** | Statutory Financial & GST Record Retention Requirement | Moderate | Low | Anonymization engine scrubs customer PII to `deleted_user_<hash>` upon account erasure while preserving immutable transaction amounts for 8 years per Section 128 Indian Companies Act. | Financial accounting ledger entries cannot be hard-deleted immediately on account closure; legally mandated and mitigated by irreversible hashing. | Legal & Compliance Lead | **ACCEPTED** |
| **RSK-04** | Cloudflare CDN Cache Staleness for Service Catalog Updates | Low | Low | Automated cache invalidation purge hooks triggered on catalog update mutations in CatalogService. | Edge nodes may serve previous service pricing for up to 60 seconds post-mutation prior to global cache purge completion. | Frontend Lead | **ACCEPTED** |
| **RSK-05** | Presigned S3 Document URL Expiration in Slow Mobile Networks | Low | Low | Presigned signed URLs configured with 15-minute expiration; client application prompts user to refresh link if expired. | Partner must refresh screen to re-generate presigned URL if viewing documents on severely throttled cellular connections. | Security Lead | **ACCEPTED** |

---

## 2. RISK ACCEPTANCE DECLARATION

All identified technical risks have been thoroughly evaluated against operational necessity, architectural safeguards, and statutory requirements:
* Zero risks exceed acceptable enterprise operational risk thresholds.
* All residual risks possess automated mitigations, circuit breakers, or procedural runbooks.

**Overall Risk Posture**: **APPROVED FOR PRODUCTION LAUNCH WITH ACCEPTED RISKS**
