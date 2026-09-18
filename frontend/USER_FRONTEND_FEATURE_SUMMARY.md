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

## 9. Phase 3 - Module Checkpoint cuối Chapter, Bài Luyện Nghe & AI Gemini chấm Writing

Thêm các components và route mới để hỗ trợ bài Checkpoint cuối Chapter gồm Listening + AI Writing:

- `ListeningExercise` (frontend/src/features/frontend/lesson/components/exercises/ListeningExercise.tsx)
  - Dạng: nghe audio, chọn đáp án hoặc gõ lại câu nghe được.
  - Dùng HTML5 Audio API để phát audio; hỗ trợ options hoặc input text.

- `CheckpointWritingExercise` (frontend/src/features/frontend/lesson/components/exercises/CheckpointWritingExercise.tsx)
  - Dạng: ô nhập bài viết theo `WritingTopicDto` (hiển thị `promptTitle`, `promptText`).
  - Nút `GỬI AI CHẤM BÀI` gửi `POST /api/app/user-writing/submit` và hiển thị `AiFeedbackCard`.

- `AiFeedbackCard` (frontend/src/features/frontend/lesson/components/AiFeedbackCard.tsx)

## 10. Phase 4 - Spaced Repetition Hub & Game Hub (NEW)

### 10.1 Spaced Repetition Hub

- Route: `src/app/(main)/review/page.tsx`
- Mục tiêu: cung cấp "hub" để người dùng xem số lượng từ / bài học đến hạn ôn tập, và bắt đầu các flow ôn tập (Flashcard / Quiz).
- FE implementation summary:
  - Server-side page fetches: `GET /api/app/user-lesson-review/due-reviews` (uses `fetch(..., { cache: 'no-store' })`).
  - Shows count of due items and a small preview list.
  - `ReviewStartButton` client component (`frontend/src/components/ReviewStartButton.tsx`) provides actions: "Start Flashcard Review" and "Start Quiz". These can route to dedicated review flows (`/review/flashcards`, `/review/quiz`) to be implemented later or integrated with existing lesson flows.

### 10.2 Game Hub - Matching Game

- Route: `src/app/(main)/games/page.tsx`
- Mục tiêu: mini-game để củng cố từ vựng (Matching Game) và thưởng XP khi thắng.
- FE implementation summary:
  - `MatchingGameClient` (`frontend/src/components/MatchingGameClient.tsx`) is a client-side React component that:
    - Loads pairs from `GET /api/app/matching-game/data` and prioritizes items returned by the backend (backend should return due/prioritized items when possible).
    - Builds shuffled cards, handles flips, detects matches, tracks score and combo, and enforces a timer.
    - On completion (all pairs matched) it displays a Victory section awarding XP and attempts to call `POST /api/app/user-lesson-review/complete-review` with the reviewed vocabulary ids to mark them complete.

### 10.3 Backend APIs used (add to integration checklist)

- `GET /api/app/user-lesson-review/due-reviews` — returns list of due review items (vocabulary / lesson review entries). Expected response shape: `{ items: [{ id, word, lessonId, nextReviewTime, currentIntervalStage, ... }] }`.
- `POST /api/app/user-lesson-review/complete-review` — accept `{ ids: [] }` to mark reviewed items as completed.
- `GET /api/app/matching-game/data` — returns matching pairs for the game. Expected response shape: `{ items: [{ id, left, right, vocabId? }] }`.

### 10.4 Notes & next steps

- The pages added are minimal, focused on connecting to the ABP endpoints and providing a working Matching Game UI. They are intentionally small and live in `frontend/src/app/(main)/...` so they follow the current app router structure.
- Next tasks you may want me to implement:
  - Full Flashcard Review and Quiz flows (`/review/flashcards`, `/review/quiz`).
  - Persisting game session results to backend with richer payloads (time, accuracy, earnedXp).
  - Add unit tests and TypeScript DTO files under `src/features/frontend/review/types` and `services` to formalize contracts.

### 10.5 Implemented Flashcard & Quiz flows (Phase 4 - additions)

