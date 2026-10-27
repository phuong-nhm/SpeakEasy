# English Learning Platform

Nền tảng học tiếng Anh gamified theo mô hình Duolingo, có AI chấm bài viết, spaced repetition và game ôn từ vựng ngầm. Dự án fullstack solo, từ thiết kế database đến deploy production.

## Giới thiệu

Nội dung học được phân cấp **Level > Chapter > Lesson**. Mỗi Chapter gồm 3-4 Lesson, kết thúc bằng module Nghe + Viết + Checkpoint ôn tập ngữ pháp. Mỗi Lesson chia 3 phần:

- **Từ vựng**: ảnh + nghĩa + audio + trắc nghiệm + game nối từ
- **Ngữ pháp**: xếp block từ thành câu, đúng thì tự phát audio
- **Tổng hợp**: trộn 2 phần trên, kèm game nối từ ôn ngầm từ vựng cũ

Nguồn từ vựng lấy từ sách Destination B1/B2 (Malcolm Mann, Macmillan), 7 từ/lesson.

## Tính năng chính

**Học tập**

- Lộ trình Level/Chapter/Lesson, unlock tuần tự (Lesson sau mở khi Lesson trước hoàn thành)
- 4 dạng bài ngữ pháp: Word Order (ghép câu xáo trộn), Fill in Blank, Answer Question, Translate from Vietnamese
- 2 track nội dung song song: Topic Vocabulary (học trước, theo thứ tự) và Word Formation/Word Pattern (rải xuyên suốt, luyện phản xạ cấu trúc)

**Nghe - Nói - Viết**

- Listening Dialogue: nghe đối thoại, chọn câu đúng + dịch câu còn lại sang tiếng Anh
- Listening Passage: nghe đoạn dài, trả lời trắc nghiệm hoặc tự luận (chấm bằng AI)
- Writing: AI chấm bài theo chuẩn band IELTS, trả về điểm, lỗi sai, gợi ý sửa, giải thích (tần suất 1 đoạn/tuần, 1 bài dài/1-2 tháng)

**Ôn tập**

- Spaced repetition theo mốc thời gian: 3h → 1d → 3d → 1w → 2w → 1m
- Cơ chế ôn ngầm tích hợp thẳng vào game nối từ ở phần Tổng hợp, không cần bảng riêng
- Game Hub độc lập để luyện lại bất kỳ Chapter nào

**Checkpoint**

- Bài ôn tập ngữ pháp tổng hợp toàn Chapter, random 15-20 câu từ mọi dạng bài đã học

**Admin CMS**

- Quản lý toàn bộ nội dung (Level/Chapter/Lesson/Vocabulary/Grammar/Listening/Writing)
- Import hàng loạt (bulk import) qua paste JSON, tự động sinh audio và ảnh minh họa cho từ vựng còn thiếu
- Phân quyền Admin/Manager, upload media qua Multipart Form Data

## Tech Stack

**Backend**: ASP.NET Core (ABP Framework, template app-nolayers) · PostgreSQL (Neon) qua EF Core · OpenIddict (JWT, password grant) · FusionCache (caching) · Redis (rate limiting)

**Frontend**: Next.js / React · TypeScript · React Query (đang tích hợp) · apiClient tự đính Bearer token, tự xử lý 401

**AI / Agent**: Service Python riêng tách biệt · Gemini API cho chấm bài viết (Writing + Listening Essay) · Gemini TTS sinh audio · Replicate (Flux Schnell) sinh ảnh minh họa từ vựng theo ngữ cảnh

**Hạ tầng**: Docker (Dockerfile riêng cho Frontend/Backend/Agent + Docker Compose) · GitHub Actions CI/CD cho cả 3 service · Cloudinary (CDN media) · Deploy: Backend → Render, Agent → Azure Container Apps, Frontend → Vercel

## Kiến trúc & thiết kế đáng chú ý

