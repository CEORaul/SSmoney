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
  return (
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL
  )
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: resolveConnectionString(),
    // Newer pg versions treat sslmode=require/prefer/verify-ca as aliases for
    // verify-full, so Supabase's pooler certificate chain (which Node's
    // default trust store doesn't fully validate) now fails with "self-signed
    // certificate in certificate chain" (P1011) instead of just connecting.
    // The connection is still encrypted — this only relaxes chain verification.
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
