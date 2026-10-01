# Standard Operating Procedure: Privacy Incident & Data Breach Response
**Document ID**: SOP-SEC-PRIV-01  
**Classification**: CONFIDENTIAL — INTERNAL OPERATIONAL USE  
**Scope**: WASHORA Production Platform (API, Database, S3 Object Storage, Third Parties)  
**Standard Alignment**: India Digital Personal Data Protection Act (DPDPA 2023), GDPR Articles 33/34, CERT-In Cyber Security Directions, PCI-DSS Incident Handling  

---

## 1. PURPOSE & OBJECTIVES

This runbook defines the mandatory, end-to-end technical and operational procedure for managing, containing, investigating, and remediating suspected or confirmed privacy incidents and personal data breaches within the WASHORA multi-tenant marketplace platform.

Objectives:
1. Immediately contain exposure of personal or financial data.
2. Prevent further unauthorized access or exfiltration.
3. Preserve forensically sound audit trails and evidence.
4. Accurately identify affected data categories, tenants (`organization_id`), and data subjects (Customers, Providers, Delivery Partners).
5. Triage severity (P0 to P3) and determine statutory notification requirements under legal guidance.
6. Execute comprehensive technical remediation and publish a post-incident Root Cause Analysis (RCA).

---

## 2. 10-STEP INCIDENT RESPONSE WORKFLOW

```text
1. DETECT
   ↓
2. CONTAIN
   ↓
3. PRESERVE EVIDENCE
   ↓
4. ASSESS DATA
   ↓
5. IDENTIFY AFFECTED USERS
   ↓
6. DETERMINE SEVERITY
   ↓
7. LEGAL & COMPLIANCE REVIEW
   ↓
8. REQUIRED NOTIFICATION
   ↓
9. REMEDIATION
   ↓
10. POST-INCIDENT REVIEW
```

---

## 3. DETAILED ACTION PHASES

### STEP 1: DETECT
* **Sources of Alert**:
  - T5 Automated Anomaly Detection: Spikes in 401/403 errors, unexpected database query volume, unauthorized S3 bucket access attempts.
  - Security Monitoring: Failed JWT authentication floods, abnormal cross-tenant query patterns.
  - External Reports: Security researcher submission via security disclosure program, payment aggregator anomaly notification, or user support ticket.
* **Immediate Action**:
  - Security Lead assigns incident commander and creates a private, isolated incident Slack/Bridge channel (`#incident-priv-YYYYMMDD-xx`).
  - Set incident timer clock to $T_0$.

---

### STEP 2: CONTAIN
* **Technical Containment Options**:
  - **Account Level**: If specific compromised user or provider accounts are identified:
    ```bash
    # Revoke active sessions immediately
    UPDATE sessions SET expires_at = NOW() WHERE user_id = :compromised_user_id;
    ```
  - **Credential Rotation**: Rotate affected API keys, database credentials, or third-party service tokens immediately.
  - **Network Isolation**: If an API endpoint or microservice exhibits an IDOR or BOLA leak:
    - Route traffic away via WAF/Cloudflare rule or temporarily return `503 Service Unavailable` on the vulnerable route.
  - **Storage Bucket Isolation**: If an S3 bucket or presigned URL generator is compromised:
    - Revoke IAM credentials generating signed URLs; verify S3 Public Access Block is strictly enabled (`IgnorePublicAcls=true`, `RestrictPublicBuckets=true`).

---

### STEP 3: PRESERVE EVIDENCE
* **DO NOT** delete logs, restart containers without capturing memory dumps, or overwrite database tables.
* **Evidence Collection Checklist**:
  1. Capture current PostgreSQL WAL / transaction logs.
  2. Export application logs from T5 logging pipeline (Elasticsearch/Datadog/CloudWatch) covering $T_0 - 24\text{h}$ to $T_0$.
  3. Export Nginx / Cloudflare access logs with client IP, Request ID, User-Agent, and HTTP path.
  4. Compute SHA-256 checksums on all exported log archives to preserve chain of custody.

---

### STEP 4: ASSESS DATA EXPOSED
* Classify compromised data fields using the **WASHORA 5-Tier Data Classification**:
  - **Tier 1 — PUBLIC**: Service descriptions, prices, public review comments. *(Low privacy risk)*
  - **Tier 2 — INTERNAL**: Roles, permissions, system configuration. *(Operational risk)*
  - **Tier 3 — CONFIDENTIAL**: Order items, booking schedules, provider earnings. *(Medium privacy risk)*
  - **Tier 4 — SENSITIVE PERSONAL DATA**: Customer names, emails, phone numbers, physical pickup/dropoff addresses. *(High privacy risk)*
  - **Tier 5 — HIGH-RISK / RESTRICTED**: Password hashes, JWT tokens, Aadhaar/PAN KYC documents, dispute evidence photos, payment gateway credentials. *(Critical privacy risk)*