- **Database**: 9+ entity theo chuẩn ABP (khóa chính Guid), không tạo bảng Users riêng mà dùng IdentityUser sẵn có
- **Chấm bài trắc nghiệm/xếp câu/nối từ**: xử lý client-side để tối ưu tốc độ phản hồi, chấp nhận đánh đổi lộ đáp án qua Network tab
- **Ôn tập ngầm**: khi vào bài mới, backend quét (chỉ SELECT) các bài cũ đến hạn ôn, bốc ngẫu nhiên từ vào game nối từ - không cần thêm bảng hay cột riêng
- **Rate limiting phân tầng**: Token Bucket lưu trạng thái trên Redis (hỗ trợ scale ngang multi-instance), Global Limiter chặn cả Auto Controller lẫn Controller thường, giới hạn tùy biến theo endpoint, phân biệt theo user đăng nhập hoặc IP; siết chặt các endpoint rủi ro cao (auth, API gọi AI tốn phí, upload media, batch import)
- **Xử lý lỗi dịch vụ AI sinh media**: ảnh/audio có thể fail không làm sập cả batch import (giới hạn request song song, log cảnh báo thay vì throw)

## Deployment & CI/CD

Cả 3 service (Backend, Frontend, Agent) đều có pipeline riêng theo chung một pattern: build & test → build Docker image, push lên GHCR → deploy (chỉ chạy khi push vào nhánh main).

- **Backend**: Render, kéo image Docker từ GHCR, deploy qua Deploy Hook
- **Agent**: Azure Container Apps, deploy qua Azure CLI trong CI
- **Frontend**: Vercel, deploy qua Vercel CLI trong GitHub Actions (không dùng Git Integration tự động)

Một số vấn đề triển khai thực tế đã xử lý: cấu hình Forwarded Headers (do nền tảng terminate TLS ở reverse proxy khiến OpenIddict từ chối request), khớp port giữa Ingress và Health Probe trên Azure, quản lý biến môi trường/secrets cho từng nền tảng.

## Cài đặt & chạy local

Dự án gồm 3 service độc lập: Backend (.NET), Frontend (Next.js), Agent (Python). Có thể chạy từng service riêng hoặc dùng Docker Compose.

**Yêu cầu**: .NET SDK, Node.js, Python, Docker (nếu dùng Compose), tài khoản PostgreSQL (vd Neon), API key Gemini.

**1. Clone & cấu hình biến môi trường**

```
git clone <repo-url>
cd <project-folder>
```

Backend cần file `appsettings.secrets.json` (đặt cạnh `appsettings.json`) chứa connection string DB, Gemini API key. Frontend cần file `.env.local` chứa URL trỏ về Backend. Agent cần file `.env` chứa API key tương ứng.

**2. Chạy Backend**

```
cd <thư-mục-backend>
dotnet ef database update   # chạy migration tạo DB
dotnet run
```

**3. Chạy Frontend**

```
cd <thư-mục-frontend>
npm install
npm run dev
```

**4. Chạy Agent**

```
cd <thư-mục-agent>
pip install -r requirements.txt
python main.py
```

**Hoặc chạy bằng Docker Compose** (dùng cho môi trường test/CI, chưa phải cấu hình chính cho local dev hàng ngày):

```
docker-compose up --build
```

> Lưu ý: tên thư mục, tên biến môi trường cụ thể và cổng chạy mặc định thì điền lại đúng theo project thật trước khi đưa lên repo — ở đây mình chỉ viết khung chuẩn, bạn check lại rồi sửa path/tên file cho khớp nhé.

## Hiệu năng

Đã thực hiện tối ưu có đo lường bằng k6 load test: phát hiện và sửa N+1 query ở các API đọc danh sách, triển khai FusionCache cho các route được gọi nhiều kèm cơ chế tự invalidate khi dữ liệu thay đổi, bật Response Compression. Sau tối ưu, hệ thống giữ ổn định dưới tải gấp đôi baseline (0% request lỗi).

## Việc còn lại / định hướng mở rộng

- Tích hợp React Query cho toàn bộ Frontend (đang làm)
- Tính năng đọc truyện theo trình độ người dùng (AI sinh nội dung theo vốn từ đã học)
- Tính năng bạn bè, nhắn tin, streak học liên tục
- Permission chi tiết ở Frontend (ẩn/hiện theo đúng quyền thật)
- Leaderboard

## Ghi chú kỹ thuật

Dự án cũng là một phần portfolio cá nhân, được phát triển và triển khai solo từ đầu đến cuối.
