import { NextResponse, NextRequest } from "next/server";

// 1. Định nghĩa Interface chuẩn cho Route Context
interface RouteContext {
  params: Promise<{
    id?: string;
  }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  // 2. await params một cách sạch sẽ, không dùng any
  const params = await context.params;
  const chapterId = params?.id ?? "unknown";

  // mock: return success
  return NextResponse.json({ unlocked: true, chapterId });
}