- Routes:
  - `src/app/(main)/review/flashcards/page.tsx` — Flashcard review flow (client component: `frontend/src/components/FlashcardReviewClient.tsx`).
  - `src/app/(main)/review/quiz/page.tsx` — Quiz review flow (client component: `frontend/src/components/QuizReviewClient.tsx`).
- Entry points:
  - Header dropdown updated: `frontend/src/components/layout/AppHeader.tsx` now includes quick links to `Spaced Repetition Hub` and `Game Hub` for authenticated users.
- Flashcard flow details:
  - Loads items from `GET /api/app/user-lesson-review/due-reviews`.
  - Shows one card at a time (word + reveal meaning), supports "I remember" action which advances to next card.
  - On finish calls `POST /api/app/user-lesson-review/complete-review` with reviewed ids.
- Quiz flow details:
  - Loads due items and maps to simple multiple-choice questions (uses `word`, `meaning`, and optional `distractors` from backend if available).
  - Tracks score and completed count; on finish calls `POST /api/app/user-lesson-review/complete-review`.

  - Hiển thị Band, score, danh sách lỗi ngữ pháp (original + suggestion) và improvedText.

Additional implementation details (Phase 3 extras):

- Files added in Phase 3:
  - `frontend/src/features/frontend/lesson/components/exercises/ListeningExercise.tsx` — listening task UI (audio play + answer input/options).
  - `frontend/src/features/frontend/lesson/components/exercises/CheckpointWritingExercise.tsx` — writing prompt + submit flow to AI grader.
  - `frontend/src/features/frontend/lesson/components/AiFeedbackCard.tsx` — AI feedback presenter.
  - `frontend/src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx` — checkpoint orchestration page (hearts, tasks, pass rule, unlock flow).

- Local mock API routes added for easier local testing (can be swapped with real backend later):
  - `GET /api/app/writing-topic/by-chapter` -> `src/app/api/app/writing-topic/by-chapter/route.ts`
  - `GET /api/app/listening/by-chapter` -> `src/app/api/app/listening/by-chapter/route.ts`
  - `POST /api/app/user-writing/submit` -> `src/app/api/app/user-writing/submit/route.ts` (returns `aiFeedback`)
  - `POST /api/app/chapter/{id}/unlock-checkpoint` -> `src/app/api/app/chapter/[id]/unlock-checkpoint/route.ts`

- Dashboard integration:
  - `frontend/src/features/frontend/dashboard/components/ChapterCard.tsx` was updated to expose two action links directly on each chapter card:
    - `Mở Lesson` -> navigates to the first lesson: `/lesson/{lessonId}`
    - `Checkpoint` -> navigates to `/lesson/checkpoint/{chapterId}`

- Checkpoint behavior summary:
  - Default `3` hearts, a mix of tasks (listening + writing + one additional task), simple scoring where passing requires ≥80%.
  - On pass, frontend calls `POST /api/app/chapter/{id}/unlock-checkpoint` then redirects to `/dashboard`.

- Notes and next steps for Phase 3:
  - Improve orchestration: shuffle questions, persist progress, show failure modal + retry flow.
  - Replace mock API routes with backend ABP endpoints when available and map the returned `AiFeedbackJson` to `AiFeedbackCard`.

Route mới:

- `src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx`
  - Màn Checkpoint tải `GET /api/app/writing-topic/by-chapter?chapterId={id}` và `GET /api/app/listening/by-chapter?chapterId={id}` (fallback mock nếu không có API).
  - Bài Checkpoint có 3 hearts mặc định và 3 task (listening + writing + plus one internal task). Pass nếu đạt ≥80%.
  - Khi pass, frontend gọi `POST /api/app/chapter/{id}/unlock-checkpoint` để mở khóa chapter tiếp theo và điều hướng về dashboard.

API backend ABP tương ứng (đề xuất):

