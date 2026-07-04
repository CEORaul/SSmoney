import { redirect } from "next/navigation";

import { toYearMonth } from "@/lib/date";

export default function BillsIndexPage() {
  redirect(`/bills/${toYearMonth(new Date())}`);
}
