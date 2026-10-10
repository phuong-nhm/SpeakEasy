import QuizReviewClient from "@/components/QuizReviewClient";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { lessonId } = await params;

  return (
    <div style={{ padding: 20 }}>
      <h1>Quiz Review</h1>
      <QuizReviewClient lessonId={lessonId} />
    </div>
  );
}
