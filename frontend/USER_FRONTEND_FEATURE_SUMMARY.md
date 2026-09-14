# English Journey - User Frontend Feature Summary

## 1. Tổng hợp các phần đã xây dựng

### 1.1 Landing page

- Route: `/`
- Mục tiêu: giới thiệu sản phẩm, hướng người dùng vào flow đăng nhập / bắt đầu học
- Thành phần chính:
  - Hero section
  - CTA: Bắt đầu học ngay / Vào lộ trình
  - Feature cards
  - Footer
- Mock/auth flow hiện tại:
  - `useAuth()` quản lý trạng thái đăng nhập
  - Nếu đã authenticated -> redirect tới `/dashboard`
  - Nếu chưa -> redirect tới `/login`
- Dự kiến API thực khi tích hợp backend:
  - `GET /api/public/home/summary` hoặc `GET /api/applications/home/overview`
  - `GET /api/public/feature-highlights`
  - Không bắt buộc phải gọi realtime; có thể hardcode/seed trong FE nếu chưa có API thật

### 1.2 Auth flow

- Route: `/login`, `/register`
- Mục tiêu: user login/register, lưu session mock vào localStorage
- Mock service hiện tại:
  - `src/mock/mockAuth.ts`
  - `src/hooks/useAuth.ts`
  - `src/types/auth.ts`
- Chức năng hiện có:
  - validate form
  - login/register mock
  - persist session
  - logout
  - auto hydrate session khi refresh
- API thật tương lai cần thay mock:
  - `POST /api/account/login`
  - `POST /api/account/register`
  - `POST /api/account/logout`
  - `GET /api/account/me`
  - `GET /api/account/session`
- Service layer gợi ý:
  - `src/features/frontend/auth/services/authService.ts`
  - `src/features/frontend/auth/hooks/useAuth.ts`
  - `src/features/frontend/auth/types/auth.ts`

### 1.3 Shared header

- Vị trí: root layout, dùng chung toàn app
- Mục tiêu: hiển thị trạng thái guest / logged-in
- Hiện tại:
  - guest: nav giới thiệu, đăng nhập, đăng ký
  - authenticated: avatar, streak, dropdown, logout
- API cần thay mock khi có backend:
  - `GET /api/account/profile`
  - `GET /api/account/current-user`
  - `GET /api/user/dashboard-summary`

### 1.4 Dashboard user

- Route: `/dashboard`
- Mục tiêu: user lộ trình học theo level/chapter/lesson
- Chức năng chính hiện có:
  - Level selector
  - Chapter selector
  - Chapter roadmap tree
  - Lesson node states: completed / unlocked / locked
  - Daily quest widget
  - Header stats (level progress, streak, xp)

---

## 2. Tóm tắt phần dashboard roadmap đã làm

### 2.1 Level-based roadmap

- Mục tiêu: user chọn level trước, sau đó mới thấy chapter liên quan
- Mock data hiện tại:
  - `src/features/frontend/dashboard/mock/mockRoadmapData.ts`
- DTO hiện dùng:
  - `LevelDto`
  - `ChapterDto`
  - `LessonDto`
- API tương lai cần gọi:
  - `GET /api/user/roadmap/levels`
  - `GET /api/user/roadmap/levels/{levelId}`
  - `GET /api/user/roadmap/chapters/{chapterId}`

### 2.2 Chapter selector

- Mục tiêu: nếu nhiều chapter thì user có thể chọn chapter trong danh sách scrollable
- Data source hiện tại: mockRoadmapLevels
- API tương lai cần gọi:
  - `GET /api/user/roadmap/levels/{levelId}/chapters`
  - `GET /api/user/roadmap/chapters/{chapterId}/summary`

### 2.3 Roadmap tree

- Mục tiêu: render lesson nodes theo dạng zig-zag / vertical path gamified
- State theo lesson:
  - `completed`: đã học xong
  - `unlocked`: có thể mở
  - `locked`: chưa mở
- API tương lai cần gọi:
  - `GET /api/user/roadmap/lessons?chapterId={id}`
  - `GET /api/user/roadmap/lessons/{lessonId}`
  - `PATCH /api/user/roadmap/lessons/{lessonId}/complete`
  - `PATCH /api/user/roadmap/lessons/{lessonId}/unlock`

