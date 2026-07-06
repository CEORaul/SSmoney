import "server-only"

import { requireUser } from "@/lib/auth/session"

/** Comma-separated allowlist — fails closed (nobody is admin) if unset. */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

/** For internal-only pages like /admin/feedbacks. Redirects/notFound is the caller's job. */
export async function requireAdmin() {
  const profile = await requireUser()
  const admins = getAdminEmails()

  if (!admins.includes(profile.email.toLowerCase())) {
    return null
  }

  return profile
}
