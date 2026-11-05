# AEGIS GRC - Load & Stress Testing (k6)

This directory contains diagnostic load test scripts built with [k6](https://k6.io/) to benchmark AEGIS GRC and pinpoint root causes of failed requests (e.g., the 36.6% failure rate observed during 100-VU tests).

---

## 🔍 Why Requests Fail Under 100-User Load

When testing the AEGIS GRC web application with 100 concurrent virtual users, requests typically fail for three primary architectural reasons:

1. **Netlify Edge Rate Limiting (`HTTP 429 Too Many Requests`)**:
   - Netlify's free/team tiers apply edge rate-limiting and burst protection when hundreds of requests arrive per second from a single IP address without pacing.
   - The test script logs `X-Nf-Request-Id` and `Retry-After` headers to verify if Netlify edge DDoS protection was triggered.

2. **SPA Deep-Link Routing (`HTTP 404 Not Found`)**:
   - Direct requests to routes like `/frameworks`, `/risks`, `/tasks` will 404 if the hosting provider doesn't rewrite routes to `/index.html`.
   - AEGIS GRC includes `public/_redirects` (`/* /index.html 200`), but custom headers or asset hashing mismatches can still produce 404s.

3. **Supabase Database Connection Exhaustion (`HTTP 503 / 500 / 429`)**:
   - Supabase Free / Pro tiers have connection limits on direct PostgreSQL connections (typically 60 connections max).
   - 100 concurrent users hitting non-cached endpoints directly without Supavisor connection pooling will exhaust the database connection pool, resulting in `503 Service Unavailable` or `500 Internal Server Error`.
   - Supabase Auth endpoints have built-in rate limits (~30 requests per minute per IP), returning `429` on mass login/signup attempts.

---

## 📁 Test Scripts

| Script | Purpose | Target |
|---|---|---|
| [`frontend-load-test.js`](file:///home/parrot/aegis-grc-web/load-tests/frontend-load-test.js) | Tests static asset delivery, SPA routing, and Netlify edge limits. Measures HTTP status distribution (200, 3xx, 404, 429, 5xx). | Netlify / Frontend URL |
| [`supabase-load-test.js`](file:///home/parrot/aegis-grc-web/load-tests/supabase-load-test.js) | Tests PostgREST queries (`frameworks`, `controls`, `assessments`, `risks`) and Auth health. Evaluates database connection pooling and RLS throughput. | Supabase Backend API |

---

## 🚀 Running Locally with k6

### 1. Install k6
```bash
# Debian / Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### 2. Run Frontend Test
```bash
k6 run \
  -e TARGET_URL="https://aegis-grc.netlify.app" \
  -e VUS=50 \
  -e DURATION="30s" \
  load-tests/frontend-load-test.js
```

### 3. Run Supabase Backend Test
```bash
k6 run \
  -e SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
  -e SUPABASE_ANON_KEY="YOUR_ANON_KEY" \
  -e VUS=30 \
  -e DURATION="30s" \
  load-tests/supabase-load-test.js
```

---

## ⚡ Running via GitHub Actions

1. Go to your repository on GitHub: `https://github.com/AMALRAJ-HACKER/AEGIS-GRC/actions`
2. Select **"AEGIS GRC - k6 Load & Diagnostics"**.
3. Click **"Run workflow"**.
4. Configure options:
   - **Test Target:** `frontend`, `supabase`, or `both`
   - **Frontend URL:** Your deployed URL
   - **VUs:** Virtual users (e.g., 25, 50, 100)
   - **Duration:** Duration (e.g., 30s, 1m)
5. Review the execution summary directly in the **GitHub Step Summary** table!
