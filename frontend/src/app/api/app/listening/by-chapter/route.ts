import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") ?? "mock-chapter";

  const items = [
    {
      id: `lt-${chapterId}-1`,
      audioUrl: `/audio/${chapterId}-sample.mp3`,
      prompt: "Listen and type the sentence you hear.",
    },
  ];

  return NextResponse.json(items);
}
