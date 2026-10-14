// app/review/quiz/[lessonId]/page.tsx
import QuizReviewClient from "@/components/QuizReviewClient";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { lessonId } = await params;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Review
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Quiz Review
          </h1>
        </div>
        <QuizReviewClient lessonId={lessonId} />
      </div>
    </div>
  );
}
