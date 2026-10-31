import { randomUUID } from "node:crypto";
const COOKIE = "restart_case_session";
export function readSessionId(request: Request): string | null {
  const header = request.headers.get("cookie") || "";
  const match = header.split(";").map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(COOKIE.length + 1));
  return /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}
export function createSessionId() { return randomUUID(); }
export function sessionCookie(id: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
}
