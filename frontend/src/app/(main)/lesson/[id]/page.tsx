import { LessonScreen } from "@/features/frontend/lesson/components/LessonScreen";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;

  return <LessonScreen lessonId={id} />;
}
