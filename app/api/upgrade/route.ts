
import { NextResponse } from "next/server";
import { readSessionId } from "../../../src/session";
import { upgradeItem } from "../../../src/db";

export async function POST(req: Request) {
  const sessionId = readSessionId(req);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Сессия не найдена" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    !Number.isSafeInteger(body.sourceId) ||
    typeof body.targetName !== "string"
  ) {
    return NextResponse.json(
      { error: "Некорректный запрос" },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(
      upgradeItem(sessionId, body.sourceId, body.targetName)
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Ошибка апгрейда"
      },
      { status: 400 }
    );
  }
}
