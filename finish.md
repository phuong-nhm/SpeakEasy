1. Đo lường & benchmark
   Dùng k6 viết bộ test đo hiệu năng cho 11 API endpoint, benchmark trước/sau mỗi lần tối ưu để có số liệu đối chứng rõ ràng thay vì chỉ ước lượng cảm tính.

2. Fix N+1 Query
   Phát hiện và sửa lỗi N+1 query ở API lấy danh sách bài nghe theo Level (query lặp lại cho từng item thay vì gộp 1 lần). Sửa bằng kỹ thuật batch query: gom hết ID cần query, lấy dữ liệu liên quan trong 1 lần gọi DB, rồi group trong bộ nhớ (RAM) thay vì query DB lặp lại nhiều lần.

3. Caching nhiều tầng với FusionCache
   Triển khai FusionCache (kết hợp In-Memory cache L1 + Redis L2) cho 6 API đọc nhiều (Level, Chapter, Lesson, Vocabulary, GrammarNote). Thiết kế cache key theo tham số để tránh trả nhầm dữ liệu, dùng cơ chế tag để xóa cache theo nhóm khi dữ liệu gốc thay đổi (thay vì phải nhớ chính xác từng cache key). Có xử lý riêng cho trường hợp dữ liệu có yếu tố ngẫu nhiên (random quiz) để không cache nhầm làm “đóng băng” kết quả.

4. Response Compression
   Bật nén Gzip/Brotli cho response API, phát hiện và sửa đúng thứ tự middleware (Forwarded Headers phải chạy trước Response Compression) để đảm bảo hoạt động đúng trên môi trường production sau reverse proxy.

5. Kết quả đo được (benchmark thật, không phải ước lượng)
   Median response time giảm từ khoảng 530-620ms xuống còn 5-7ms (nhờ cache hit). Khi tăng tải thử nghiệm gấp đôi (từ 5 lên 10 concurrent user), hệ thống vẫn giữ 0% lỗi request, throughput tăng gần 5 lần so với baseline ban đầu.

6. Kỹ năng debug hạ tầng
   Trong quá trình benchmark, từng gặp hiện tượng độ trễ tăng bất thường. Đã điều tra có phương pháp: loại trừ lần lượt các khả năng (token hết hạn, tải máy local, rate limiting), từng nghi ngờ sai hướng do giới hạn connection pool của database, sau đó dùng công cụ Monitoring của nhà cung cấp DB (Neon) để xác nhận đúng nguyên nhân thực sự là cơ chế auto-suspend/cold-start của compute instance ở gói miễn phí — từ đó phân biệt được đâu là vấn đề do code, đâu là giới hạn của hạ tầng test.
   Tóm tắt chi tiết riêng phần Agent Python (english-agent):

Kiến trúc tổng quan

Agent dùng LangGraph theo mô hình supervisor pattern: 1 supervisor node điều phối, route câu hỏi học viên sang đúng 1 trong 3 sub-agent chuyên biệt (tutor, progress, evaluator), mỗi sub-agent dựng bằng create_react_agent. State/lịch sử hội thoại lưu qua checkpointer MemorySaver theo thread_id.

Agent không truy cập database trực tiếp, mà kết nối tới backend ASP.NET qua giao thức MCP (Model Context Protocol) — chạy mcp_server.py như 1 process riêng (stdio), expose ra khoảng 20 tool gọi REST API sang backend: đọc nội dung học (level, chapter, lesson, từ vựng, ngữ pháp, bài nghe), đọc dữ liệu cá nhân học viên (profile, tiến độ, lịch ôn tập, lịch sử bài viết), và các tool chấm bài/ghi dữ liệu (một số tool bắt buộc tham số confirm=True để tránh agent tự ý nộp bài thay học viên). Access token của học viên truyền qua RunnableConfig, lấy ra trong từng tool bằng ensure_config().

Guardrail an toàn 3 lớp

Xây dựng hệ thống guardrail input theo cơ chế fail-open (lỗi hệ thống thì cho qua, chỉ chặn khi guard thật sự phát hiện vi phạm): Lớp 1 regex chặn nhanh/miễn phí các từ khóa rõ ràng (mật khẩu, API key, system prompt, jailbreak...); Lớp 2 chỉ kích hoạt khi có từ khóa nghi ngờ nhẹ, gọi 1 model rẻ hỏi YES/NO có đang cố khai thác thông tin nhạy cảm; Lớp 3 dùng ToxicLanguage (guardrails-ai) bắt lời lẽ độc hại, chạy song song với Lớp 2 bằng asyncio.gather để không cộng dồn độ trễ. Output cũng được lọc, regex che các GUID/UUID nhạy cảm trước khi trả về học viên.

Tối ưu hiệu năng (latency)

Đổi model ở bước routing (supervisor_node) sang model rẻ hơn thay vì model chính, vì chỉ cần phân loại intent đơn giản. Giới hạn lịch sử chỉ gửi 10 tin nhắn gần nhất lên model mỗi lần gọi, tránh phình context theo thời gian chat dài. Chạy song song 2 lớp guardrail bằng asyncio thay vì tuần tự.

Observability

Tích hợp LangSmith để trace lại toàn bộ luồng xử lý của agent (debug được chính xác agent gọi tool nào, model trả lời gì ở từng bước).

CI/CD và triển khai

Pipeline GitHub Actions: lint + test → build Docker image (multi-stage build, ép dùng torch bản CPU-only thay vì GPU để giảm kích thước image và thời gian build) → push lên GitHub Container Registry → deploy tự động lên Azure Container Apps qua Azure CLI. Tối ưu Dockerfile để bake sẵn các model AI phụ trợ (Detoxify cho guardrail, NLTK tokenizer) ngay lúc build, chạy bằng user không phải root, tránh phải tải lại các model này mỗi lần container khởi động lại (cold start), giảm đáng kể thời gian activate trên Azure. Đã tự fix được pipeline để chỉ deploy đúng 1 lần sau khi merge code (trước đó bị deploy 2 lần do trigger cả lúc mở PR và lúc merge).

Các vấn đề kỹ thuật đã tự debug và xử lý

Conflict phiên bản thư viện Python (mcp, guardrails, langchain) khi cài đặt; thay đổi API giữa các phiên bản của thư viện guardrails-ai; lỗi OOM (hết bộ nhớ) khi container phải chạy song song app chính (đã tải sẵn model AI) với 1 process con MCP server riêng, đã chẩn đoán và điều chỉnh tài nguyên container hợp lý; lỗi CORS giữa frontend (Vercel) và backend do thiếu cấu hình domain cho phép; sự cố cold-start của database khi không có traffic.

Kiến thức/nghiên cứu đã tìm hiểu thêm (chưa triển khai, đã đánh giá)

Đã tìm hiểu và đánh giá khả năng tích hợp vector database (pgvector trên nền Postgres có sẵn) để bổ sung khả năng RAG/semantic search cho agent — giúp agent trả lời được câu hỏi tự do của học viên (không cần biết trước ID cụ thể) hiệu quả hơn và tiết kiệm token hơn so với cách dò tuần tự qua nhiều lượt gọi tool hiện tại; đã lên roadmap kỹ thuật chi tiết (chọn bảng ưu tiên, model embedding, cách tích hợp vào MCP tool) nhưng quyết định chưa triển khai vì quy mô nội dung hiện tại chưa cần thiết.

Bạn muốn mình rút gọn hơ
