Giờ giải thích kỹ từng số để bạn ghi CV / trả lời phỏng vấn cho chuẩn:

1. http_req_duration (thời gian phản hồi của mỗi HTTP request)

avg = 687ms: thời gian trung bình
min = 261ms: request nhanh nhất
med (median/p50) = 531ms: nghĩa là 50% request nhanh hơn 531ms, 50% chậm hơn
max = 6.79s: request chậm nhất — đây là dấu hiệu có 1 (vài) request bị outlier cực chậm, nghi là route N+1 (listening by-level)
p90 = 1.31s: 90% request nhanh hơn 1.31s (tức 10% request chậm hơn mức này)
p95 = 1.32s: 95% request nhanh hơn 1.32s (tức 5% chậm hơn) — đây là con số quan trọng nhất để đánh giá hiệu năng thực tế, vì nó loại bỏ phần lớn nhiễu nhưng vẫn bắt được các case chậm thật sự ảnh hưởng người dùng

Lý do dùng p95 thay vì avg để đánh giá: avg dễ bị “trung bình hóa” che mất vấn đề (ví dụ 95 request nhanh + 5 request siêu chậm vẫn ra avg thấp), còn p95 phản ánh đúng trải nghiệm của nhóm người dùng “xui” gặp phải request chậm.

2. http_req_failed = 0% (0 out of 286)
   Nghĩa là không có request nào trả lỗi (4xx/5xx hay timeout) — backend không sập, chỉ là chậm. Đây là điểm quan trọng để phân biệt 2 loại vấn đề khác nhau: “chậm” (performance issue) khác với “lỗi” (correctness/stability issue). Baseline của bạn chỉ có vấn đề loại 1.

3. checks 312/312 pass (100%)
   “Checks” là các điều kiện bạn tự định nghĩa để xác nhận response đúng, không phải chỉ status 200 mà cả nội dung (ví dụ check “có trả về mảng”). 312 = 12 check/iteration × 26 iteration. Pass hết nghĩa là dữ liệu trả về đúng định dạng, không có lỗi logic — vấn đề thuần túy là tốc độ.

4. iterations = 26, trong 50s, 5 VU
   VU (Virtual User) là người dùng ảo mô phỏng. 1 iteration = 1 vòng chạy hết toàn bộ 11 route trong hàm default(). 26 iteration/50s với 5 VU nghĩa là trung bình mỗi VU chỉ chạy được khoảng 5 iteration trong 50 giây — số này thấp vì mỗi iteration mất tới ~8.57s trung bình (dòng iteration_duration avg=8.57s) do 11 request tuần tự cộng dồn + sleep(1).

5. data_received/data_sent
   1.8 MB nhận về, 41 kB gửi đi — kích cỡ dữ liệu không lớn, nên nghẽn chủ yếu do thời gian xử lý ở server (query DB), không phải do băng thông mạng.

Tóm lại để trả lời phỏng vấn: “Tôi dùng k6 đo baseline cho nhóm API đang nghi N+1 query, p95 response time đo được là 1.32s trong khi mục tiêu đặt ra là dưới 500ms, mặc dù tỉ lệ lỗi 0% (hệ thống vẫn chạy đúng, chỉ chậm). Tôi dùng số liệu này làm baseline để so sánh sau khi áp patch batch-query khắc phục N+1.”