- `GET /api/app/writing-topic/by-chapter` — Lấy đề bài viết theo chapter
- `POST /api/app/user-writing/submit` — Nộp bài viết và nhận `AiFeedbackJson` trả về từ GeminiGradingService
- `POST /api/app/chapter/{id}/unlock-checkpoint` — Mở khóa chapter trên server

Các file mới đã thêm vào codebase và đã được kiểm tra TypeScript/VSCode diagnostics (không có lỗi trong các file mới).

### 10.6 Fix mock-first cho Phase 4 (Review Hub & Game Hub)

- Phát hiện lỗi: `reviewService.ts` và `matchingGameService.ts` (Phase 4) đang code thẳng `fetch()` gọi API thật (`/api/app/user-lesson-review/due-reviews`, `/api/app/matching-game/data`), khác với pattern mock-first mà các feature khác (Auth, Lesson) đang tuân theo → gây lỗi `Failed to parse URL` khi backend chưa chạy/chưa đúng URL.
- Đã sửa lại cả 2 service theo đúng chuẩn mock-first:
  - Thêm file `src/features/frontend/review/mock/mockReviewData.ts` — chứa `mockDueReviews` (5 items, đúng field `DueReviewItem`: word, meaning, exampleSentence, lessonId, lessonTitle, nextReviewTime, currentIntervalStage, intervalDays, easeFactor, vocabId, distractors) và `mockMatchingPairs` (5 pairs, đúng field `MatchingPairDto`).
  - `reviewService.ts`: thêm flag `USE_MOCK = true` ở đầu file — `getDueReviews()` và `completeReview()` trả mock data (có delay giả lập `setTimeout`) khi `USE_MOCK = true`, giữ nguyên code gọi API thật bên dưới để chỉ cần đổi `USE_MOCK = false` khi backend sẵn sàng, không cần sửa UI/hook.
  - `matchingGameService.ts`: áp dụng cùng pattern `USE_MOCK` cho `getMatchingData()`.
- Function signature giữ nguyên hoàn toàn → `review/page.tsx`, `games/page.tsx`, `FlashcardReviewClient.tsx`, `QuizReviewClient.tsx`, `MatchingGameClient.tsx` không cần sửa gì.

### 10.7 Quick-action Review/Games trên Dashboard header

- Thêm 2 nút quick-action (Ôn tập → `/review`, Mini Games → `/games`) vào `HeaderStats.tsx` (dashboard header), đặt giữa progress bar và hàng stats (Completed/Streak/XP).
- Dùng `next/link` + icon `BookOpenCheck`/`Gamepad2` từ `lucide-react`, style theo đúng tông gradient/glass (`bg-white/10 backdrop-blur-sm`) đã có sẵn trong component.

## 11. Phase 5 (PHASE CUỐI CÙNG) - Profile, Leaderboard & Navigation Integration

### 11.1 Màn Profile

- Route: `src/app/(main)/profile/page.tsx` (Server Component, fetch song song profile + achievements + learning stats weekly/monthly)
- Hiển thị: Avatar (initial letter), tên (`fullName ?? userName`, fallback cho trường hợp IdentityUser chưa điền Name/Surname), Streak, Total XP, Gems.
- Danh sách Achievements/Badges dạng grid card, mỗi item có progress bar (`progressCurrent/progressTarget`) và trạng thái `isUnlocked`.
- Bảng thống kê học tập (bar chart CSS thuần, không dùng lib chart) với tab chuyển đổi Tuần/Tháng — xử lý client-side qua component con `LearningStatsTabs.tsx`, không gọi lại API khi đổi tab (data cả 2 period đã fetch sẵn ở server).
- Files:
  - `frontend/src/features/frontend/profile/types/profile.ts` — `UserProfileDto` (có `userName`/`fullName` optional dựa theo IdentityUser), `AchievementDto`, `LearningStatEntryDto`, `LearningStatsDto`
  - `frontend/src/features/frontend/profile/mock/mockProfileData.ts`
  - `frontend/src/features/frontend/profile/services/profileService.ts` — `getUserProfile()`, `getUserAchievements()`, `getLearningStats(period)`
  - `frontend/src/features/frontend/profile/components/LearningStatsTabs.tsx` (Client Component)
  - `frontend/src/app/(main)/profile/page.tsx`

