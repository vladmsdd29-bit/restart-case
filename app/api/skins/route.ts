import { NextResponse } from "next/server";
import { cases } from "../../../src/data";

export const revalidate = 86400;
const base = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";
type CatalogItem = { name?: string; market_hash_name?: string; image?: string };
const normalize = (value: string) => value
  .toLowerCase()
  .replace(/★|☆|stattrak™?/g, "")
  .replace(/\s*\([^)]*\)\s*$/g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*\|\s*/g, " | ")
  .trim();

async function load(path: string): Promise<CatalogItem[]> {
  const response = await fetch(`${base}/${path}.json`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(18000) });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  if (Array.isArray(payload)) return payload as CatalogItem[];
  if (payload && typeof payload === "object") return Object.values(payload as Record<string, CatalogItem>);
  return [];
}

export async function GET() {
  try {
    const [skins, gloves] = await Promise.all([load("skins"), load("gloves")]);
    const catalog = [...skins, ...gloves].filter(x => typeof x.image === "string" && /^https:\/\//i.test(x.image!));
    const result: Record<string, string> = {};
    for (const item of cases.flatMap(c => c.items)) {
      const target = normalize(item.name);
      const exact = catalog.find(row => normalize(row.name ?? row.market_hash_name ?? "") === target);
      let found = exact;
      if (!found) {
        const [weapon, ...finishParts] = target.split("|");
        const finish = finishParts.join("|").trim();
        if (weapon && finish) {
          const candidates = catalog.filter(row => {
            const candidate = normalize(row.name ?? row.market_hash_name ?? "");
            return candidate.startsWith(`${weapon.trim()} |`) && candidate.includes(finish);
          });
          found = candidates.find(row => !/\((minimal wear|field-tested|well-worn|battle-scarred|factory new)\)/i.test(row.name ?? "")) ?? candidates[0];
        }
      }
      if (found?.image) result[item.name] = found.image;
    }
    return NextResponse.json({ images: result, count: Object.keys(result).length, total: catalog.length, source: "ByMykel CS2 item catalog" });
  } catch {
    return NextResponse.json({ images: {}, count: 0, fallback: true }, { status: 200 });
  }
}
