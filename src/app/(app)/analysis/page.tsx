import { redirect } from "next/navigation";

import { toYearMonth } from "@/lib/date";

export default function AnalysisIndexPage() {
  redirect(`/analysis/${toYearMonth(new Date())}`);
}
