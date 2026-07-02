import { redirect } from "next/navigation";

import { toYearMonth } from "@/lib/date";

export default function MonthEndIndexPage() {
  redirect(`/month-end/${toYearMonth(new Date())}`);
}
