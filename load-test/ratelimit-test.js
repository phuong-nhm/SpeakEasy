import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    burst: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5s',
    },
  },
};
export default function () {
const res = http.post(
  `${__ENV.API_URL}/api/app/user-writing/submit-writing`,
  JSON.stringify({
    topicId: '00000000-0000-0000-0000-000000000000', // giả, không tồn tại
    userContent: 'test',
  }),
  { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${__ENV.TOKEN}` } }
);

check(res, {
  'không bị 429 ở các request đầu': (r) => r.status !== 429,
});

console.log(`Request ${__ITER}: status=${res.status}`);
  sleep(0.1);
}