### 11.2 Màn Leaderboard (bản đơn giản, chưa có backend thật - chỉ mock)

- Route: `src/app/(main)/leaderboard/page.tsx` (Server Component, fetch song song weekly + friends)
- Bản tối giản theo yêu cầu: chỉ hiển thị 1 division cố định (chưa có bảng division thật trong DB), có Top 1-3 dạng podium + Crown cho hạng 1, danh sách rank còn lại có highlight vị trí user hiện tại (`isCurrentUser`).
- Tab chuyển đổi "Bảng xếp hạng Tuần" / "Bạn bè" xử lý client-side qua `LeaderboardTabs.tsx`, không gọi lại API khi đổi tab.
- Type đã có sẵn `LeaderboardDivision` (Bronze/Silver/Gold/Diamond) dù UI hiện chỉ dùng 1 division — chuẩn bị sẵn cho việc mở rộng sau này khi có bảng division thật trong DB.
- Files:
  - `frontend/src/features/frontend/leaderboard/types/leaderboard.ts` — `LeaderboardDivision`, `LeaderboardScope`, `LeaderboardEntryDto`, `LeaderboardResultDto`
  - `frontend/src/features/frontend/leaderboard/mock/mockLeaderboardData.ts`
  - `frontend/src/features/frontend/leaderboard/services/leaderboardService.ts` — `getLeaderboard(scope)`
  - `frontend/src/features/frontend/leaderboard/components/LeaderboardTabs.tsx` (Client Component)
  - `frontend/src/app/(main)/leaderboard/page.tsx`

### 11.3 Navigation Integration

- `AppHeader.tsx`: thêm hàng nav icon chính (desktop, `md:flex`) với 5 route — Dashboard/Review/Games/Leaderboard/Profile, có active state theo `usePathname()`. Dropdown avatar được dọn lại chỉ còn "Hồ sơ của tôi", "Trang quản trị", "Đăng xuất" (bỏ Review/Games ra khỏi dropdown vì đã có ở nav chính, tránh trùng lặp).
- `BottomNav.tsx` (mới) — thanh nav cố định đáy màn hình, chỉ hiện trên mobile (`md:hidden`), cùng 5 route, tự ẩn khi chưa đăng nhập (tự gọi `useAuth()` nội bộ, không cần `MainLayout` truyền props xuống).
- `MainLayout.tsx` (`src/app/(main)/layout.tsx`): gắn `BottomNav`, thêm `pb-24 md:pb-6` cho `<main>` để nội dung không bị `BottomNav` che trên mobile.
- `HeaderStats.tsx` (dashboard widget): đã có sẵn link Review/Games từ Phase 4, Phase 5 thêm link Profile — grid 3 quick-action (Ôn tập / Mini Games / Hồ sơ) nằm giữa progress bar và hàng stats.

### 11.4 Xác nhận hoàn tất

- Đã hoàn tất 100% cả 5 Phase giao diện Frontend (Landing/Auth/Dashboard → Lesson learning flow → Checkpoint/Listening/Writing AI → Spaced Repetition Hub/Game Hub → Profile/Leaderboard/Navigation).
- Toàn bộ mock-first architecture xuyên suốt các feature (Auth, Lesson, Review, Games, Profile, Leaderboard) đều theo cùng 1 pattern: `types/` + `mock/` + `services/` (flag `USE_MOCK`) + `hooks/` hoặc trực tiếp Server Component fetch + `components/`.

### 11.5 API ABP Backend dự kiến cho Phase 5

- `GET /api/app/user-profile/me` — trả `UserProfileDto` (userName, fullName ghép từ IdentityUser.Surname+Name, currentStreak, totalXp, gems, level...)
- `GET /api/app/user-profile/learning-stats?period=weekly|monthly` — trả `LearningStatsDto`
- `GET /api/app/achievement/user-achievements` — trả danh sách `AchievementDto` kèm tiến độ
- `GET /api/app/leaderboard/weekly` — trả `LeaderboardResultDto` (scope=weekly)
- `GET /api/app/leaderboard/friends` — trả `LeaderboardResultDto` (scope=friends) — cần bảng/quan hệ Friend riêng, hiện DB chưa có, để dành phát triển sau

