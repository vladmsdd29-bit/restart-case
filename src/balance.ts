import { NextResponse } from "next/server";
import { addBalance } from "./db";
import { readSessionId } from "./session";
export async function POST(req: Request) {
  const sessionId = readSessionId(req);
  if (!sessionId) return NextResponse.json({ error: "Сессия не найдена. Обновите страницу." }, { status: 401 });
  return NextResponse.json({ user: addBalance(sessionId, 500) });
}
