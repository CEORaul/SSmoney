import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * Wordmark logo — swaps between the light-background (dark text) and
 * dark-background (light text) PNGs via Tailwind's `dark:` variant, so it
 * always matches next-themes' current class without a client-side hook or
 * hydration flash. Source files are 357x82 (trimmed to the actual wordmark's
 * bounding box, no padding) in /public.
 */
export function Logo({ className, height = 20 }: { className?: string; height?: number }) {
  const width = Math.round((height * 357) / 82)

  return (
    <>
      <Image
        src="/logo-on-light.png"
        alt="SSmoney"
        width={width}
        height={height}
        priority
        className={cn("block dark:hidden", className)}
      />
      <Image
        src="/logo-on-dark.png"
        alt="SSmoney"
        width={width}
        height={height}
        priority
        className={cn("hidden dark:block", className)}
      />
    </>
  )
}