### 2.4 Daily quest widget

- Mục tiêu: hiển thị mục tiêu hàng ngày để user duy trì streak
- Hiện tại mock chỉ là UI demo, chưa có logic tính toán thực
- Các field cần backend cung cấp nếu muốn làm thực:
  - `dailyQuestId`
  - `title`
  - `targetValue`
  - `currentValue`
  - `unit`
  - `rewardXp`
  - `isCompleted`
  - `completedAt`
- API tương lai cần gọi:
  - `GET /api/user/daily-quests/today`
  - `GET /api/user/daily-quests/history`
  - `POST /api/user/daily-quests/{questId}/claim-reward`
  - `POST /api/user/daily-quests/{questId}/complete`

### 2.5 Header stats

- Mục tiêu: hiển thị progress, streak, xp tại dashboard
- Data cần backend có thể trả về:
  - `currentLevel`
  - `levelProgressPercent`
  - `completedLessons`
  - `totalLessons`
  - `currentStreak`
  - `xp`
- API tương lai cần gọi:
  - `GET /api/user/dashboard/stats`
  - `GET /api/user/profile/summary`

---

## 3. Phase 2.2 - Lesson learning flow

### 3.1 Mục tiêu thiết kế

- Route: `/lesson/[id]`
- Mục tiêu: hiển thị luồng học dạng gamified, gồm progress bar, trái tim (hearts), câu hỏi và kiểm tra đáp án
- UX hiện tại:
  - header có nút thoát và thanh tiến độ
  - hiển thị số hearts còn lại
  - người dùng chọn đáp án, nhấn kiểm tra, xem feedback
  - nếu đúng tăng XP và đúng số câu
  - nếu sai mất 1 heart
  - sau khi hoàn tất sẽ hiển thị màn hình tổng kết

### 3.2 Thành phần đã tạo

- `frontend/src/features/frontend/lesson/types/lesson.ts`
  - định nghĩa `LessonDto`, `LessonQuestion`, `LessonSubmitRequest`, `LessonSubmitResponse`
- `frontend/src/features/frontend/lesson/mock/mockLessonData.ts`
  - mock lesson data cho `lesson-1`, `lesson-2`
- `frontend/src/features/frontend/lesson/services/lessonService.ts`
  - `getLessonById()` và `submitLessonResult()` mock API
- `frontend/src/features/frontend/lesson/hooks/useLessonFlow.ts`
  - quản lý state câu hỏi, selected answer, response check, hearts, progress, final summary
- `frontend/src/features/frontend/lesson/components/HeaderBar.tsx`
  - thanh tiến độ + heart + confirm exit modal
- `frontend/src/features/frontend/lesson/components/FooterAction.tsx`
  - nút kiểm tra và tiếp tục với feedback banner
- `frontend/src/features/frontend/lesson/components/CompleteScreen.tsx`
  - màn hình kết thúc bài học với XP / tỷ lệ đúng / thời gian
- `frontend/src/features/frontend/lesson/components/VictoryModal.tsx`
  - modal hiển thị thành tích sau khi hoàn thành (dùng cho demo/UX)
- `frontend/src/features/frontend/lesson/components/LessonScreen.tsx`
  - layout tập hợp toàn bộ flow bài học

### 3.3 Logic hiện tại

- `useLessonFlow()`:
  - load lesson theo `lessonId`
  - lưu `currentIndex`, `selectedAnswer`, `isChecked`, `resultType`
  - giảm `hearts` khi trả lời sai
  - tính `progressPercent`
  - khi hết câu hoặc hết heart thì finalize lesson
  - render summary gồm `xpEarned`, `accuracyPercent`, `elapsedSeconds`
- `HeaderBar`: hiển thị modal xác nhận thoát
- `FooterAction`: có 2 state:
  - chưa kiểm tra: hiển thị nút `KIỂM TRA`
  - đã kiểm tra: hiển thị feedback + nút `TIẾP TỤC`

### 3.4 API tương lai cho lesson feature

- `GET /api/app/lesson/{id}`
  - trả về lesson data theo ID
  - fields gợi ý: `id`, `title`, `category`, `difficulty`, `xpReward`, `totalHearts`, `estimatedMinutes`, `questions[]`
