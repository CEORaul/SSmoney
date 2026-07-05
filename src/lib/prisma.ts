import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vercel's Supabase integration auto-provisions POSTGRES_PRISMA_URL/POSTGRES_URL
// pointed at the pooled Supavisor endpoint; the direct db.<ref>.supabase.co
// host behind DATABASE_URL is frequently unreachable from Vercel's serverless
// functions (P1001 "Can't reach database server") because it's IPv6-only
// unless the project has the IPv4 add-on. Prefer the pooled string when
// present and fall back to DATABASE_URL for local dev (which only has that one).
function resolveConnectionString(): string | undefined {
  const raw =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL
  if (!raw) return raw

  // pg's ConnectionParameters does `Object.assign({}, config, parse(connectionString))`
  // — the sslmode parsed out of the connection string ALWAYS overrides any
  // separate `ssl` option passed alongside `connectionString`. So a plain
  // `ssl: { rejectUnauthorized: false }` config field is silently ignored
  // whenever the string itself carries a `sslmode`. Supabase's pooled
  // connection strings ship with `sslmode=require`, and newer pg-connection-
  // string versions treat that as full chain verification (not just
  // encryption) — which fails against Supabase's cert chain with "self-signed
  // certificate in certificate chain" (P1011). Force `sslmode=no-verify` in
  // the string itself, which pg-connection-string maps directly to
  // `{ rejectUnauthorized: false }` — connection stays encrypted, only chain
  // verification is relaxed.
  try {
    const url = new URL(raw)
    url.searchParams.set("sslmode", "no-verify")
    return url.toString()
  } catch {
    return raw
  }
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
