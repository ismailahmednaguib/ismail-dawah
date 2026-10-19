// scripts/lib/rest.ts
// أدوات مشتركة لسكربتات الاستيراد: قراءة البيئة وواجهة Supabase REST بلا حزمة خارجية.
import fs from 'node:fs';

export function loadEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

export function readEnv(): Record<string, string | undefined> {
  return { ...loadEnv('.env.local'), ...loadEnv('.env'), ...process.env };
}

export function argValue(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

export interface RestClient {
  url: string;
  headers: Record<string, string>;
}

export function createRest(url: string, key: string): RestClient {
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  };
}

export async function getAll<T>(
  client: RestClient,
  table: string,
  select: string
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const res = await fetch(
      `${client.url}/rest/v1/${table}?select=${select}&limit=1000&offset=${offset}`,
      { headers: client.headers }
    );
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as T[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

export async function insertRows(
  client: RestClient,
  table: string,
  rows: Array<Record<string, unknown>>
): Promise<void> {
  const res = await fetch(`${client.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...client.headers, Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`insert ${table}: ${res.status} ${await res.text()}`);
  }
}
