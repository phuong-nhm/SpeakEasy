import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "mock-chapter";

  const topics = [
    {
      id: `wt-${chapterId}-1`,
      chapterId,
      promptTitle: "Describe your last holiday",
      promptText: "Write about where you went and what you did.",
    },
  ];

  return NextResponse.json(topics);
}