---

### STEP 5: IDENTIFY IMPACTED USERS & TENANTS
* Run scoped read-only SQL queries on the isolated forensic replica:
  ```sql
  -- Identify distinct users accessed by anomalous actor IP or compromised token
  SELECT DISTINCT actor_user_id, organization_id, resource, action, created_at
  FROM audit_events
  WHERE request_id IN (:anomalous_request_ids)
     OR ip_address = :actor_ip;
  ```
* Catalog total count of unique:
  - Customers affected
  - Providers affected
  - Delivery Partners affected
  - Organizations (`organization_id`) impacted

---

### STEP 6: DETERMINE SEVERITY LEVEL

| Severity | Definition | Threshold Criteria | Escalation Target |
| :--- | :--- | :--- | :--- |
| **P0 — CRITICAL** | Catastrophic privacy event or active credential/KYC breach | • High-risk credentials leaked<br>• > 1,000 users' sensitive PII exposed<br>• Direct database dump exfiltrated | CEO, CTO, Legal Counsel, DPO (Immediate / 15 min) |
| **P1 — HIGH** | Significant unauthorized personal data disclosure | • Sensitive personal data (addresses/phones) leaked<br>• 100 to 1,000 users affected<br>• Cross-tenant data isolation leak | Engineering Leads, Security Team, Legal (Within 1 hour) |
| **P2 — MEDIUM** | Limited data exposure with minimal harm potential | • < 100 users affected<br>• Confidential operational data without direct PII<br>• Quickly contained IDOR | System Owners, Support Leads (Within 4 hours) |
| **P3 — LOW** | Minor anomaly or non-sensitive internal metadata | • Internal identifiers or public data exposed<br>• Zero customer PII or credentials | Standard triage backlog (Within 24 hours) |

---

### STEP 7: LEGAL & COMPLIANCE REVIEW
* **Mandatory Action**:
  - Do NOT make legal conclusions without legal counsel.
  - Convene WASHORA Legal Counsel and designated Data Protection Officer (DPO).
  - Review applicable territorial regulations based on deployment jurisdiction:
    - **India**: Digital Personal Data Protection Act (DPDPA 2023) & CERT-In Cyber Security Directions (6-hour cybersecurity incident reporting rule for specific incident classes).
    - **European Union**: General Data Protection Regulation (GDPR Art. 33 - 72-hour supervisory authority notification).
    - **United States / California**: CCPA / CPRA statutory guidelines.
  - Flag all decisions requiring formal legal determination with `REQUIRES LEGAL/COMPLIANCE REVIEW`.

---

### STEP 8: STATUTORY & USER NOTIFICATION (UNDER LEGAL GUIDANCE)
* If formal notification is legally required:
  - **Regulatory Notification**: Prepared and submitted by Legal Counsel to relevant authorities (e.g. CERT-In / Data Protection Board).
  - **User Notification**:
    - Transparent, plain-language communication via registered email and in-app banner.
    - Specifies: What occurred, what data categories were involved, protective measures implemented by WASHORA, and recommended user actions (e.g., password reset, 2FA enablement).
    - Dedicated support helpline/inbox established: `privacy-support@washora.internal`.

---

### STEP 9: TECHNICAL REMEDIATION
* Develop, test, and deploy permanent fix:
  - Patch vulnerability in code repository.
  - Add regression test cases in `test_t10_privacy_governance_master.mjs`.
  - Validate multi-tenant isolation and IDOR guards across all environments.
  - Re-verify sanitization and masking filters in `LogTraceSanitizerEngine`.

---

### STEP 10: POST-INCIDENT REVIEW (RCA)
* Within 5 business days of incident closure:
  - Complete formal Root Cause Analysis (RCA) document:
    - Timeline of events ($T_{\text{detect}}$, $T_{\text{contain}}$, $T_{\text{resolve}}$)
    - Root cause analysis (Why did the boundary fail?)
    - Technical corrective actions and preventive engineering controls
    - Updated documentation and policy improvements
  - Present findings to Executive Leadership and Security Committee.
