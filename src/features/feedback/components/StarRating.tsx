"use client"

import { useState } from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function StarRating({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (value: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const displayValue = hovered ?? value ?? 0

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-7 transition-colors",
              star <= displayValue
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  )
}
