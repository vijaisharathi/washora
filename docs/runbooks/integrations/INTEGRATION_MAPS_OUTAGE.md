# Integration Incident Runbook: Maps & Location Services Outage

## 1. Overview
- **Integration**: Maps & Geolocation (Google Maps Platform / OpenStreetMap abstraction)
- **Severity**: P2 (Medium)
- **Ownership**: Platform Operations & Logistics Engineering
- **Affected Workflows**: Address Autocomplete, Geocoding, Provider Service-Area Verification, Valet Route Estimation

---

## 2. Detection
- **Alert Trigger**: `AlertMapsApiQuotaHigh` (> 90% daily quota) or `AlertGeocodingLatencyHigh` (> 1000ms p95)
- **Telemetry Indicators**:
  - `washora_maps_requests_total{status="failed"}` rising
  - Error responses logged: `OVER_QUERY_LIMIT`, `REQUEST_DENIED`, `INVALID_REQUEST`
  - Address verification fallback triggers in checkout workflow

---

## 3. Confirmation
1. Check Google Cloud Status Dashboard (Maps API status).
2. Test geocoding endpoint via curl with API key:
   ```bash
   curl "https://maps.googleapis.com/maps/api/geocode/json?address=Mumbai&key=${MAPS_API_KEY}"
   ```
3. Check Google Cloud Console for quota status and billing account validity.

---

## 4. Containment
1. **Enable Haversine Fallback**: Switch distance and service-area calculations to internal Haversine straight-line calculation with 1.3x urban distance factor.
2. **Postal Code Resolution**: For addresses where geocoding fails, fallback to postal code centroid lookup from local database table.

---

## 5. Diagnosis
1. Verify if daily API quota was exceeded or rate limiting (QPS limit) was hit due to an unexpected traffic surge.
2. Verify API key restrictions (HTTP referrers or IP restrictions) were not accidentally modified to block backend servers.
3. Check for billing account suspension or credit card expiration in Google Cloud.

---

## 6. Mitigation
1. If quota reached, request quota uplift in GCP console or failover to secondary OpenStreetMap / Nominatim provider.
2. If API key restricted, update IP whitelist in Google Cloud Console.
3. Cache frequent geocoding results in Redis (TTL: 30 days) to reduce external API queries by up to 70%.

---

## 7. Recovery
1. Verify Maps API queries return HTTP 200 OK with valid coordinates.
2. Transition logistics services from Haversine fallback back to full Maps routing.

---

## 8. Validation
1. Execute test geocode for test address:
   ```bash
   node scripts/test-maps-integration.mjs --address "Bandra West, Mumbai"
   ```
2. Verify coordinates are returned within acceptable bounds (lat ~19.05, lon ~72.83).
3. Verify public logs contain only redacted 2-decimal coordinates for privacy protection.

---

## 9. Escalation
- **Level 1**: Backend Logistics Engineer (Response < 30 mins)
- **Level 2**: Lead Systems Architect
