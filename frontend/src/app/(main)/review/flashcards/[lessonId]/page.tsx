import FlashcardReviewClient from "@/components/FlashcardReviewClient";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function FlashcardsPage({ params }: Props) {
  const { lessonId } = await params;

  return (
    <div style={{ padding: 20 }}>
      <h1>Flashcard Review</h1>
      <FlashcardReviewClient lessonId={lessonId} />
    </div>
  );
}
