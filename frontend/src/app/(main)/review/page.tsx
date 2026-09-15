import React from "react";
import ReviewStartButton from "../../../components/ReviewStartButton";
import { getDueReviews } from "@/features/frontend/review/services/reviewService";

export default async function ReviewPage() {
  const due = await getDueReviews();
  const count = Array.isArray(due) ? due.length : 0;

  return (
    <div style={{ padding: 20 }}>
      <h1>Spaced Repetition Hub</h1>
      <p style={{ marginTop: 6 }}>
        You have <strong>{count}</strong> items due for review today.
      </p>
      <ReviewStartButton count={count} />

      <section style={{ marginTop: 28 }}>
        <h2>Due Items (preview)</h2>
        <ul>
          {due.slice(0, 10).map((d) => (
            <li key={d.id}>
              {d.word ?? `Lesson ${d.lessonId}`} • next:{" "}
              {d.nextReviewTime ?? "-"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