- `POST /api/app/user-lesson/submit-result`
  - gửi thông tin cuối bài: `lessonId`, `correctAnswers`, `totalQuestions`, `xpEarned`, `heartsLeft`, `accuracyPercent`, `elapsedSeconds`
  - response mock tương ứng: `success`, `xpEarned`, `accuracyPercent`, `lessonsCompleted`, `streakUpdated`

### 3.5 Kết nối với dashboard

- Lesson node từ roadmap khi click vào một lesson unlocked sẽ điều hướng theo dạng:
  - `/lesson/lesson-1`
  - `/lesson/lesson-2`
- Sau khi hoàn tất, flow sẽ quay về `/dashboard`
- Đây là luồng user-learning hoàn chỉnh dựa trên mock-first architecture, dễ thay bằng API thật sau này mà không phải sửa UI nhiều

### 3.6 Phase 2.3 - Sentence exercise types & spaced repetition (Backend-standard)

- Mục tiêu: chuẩn hóa lesson flow với dữ liệu backend ABP theo đúng contract của `SentenceExerciseAppService` và phần từ vựng / ôn ngầm.
- Dạng bài tập chuẩn theo backend hiện đã đồng bộ trong frontend:
  - `WordOrder`: ghép câu xáo trộn (`exerciseType: "WordOrder"`)
  - `FillInBlank`: điền từ vào chỗ trống (`exerciseType: "FillInBlank"`)
  - `AnswerQuestion`: trả lời tự do với `promptText` (`exerciseType: "AnswerQuestion"`)
  - `TranslateFromVietnamese`: dịch câu tiếng Việt sang tiếng Anh (`exerciseType: "TranslateFromVietnamese"`)
  - `MatchingGame`: phần ôn ngầm Spaced Repetition ở cuối bài
- DTO chuẩn đã cập nhật trong `lesson/types/lesson.ts`:
  - `SentenceExerciseDto` với các field:
    - `id`, `lessonId`, `sectionType`, `correctSentence`, `audioUrl?`, `exerciseType`, `promptText?`, `vietnameseTranslation?`
  - `VocabularyDto` với các field:
    - `id`, `lessonId`, `word`, `meaning`, `imageUrl?`, `audioUrl?`, `distractor?`
  - `LessonDto` có thêm `vocabulary: VocabularyDto[]` để mock chuẩn ~7 từ / lesson
- Components đã cập nhật theo chuẩn backend:
  - `WordOrderExercise.tsx`: render câu ghép từ theo dữ liệu `correctSentence` / `wordBank`
  - `FillInBlankExercise.tsx`: render dạng điền từ với `questionText` chứa chỗ trống
  - `AnswerQuestionExercise.tsx`: render dựa trên `promptText` (câu hỏi để user trả lời)
  - `TranslateExercise.tsx`: render dựa trên `vietnameseTranslation` để dịch sang tiếng Anh
  - `MatchingGameExercise.tsx`: render phần ôn ngầm Spaced Repetition cuối bài
- `LessonScreen.tsx` render theo `switch` với các case:
  - `WordOrder`
  - `FillInBlank`
  - `AnswerQuestion`
  - `TranslateFromVietnamese`
  - `MatchingGame`
- Mock data trong `mockLessonData.ts` đã được cập nhật để khớp kiểu dữ liệu backend chuẩn, gồm ~7 từ vựng mỗi lesson và 4 dạng sentence exercise + phần matching game ở cuối bài.
- API chuẩn tương ứng cần dùng khi có backend thật:
  - `GET /api/app/sentence-exercise`
    - trả về `SentenceExerciseDto[]` theo lessonId / sectionType
  - `GET /api/app/vocabulary`
    - trả về `VocabularyDto[]` theo lessonId hoặc bộ từ ôn ngầm
  - `GET /api/app/matching-game`
    - trả về dữ liệu ghép từ / game review cho phần Spaced Repetition
- Flow tích hợp khuyến nghị:
  - FE load lesson -> `lessonService.getLessonById(lessonId)`
  - `sentence-exercise` dùng `exerciseType` để render đúng component
  - `vocabulary` dùng cho bộ từ vựng và ôn ngầm
  - `matching-game` dùng cho game ghép từ ở cuối lesson

