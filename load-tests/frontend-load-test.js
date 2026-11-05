import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ========================================================================
// AEGIS GRC - Frontend Load & Diagnostic Test
// Designed to diagnose 4xx / 5xx / 429 status code failures under load
// ========================================================================

// Custom HTTP status code counters
export const status200 = new Counter('http_status_200');
export const status301 = new Counter('http_status_301');
export const status304 = new Counter('http_status_304');
export const status401 = new Counter('http_status_401');
export const status403 = new Counter('http_status_403');
export const status404 = new Counter('http_status_404');
export const status429 = new Counter('http_status_429_rate_limit');
export const status500 = new Counter('http_status_500');
export const status502 = new Counter('http_status_502');
export const status503 = new Counter('http_status_503_service_unavailable');
export const status504 = new Counter('http_status_504');
export const otherStatus = new Counter('http_status_other');

// Rates
export const failureRate = new Rate('failed_requests_rate');
export const rateLimitRate = new Rate('rate_limited_rate');

// Latency trends
export const frontendLatency = new Trend('frontend_response_time', true);

// Configurable options via environment variables
const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:5173';
const VUS = parseInt(__ENV.VUS || '100', 10);
const DURATION = __ENV.DURATION || '1m';

export const options = {
  stages: [
    { duration: '10s', target: VUS },      // Ramp up to 100 users
    { duration: DURATION, target: VUS },   // Hold steady load for 1 minute
    { duration: '5s', target: 0 },         // Ramp down
  ],
  thresholds: {
    // Alert if error rate exceeds 5%
    failed_requests_rate: ['rate<0.05'],
    // 95% of requests should be below 800ms
    http_req_duration: ['p(95)<800'],
  },
};

// Common routes in AEGIS GRC SPA
const ROUTES = [
  '/',
  '/login',
  '/signup',
  '/frameworks',
  '/risks',
  '/tasks',
];

let loggedErrorCount = 0;
const MAX_LOGGED_ERRORS = 15; // Prevent flooding logs while capturing diagnosis

export default function () {
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  const url = `${TARGET_URL.replace(/\/$/, '')}${route}`;

  const params = {
    headers: {
      'User-Agent': 'k6-load-test/aegis-grc-diagnostic',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    tags: { name: `route_${route}` },
  };

  const res = http.get(url, params);
  frontendLatency.add(res.timings.duration);

  // Track status codes
  switch (res.status) {
    case 200:
      status200.add(1);
      break;
    case 301:
    case 302:
      status301.add(1);
      break;
    case 304:
      status304.add(1);
      break;
    case 401:
      status401.add(1);
      break;
    case 403:
      status403.add(1);
      break;
    case 404:
      status404.add(1);
      break;
    case 429:
      status429.add(1);
      rateLimitRate.add(1);
      break;
    case 500:
      status500.add(1);
      break;
    case 502:
      status502.add(1);
      break;
    case 503:
      status503.add(1);
      break;
    case 504:
      status504.add(1);
      break;
    default:
      otherStatus.add(1);
      break;
  }

  const isSuccess = res.status >= 200 && res.status < 400;
  failureRate.add(!isSuccess);

  // Diagnostic logging for failures (sample up to MAX_LOGGED_ERRORS)
  if (!isSuccess && loggedErrorCount < MAX_LOGGED_ERRORS) {
    loggedErrorCount++;
    const retryAfter = res.headers['Retry-After'] || res.headers['retry-after'] || 'N/A';
    const netlifyId = res.headers['X-Nf-Request-Id'] || res.headers['x-nf-request-id'] || 'N/A';
    const serverHeader = res.headers['Server'] || res.headers['server'] || 'N/A';
    const bodySnippet = (res.body || '').toString().slice(0, 150).replace(/\n/g, ' ');

    console.warn(
      `[FAIL #${loggedErrorCount}] Status: ${res.status} | URL: ${url} | Server: ${serverHeader} | Netlify-ID: ${netlifyId} | Retry-After: ${retryAfter} | Body: ${bodySnippet}`
    );
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
    'not rate limited (429)': (r) => r.status !== 429,
    'no server error (5xx)': (r) => r.status < 500,
  });

  // Pacing: simulate realistic user click delay (0.5s - 1.5s)
  sleep(0.5 + Math.random());
}