## 12. Tính năng bổ sung sau Phase 5 - GrammarTopic (Chủ điểm ngữ pháp theo Lesson)

### 12.1 Bối cảnh & quyết định thiết kế

- Nhu cầu: khi vào Part 2 (Grammar) của 1 Lesson, hiển thị banner "Hôm nay học: {chủ điểm}" thay vì nhảy thẳng vào câu hỏi không có ngữ cảnh.
- Quyết định: thêm 1 field `GrammarTopic` (nullable string) vào **Entity `Lesson`** (không tạo bảng mới) — vì mỗi Lesson chỉ dạy 1 chủ điểm ngữ pháp cố định (đúng nguyên tắc "Ngữ pháp tính theo Lesson" đã chốt trước đó), tránh lặp lại trên từng `SentenceExercise`.
- Quyết định liên quan: xác nhận **Word Pattern/Word Formation không cần lưu vào bảng `Vocabulary`** — chỉ xuất hiện trực tiếp trong text của `SentenceExercise`, không cần nghĩa/ảnh/audio riêng, không vào Spaced Repetition.

### 12.2 Backend (đã hoàn tất)

- `Lesson.cs`: thêm property `GrammarTopic` (nullable string), constructor thêm tham số optional `grammarTopic = null` (không phá code cũ đang gọi constructor).
- `LessonDto.cs` / `CreateUpdateLessonDto.cs`: thêm field `GrammarTopic`.
- AutoMapper Profile: không cần sửa (map tự động theo tên field trùng nhau, không có `.ForMember().Ignore()` cho Lesson).
- `LessonAppService.cs`: không cần sửa (dùng `ObjectMapper.Map()` thuần cho mọi method).
- Việc cần làm thủ công: chạy `dotnet ef migrations add AddGrammarTopicToLesson` + `dotnet ef database update`.

### 12.3 Admin CMS (đã hoàn tất, dùng mock)

- `features/admin/lessons/types/lesson.ts`: thêm `grammarTopic?: string` vào `LessonDto` và `CreateUpdateLessonDto`.
- `features/admin/lessons/services/lessonService.ts`: thêm data mẫu có `grammarTopic` cho lesson mock.
- `features/admin/lessons/hooks/useAdminLessons.ts`: thêm state `grammarTopic`/`setGrammarTopic`, đưa vào `openCreateModal`/`openEditModal`/`closeModal`/`handleSubmit` (gửi `undefined` nếu rỗng thay vì chuỗi trống).
- `features/admin/lessons/components/LessonModal.tsx`: thêm input `Chủ điểm ngữ pháp` — chỉ hiện khi `LessonType` là `Grammar` hoặc `Combined` (ẩn khi `Vocabulary`).
- `features/admin/lessons/components/LessonTable.tsx`: thêm cột "Chủ điểm ngữ pháp" trong bảng, truncate nếu dài, hiển thị "—" nếu rỗng.
- `app/admin/lessons/page.tsx`: thêm `grammarTopic`/`setGrammarTopic` vào destructure từ hook và truyền prop xuống `<LessonModal />`.

### 12.4 Client (đã hoàn tất, dùng mock)

- `features/frontend/lesson/types/lesson.ts`: thêm `grammarTopic?: string` vào `LessonDto`.
- `features/frontend/lesson/mock/mockLessonData.ts`: thêm `grammarTopic` cho `lesson-1` ("Present Simple") và `lesson-2` ("Present Simple với trạng từ tần suất").
- `features/frontend/lesson/components/LessonScreen.tsx`: trong `renderBody()`, chèn banner "📘 Hôm nay học: {lesson.grammarTopic}" ngay trước phần hiển thị số câu/thời gian, chỉ hiện khi `currentPart === "grammar"` và `lesson.grammarTopic` có giá trị.
- `features/frontend/lesson/hooks/useLessonFlow.ts`: không cần sửa (field tự động đi theo object `lesson` trả về nguyên vẹn từ `lessonService.getLessonById()`).

