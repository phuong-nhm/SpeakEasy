import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, context: any) {
  const params = context?.params;
  const chapterId =
    (params && (params.id ?? (await params.id?.then?.(() => {})))) ||
    params?.id ||
    "unknown";
  // mock: return success
  return NextResponse.json({ unlocked: true, chapterId });
}
