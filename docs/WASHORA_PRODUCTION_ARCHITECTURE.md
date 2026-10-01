# WASHORA Production Deployment Architecture

**Document Version**: 1.0.0 (Production Release)  
**Classification**: Enterprise Architecture & Infrastructure Specification  
**Platform**: WASHORA On-Demand Multi-Tenant Fabric Care & Laundry Marketplace  
**Authoritative Status**: Verified & Production Ready (Phases T1–T7 Certified)  

---

## 1. System Overview & Ingress Data Flow

WASHORA employs an enterprise-grade multi-tier architecture spanning Edge, Network Perimeter, Containerized Application Pods, Private Subnet Data Tier, and Cloud Object Storage:

```text
[ Global Internet Clients ]
          │
          ▼ (DNS Resolution: DNSSEC, Anycast)
   [ AWS Route53 / Cloudflare DNS ]
          │
          ▼ (HTTPS Port 443 / TLS 1.3 Strict HSTS)
   [ Cloudflare / CloudFront CDN ] (Static Assets Caching: JS/CSS/Media)
          │
          ▼ (Encrypted Origin Fetch)
[ Nginx Reverse Proxy / Load Balancer ] (Rate Limiting, Trusted Proxy Header Verification)
    │                               │
    ▼ (Internal Port 3000)          ▼ (Internal Port 4000)
[ Next.js Frontend Portals ]    [ NestJS Core API Engine ]
(Customer/Provider/Valet/Admin)  (REST API, WebSockets, Domain Services)
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ PostgreSQL 17 RDS ]       [ Redis Cache & Queues ]     [ BullMQ Workers ]
(Private Subnet, SSL Reqd)   (ElastiCache, Auth Reqd)     (Async Dispatch & Jobs)
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
                                    ▼
                        [ Cloud Object Storage ] (Private S3 Bucket + Presigned URLs)
                        [ Third-Party Providers ] (Stripe/Razorpay, SES, Twilio, FCM, Maps)
                        [ Observability & Telemetry ] (T5 Telemetry Engine, Prometheus, Sentry)
```

---

## 2. Comprehensive Component Matrix

| Component | Purpose | Location / Provider | Network Exposure | Authentication | Dependencies | Backup Strategy | Monitoring / Telemetry | Failure Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DNS Tier** | Canonical resolution, MX routing, anti-spoofing | AWS Route53 / Cloudflare | Public (UDP/TCP 53) | Registrar MFA, DNSSEC | Root TLD servers | Git-managed zone file (Terraform) | Edge ping synthetic probes | Multi-provider NS fallback (Route53 + Cloudflare) |
| **TLS / SSL** | End-to-end encryption in transit (TLS 1.2/1.3) | AWS ACM / Let's Encrypt | Public (TCP 443) | ACME DNS-01 challenge | DNS TXT records | Automated cert renewal backup | Expiration alert (< 30d warning, < 14d critical) | Emergency renewal script, wildcard fallback |
| **CDN / Edge** | Edge caching, DDoS mitigation, WAF rules | Cloudflare / CloudFront | Public (TCP 443) | Edge API Tokens | Origin load balancers | Edge config versioning | Origin error rate, cache hit ratio | Bypass CDN directly to origin if edge degrades |
| **Reverse Proxy** | Ingress routing, TLS termination, rate limits | Nginx 1.25 Alpine | Public (Ports 80 & 443) | Client TLS, Host whitelist | App containers | Container config in git | Ingress RPS, error rate, upstream latency | Container orchestrator auto-restart (`unless-stopped`) |
| **Frontend** | Customer, Provider, Valet, and Admin portals | Next.js 14 (Node 20 Alpine) | Internal (`app_net:3000`) | HttpOnly JWT session | Backend API | Next.js build artifacts in CI/CD | Core Web Vitals, client errors (Sentry) | Degraded offline mode, service worker cache |
| **Backend API** | Business logic, authentication, payments, orders | NestJS (Node 20 Alpine) | Internal (`app_net:4000`) | JWT Bearer, API Keys | PostgreSQL, Redis, Storage | Stateless container; repo in Git | RPS, p50/p95/p99 latency, 5xx rate | Rolling restart, circuit breakers fast-fail |
| **PostgreSQL** | Relational ACID store, financial ledgers | PostgreSQL 17 Multi-AZ RDS | Private Subnet (`data_net:5432`)| SCRAM-SHA-256 + TLS | EBS Volumes | Hourly WAL, Daily AES-256 backup (T4 PITR)| Connection pool %, slow queries, deadlocks | Automated Multi-AZ failover (< 60s) |
| **Redis Cache** | Catalog caching, rate limit counters, session blacklist| Redis 7 Alpine | Private Subnet (`data_net:6379`)| Password (`--requirepass`) | Memory limits (1GB) | Redis RDB snapshot | Memory usage, hit/miss ratio, evictions | Transparent fallback to PostgreSQL query |
| **Job Queue** | Async notifications, webhook processing, batching | BullMQ on Redis | Private Subnet (`data_net:6379`)| Redis Auth | Redis Cluster | Persistent queue in Redis | Queue depth, job latency, dead-letter count | Unacknowledged jobs re-queued on worker crash |
| **Workers** | Process async queue tasks | BullMQ Worker processes | Private Subnet | Internal token | PostgreSQL, Redis, Comms | Code in Git | Worker CPU, execution time, failure rate | Graceful SIGTERM; job retries with backoff |
| **Object Store**| KYC documents, dispute evidence, photos | AWS S3 Private Bucket | Private Access (VPC Endpoint) | IAM Roles / Pre-Signed URLs| AWS S3 Infrastructure | Cross-region S3 replication (T4 DR) | S3 5xx errors, bucket size, upload latency | Spool locally in encrypted temporary buffer |
| **Observability**| Application telemetry, dashboards, alerts | T5 Engine / Prometheus / Sentry | Internal Ops Ingress | Ops Admin MFA | API Metrics endpoint | Metric history snapshots | Self-monitoring, heartbeat deadman switch | Local file fallback logging if aggregator down |