### 12.5 API ABP Backend cần lưu ý khi tích hợp thật

- `GET /api/app/lesson/{id}` và `GET /api/app/lesson/by-chapter` (route thật theo Conventional Controller: `/api/app/lesson/{id}`, `/api/app/lesson/list-by-chapter?chapterId={id}`) — response giờ cần có thêm field `grammarTopic` (camelCase khi trả JSON) để FE nhận đúng.
- Khi nối API thật, nhớ kiểm tra Admin CMS `lessonService.ts` (đang 100% mock) đổi sang gọi `POST /api/app/lesson`, `PUT /api/app/lesson/{id}` — payload `CreateUpdateLessonDto` đã có sẵn field `grammarTopic`, không cần sửa gì thêm ở tầng payload.

## 13. Phase 6 - Client Listening nâng cấp

### 13.1 Mục tiêu

- Tách luồng Listening thành 2 nhánh rõ ràng:
  - Dialogue Exercise dùng lại `SentenceExercise` trong Lesson flow.
  - Passage Listening dùng API riêng cho checkpoint chapter.
- Giữ nguyên mock-first pattern trong FE, không làm ảnh hưởng các bài `WordOrder` / `FillInBlank` / `AnswerQuestion` / `MatchingGame` đang ổn định.

### 13.2 File đã thêm / cập nhật

- `frontend/src/features/frontend/lesson/components/exercises/DialogueListenExercise.tsx` — render nhóm `SentenceExercise` cùng `DialogueGroupId`, xử lý `ListenChoose` và `TranslateFromVietnamese` theo từng lượt.
- `frontend/src/features/frontend/lesson/components/exercises/PassageListeningExercise.tsx` — render bài nghe đoạn dài theo shape `ListeningPassageClientDto`, chấm `MultipleChoice` và `Essay` riêng.
- `frontend/src/features/frontend/lesson/components/exercises/ListeningExercise.tsx` — file cũ được thay sang nhánh passage mới.
- `frontend/src/features/frontend/lesson/components/AiFeedbackCard.tsx` — dùng chung `AiFeedbackDto` cho bài essay nghe đoạn dài.
- `frontend/src/features/frontend/lesson/types/lesson.ts` — thêm `ListenChoose`, `DialogueGroupId`, `OrderInGroup`, `ListenOptions`, `ListeningPassageClientDto`, `AiFeedbackDto` và các DTO submit mới.
- `frontend/src/features/frontend/lesson/services/lessonService.ts` — thêm `getPassageByChapter(chapterId)`, `submitMultipleChoice(input)`, `submitEssay(input)` theo `USE_MOCK`.
- `frontend/src/features/frontend/lesson/components/LessonScreen.tsx` — gom nhóm các câu cùng `DialogueGroupId` và render qua `DialogueListenExercise`.
- `frontend/src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx` — đổi sang `PassageListeningExercise` cho checkpoint Listening.
- `frontend/src/features/frontend/lesson/mock/mockLessonData.ts` — thêm mock dialogue group để Lesson flow có dữ liệu demo.

### 13.3 Ghi chú kiến trúc

- `ListenChoose` dùng `ListenOptions` đã được xáo trộn sẵn từ backend, FE chỉ chọn và chấm theo kết quả mock/service.
- Dialogue flow tự chuyển sang lượt kế tiếp khi đúng, và khi hết nhóm sẽ hiển thị trạng thái hoàn thành đoạn hội thoại.
- Passage Listening ở checkpoint không dùng transcript và không lộ đáp án từ payload trả về.
- `ListeningExercise.tsx` cũ đã được thay bằng `DialogueListenExercise.tsx` + `PassageListeningExercise.tsx` để tách rõ 2 use case.

