import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text ?? "";

    // naive mock grading
    const lengthScore = Math.min(100, Math.round((text.length / 200) * 100));
    const score = Math.max(30, Math.round((lengthScore + 80) / 2));

    const aiFeedback = {
      band: score >= 80 ? "B2" : "B1",
      score,
      errors: [],
      improvedText: text + (text ? "" : " (no content)") + "",
      suggestion: "Focus on coherence and add more details.",
    };

    return NextResponse.json({ aiFeedback });
  } catch (e) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
