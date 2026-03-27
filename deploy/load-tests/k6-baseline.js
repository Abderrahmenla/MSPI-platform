/**
 * MSPI k6 Baseline Load Test
 * Usage: k6 run deploy/load-tests/k6-baseline.js
 * Docs:  https://k6.io/docs/
 *
 * Stages:
 *   0→3m: ramp from 0 to 20 VUs  (warm-up)
 *   3→8m: hold 20 VUs             (steady state)
 *   8→10m: ramp down to 0         (cool-down)
 *
 * Pass thresholds:
 *   p95 response time < 800 ms
 *   error rate < 1%
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://mspi.tn';
const API_URL = __ENV.API_URL || 'https://mspi.tn/api/v1';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '3m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    errors: ['rate<0.01'],
  },
};

export default function () {
  const res = http.batch([
    ['GET', `${BASE_URL}/fr`],
    ['GET', `${BASE_URL}/fr/products`],
    ['GET', `${API_URL}/products`],
  ]);

  for (const r of res) {
    const ok = check(r, {
      'status 200': (resp) => resp.status === 200,
      'response < 800ms': (resp) => resp.timings.duration < 800,
    });
    errorRate.add(!ok);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'deploy/load-tests/results/summary.json': JSON.stringify(data, null, 2),
  };
}