## 13. Phase 6 - Admin CMS Listening

### 13.1 Mục tiêu

- Bổ sung màn quản lý Listening Passage cho Admin CMS theo mock-first architecture.
- 1 Chapter chỉ có 1 Listening Passage.
- Hỗ trợ 2 loại câu hỏi: `MultipleChoice` và `Essay`.
- Hỗ trợ sinh audio mock từ transcript ngay trong modal.

### 13.2 Files đã tạo / cập nhật

- `frontend/src/app/admin/listening/page.tsx`
- `frontend/src/features/admin/listening/types/listening.ts`
- `frontend/src/features/admin/listening/mock/mockListeningData.ts`
- `frontend/src/features/admin/listening/services/listeningService.ts`
- `frontend/src/features/admin/listening/hooks/useAdminListening.ts`
- `frontend/src/features/admin/listening/components/ListeningPassageTable.tsx`
- `frontend/src/features/admin/listening/components/ListeningPassageModal.tsx`
- `frontend/src/features/admin/listening/components/ListeningHeader.tsx` — tiêu đề + CTA theo style mẫu `ChapterHeader.tsx`.
- `frontend/src/features/admin/listening/components/ListeningFilterBar.tsx` — dropdown chọn Chapter theo style mẫu `ChapterFilterBar.tsx`.
- `frontend/src/app/admin/layout.tsx` — thêm menu `Quản lý Listening` vào sidebar Admin.
- `frontend/src/features/admin/sentence-exercises/types/sentence-exercise.ts` — thêm `ExerciseType.ListenChoose` và metadata dialogue.
- `frontend/src/features/admin/sentence-exercises/services/sentenceExerciseService.ts` — mock data + validation + grouping metadata cho `ListenChoose`.
- `frontend/src/features/admin/sentence-exercises/components/SentenceExerciseModal.tsx` — thêm UI nhập `DistractorSentence`, `DialogueGroupId`, `OrderInGroup`.
- `frontend/src/features/admin/sentence-exercises/components/SentenceExerciseTable.tsx` — group hiển thị theo `DialogueGroupId` để đọc hội thoại A-B-A-B dễ hơn.

### 13.3 Ghi chú triển khai

- Listening dùng `USE_MOCK = true`, service đã có hàm sinh URL audio mock từ transcript.
- Trang Listening đã được tách thành Header / FilterBar / Table / Modal đúng pattern admin chapters, trong đó FilterBar chọn theo Chapter.
- Modal Listening có sub-form nhiều câu hỏi, tự re-index `OrderIndex` khi thêm/xoá câu.
- Sentence Exercise đã có thêm một dạng `ListenChoose` để chuẩn bị cho dialogue nghe-chọn của backend ABP.

## 14. Checkpoint Audit (cập nhật mới)

### 14.1 Cập nhật UI mới nhất

- Trang Checkpoint đã có toggle chọn 2 mode Listening:
  - `Đoạn dài` -> render bằng `PassageListeningExercise`
  - `Hội thoại` -> render bằng `DialogueListenExercise`
- Vị trí triển khai: `frontend/src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx`.

### 14.2 Checkpoint hiện tại đang làm gì

- `writing`:
  - Gọi `GET /api/app/writing-topic/by-chapter?chapterId={id}`.
  - Render 1 bài viết qua `CheckpointWritingExercise`.
- `listening`:
  - `Đoạn dài`: gọi `lessonService.getPassageByChapter(chapterId)` (mock-first), rồi chấm từng câu qua service submit mock.
  - `Hội thoại`: đang dùng mảng hằng `checkpointDialogueQuestions` hardcode ngay trong page.
- `pass rule`:
  - Score tăng theo từng câu/listening + writing.
  - Pass khi đạt >=80% và còn heart.
  - Pass thì gọi `POST /api/app/chapter/{id}/unlock-checkpoint`.

### 14.3 So với thiết kế "ôn lại kiến thức từ các lesson trong chapter"

