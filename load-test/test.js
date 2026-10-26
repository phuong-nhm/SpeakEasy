import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Cấu hình kịch bản test (Load Profile)
export const options = {
  // Dùng stages để test tăng dần tải (ramp-up) thực tế hơn:
  stages: [
    { duration: '10s', target: 10 },   // Tăng từ từ lên 5 người dùng ảo trong 10 giây đầu
    { duration: '30s', target: 10 },   // Giữ ổn định 5 người dùng trong 30 giây tiếp theo
    { duration: '10s', target: 0 },   // Giảm dần về 0 người dùng trong 10 giây cuối
  ],

  // Ngưỡng đánh giá (Thresholds) - k6 sẽ báo lỗi (fail) nếu không đạt điều kiện này
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% số request phải phản hồi dưới 500ms
    http_req_failed: ['rate<0.01'],   // Tỉ lệ lỗi phải dưới 1%
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:44300';
const TOKEN = __ENV.TOKEN; // bắt buộc truyền vào, không hardcode

// Bộ ID test cố định (level -> chapter -> lesson, cùng 1 nhánh) - vẫn cho phép override qua -e
const LEVEL_ID = __ENV.LEVEL_ID || 'f6dbd747-3850-54f4-2245-3a23d1f042ad';
const CHAPTER_ID = __ENV.CHAPTER_ID || 'bc1ea93c-d048-9e68-2a0c-3a23d1fc31af';
const LESSON_ID = __ENV.LESSON_ID || '56ee03b1-2c04-fd98-9fa2-3a23dae1fbff';

const params = {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
};

export default function () {
  // --- P0: route N+1 chính cần đo ---
  group('P0 - ListeningPassage by-level (N+1 chính)', function () {
    const res = http.get(
      `${API_URL}/api/app/listening-passage/by-level/${LEVEL_ID}`,
      params
    );
    check(res, {
      'status là 200': (r) => r.status === 200,
      'có trả về mảng': (r) => Array.isArray(JSON.parse(r.body)),
    });
  });

  // --- P1: nhóm cache (đọc nhiều, chưa phải N+1 nhưng cần baseline) ---
  group('P1 - Level/Chapter/Lesson/Vocabulary/GrammarNote', function () {
    let res;

    res = http.get(`${API_URL}/api/app/level`, params);
    check(res, { 'level status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/chapter/by-level/${LEVEL_ID}`, params);
    check(res, { 'chapter by-level status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/lesson/by-chapter/${CHAPTER_ID}`, params);
    check(res, { 'lesson by-chapter status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/lesson/lesson-content/${LESSON_ID}`, params);
    check(res, { 'lesson-content status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/vocabulary/by-lesson/${LESSON_ID}`, params);
    check(res, { 'vocabulary by-lesson status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/vocabulary/quiz-batch/${LESSON_ID}`, params);
    check(res, { 'vocabulary quiz-batch status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/grammar-note/by-chapter/${CHAPTER_ID}`, params);
    check(res, { 'grammar-note by-chapter status 200': (r) => r.status === 200 });

    res = http.get(`${API_URL}/api/app/grammar-note/by-level-paged/${LEVEL_ID}`, params);
    check(res, { 'grammar-note by-level-paged status 200': (r) => r.status === 200 });
  });

  // --- Đo kèm cho biết, không ưu tiên (N=1 / không nguy hiểm) ---
  group('Extra - ListeningPassage by-chapter / MatchingGame', function () {
    let res;

    res = http.get(
      `${API_URL}/api/app/listening-passage/by-chapter/${CHAPTER_ID}`,
      params
    );
    check(res, { 'listening by-chapter status 200': (r) => r.status === 200 });

    res = http.get(
      `${API_URL}/api/app/matching-game/game-for-chapter/${CHAPTER_ID}`,
      params
    );
    check(res, { 'matching-game by-chapter status 200': (r) => r.status === 200 });
  });

  sleep(1);
}