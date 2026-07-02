import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/features/categories/icon-options"

export function CategoryIcon({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  const Icon = (name && CATEGORY_ICONS[name]) || DEFAULT_CATEGORY_ICON
  return <Icon className={className} />
}
