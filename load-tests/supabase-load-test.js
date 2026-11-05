import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ========================================================================
// AEGIS GRC - Supabase Backend Workflows Load Test
// Tests database PostgREST endpoints, connection pooling, and latency
// ========================================================================

// Status counters
export const status200 = new Counter('supabase_status_200');
export const status400 = new Counter('supabase_status_400');
export const status401 = new Counter('supabase_status_401_unauthorized');
export const status403 = new Counter('supabase_status_403_forbidden_rls');
export const status404 = new Counter('supabase_status_404_not_found');
export const status429 = new Counter('supabase_status_429_rate_limit');
export const status500 = new Counter('supabase_status_500_db_error');
export const status503 = new Counter('supabase_status_503_pool_exhausted');
export const otherStatus = new Counter('supabase_status_other');

// Rates & Trends
export const supabaseFailureRate = new Rate('supabase_failed_rate');
export const apiLatency = new Trend('supabase_api_latency', true);

const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'placeholder';
const VUS = parseInt(__ENV.VUS || '100', 10);
const DURATION = __ENV.DURATION || '1m';

export const options = {
  stages: [
    { duration: '10s', target: VUS },     // Ramp up to 100 users
    { duration: DURATION, target: VUS },  // Hold steady load for 1 minute
    { duration: '5s', target: 0 },        // Ramp down
  ],
  thresholds: {
    supabase_failed_rate: ['rate<0.05'],
    http_req_duration: ['p(95)<1200'],
  },
};

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'k6-supabase-load-test/aegis-grc',
};

// Key Supabase business workflows from src/services/api.ts
const ENDPOINTS = [
  { name: 'frameworks_catalog', path: '/rest/v1/frameworks?select=*' },
  { name: 'controls_list', path: '/rest/v1/framework_controls?select=id,title,category&limit=50' },
  { name: 'compliance_assessments', path: '/rest/v1/compliance_assessments?select=id,status&limit=20' },
  { name: 'risks_register', path: '/rest/v1/risks?select=id,title,score,status&limit=20' },
  { name: 'auth_health', path: '/auth/v1/health' },
];

let loggedErrorCount = 0;
const MAX_LOGGED_ERRORS = 10;

export default function () {
  const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${ep.path}`;

  const res = http.get(url, { headers: HEADERS, tags: { endpoint: ep.name } });
  apiLatency.add(res.timings.duration);

  switch (res.status) {
    case 200:
    case 206:
      status200.add(1);
      break;
    case 400:
      status400.add(1);
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
      break;
    case 500:
      status500.add(1);
      break;
    case 503:
      status503.add(1);
      break;
    default:
      otherStatus.add(1);
      break;
  }

  const isSuccess = res.status >= 200 && res.status < 400;
  supabaseFailureRate.add(!isSuccess);

  if (!isSuccess && loggedErrorCount < MAX_LOGGED_ERRORS) {
    loggedErrorCount++;
    const retryAfter = res.headers['Retry-After'] || res.headers['retry-after'] || 'N/A';
    const server = res.headers['Server'] || res.headers['server'] || 'N/A';
    const bodySnippet = (res.body || '').toString().slice(0, 200).replace(/\n/g, ' ');

    console.warn(
      `[SUPABASE FAIL #${loggedErrorCount}] Status: ${res.status} | Endpoint: ${ep.name} | Server: ${server} | Retry-After: ${retryAfter} | Body: ${bodySnippet}`
    );
  }

  check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'not rate limited (429)': (r) => r.status !== 429,
    'pool not exhausted (503)': (r) => r.status !== 503,
  });

  sleep(0.5 + Math.random() * 0.5);
}

