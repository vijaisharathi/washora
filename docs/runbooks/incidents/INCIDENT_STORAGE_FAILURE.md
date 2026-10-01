# WASHORA INCIDENT RUNBOOK — STORAGE FAILURE
**Document ID**: `RUNBOOK-INC-006`  
**Severity**: `P2_MEDIUM`  
**Authoritative Owner**: Platform Engineer / Storage Administrator  

---

## 1. Detection
- Document upload API returns 500 or 503 errors for provider KYC or dispute images.
- File retrieval requests result in 404 or access denied errors.
- S3 / cloud storage health probe reports degraded status.

## 2. Confirmation
- Test direct upload/download via StorageBackupService or AWS CLI: `aws s3 ls s3://washora-secure-vault`.
- Check cloud provider service health dashboard (AWS S3 / Cloudflare R2).

## 3. Immediate Containment
- Provide fallback temporary storage directory on local persistent volume.
- Queue upload tasks in database for asynchronous sync once object store recovers.

## 4. Diagnosis
- Inspect IAM role permissions and bucket policy changes.
- Check storage quota usage and egress rate limits.

## 5. Mitigation
- Rotate and restore expired cloud storage IAM credentials.
- Revert unauthorized bucket policy modifications.

## 6. Recovery
- Synchronize queued local temporary files to the authoritative object store.
- Verify SHA-256 checksums on all synchronized assets.

## 7. Validation
- Verify provider KYC document viewing from Operations portal.
- Verify dispute evidence image rendering from Customer and Admin portals.

## 8. Communication
- Notify Provider Onboarding and Support teams.

## 9. Post-Incident Review (RCA)
- Implement multi-region bucket replication and automated credential expiration alarms.