---

## 4. Mock service mapping gợi ý cho tương lai

### 3.1 Authentication

- Service: `AuthService`
- Methods:
  - `login(email, password)`
  - `register(payload)`
  - `logout()`
  - `getCurrentUser()`
  - `refreshSession()`

### 3.2 Roadmap

- Service: `RoadmapService`
- Methods:
  - `getLevels()`
  - `getLevelById(levelId)`
  - `getChapters(levelId)`
  - `getLessons(chapterId)`
  - `markLessonCompleted(lessonId)`
  - `unlockLesson(lessonId)`

### 3.3 Daily quest

- Service: `DailyQuestService`
- Methods:
  - `getTodayQuest()`
  - `getQuestProgress()`
  - `completeQuest(questId)`
  - `claimReward(questId)`

### 3.4 User stats / profile

- Service: `UserStatsService`
- Methods:
  - `getDashboardStats()`
  - `getCurrentProfile()`
  - `getStreakSummary()`

---

## 4. Từ mock hiện tại sang backend thật

### 4.1 Thiết kế service chuẩn nên dùng

Mỗi feature nên có 3 phần:

- `types/*.ts`: DTO/response contract
- `services/*.ts`: call API, map data
- `hooks/*.ts`: UI state + domain logic

Ví dụ chuẩn:

- `src/features/frontend/auth/services/authService.ts`
- `src/features/frontend/dashboard/services/roadmapService.ts`
- `src/features/frontend/dashboard/services/dailyQuestService.ts`
- `src/features/frontend/profile/services/userStatsService.ts`

### 4.2 Cách thay mock hiện tại

- Tạm thời: mock file còn tồn tại để test UI
- Khi backend sẵn sàng: chỉ thay nội dung trong `service` mà không chạm UI component
- UI component nên không gọi mock trực tiếp; nên gọi hook → service
- Điều này giúp dễ switch từ mock sang real API mà không phá UI

---

## 5. Những phần nên ưu tiên gọi API thật tiếp theo

### Ưu tiên cao

- Auth login/register/logout/current user
- Roadmap levels & chapters & lessons
- User dashboard stats

### Ưu tiên trung bình

- Daily quest progress/reward claim
- Streak logic
- XP tracking

### Ưu tiên thấp / có thể delay

- Landing page marketing content
- Feature highlights
- Static banner copy

---

## 6. File chính đã tạo / đang dùng

### Auth