export function handleSummary(data) {
  const getCounter = (name) => (data.metrics[name] ? data.metrics[name].values.count : 0);
  const totalRequests = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const rps = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(1) : '0';
  const failRateVal = data.metrics.supabase_failed_rate ? (data.metrics.supabase_failed_rate.values.rate * 100).toFixed(2) : '0';

  const durationValues = data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const avgLatency = (durationValues.avg || 0).toFixed(1);
  const minLatency = (durationValues.min || 0).toFixed(1);
  const maxLatency = (durationValues.max || 0).toFixed(1);
  const medLatency = (durationValues.med || 0).toFixed(1);
  const p90Latency = (durationValues['p(90)'] || 0).toFixed(1);
  const p95Latency = (durationValues['p(95)'] || 0).toFixed(1);

  const markdownReport = `
# 🗄️ AEGIS GRC - Supabase Backend Load Test Summary (100 VUs / 1 min)

- **Supabase URL:** \`${SUPABASE_URL}\`
- **Virtual Users (VUs):** ${VUS} concurrent users
- **Test Duration:** ${DURATION}
- **Total Requests Handled:** ${totalRequests.toLocaleString()}
- **Throughput (RPS):** **${rps} req/sec**
- **Overall Failure Rate:** **${failRateVal}%**

---

### ⏱️ Database & API Response Time Distribution
| Metric | Latency | Description |
|---|---|---|
| **Min** | \`${minLatency} ms\` | Fastest recorded database query |
| **Average (Mean)** | \`${avgLatency} ms\` | Mean time across all queries |
| **Median (P50)** | \`${medLatency} ms\` | 50% of queries finished within this time |
| **P90** | \`${p90Latency} ms\` | 90% of queries finished within this time |
| **P95** | \`${p95Latency} ms\` | 95% of queries finished within this time |
| **Max** | \`${maxLatency} ms\` | Slowest single query |

---

### 🔍 Supabase Status Code Breakdown
| Status Code | Meaning | Count | % of Total | Diagnostic Guidance |
|---|---|---|---|---|
| **200/206 OK** | Successful Query | ${getCounter('supabase_status_200')} | ${totalRequests ? ((getCounter('supabase_status_200') / totalRequests) * 100).toFixed(1) : 0}% | Normal database response |
| **400 Bad Request** | Query Syntax Error | ${getCounter('supabase_status_400')} | ${totalRequests ? ((getCounter('supabase_status_400') / totalRequests) * 100).toFixed(1) : 0}% | Invalid PostgREST filter or syntax |
| **401 Unauthorized** | Missing/Invalid Key | ${getCounter('supabase_status_401_unauthorized')} | ${totalRequests ? ((getCounter('supabase_status_401_unauthorized') / totalRequests) * 100).toFixed(1) : 0}% | Check anon key or bearer token |
| **403 Forbidden** | RLS Policy Rejection | ${getCounter('supabase_status_403_forbidden_rls')} | ${totalRequests ? ((getCounter('supabase_status_403_forbidden_rls') / totalRequests) * 100).toFixed(1) : 0}% | Row-Level Security policy denied access |
| **404 Not Found** | Table Not Found | ${getCounter('supabase_status_404_not_found')} | ${totalRequests ? ((getCounter('supabase_status_404_not_found') / totalRequests) * 100).toFixed(1) : 0}% | Missing table or endpoint |
| **429 Rate Limited** | Gateway Throttled | ${getCounter('supabase_status_429_rate_limit')} | ${totalRequests ? ((getCounter('supabase_status_429_rate_limit') / totalRequests) * 100).toFixed(1) : 0}% | Supabase API/Auth rate limit hit |
| **500 DB Error** | Internal Server Error | ${getCounter('supabase_status_500_db_error')} | ${totalRequests ? ((getCounter('supabase_status_500_db_error') / totalRequests) * 100).toFixed(1) : 0}% | Database internal error / query timeout |
| **503 Pool Exhausted** | Connection Limit Maxed | ${getCounter('supabase_status_503_pool_exhausted')} | ${totalRequests ? ((getCounter('supabase_status_503_pool_exhausted') / totalRequests) * 100).toFixed(1) : 0}% | Max direct DB connections reached (switch to pooling) |
| **Other** | Miscellaneous | ${getCounter('supabase_status_other')} | ${totalRequests ? ((getCounter('supabase_status_other') / totalRequests) * 100).toFixed(1) : 0}% | Other errors |
`;

  return {
    'supabase-load-summary.md': markdownReport,
    'supabase-load-summary.json': JSON.stringify(data, null, 2),
    stdout: markdownReport,
  };
}