// Generate summary report
export function handleSummary(data) {
  const getCounter = (name) => (data.metrics[name] ? data.metrics[name].values.count : 0);
  const totalRequests = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const rps = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(1) : '0';
  const failRateVal = data.metrics.failed_requests_rate ? (data.metrics.failed_requests_rate.values.rate * 100).toFixed(2) : '0';

  const durationValues = data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const avgLatency = (durationValues.avg || 0).toFixed(1);
  const minLatency = (durationValues.min || 0).toFixed(1);
  const maxLatency = (durationValues.max || 0).toFixed(1);
  const medLatency = (durationValues.med || 0).toFixed(1);
  const p90Latency = (durationValues['p(90)'] || 0).toFixed(1);
  const p95Latency = (durationValues['p(95)'] || 0).toFixed(1);

  const markdownReport = `
# 📊 AEGIS GRC - Baseline Load Test Summary (100 VUs / 1 min)

- **Target URL:** \`${TARGET_URL}\`
- **Virtual Users (VUs):** ${VUS} concurrent users
- **Test Duration:** ${DURATION}
- **Total Requests Handled:** ${totalRequests.toLocaleString()}
- **Throughput (RPS):** **${rps} req/sec**
- **Overall Failure Rate:** **${failRateVal}%**

---

### ⏱️ Response Time Distribution
| Metric | Latency | Description |
|---|---|---|
| **Min** | \`${minLatency} ms\` | Fastest recorded request |
| **Average (Mean)** | \`${avgLatency} ms\` | Mean time across all requests |
| **Median (P50)** | \`${medLatency} ms\` | 50% of requests finished within this time |
| **P90** | \`${p90Latency} ms\` | 90% of requests finished within this time |
| **P95** | \`${p95Latency} ms\` | 95% of requests finished within this time |
| **Max** | \`${maxLatency} ms\` | Slowest single request |

---

### 🔍 HTTP Status Code Breakdown (Diagnosing 4xx / 5xx / 429)
| Status Code | Meaning | Count | % of Total | Diagnostic Guidance |
|---|---|---|---|---|
| **200 OK** | Successful | ${getCounter('http_status_200')} | ${totalRequests ? ((getCounter('http_status_200') / totalRequests) * 100).toFixed(1) : 0}% | Normal operational traffic |
| **301/302/304** | Redirect / Cache | ${getCounter('http_status_301') + getCounter('http_status_304')} | ${totalRequests ? (((getCounter('http_status_301') + getCounter('http_status_304')) / totalRequests) * 100).toFixed(1) : 0}% | CDN cached / redirected |
| **401 Unauthorized** | Auth Challenge | ${getCounter('http_status_401')} | ${totalRequests ? ((getCounter('http_status_401') / totalRequests) * 100).toFixed(1) : 0}% | Missing authentication header |
| **403 Forbidden** | Access Denied | ${getCounter('http_status_403')} | ${totalRequests ? ((getCounter('http_status_403') / totalRequests) * 100).toFixed(1) : 0}% | WAF block or forbidden route |
| **404 Not Found** | Missing Route / Asset | ${getCounter('http_status_404')} | ${totalRequests ? ((getCounter('http_status_404') / totalRequests) * 100).toFixed(1) : 0}% | Check SPA rewrite rules (_redirects) |
| **429 Rate Limited** | Edge / CDN Throttle | ${getCounter('http_status_429_rate_limit')} | ${totalRequests ? ((getCounter('http_status_429_rate_limit') / totalRequests) * 100).toFixed(1) : 0}% | Netlify DDoS / burst protection |
| **500 Internal Error** | Application Error | ${getCounter('http_status_500')} | ${totalRequests ? ((getCounter('http_status_500') / totalRequests) * 100).toFixed(1) : 0}% | Unhandled server exception |
| **502 / 504 Timeout** | Gateway Timeout | ${getCounter('http_status_502') + getCounter('http_status_504')} | ${totalRequests ? (((getCounter('http_status_502') + getCounter('http_status_504')) / totalRequests) * 100).toFixed(1) : 0}% | Upstream origin took too long |
| **503 Unavailable** | Server Overloaded | ${getCounter('http_status_503_service_unavailable')} | ${totalRequests ? ((getCounter('http_status_503_service_unavailable') / totalRequests) * 100).toFixed(1) : 0}% | Server capacity or connection pool reached |
| **Other** | Other codes | ${getCounter('http_status_other')} | ${totalRequests ? ((getCounter('http_status_other') / totalRequests) * 100).toFixed(1) : 0}% | Miscellaneous |
`;

  return {
    'load-test-summary.md': markdownReport,
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: markdownReport,
  };
}