Hiện tại Checkpoint **chưa** ôn toàn bộ kiến thức chapter theo đúng nghĩa tổng hợp từ nhiều lesson, vì:

- Chưa có bước lấy danh sách lesson của chapter rồi hợp nhất câu hỏi từ các lesson đó.
- Mode `Hội thoại` đang là dữ liệu demo hardcode, chưa map theo `chapterId`.
- Chưa có cơ chế sampling/phân tầng nội dung theo lesson (ví dụ: mỗi lesson lấy n câu grammar/listening/writing).
- Chưa có theo dõi coverage kiểu "đã ôn phần nào của chapter".

### 14.4 Kết luận ngắn

- Đúng là hiện tại checkpoint đang thiên về "bài nghe + bài viết AI" (và có thêm hội thoại demo),
  chưa phải là một "chapter review aggregator" đúng thiết kế ban đầu.

## 15. Tách riêng Listening / Writing / Checkpoint (mới)

### 15.1 Mục tiêu tách màn

- Tách hoàn toàn phần học theo chapter thành 3 màn riêng:
  - Listening riêng (vẫn có đủ 2 dạng).
  - Writing AI riêng.
  - Checkpoint riêng, tạm để trống để phát triển sau.

### 15.2 Điều hướng từ Chapter

- File cập nhật: `frontend/src/features/frontend/dashboard/components/ChapterCard.tsx`.
- Nút action hiện tại theo chapter:
  - `Mở Lesson` -> `/lesson/{lessonId}`
  - `Listening` -> `/lesson/listening/{chapterId}`
  - `Writing AI` -> `/lesson/writing/{chapterId}`
  - `Checkpoint` -> `/lesson/checkpoint/{chapterId}`

### 15.3 Route mới / route đã đổi vai trò

- `frontend/src/app/(main)/lesson/listening/[chapterId]/page.tsx`
  - Màn listening riêng.
  - Có toggle 2 mode:
    - `Đoạn dài` -> `PassageListeningExercise`.
    - `Hội thoại` -> `DialogueListenExercise`.
- `frontend/src/app/(main)/lesson/writing/[chapterId]/page.tsx`
  - Màn writing AI riêng, dùng `CheckpointWritingExercise` để nộp và xem feedback.
- `frontend/src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx`
  - Đã đổi thành placeholder tạm trống (không còn chứa listening/writing).

### 15.4 Ghi chú trạng thái

- Listening và Writing đã được bóc tách khỏi Checkpoint đúng theo yêu cầu hiện tại.
- Checkpoint để trống để bạn tiếp tục implement chapter-review aggregator sau.

## 16. Checkpoint Skeleton cho Chapter Review (mới)

### 16.1 Mục tiêu

- Dựng trước khung Checkpoint để bám đúng định hướng "ôn tập kiến thức toàn chapter".
- Chưa bật logic chấm điểm cuối, chỉ hiển thị blueprint + coverage theo lesson.

### 16.2 Triển khai

- File cập nhật: `frontend/src/app/(main)/lesson/checkpoint/[chapterId]/page.tsx`.
- Trang checkpoint hiện tại:
  - Load chapter từ `roadmapService.getRoadmapLevels()` và tìm theo `chapterId`.
  - Hiển thị thống kê nhanh: tổng lesson, đã học, sẵn sàng ôn, tổng số câu hỏi.
  - Render danh sách lesson trong chapter với badge trạng thái (`Đã học` / `Sẵn sàng ôn` / `Chưa mở`).
  - Mỗi lesson có block placeholder coverage `Grammar/Quiz`, `Listening`, `Writing` để gắn aggregator logic sau.
  - Có link nhanh sang 2 màn đã tách riêng:
    - `/lesson/listening/{chapterId}`
    - `/lesson/writing/{chapterId}`

### 16.3 Trạng thái hiện tại

- Checkpoint vẫn chưa chấm pass/fail cuối chapter (đúng theo yêu cầu tạm để sau).
- Nhưng đã có cấu trúc dữ liệu và UI để nối tiếp sang chapter-review aggregator ở bước kế tiếp.
