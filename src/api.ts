import { NextResponse } from "next/server";
import { cases } from "./data";
import { getState, openCase } from "./db";
import { createSessionId, readSessionId, sessionCookie } from "./session";

export async function GET(req: Request) {
  const existing = readSessionId(req);
  const id = existing || createSessionId();
  const response = NextResponse.json(getState(id));
  if (!existing) response.headers.append("Set-Cookie", sessionCookie(id));
  return response;
}
export async function POST(req: Request) {
  const sessionId = readSessionId(req);
  if (!sessionId) return NextResponse.json({ error: "Сессия не найдена. Обновите страницу." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.caseId !== "string") return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const chosen = cases.find(c => c.id === body.caseId);
  if (!chosen) return NextResponse.json({ error: "Кейс не найден" }, { status: 404 });
  const roll = Math.random() * 100; let cumulative = 0;
  const item = chosen.items.find(x => (cumulative += x.weight, roll < cumulative)) ?? chosen.items[0];
  try { return NextResponse.json(openCase(sessionId, chosen.name, chosen.price, item)); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка открытия" }, { status: 400 }); }
}
