import fs from "node:fs";
import path from "node:path";

export type User = { nickname: string; balance: number; opened: number };
export type InventoryEntry = { id: number; name: string; icon: string; value: number; rarity: string; createdAt: string };
export type OpeningEntry = { id: number; caseName: string; itemName: string; itemValue: number; createdAt: string };
type Store = { user: User; inventory: InventoryEntry[]; history: OpeningEntry[]; nextId: number };
type Database = { sessions: Record<string, Store>; legacy?: Store | null };
const dataDir = process.env.STORE_DIR || process.cwd();
fs.mkdirSync(dataDir, { recursive: true });
const file = path.join(dataDir, "restart-case-data.json");
const initial = (): Store => ({ user: { nickname: "GUEST", balance: 1000, opened: 0 }, inventory: [], history: [], nextId: 1 });
function readAll(): Database {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (parsed && typeof parsed === "object" && parsed.sessions && typeof parsed.sessions === "object") return { sessions: parsed.sessions, legacy: parsed.legacy ?? null };
    // Migrate the previous single-player local demo data into the first browser session.
    if (parsed && parsed.user && Array.isArray(parsed.inventory) && Array.isArray(parsed.history)) return { sessions: {}, legacy: parsed as Store };
  } catch {}
  return { sessions: {}, legacy: null };
}
function writeAll(db: Database) { fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8"); }
function ensureSession(sessionId: string, db = readAll()): { store: Store; db: Database } {
  if (!db.sessions[sessionId]) {
    db.sessions[sessionId] = db.legacy ? { ...db.legacy, user: { ...db.legacy.user }, inventory: [...db.legacy.inventory], history: [...db.legacy.history] } : initial();
    db.legacy = null;
    writeAll(db);
  }
  return { store: db.sessions[sessionId], db };
}
export function getState(sessionId: string) {
  const { store } = ensureSession(sessionId);
  return { user: store.user, inventory: store.inventory.slice(0, 60), history: store.history.slice(0, 20) };
}
export function openCase(sessionId: string, caseName: string, price: number, item: { name: string; icon: string; value: number; rarity: string }) {
  const db = readAll(); const { store } = ensureSession(sessionId, db);
  if (store.user.balance < price) throw new Error("Недостаточно виртуальных монет");
  const now = new Date().toLocaleString("ru-RU");
  store.user.balance -= price; store.user.opened += 1;
  const entry: InventoryEntry = { id: store.nextId++, ...item, createdAt: now };
  store.inventory.unshift(entry);
  store.history.unshift({ id: entry.id, caseName, itemName: item.name, itemValue: item.value, createdAt: now });
  writeAll(db);
  return { user: store.user, item, caseName };
}
export function addBalance(sessionId: string, amount: number) {
  const db = readAll(); const { store } = ensureSession(sessionId, db); store.user.balance += amount; writeAll(db); return store.user;
}
export function sellItem(sessionId: string, id: number) {
  const db = readAll(); const { store } = ensureSession(sessionId, db);
  const index = store.inventory.findIndex(x => x.id === id);
  if (index < 0) throw new Error("Предмет уже отсутствует в инвентаре");
  const [item] = store.inventory.splice(index, 1); store.user.balance += item.value; writeAll(db);
  return { user: store.user, sold: item, inventory: store.inventory.slice(0, 60) };
}
