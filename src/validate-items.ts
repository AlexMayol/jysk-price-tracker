import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const KNOWN_ADAPTERS = ["jysk", "ikea"] as const;
type KnownAdapter = (typeof KNOWN_ADAPTERS)[number];

interface RawItem {
  id?: unknown;
  name?: unknown;
  url?: unknown;
  shop?: unknown;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validateItems(items: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(items)) {
    errors.push("items.json must contain a JSON array at the top level");
    return errors;
  }

  const seenIds = new Set<string>();

  items.forEach((item: RawItem, index: number) => {
    const prefix = `Item[${index}]`;

    if (typeof item !== "object" || item === null) {
      errors.push(`${prefix}: must be an object`);
      return;
    }

    // id
    if (typeof item.id !== "string" || item.id.trim() === "") {
      errors.push(`${prefix}: "id" must be a non-empty string`);
    } else {
      if (seenIds.has(item.id)) {
        errors.push(`${prefix}: duplicate id "${item.id}"`);
      }
      seenIds.add(item.id);
    }

    // name
    if (typeof item.name !== "string" || item.name.trim() === "") {
      errors.push(`${prefix}: "name" must be a non-empty string`);
    }

    // url
    if (typeof item.url !== "string" || !isValidUrl(item.url)) {
      errors.push(`${prefix}: "url" must be a valid http/https URL`);
    }

    // shop
    if (!KNOWN_ADAPTERS.includes(item.shop as KnownAdapter)) {
      errors.push(
        `${prefix}: "shop" must be one of [${KNOWN_ADAPTERS.join(", ")}], got "${item.shop}"`
      );
    }
  });

  return errors;
}

function main(): void {
  const dir = fileURLToPath(new URL(".", import.meta.url));
  const itemsPath = resolve(dir, "../data/items.json");

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(itemsPath, "utf-8"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to parse items.json: ${message}`);
    process.exit(1);
  }

  const errors = validateItems(raw);

  if (errors.length === 0) {
    console.log(`✅ items.json is valid (${(raw as unknown[]).length} item(s))`);
    process.exit(0);
  } else {
    console.error(`❌ items.json has ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

main();
