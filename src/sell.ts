import { NextResponse } from "next/server";
import { sellItem } from "./db";
import { readSessionId } from "./session";
export async function POST(req: Request) {
  const sessionId = readSessionId(req);
  if (!sessionId) return NextResponse.json({ error: "Сессия не найдена. Обновите страницу." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !Number.isInteger(body.id)) return NextResponse.json({ error: "Некорректный предмет" }, { status: 400 });
  try { return NextResponse.json(sellItem(sessionId, body.id)); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Не удалось продать предмет" }, { status: 400 }); }
}
