# Integration Incident Runbook: Object Storage Outage

## 1. Overview
- **Integration**: Cloud Object Storage (AWS S3 / Cloudflare R2 abstraction)
- **Severity**: P1 (High)
- **Ownership**: Platform Infrastructure Team
- **Affected Workflows**: KYC Document Uploads, Dispute Evidence Files, Laundry Garment Photos, Catalog Imagery

---

## 2. Detection
- **Alert Trigger**: `AlertStorageUploadFailureRate` (> 2% failed uploads) or `AlertStorage5xxErrors`
- **Telemetry Indicators**:
  - `washora_storage_operations_total{op="upload",status="failed"}`
  - HTTP 500 / 503 errors during KYC submission or booking intake photo upload
  - S3 bucket metrics showing elevated client or server error rates

---

## 3. Confirmation
1. Verify AWS S3 or Cloudflare R2 regional status dashboard.
2. Probe bucket read/write access directly via AWS CLI:
   ```bash
   aws s3 cp /tmp/healthcheck.txt s3://washora-production-assets/healthcheck.txt
   aws s3 rm s3://washora-production-assets/healthcheck.txt
   ```
3. Inspect application logs for `AccessDenied`, `SlowDown` (rate limiting), or `NoSuchBucket`.

---

## 4. Containment
1. **Queue Uploads Locally**: Store uploaded temporary image buffers in encrypted local ephemeral cache / Redis with a deferred upload worker.
2. **Read-Only Preservation**: If outage affects writes only, maintain catalog and existing document reads intact.

---

## 5. Diagnosis
1. **IAM Permissions**: Check if IAM role or instance profile attached to the backend pods has lost `s3:PutObject` or `s3:GetObject` permissions.
2. **CORS Configuration**: Check if S3 bucket CORS policy was overwritten, blocking direct-to-S3 presigned client uploads.
3. **Bucket Rate Limits**: Check if partition prefix prefixing (e.g. `kyc/{tenantId}/{hash}/`) is required due to > 3,500 PUT requests/sec per prefix.

---

## 6. Mitigation
1. If IAM policy was drifted or revoked, reapply Terraform / CDK storage module permissions immediately.
2. If bucket CORS was cleared, restore allowed origins:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://app.washora.com", "https://provider.washora.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. If primary S3 region is down, failover to secondary DR replica bucket (configured in T4 Disaster Recovery).

---

## 7. Recovery
1. Re-enable direct-to-storage presigned URL generation.
2. Flush spooled local buffers to the primary bucket using the background sync job.
3. Verify integrity hashes (MD5 / SHA256 ETag) of restored files.

---

## 8. Validation
1. Execute test upload of non-sensitive test image (100 KB PNG).
2. Request presigned download URL and verify accessibility.
3. Verify unauthorized access without token returns HTTP 403 Forbidden.

---

## 9. Escalation
- **Level 1**: Cloud Infrastructure On-Call (Response < 10 mins)
- **Level 2**: Lead DevOps Architect & AWS Technical Account Manager