- `frontend/src/mock/mockAuth.ts`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/types/auth.ts`

### Dashboard

- `frontend/src/features/frontend/dashboard/mock/mockRoadmapData.ts`
- `frontend/src/features/frontend/dashboard/services/roadmapService.ts`
- `frontend/src/features/frontend/dashboard/hooks/useRoadmap.ts`
- `frontend/src/features/frontend/dashboard/components/DashboardRoadmap.tsx`
- `frontend/src/features/frontend/dashboard/components/RoadmapTree.tsx`
- `frontend/src/features/frontend/dashboard/components/ChapterCard.tsx`
- `frontend/src/features/frontend/dashboard/components/DailyQuestWidget.tsx`
- `frontend/src/features/frontend/dashboard/components/HeaderStats.tsx`

### Landing page

- `frontend/src/app/page.tsx`
- `frontend/src/components/layout/AppHeader.tsx`
- `frontend/src/app/layout.tsx`

---

## 7. Kết luận

User-facing phần hiện tại đã có 3 luồng chính đang hoạt động mock tốt:

1. Landing page marketing
2. Auth login/register/logout
3. Dashboard roadmap + daily quest + stats

Trong tương lai, khi backend đã có API thật, cần thay thế mock theo hướng:

- `service layer` thay logic mock bằng HTTP client
- `hook` giữ UI state
- component UI không cần sửa nhiều

Đây là cách tốt nhất để giữ UI stable và dễ tích hợp ABP / backend thật sau này.

---

## 8. Phase 2.4 - Cấu trúc 1 lesson chuẩn 3 phần (không checkpoint)

### 8.1 Mục tiêu thiết kế

Luồng học mỗi lesson đã được chuẩn hóa thành 3 phần rõ ràng, không dùng checkpoint trung gian nữa:

1. Part 1: Vocabulary introduction
2. Part 2: Grammar practice
3. Part 3: Comprehensive review / spaced repetition

Điểm khác biệt so với mô hình cũ là: người dùng sẽ học theo đúng flow giáo dục, từ vựng -> ngữ pháp -> ôn tập tổng hợp, thay vì xếp một chuỗi câu hỏi phẳng và không có nhánh nội dung rõ ràng.

### 8.2 Part 1 - Vocabulary

- Mục tiêu: giới thiệu ~7 từ vựng mới của lesson
- Hiển thị: danh sách vocabulary card có từ, nghĩa, TTS, quick recall
- UI hiện có:
  - `VocabIntroCard.tsx`
  - mỗi item có `word`, `meaning`, `audioUrl`, `distractor`
- Interaction:
  - click vào từ để chọn active word
  - bấm `🔊 TTS` để nghe phát âm
  - quick recognition quiz để chọn nghĩa đúng
- Chuyển phần:
  - bấm `BẮT ĐẦU PHẦN 2 · GRAMMAR`

### 8.3 Part 2 - Grammar

- Mục tiêu: luyện dạng câu/structure tiếng Anh theo các sentence exercise
- Các dạng bài tập hiện hỗ trợ:
  - `WordOrder`
  - `FillInBlank`
  - `AnswerQuestion`
  - `TranslateFromVietnamese`
- Flow hiện tại:
  - `useLessonFlow()` tách `grammarQuestions` và `comprehensiveQuestions`
  - `currentPart === "grammar"` render question theo từng câu hỏi
  - khi hoàn tất phần này, tự động chuyển sang phần 3
- Dữ liệu tuân theo chuẩn backend:
  - `sectionType === 1`
  - `exerciseType` map vào đúng component renderer

### 8.4 Part 3 - Comprehensive review / Matching Game

- Mục tiêu: ôn ngắn gọn bằng bài tập tổng hợp và game ghép từ
- Các câu hỏi trong phần này được xáo trộn theo logic `shuffleItems()` để đảm bảo trải nghiệm ôn tập linh hoạt
- Dạng phần này gồm:
  - review question
  - matching pair game
  - spaced repetition style learning
- UI hiện có:
  - `MatchingGameExercise.tsx`
  - `LessonScreen.tsx` switch phần `comprehensive`
- Khi hoàn tất phần này, hệ thống finalize bài học -> hiển thị `CompleteScreen` với XP / độ chính xác / thời gian

### 8.5 API backend dự kiến tương ứng

Dựa theo Thỏa thuận contract ABP hiện có, FE nên chuẩn hóa mapping như sau:

- `GET /api/app/vocabulary/by-lesson`
  - trả về danh sách từ vựng thuộc lesson
  - dùng để render `VocabIntroCard` và vocabulary section
- `GET /api/app/sentence-exercise/by-lesson`
  - trả về hàng loạt câu hỏi thuộc lesson
  - dùng để render phần Grammar và Comprehensive review theo `exerciseType` + `sectionType`
- `GET /api/app/user-lesson-review/due-reviews`
  - trả về những review cần ôn tập theo spaced repetition / matching review
  - dùng cho phần 3 `comprehensive`

### 8.6 Mô hình dữ liệu đã normalize cho lesson

- `VocabularyDto`
  - `id`, `lessonId`, `word`, `meaning`, `imageUrl?`, `audioUrl?`, `distractor?`
- `SentenceExerciseDto`
  - `id`, `lessonId`, `sectionType`, `correctSentence`, `audioUrl?`, `exerciseType`, `promptText?`, `vietnameseTranslation?`
- `LessonDto`
  - `vocabulary: VocabularyDto[]`
  - `questions: LessonQuestion[]`
  - `totalHearts`, `xpReward`, `estimatedMinutes`

### 8.7 Kết luận phần 2.4

Flow lesson hiện tại đã được chuẩn hóa đúng theo mô hình 3 phần và phù hợp với mục tiêu học tập của user:

- Học từ vựng trước
- Luyện ngữ pháp sau
- Ôn tổng hợp ở cuối

Đây là cấu trúc đơn giản, dễ hiểu, dễ mở rộng và có thể chuyển thẳng sang backend ABP mà không cần sửa nhiều UI.

---