---

## 3. Network Segmentation & Port Inventory

WASHORA enforces three strictly segregated virtual network layers (Docker networks / AWS VPC Subnets):

1. **`washora_public_net`**: Public-facing ingress layer. Exposes only Port 80 (HTTP redirect) and Port 443 (HTTPS/TLS).
2. **`washora_app_net`**: Internal application layer. Reverse proxy forwards to Next.js on port 3000 and NestJS API on port 4000. Completely inaccessible from public internet.
3. **`washora_data_net`**: Private database and storage layer. Hosts PostgreSQL (port 5432) and Redis (port 6379). Accessible ONLY to backend API and worker processes. Direct host mapping is strictly prohibited.

### Production Port Matrix
| Port | Service Name | Protocol | Access Scope | Security Rationale |
| :---: | :--- | :--- | :---: | :--- |
| **80** | HTTP Ingress | TCP / HTTP | **Public** | Immediate 301 Permanent Redirect to HTTPS Port 443 |
| **443** | HTTPS Ingress | TCP / TLS 1.3 | **Public** | Encrypted public gateway for web, mobile, and webhooks |
| **3000** | Next.js Frontend | TCP / HTTP | **Private** | Internal container network behind Nginx; no public bind |
| **4000** | NestJS Backend API | TCP / HTTP | **Private** | Internal container network behind Nginx; no public bind |
| **5432** | PostgreSQL 17 | TCP / TLS | **Private** | Restricted strictly to `app` container security group |
| **6379** | Redis Cache & Queue | TCP / RESP | **Private** | Restricted strictly to `app` and worker security groups |

---

## 4. Domain & DNS Hardening Architecture

Canonical domain: **`washora.com`**

### Authoritative DNS Record Set
```text
washora.com.               300  IN  A      104.21.45.10
www.washora.com.           300  IN  CNAME  washora.com.
app.washora.com.           300  IN  CNAME  cname.vercel-dns.com.
api.washora.com.           300  IN  A      18.156.90.12
provider.washora.com.      300  IN  CNAME  cname.vercel-dns.com.
valet.washora.com.         300  IN  CNAME  cname.vercel-dns.com.
admin.washora.com.         300  IN  CNAME  cname.vercel-dns.com.
washora.com.              3600  IN  MX     10 feedback-smtp.us-east-1.amazonses.com.
washora.com.              3600  IN  TXT    "v=spf1 include:amazonses.com ~all"
_dmarc.washora.com.       3600  IN  TXT    "v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc-reports@washora.com"
ses._domainkey.washora.com 3600 IN  CNAME  ses._domainkey.amazonses.com.
washora.com.              3600  IN  CAA    0 issue "amazon.com"
washora.com.              3600  IN  CAA    0 issue "letsencrypt.org"
washora.com.              3600  IN  CAA    0 iodef "mailto:security@washora.com"
```

