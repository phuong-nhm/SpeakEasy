import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình kịch bản test (Load Profile)
export const options = {
  // Bạn có thể dùng stages để test tăng dần tải (ramp-up) thực tế hơn:
  stages: [
    { duration: '10s', target: 5 },   // Tăng từ từ lên 5 người dùng ảo trong 10 giây đầu
    { duration: '30s', target: 5 },   // Giữ ổn định 5 người dùng trong 30 giây tiếp theo
    { duration: '10s', target: 0 },   // Giảm dần về 0 người dùng trong 10 giây cuối
  ],
  
  // Hoặc dùng cấu hình đơn giản nhanh gọn:
  // vus: 10,
  // duration: '20s',

  // Ngưỡng đánh giá (Thresholds) - k6 sẽ báo lỗi (fail) nếu không đạt điều kiện này
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% số request phải phản hồi dưới 500ms
    http_req_failed: ['rate<0.01'],  // Tỉ lệ lỗi phải dưới 1%
  },
};
  const API_URL = __ENV.API_URL || 'http://localhost:44300';
  const LEVEL_ID = __ENV.LEVEL_ID; // bắt buộc truyền vào, không hardcode
const TOKEN = __ENV.TOKEN; // bắt buộc truyền vào, không hardcode
export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.get(`${BASE_URL}/api/app/listening-passage/by-level/${LEVEL_ID}`, params);

  check(res, {
    'status là 200': (r) => r.status === 200,
    'có trả về mảng': (r) => Array.isArray(JSON.parse(r.body)),
  });

  sleep(1);
}