k6 run --insecure-skip-tls-verify -e API_URL="https://localhost:44326" -e TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxRDA4Rjc5RTc0Q0EzMDFBN0QyQzIyMDIwNUUzQUE4RDFDMjM0NEUiLCJ4NXQiOiJBZENQZWVkTW93R24wc0lnSUY0NnFOSENORTQiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo0NDMyNi8iLCJleHAiOjE3OTI4MjM2MzAsImlhdCI6MTc5MjgyMDAzMCwiYXVkIjoiRW5nbGlzaExlYXJuaW5nQXBwIiwic2NvcGUiOiJFbmdsaXNoTGVhcm5pbmdBcHAiLCJqdGkiOiI4NzA5NTdiOC03YWQ1LTQyMjUtODgwMy01OWVlM2Q5ZGExNjIiLCJzdWIiOiIzYTI0MWE4MC1kNzk5LWVmNTAtNjc2Yi0yODBmN2U4Y2EzY2MiLCJ1bmlxdWVfbmFtZSI6ImFkbWluIiwicmVtZW1iZXJfbWUiOiJUcnVlIiwib2lfcHJzdCI6IkVuZ2xpc2hMZWFybmluZ0FwcF9Td2FnZ2VyIiwib2lfYXVfaWQiOiIzYTI0MWUwYS02YWVjLTE4YWUtNWY1Zi00YWZkYjZkMzE3NzgiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJhZG1pbiIsImZhbWlseV9uYW1lIjoixJHhu5ciLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGFicC5pbyIsImVtYWlsX3ZlcmlmaWVkIjoiRmFsc2UiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOiJGYWxzZSIsImNsaWVudF9pZCI6IkVuZ2xpc2hMZWFybmluZ0FwcF9Td2FnZ2VyIiwib2lfdGtuX2lkIjoiM2EyNDdlOTMtODI4Yi01OTA5LTA1NzQtMDEzNzg4MzM5YWI2In0.QH9fkvgcbA7KHdaMGbxnX34paVo1noVEm8gWmq1SzJvLTs9bP_w9r9npxq0T4zzB_plWy8Efw93NwZKY_YncXJxiIegNd7BXI1DdrZhXzG0ZF8PJ3C091cyxBbhLxIMnmPAdWC1zg9n4T0rP0KaGZ7sZBcIqZH72WTI2yucc8UmOjTTyKDsDv4s95SAgN0lluzxCsLaLHR66XbfyXk05L8f6S4eX-YE3oWIAWZE9jsnLKFAyhDjnT_YriBxHIu6qJDiL-r6B_0sk66HDJcLE2f9NEEOnOGsqak_YWXACnyr5-kkMt2i4bnHV8ZMlPdIpIz4J870a-3jGIodEjn7-Kg" test.js

/////////////////////

k6 run --insecure-skip-tls-verify -e API_URL="https://localhost:44326" -e TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxRDA4Rjc5RTc0Q0EzMDFBN0QyQzIyMDIwNUUzQUE4RDFDMjM0NEUiLCJ4NXQiOiJBZENQZWVkTW93R24wc0lnSUY0NnFOSENORTQiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo0NDMyNi8iLCJleHAiOjE3OTI4MjM2MzAsImlhdCI6MTc5MjgyMDAzMCwiYXVkIjoiRW5nbGlzaExlYXJuaW5nQXBwIiwic2NvcGUiOiJFbmdsaXNoTGVhcm5pbmdBcHAiLCJqdGkiOiI4NzA5NTdiOC03YWQ1LTQyMjUtODgwMy01OWVlM2Q5ZGExNjIiLCJzdWIiOiIzYTI0MWE4MC1kNzk5LWVmNTAtNjc2Yi0yODBmN2U4Y2EzY2MiLCJ1bmlxdWVfbmFtZSI6ImFkbWluIiwicmVtZW1iZXJfbWUiOiJUcnVlIiwib2lfcHJzdCI6IkVuZ2xpc2hMZWFybmluZ0FwcF9Td2FnZ2VyIiwib2lfYXVfaWQiOiIzYTI0MWUwYS02YWVjLTE4YWUtNWY1Zi00YWZkYjZkMzE3NzgiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJhZG1pbiIsImZhbWlseV9uYW1lIjoixJHhu5ciLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGFicC5pbyIsImVtYWlsX3ZlcmlmaWVkIjoiRmFsc2UiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOiJGYWxzZSIsImNsaWVudF9pZCI6IkVuZ2xpc2hMZWFybmluZ0FwcF9Td2FnZ2VyIiwib2lfdGtuX2lkIjoiM2EyNDdlOTMtODI4Yi01OTA5LTA1NzQtMDEzNzg4MzM5YWI2In0.QH9fkvgcbA7KHdaMGbxnX34paVo1noVEm8gWmq1SzJvLTs9bP_w9r9npxq0T4zzB_plWy8Efw93NwZKY_YncXJxiIegNd7BXI1DdrZhXzG0ZF8PJ3C091cyxBbhLxIMnmPAdWC1zg9n4T0rP0KaGZ7sZBcIqZH72WTI2yucc8UmOjTTyKDsDv4s95SAgN0lluzxCsLaLHR66XbfyXk05L8f6S4eX-YE3oWIAWZE9jsnLKFAyhDjnT_YriBxHIu6qJDiL-r6B_0sk66HDJcLE2f9NEEOnOGsqak_YWXACnyr5-kkMt2i4bnHV8ZMlPdIpIz4J870a-3jGIodEjn7-Kg" ratelimit-test.js