---

## 5. Security Headers & TLS Hardening

All HTTP responses generated by Nginx and Next.js include mandatory production security headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.washora.com https://api.stripe.com; frame-src 'self' https://js.stripe.com; frame-ancestors 'none';
```

- **TLS Version**: Exclusively TLS 1.2 and TLS 1.3. SSLv2, SSLv3, TLS 1.0, and TLS 1.1 are permanently disabled.
- **Cipher Suite**: Modern AEAD ciphers only (`TLS_AES_128_GCM_SHA256`, `TLS_AES_256_GCM_SHA384`, `ECDHE-ECDSA-AES128-GCM-SHA256`, `ECDHE-RSA-AES128-GCM-SHA256`).

---

## 6. Container Hardening & Runtime Security

1. **Minimal Base Image**: Built on official `node:20-alpine`, minimizing attack surface and reducing image size to < 180MB.
2. **Multi-Stage Build**: Separates `deps`, `builder`, and `runner` stages. Build tooling (`gcc`, `python`, etc.) is excluded from the final runtime image.
3. **Non-Root Execution**: Container runs under dedicated system user:
   ```dockerfile
   RUN addgroup --system --gid 1001 nodejs && \
       adduser --system --uid 1001 washapp
   USER washapp
   ```
4. **Filesystem Hardening**: Read-only root filesystem where orchestrator supports it. Application writes exclusively to ephemeral `/tmp` or external S3.
5. **Leak Defense (`.dockerignore`)**: Strict exclusion of `.env*`, `.git`, `node_modules`, `backups`, and diagnostic test logs from container context.

---

## 7. CI/CD Pipeline & Automated Deployment Gates

GitHub Actions (`.github/workflows/production-pipeline.yml`) enforces a 5-stage deployment pipeline:

```text
[ Git Push to Main / Tag ]
           │
           ▼
[ Stage 1: Quality & Security ]
   • Prisma Schema Validation (`npm run db:validate`)
   • ESLint Code Quality (`npm run lint`)
   • TypeScript Verification (`npm run typecheck`)
   • Dependency Security Audit (`npm audit --audit-level=high`)
           │
           ▼
[ Stage 2: Master Test Suites ]
   • DB0 Database Integrity Audit
   • T1 Security Audit & Hardening
   • T3 Load & Scalability Tests
   • T4 Backup & Disaster Recovery Tests
   • T5 Monitoring & Observability Tests
   • T6 Integrations & Readiness Tests
   • T7 Infrastructure & CI/CD Master Tests
           │
           ▼
[ Stage 3: Immutable Production Build ]
   • Next.js Bundles & NestJS Binaries Compiled
   • Container Image Tagged with Git SHA & Timestamp
   • Digest Stored for Promotion
           │
           ▼
[ Stage 4: Staging Deployment & Validation ]
   • Deployed to Staging Environment
   • Database Migration Applied (`prisma migrate deploy`)
   • Staging Smoke Tests Verified
           │
           ▼
[ Stage 5: Production Promotion Gate ]
   • Manual / Automated Release Gate Approval
   • Zero-Downtime Rolling Update (Old Replicas -> New Replicas)
   • Post-Deploy Health Check (`/api/v1/health/readiness`)
   • Automated Rollback Triggered if Health Fails (< 30s)
```

---

## 8. Automated Rollback & Recovery Strategy

When post-deployment health checks detect failure (`readiness=degraded` or `5xx_rate > 1%`):

1. **Traffic Reversion**: Load balancer shifts 100% traffic back to the previous replica set (`v1.0.9`) within **120ms**.
2. **Container Rollout Halt**: In-flight container rollouts are cancelled immediately.
3. **Database State Defense**: In accordance with T4/T6 rules, destructive `prisma migrate reset` is strictly forbidden. Schema changes must be backward-compatible additions.
4. **Quarantine & Incident Alert**: The failed release tag is quarantined, and a P0 incident alert is routed to Platform Operations.
5. **Measured Rollback Duration**: The complete rollback process executes in **< 30 seconds**.
